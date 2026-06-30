import { ConflictError } from '../../../../shared/domain/errors/domain-error';
import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import { IEventPublisher } from '../../../../shared/domain/events/event-publisher.port';
import {
  FranjaConsultaView,
  IFranjaHorariaConsultaPort,
} from '../../../catalogos/domain/ports/outbound/franja-horaria-consulta.port';
import { ITutorMateriaConsultaPort } from '../../../catalogos/domain/ports/outbound/tutor-materia-consulta.port';
import { Tutoria } from '../../../tutorias/domain/entities/tutoria.entity';
import { ITutoriaRepository } from '../../../tutorias/domain/ports/outbound/tutoria.repository.port';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import { IDisponibilidadRepository } from '../../domain/ports/outbound/disponibilidad.repository.port';

export class InMemoryDisponibilidadRepository implements IDisponibilidadRepository {
  private readonly data = new Map<string, DisponibilidadTutor>();

  guardar(d: DisponibilidadTutor): Promise<void> {
    const dup = [...this.data.values()].some(
      (x) => x.tutorUserId === d.tutorUserId && x.franjaId === d.franjaId,
    );
    if (dup) {
      return Promise.reject(
        new ConflictError('Disponibilidad duplicada (tutor, franja).'),
      );
    }
    this.data.set(d.id, d);
    return Promise.resolve();
  }

  actualizar(d: DisponibilidadTutor): Promise<void> {
    this.data.set(d.id, d);
    return Promise.resolve();
  }

  obtenerPorId(id: string): Promise<DisponibilidadTutor | null> {
    return Promise.resolve(this.data.get(id) ?? null);
  }

  obtenerPorTutorYFranja(
    tutorUserId: string,
    franjaId: string,
  ): Promise<DisponibilidadTutor | null> {
    const found = [...this.data.values()].find(
      (x) => x.tutorUserId === tutorUserId && x.franjaId === franjaId,
    );
    return Promise.resolve(found ?? null);
  }

  listarPorTutor(tutorUserId: string): Promise<DisponibilidadTutor[]> {
    return Promise.resolve(
      [...this.data.values()].filter((x) => x.tutorUserId === tutorUserId),
    );
  }

  listarActivas(): Promise<DisponibilidadTutor[]> {
    return Promise.resolve([...this.data.values()].filter((x) => x.activa));
  }
}

export class InMemoryTutoriaRepository implements ITutoriaRepository {
  private readonly claves = new Set<string>();

  guardar(t: Tutoria): Promise<void> {
    const clave = `${t.tutorUserId}|${t.franjaId}|${t.fecha
      .toISOString()
      .slice(0, 10)}`;
    if (this.claves.has(clave)) {
      return Promise.reject(new ConflictError('Tutoría ya materializada.'));
    }
    this.claves.add(clave);
    return Promise.resolve();
  }

  cancelarFuturasPorDisponibilidad(
    _disponibilidadId: string,
    _desde: Date,
  ): Promise<number> {
    return Promise.resolve(0);
  }

  reactivarCanceladasPorDisponibilidad(
    _disponibilidadId: string,
    _desde: Date,
  ): Promise<number> {
    return Promise.resolve(0);
  }
}

export class FakeTutorMateriaConsulta implements ITutorMateriaConsultaPort {
  constructor(private readonly resultado: boolean) {}
  estaAutorizada(): Promise<boolean> {
    return Promise.resolve(this.resultado);
  }
}

export class FakeFranjaConsulta implements IFranjaHorariaConsultaPort {
  constructor(private readonly view: FranjaConsultaView | null) {}
  obtenerPorId(): Promise<FranjaConsultaView | null> {
    return Promise.resolve(this.view);
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
