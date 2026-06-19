import { Materia } from '../../entities/materia.entity';

/** Token de inyección del repositorio de materias. */
export const MATERIA_REPOSITORY = Symbol('MATERIA_REPOSITORY');

/** Puerto de salida de persistencia de materias. */
export interface IMateriaRepository {
  guardar(materia: Materia): Promise<void>;
  actualizar(materia: Materia): Promise<void>;
  obtenerPorId(id: string): Promise<Materia | null>;
  listar(soloActivas?: boolean): Promise<Materia[]>;
}
