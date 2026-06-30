import { Injectable } from '@nestjs/common';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { Prisma } from '../../../../shared/infrastructure/prisma/prisma-client';
import type { Modalidad as PrismaModalidad } from '../../../../shared/infrastructure/prisma/prisma-client';
import { mapUniqueViolation } from '../../../../shared/infrastructure/prisma/prisma-error.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import { IDisponibilidadRepository } from '../../domain/ports/outbound/disponibilidad.repository.port';

const INCLUDE_FRANJA = { franja: { select: { diaSemana: true } } } as const;

type FilaConFranja = {
  id: string;
  tutorUserId: string;
  franjaId: string;
  materiaId: string;
  salaId: string | null;
  modalidad: string;
  cuposMaximos: number;
  vigenciaDesde: Date;
  vigenciaHasta: Date;
  activa: boolean;
  franja: { diaSemana: number };
};

/** Adapter Prisma del puerto `IDisponibilidadRepository`. */
@Injectable()
export class PrismaDisponibilidadRepository implements IDisponibilidadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(d: DisponibilidadTutor): Promise<void> {
    try {
      await this.prisma.disponibilidadTutor.create({
        data: this.toPersistence(d),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ValidationError(
          'La franja, materia o sala referenciada no existe.',
        );
      }
      mapUniqueViolation(
        error,
        'Ya existe una disponibilidad de ese tutor para esa franja (RN-02).',
      );
    }
  }

  async actualizar(d: DisponibilidadTutor): Promise<void> {
    await this.prisma.disponibilidadTutor.update({
      where: { id: d.id },
      data: {
        materiaId: d.materiaId,
        salaId: d.salaId,
        modalidad: d.modalidad,
        cuposMaximos: d.cuposMaximos,
        vigenciaDesde: d.vigencia.desde,
        vigenciaHasta: d.vigencia.hasta,
        activa: d.activa,
      },
    });
  }

  async obtenerPorId(id: string): Promise<DisponibilidadTutor | null> {
    const fila = await this.prisma.disponibilidadTutor.findUnique({
      where: { id },
      include: INCLUDE_FRANJA,
    });
    return fila ? this.toDomain(fila) : null;
  }

  async obtenerPorTutorYFranja(
    tutorUserId: string,
    franjaId: string,
  ): Promise<DisponibilidadTutor | null> {
    const fila = await this.prisma.disponibilidadTutor.findUnique({
      where: { tutorUserId_franjaId: { tutorUserId, franjaId } },
      include: INCLUDE_FRANJA,
    });
    return fila ? this.toDomain(fila) : null;
  }

  async listarPorTutor(tutorUserId: string): Promise<DisponibilidadTutor[]> {
    const filas = await this.prisma.disponibilidadTutor.findMany({
      where: { tutorUserId },
      include: INCLUDE_FRANJA,
      orderBy: { creadoEn: 'asc' },
    });
    return (filas as unknown as FilaConFranja[]).map((f) => this.toDomain(f));
  }

  async listarActivas(): Promise<DisponibilidadTutor[]> {
    const filas = await this.prisma.disponibilidadTutor.findMany({
      where: { activa: true },
      include: INCLUDE_FRANJA,
    });
    return (filas as unknown as FilaConFranja[]).map((f) => this.toDomain(f));
  }

  private toPersistence(d: DisponibilidadTutor) {
    return {
      id: d.id,
      tutorUserId: d.tutorUserId,
      franjaId: d.franjaId,
      materiaId: d.materiaId,
      salaId: d.salaId,
      modalidad: d.modalidad as unknown as PrismaModalidad,
      cuposMaximos: d.cuposMaximos,
      vigenciaDesde: d.vigencia.desde,
      vigenciaHasta: d.vigencia.hasta,
      activa: d.activa,
    };
  }

  private toDomain(f: FilaConFranja): DisponibilidadTutor {
    return DisponibilidadTutor.reconstituir({
      id: f.id,
      tutorUserId: f.tutorUserId,
      franjaId: f.franjaId,
      franjaDiaSemana: f.franja.diaSemana,
      materiaId: f.materiaId,
      salaId: f.salaId,
      modalidad: f.modalidad as Modalidad,
      cuposMaximos: f.cuposMaximos,
      vigenciaDesde: f.vigenciaDesde,
      vigenciaHasta: f.vigenciaHasta,
      activa: f.activa,
    });
  }
}
