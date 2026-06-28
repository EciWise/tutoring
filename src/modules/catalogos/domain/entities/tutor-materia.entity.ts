import { randomUUID } from 'node:crypto';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';

interface TutorMateriaProps {
  id: string;
  materiaId: string;
  tutorUserId: string;
  autorizada: boolean;
  creadoEn: Date;
}

/**
 * Asignación de una materia a un tutor (referencia externa `tutorUserId` del
 * servicio `auth`). `autorizada` habilita al tutor a publicar disponibilidad de
 * esa materia (RN-05). La unicidad `(materia, tutor)` la garantiza la BD.
 */
export class TutorMateria {
  private constructor(private readonly props: TutorMateriaProps) {}

  public static crear(
    materiaId: string,
    tutorUserId: string,
    autorizada = true,
  ): TutorMateria {
    return new TutorMateria({
      id: randomUUID(),
      materiaId: TutorMateria.exigirId(materiaId, 'materiaId'),
      tutorUserId: TutorMateria.exigirId(tutorUserId, 'tutorUserId'),
      autorizada,
      creadoEn: new Date(),
    });
  }

  public static reconstituir(props: TutorMateriaProps): TutorMateria {
    return new TutorMateria({ ...props });
  }

  public autorizar(): void {
    this.props.autorizada = true;
  }

  public desautorizar(): void {
    this.props.autorizada = false;
  }

  private static exigirId(valor: string, campo: string): string {
    const limpio = valor?.trim() ?? '';
    if (limpio.length === 0) {
      throw new ValidationError(`${campo} es obligatorio.`);
    }
    return limpio;
  }

  public get id(): string {
    return this.props.id;
  }

  public get materiaId(): string {
    return this.props.materiaId;
  }

  public get tutorUserId(): string {
    return this.props.tutorUserId;
  }

  public get autorizada(): boolean {
    return this.props.autorizada;
  }

  public get creadoEn(): Date {
    return this.props.creadoEn;
  }
}
