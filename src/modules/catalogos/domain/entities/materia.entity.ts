import { randomUUID } from 'node:crypto';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';

interface MateriaProps {
  id: string;
  codigo: string;
  nombre: string;
  activa: boolean;
  creadoEn: Date;
}

const MAX_CODIGO = 20;
const MAX_NOMBRE = 150;

/**
 * Materia académica del catálogo. `codigo` es único (lo garantiza la BD). Una
 * materia inactiva no debería poder publicarse en disponibilidades nuevas
 * (RN-03), pero la baja es lógica para preservar el historial.
 */
export class Materia {
  private constructor(private readonly props: MateriaProps) {}

  public static crear(codigo: string, nombre: string): Materia {
    return new Materia({
      id: randomUUID(),
      codigo: Materia.validarCodigo(codigo),
      nombre: Materia.validarNombre(nombre),
      activa: true,
      creadoEn: new Date(),
    });
  }

  /** Rehidrata una materia ya persistida (sin re-generar id ni alterar estado). */
  public static reconstituir(props: MateriaProps): Materia {
    return new Materia({ ...props });
  }

  public activar(): void {
    this.props.activa = true;
  }

  public desactivar(): void {
    this.props.activa = false;
  }

  private static validarCodigo(codigo: string): string {
    const limpio = codigo?.trim() ?? '';
    if (limpio.length === 0) {
      throw new ValidationError('El código de la materia es obligatorio.');
    }
    if (limpio.length > MAX_CODIGO) {
      throw new ValidationError(
        `El código de la materia no puede exceder ${MAX_CODIGO} caracteres.`,
      );
    }
    return limpio;
  }

  private static validarNombre(nombre: string): string {
    const limpio = nombre?.trim() ?? '';
    if (limpio.length === 0) {
      throw new ValidationError('El nombre de la materia es obligatorio.');
    }
    if (limpio.length > MAX_NOMBRE) {
      throw new ValidationError(
        `El nombre de la materia no puede exceder ${MAX_NOMBRE} caracteres.`,
      );
    }
    return limpio;
  }

  public get id(): string {
    return this.props.id;
  }

  public get codigo(): string {
    return this.props.codigo;
  }

  public get nombre(): string {
    return this.props.nombre;
  }

  public get activa(): boolean {
    return this.props.activa;
  }

  public get creadoEn(): Date {
    return this.props.creadoEn;
  }
}
