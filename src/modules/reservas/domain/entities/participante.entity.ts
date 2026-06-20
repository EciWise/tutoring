import { randomUUID } from 'node:crypto';
import { EstadoAsistencia } from '../../../../shared/domain/enums/estado-asistencia.enum';
import { exigirMotivo } from '../motivo';

interface ParticipanteProps {
  id: string;
  tutoriaId: string;
  estudianteUserId: string;
  temaEspecifico: string | null;
  descripcionDudas: string | null;
  estadoAsistencia: EstadoAsistencia;
  reservadoEn: Date;
  canceladoEn: Date | null;
  motivoCancelacion: string | null;
}

const MAX_TEMA = 200;

/**
 * `Participante` — entidad de la reserva de un estudiante en una `Tutoria`. La
 * unicidad `(tutoria, estudiante)` (no doble inscripción) la garantiza la BD; el
 * cupo (RN-09) se controla con un UPDATE atómico en el repositorio, no aquí.
 */
export class Participante {
  private constructor(private readonly props: ParticipanteProps) {}

  public static reservar(input: {
    tutoriaId: string;
    estudianteUserId: string;
    temaEspecifico?: string | null;
    descripcionDudas?: string | null;
  }): Participante {
    return new Participante({
      id: randomUUID(),
      tutoriaId: input.tutoriaId,
      estudianteUserId: input.estudianteUserId,
      temaEspecifico: Participante.sanearTema(input.temaEspecifico),
      descripcionDudas: input.descripcionDudas?.trim() || null,
      estadoAsistencia: EstadoAsistencia.CONFIRMADA,
      reservadoEn: new Date(),
      canceladoEn: null,
      motivoCancelacion: null,
    });
  }

  public static reconstituir(props: ParticipanteProps): Participante {
    return new Participante({ ...props });
  }

  /** Cancela la participación (RF-06). Exige motivo (RN-08) y libera el cupo en persistencia. */
  public cancelar(motivo: string): void {
    this.props.motivoCancelacion = exigirMotivo(motivo);
    this.props.estadoAsistencia = EstadoAsistencia.CANCELADA;
    this.props.canceladoEn = new Date();
  }

  private static sanearTema(tema?: string | null): string | null {
    const limpio = tema?.trim() ?? '';
    if (limpio.length === 0) {
      return null;
    }
    return limpio.slice(0, MAX_TEMA);
  }

  public get id(): string {
    return this.props.id;
  }

  public get tutoriaId(): string {
    return this.props.tutoriaId;
  }

  public get estudianteUserId(): string {
    return this.props.estudianteUserId;
  }

  public get temaEspecifico(): string | null {
    return this.props.temaEspecifico;
  }

  public get descripcionDudas(): string | null {
    return this.props.descripcionDudas;
  }

  public get estadoAsistencia(): EstadoAsistencia {
    return this.props.estadoAsistencia;
  }

  public get canceladoEn(): Date | null {
    return this.props.canceladoEn;
  }

  public get motivoCancelacion(): string | null {
    return this.props.motivoCancelacion;
  }
}
