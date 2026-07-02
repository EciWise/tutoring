import { EstadoAsistencia } from '../../../../shared/domain/enums/estado-asistencia.enum';
import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import { ConflictError } from '../../../../shared/domain/errors/domain-error';
import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import { IEventPublisher } from '../../../../shared/domain/events/event-publisher.port';
import { Participante } from '../../domain/entities/participante.entity';
import {
  CancelacionOrigen,
  IReservaRepository,
  ParticipanteEnSesion,
  ReservaConDetalle,
  TutoriaParaReserva,
} from '../../domain/ports/outbound/reserva.repository.port';

/**
 * Fake in-memory de `IReservaRepository`. Modela el cupo como un contador y la
 * unicidad/traslape en memoria, reproduciendo la atomicidad: las escrituras que
 * fallan no mutan nada (se valida antes de tocar el estado).
 */
export class InMemoryReservaRepository implements IReservaRepository {
  private readonly tutorias = new Map<string, TutoriaParaReserva>();
  private readonly participantes: Participante[] = [];

  /** Helpers de test. */
  sembrarTutoria(t: TutoriaParaReserva): void {
    this.tutorias.set(t.id, { ...t });
  }
  cuposOcupados(id: string): number | undefined {
    return this.tutorias.get(id)?.cuposOcupados;
  }
  estadoTutoria(id: string): EstadoTutoria | undefined {
    return this.tutorias.get(id)?.estado;
  }

  buscarTutoriaParaReserva(id: string): Promise<TutoriaParaReserva | null> {
    const t = this.tutorias.get(id);
    return Promise.resolve(t ? { ...t } : null);
  }

  estudianteTieneTraslape(
    estudianteUserId: string,
    fecha: Date,
    franjaId: string,
    excluirTutoriaId?: string,
  ): Promise<boolean> {
    const hay = this.participantes.some((p) => {
      if (
        p.estudianteUserId !== estudianteUserId ||
        p.estadoAsistencia === EstadoAsistencia.CANCELADA ||
        p.tutoriaId === excluirTutoriaId
      ) {
        return false;
      }
      const t = this.tutorias.get(p.tutoriaId);
      return (
        !!t && t.franjaId === franjaId && t.fecha.getTime() === fecha.getTime()
      );
    });
    return Promise.resolve(hay);
  }

  obtenerParticipanteActivo(
    tutoriaId: string,
    estudianteUserId: string,
  ): Promise<Participante | null> {
    return Promise.resolve(this.activo(tutoriaId, estudianteUserId) ?? null);
  }

  reservar(p: Participante): Promise<void> {
    const t = this.tutorias.get(p.tutoriaId);
    if (
      !t ||
      t.estado !== EstadoTutoria.PROGRAMADA ||
      t.cuposOcupados >= t.cuposMaximos
    ) {
      return Promise.reject(
        new ConflictError('La tutoría está llena o no está disponible.'),
      );
    }
    if (this.activo(p.tutoriaId, p.estudianteUserId)) {
      return Promise.reject(new ConflictError('Ya tienes una reserva.'));
    }
    t.cuposOcupados++;
    this.participantes.push(p);
    return Promise.resolve();
  }

  cancelarReserva(p: Participante): Promise<void> {
    this.liberarCupo(p.tutoriaId);
    return Promise.resolve();
  }

  reprogramar(origen: CancelacionOrigen, destino: Participante): Promise<void> {
    const td = this.tutorias.get(destino.tutoriaId);
    if (
      !td ||
      td.estado !== EstadoTutoria.PROGRAMADA ||
      td.cuposOcupados >= td.cuposMaximos
    ) {
      // Falla sin tocar nada → origen intacto.
      return Promise.reject(
        new ConflictError('La tutoría destino está llena o no disponible.'),
      );
    }
    this.liberarCupo(origen.tutoriaId);
    td.cuposOcupados++;
    this.participantes.push(destino);
    return Promise.resolve();
  }

  listarPorEstudiante(_estudianteUserId: string): Promise<ReservaConDetalle[]> {
    return Promise.resolve([]);
  }

  listarParticipantesDeTutor(
    _tutorUserId: string,
  ): Promise<ParticipanteEnSesion[]> {
    return Promise.resolve([]);
  }

  cancelarTutoria(tutoriaId: string, motivo: string): Promise<number> {
    const t = this.tutorias.get(tutoriaId);
    if (!t) {
      return Promise.resolve(0);
    }
    t.estado = EstadoTutoria.CANCELADA;
    t.cuposOcupados = 0;
    let liberados = 0;
    for (const p of this.participantes) {
      if (
        p.tutoriaId === tutoriaId &&
        p.estadoAsistencia !== EstadoAsistencia.CANCELADA
      ) {
        p.cancelar(motivo);
        liberados++;
      }
    }
    return Promise.resolve(liberados);
  }

  finalizarTutoria(tutoriaId: string): Promise<string[]> {
    const t = this.tutorias.get(tutoriaId);
    if (!t) {
      return Promise.resolve([]);
    }
    t.estado = EstadoTutoria.REALIZADA;
    const userIds = this.participantes
      .filter(
        (p) =>
          p.tutoriaId === tutoriaId &&
          p.estadoAsistencia !== EstadoAsistencia.CANCELADA,
      )
      .map((p) => p.estudianteUserId);
    return Promise.resolve(userIds);
  }

  calificarTutoria(input: {
    tutoriaId: string;
    estudianteUserId: string;
    calificacion: number;
    comentario?: string | null;
  }): Promise<{ tutorUserId: string }> {
    const t = this.tutorias.get(input.tutoriaId);
    if (!t) {
      return Promise.reject(new ConflictError('No existe la tutoría.'));
    }
    return Promise.resolve({ tutorUserId: t.tutorUserId });
  }

  private activo(
    tutoriaId: string,
    estudianteUserId: string,
  ): Participante | undefined {
    return this.participantes.find(
      (p) =>
        p.tutoriaId === tutoriaId &&
        p.estudianteUserId === estudianteUserId &&
        p.estadoAsistencia !== EstadoAsistencia.CANCELADA,
    );
  }

  private liberarCupo(tutoriaId: string): void {
    const t = this.tutorias.get(tutoriaId);
    if (t && t.cuposOcupados > 0) {
      t.cuposOcupados--;
    }
  }
}

export class NoopEventPublisher implements IEventPublisher {
  public readonly publicados: DomainEvent[] = [];
  publish(event: DomainEvent): Promise<void> {
    this.publicados.push(event);
    return Promise.resolve();
  }
  publishAll(events: DomainEvent[]): Promise<void> {
    this.publicados.push(...events);
    return Promise.resolve();
  }
}
