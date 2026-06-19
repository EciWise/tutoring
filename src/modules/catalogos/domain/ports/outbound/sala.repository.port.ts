import { Sala } from '../../entities/sala.entity';

/** Token de inyección del repositorio de salas. */
export const SALA_REPOSITORY = Symbol('SALA_REPOSITORY');

/** Puerto de salida de persistencia de salas. */
export interface ISalaRepository {
  guardar(sala: Sala): Promise<void>;
  listar(): Promise<Sala[]>;
}
