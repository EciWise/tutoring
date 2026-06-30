import { Sala } from '../../entities/sala.entity';

/** Token de inyección del repositorio de salas. */
export const SALA_REPOSITORY = Symbol('SALA_REPOSITORY');

export interface ActualizarSalaCambios {
  codigo?: string;
  edificio?: string | null;
  activa?: boolean;
}

/** Puerto de salida de persistencia de salas. */
export interface ISalaRepository {
  guardar(sala: Sala): Promise<void>;
  listar(): Promise<Sala[]>;
  obtenerPorId(id: string): Promise<Sala | null>;
  actualizar(id: string, cambios: ActualizarSalaCambios): Promise<Sala>;
  eliminar(id: string): Promise<void>;
}
