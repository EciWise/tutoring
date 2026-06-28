import { FranjaHoraria } from '../../entities/franja-horaria.entity';

/** Token de inyección del repositorio de franjas horarias. */
export const FRANJA_HORARIA_REPOSITORY = Symbol('FRANJA_HORARIA_REPOSITORY');

/** Puerto de salida de persistencia de franjas horarias. */
export interface IFranjaHorariaRepository {
  guardar(franja: FranjaHoraria): Promise<void>;
  /** Lista las franjas; si se indica `dia` (1-5) filtra por ese día. */
  listarPorDia(dia?: number): Promise<FranjaHoraria[]>;
}
