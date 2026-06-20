import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import {
  USUARIO_DIRECTORY_PORT,
  type IUsuarioDirectoryPort,
} from '../../../identidad/domain/ports/outbound/usuario-directory.port';
import {
  TUTORIA_QUERY,
  type ITutoriaQueryPort,
  type TutoriaDetalle,
} from '../../domain/ports/outbound/tutoria-query.port';

export type TutoriaDetalleConTutor = TutoriaDetalle & {
  tutorNombre: string | null;
};

@Injectable()
export class ObtenerDetalleTutoriaUseCase {
  constructor(
    @Inject(TUTORIA_QUERY)
    private readonly query: ITutoriaQueryPort,
    @Inject(USUARIO_DIRECTORY_PORT)
    private readonly directory: IUsuarioDirectoryPort,
  ) {}

  async ejecutar(id: string): Promise<TutoriaDetalleConTutor> {
    const detalle = await this.query.obtenerDetalle(id);
    if (!detalle) {
      throw new NotFoundError(`No existe la tutoría: ${id}`);
    }
    const usuario = await this.directory.getById(detalle.tutorUserId);
    return {
      ...detalle,
      tutorNombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : null,
    };
  }
}
