import { randomUUID } from 'node:crypto';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';

interface SalaProps {
  id: string;
  codigo: string;
  edificio: string | null;
  capacidad: number | null;
  activa: boolean;
  creadoEn: Date;
}

const MAX_CODIGO = 20;
const MAX_EDIFICIO = 80;

/** Sala física donde se imparten tutorías presenciales. `codigo` es único. */
export class Sala {
  private constructor(private readonly props: SalaProps) {}

  public static crear(
    codigo: string,
    edificio?: string | null,
    capacidad?: number | null,
  ): Sala {
    return new Sala({
      id: randomUUID(),
      codigo: Sala.validarCodigo(codigo),
      edificio: Sala.validarEdificio(edificio),
      capacidad: Sala.validarCapacidad(capacidad),
      activa: true,
      creadoEn: new Date(),
    });
  }

  public static reconstituir(props: SalaProps): Sala {
    return new Sala({ ...props });
  }

  private static validarCodigo(codigo: string): string {
    const limpio = codigo?.trim() ?? '';
    if (limpio.length === 0) {
      throw new ValidationError('El código de la sala es obligatorio.');
    }
    if (limpio.length > MAX_CODIGO) {
      throw new ValidationError(
        `El código de la sala no puede exceder ${MAX_CODIGO} caracteres.`,
      );
    }
    return limpio;
  }

  private static validarEdificio(edificio?: string | null): string | null {
    if (edificio === undefined || edificio === null) {
      return null;
    }
    const limpio = edificio.trim();
    if (limpio.length === 0) {
      return null;
    }
    if (limpio.length > MAX_EDIFICIO) {
      throw new ValidationError(
        `El edificio no puede exceder ${MAX_EDIFICIO} caracteres.`,
      );
    }
    return limpio;
  }

  private static validarCapacidad(capacidad?: number | null): number | null {
    if (capacidad === undefined || capacidad === null) {
      return null;
    }
    if (!Number.isInteger(capacidad) || capacidad < 1) {
      throw new ValidationError(
        `La capacidad debe ser un entero positivo; se recibió: ${capacidad}`,
      );
    }
    return capacidad;
  }

  public get id(): string {
    return this.props.id;
  }

  public get codigo(): string {
    return this.props.codigo;
  }

  public get edificio(): string | null {
    return this.props.edificio;
  }

  public get capacidad(): number | null {
    return this.props.capacidad;
  }

  public get activa(): boolean {
    return this.props.activa;
  }

  public get creadoEn(): Date {
    return this.props.creadoEn;
  }
}
