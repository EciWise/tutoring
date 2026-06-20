import { Injectable } from '@nestjs/common';
import { EstadoAsistencia } from '../../../../shared/domain/enums/estado-asistencia.enum';
import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import {
  BusinessRuleViolation,
  ConflictError,
  NotFoundError,
} from '../../../../shared/domain/errors/domain-error';
import { EstadoAsistencia as PrismaEstadoAsistencia } from '../../../../shared/infrastructure/prisma/prisma-client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Participante } from '../../domain/entities/participante.entity';
import {
  CancelacionOrigen,
  IReservaRepository,
  TutoriaParaReserva,
} from '../../domain/ports/outbound/reserva.repository.port';

/**
 * Adapter Prisma transaccional de `reservas`. El control de cupo (RN-09) usa un
 * UPDATE condicional crudo (`WHERE cupos_ocupados < cupos_maximos`) — Prisma no
 * compara dos columnas en `updateMany` — dentro de `$transaction` junto al
 * upsert de `participante`, garantizando atomicidad sin locks explícitos.
 *
 * ponytail: este slice escribe la tabla `tutoria` (cupos/estado) directamente;
 * es la única forma de que cupo + participante sean atómicos. Si algún día se
 * separan en otro servicio, haría falta un saga/outbox.
 */
@Injectable()
export class PrismaReservaRepository implements IReservaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarTutoriaParaReserva(
    tutoriaId: string,
  ): Promise<TutoriaParaReserva | null> {
    const row = await this.prisma.tutoria.findUnique({
      where: { id: tutoriaId },
      select: {
        id: true,
        tutorUserId: true,
        fecha: true,
        franjaId: true,
        estado: true,
        cuposMaximos: true,
        cuposOcupados: true,
      },
    });
    if (!row) {
      return null;
    }
    return { ...row, estado: row.estado as unknown as EstadoTutoria };
  }

  async estudianteTieneTraslape(
    estudianteUserId: string,
    fecha: Date,
    franjaId: string,
    excluirTutoriaId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.participante.count({
      where: {
        estudianteUserId,
        estadoAsistencia: { not: PrismaEstadoAsistencia.CANCELADA },
        tutoriaId: excluirTutoriaId ? { not: excluirTutoriaId } : undefined,
        tutoria: { fecha, franjaId },
      },
    });
    return count > 0;
  }

  async obtenerParticipanteActivo(
    tutoriaId: string,
    estudianteUserId: string,
  ): Promise<Participante | null> {
    const row = await this.prisma.participante.findFirst({
      where: {
        tutoriaId,
        estudianteUserId,
        estadoAsistencia: { not: PrismaEstadoAsistencia.CANCELADA },
      },
    });
    return row
      ? Participante.reconstituir({
          id: row.id,
          tutoriaId: row.tutoriaId,
          estudianteUserId: row.estudianteUserId,
          temaEspecifico: row.temaEspecifico,
          descripcionDudas: row.descripcionDudas,
          estadoAsistencia: row.estadoAsistencia as unknown as EstadoAsistencia,
          reservadoEn: row.reservadoEn,
          canceladoEn: row.canceladoEn,
          motivoCancelacion: row.motivoCancelacion,
        })
      : null;
  }

  async reservar(p: Participante): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const filas = await tx.$executeRaw`
        UPDATE tutoria SET cupos_ocupados = cupos_ocupados + 1
        WHERE id = ${p.tutoriaId}::uuid
          AND estado = 'PROGRAMADA'
          AND cupos_ocupados < cupos_maximos`;
      if (filas === 0) {
        throw new ConflictError('La tutoría está llena o no está disponible.');
      }
      // Reactivar-o-crear: la fila CANCELADA de una reserva previa se conserva
      // para el historial, así que reservar de nuevo reusa esa fila (la unicidad
      // (tutoria, estudiante) impide duplicarla). El caso de uso ya garantizó por
      // RN-01 que no hay otra participación activa en esa fecha+franja.
      await this.reactivarOCrear(tx, p);
    });
  }

  async cancelarReserva(p: Participante): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const upd = await tx.participante.updateMany({
        where: {
          id: p.id,
          estadoAsistencia: { not: PrismaEstadoAsistencia.CANCELADA },
        },
        data: {
          estadoAsistencia: PrismaEstadoAsistencia.CANCELADA,
          canceladoEn: p.canceladoEn,
          motivoCancelacion: p.motivoCancelacion,
        },
      });
      if (upd.count === 0) {
        throw new BusinessRuleViolation('La reserva ya estaba cancelada.');
      }
      await tx.$executeRaw`
        UPDATE tutoria SET cupos_ocupados = cupos_ocupados - 1
        WHERE id = ${p.tutoriaId}::uuid AND cupos_ocupados > 0`;
    });
  }

  async reprogramar(
    origen: CancelacionOrigen,
    destino: Participante,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1) Ocupar destino primero: si está lleno, abortamos sin tocar el origen.
      const ocupado = await tx.$executeRaw`
        UPDATE tutoria SET cupos_ocupados = cupos_ocupados + 1
        WHERE id = ${destino.tutoriaId}::uuid
          AND estado = 'PROGRAMADA'
          AND cupos_ocupados < cupos_maximos`;
      if (ocupado === 0) {
        throw new ConflictError(
          'La tutoría destino está llena o no está disponible.',
        );
      }
      // 2) Cancelar el origen y liberar su cupo.
      const upd = await tx.participante.updateMany({
        where: {
          tutoriaId: origen.tutoriaId,
          estudianteUserId: origen.estudianteUserId,
          estadoAsistencia: { not: PrismaEstadoAsistencia.CANCELADA },
        },
        data: {
          estadoAsistencia: PrismaEstadoAsistencia.CANCELADA,
          canceladoEn: new Date(),
          motivoCancelacion: origen.motivo,
        },
      });
      if (upd.count === 0) {
        throw new NotFoundError(
          'No tienes una reserva activa en la tutoría origen.',
        );
      }
      await tx.$executeRaw`
        UPDATE tutoria SET cupos_ocupados = cupos_ocupados - 1
        WHERE id = ${origen.tutoriaId}::uuid AND cupos_ocupados > 0`;
      // 3) Reactivar-o-crear el participante en destino.
      await this.reactivarOCrear(tx, destino);
    });
  }

  /**
   * Inserta el participante o, si ya existía (típicamente una reserva CANCELADA
   * que se conserva por historial), la reactiva a CONFIRMADA. Seguro porque el
   * caso de uso ya descartó por RN-01 una participación activa en esa franja.
   */
  private async reactivarOCrear(
    tx: Pick<PrismaService, 'participante'>,
    p: Participante,
  ): Promise<void> {
    await tx.participante.upsert({
      where: {
        tutoriaId_estudianteUserId: {
          tutoriaId: p.tutoriaId,
          estudianteUserId: p.estudianteUserId,
        },
      },
      create: {
        id: p.id,
        tutoriaId: p.tutoriaId,
        estudianteUserId: p.estudianteUserId,
        temaEspecifico: p.temaEspecifico,
        descripcionDudas: p.descripcionDudas,
        estadoAsistencia: PrismaEstadoAsistencia.CONFIRMADA,
      },
      update: {
        temaEspecifico: p.temaEspecifico,
        descripcionDudas: p.descripcionDudas,
        estadoAsistencia: PrismaEstadoAsistencia.CONFIRMADA,
        reservadoEn: new Date(),
        canceladoEn: null,
        motivoCancelacion: null,
      },
    });
  }

  async cancelarTutoria(tutoriaId: string, motivo: string): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const filas = await tx.$executeRaw`
        UPDATE tutoria
        SET estado = 'CANCELADA', motivo_cancelacion = ${motivo}, cupos_ocupados = 0
        WHERE id = ${tutoriaId}::uuid AND estado = 'PROGRAMADA'`;
      if (filas === 0) {
        throw new BusinessRuleViolation(
          'Solo se puede cancelar una tutoría PROGRAMADA.',
        );
      }
      const upd = await tx.participante.updateMany({
        where: {
          tutoriaId,
          estadoAsistencia: { not: PrismaEstadoAsistencia.CANCELADA },
        },
        data: {
          estadoAsistencia: PrismaEstadoAsistencia.CANCELADA,
          canceladoEn: new Date(),
          motivoCancelacion: motivo,
        },
      });
      return upd.count;
    });
  }
}
