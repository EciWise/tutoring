import { Inject, Injectable } from '@nestjs/common';
import {
  USUARIO_DIRECTORY_PORT,
  type IUsuarioDirectoryPort,
} from '../../../identidad/domain/ports/outbound/usuario-directory.port';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
  type ReservaConDetalle,
} from '../../domain/ports/outbound/reserva.repository.port';

export type ReservaDetalleConTutor = ReservaConDetalle & {
  tutorNombre: string | null;
};

@Injectable()
export class ListarReservasDeEstudianteUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(USUARIO_DIRECTORY_PORT)
    private readonly directory: IUsuarioDirectoryPort,
  ) {}

  async ejecutar(estudianteUserId: string): Promise<ReservaDetalleConTutor[]> {
    const reservas = await this.repo.listarPorEstudiante(estudianteUserId);
    const tutorIds = [...new Set(reservas.map((r) => r.tutoria.tutorUserId))];
    const usuarios =
      tutorIds.length > 0 ? await this.directory.getMany(tutorIds) : [];
    const nombrePorId = new Map(
      usuarios.map((u) => [u.userId, `${u.nombre} ${u.apellido}`]),
    );
    return reservas.map((r) => ({
      ...r,
      tutorNombre: nombrePorId.get(r.tutoria.tutorUserId) ?? null,
    }));
  }
}
