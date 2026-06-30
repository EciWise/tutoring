import { Inject, Injectable } from '@nestjs/common';
import {
  USUARIO_DIRECTORY_PORT,
  type IUsuarioDirectoryPort,
} from '../../../identidad/domain/ports/outbound/usuario-directory.port';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
  type ParticipanteEnSesion,
} from '../../domain/ports/outbound/reserva.repository.port';

export type ParticipanteEnSesionConNombre = ParticipanteEnSesion & {
  estudianteNombre: string | null;
};

@Injectable()
export class ListarSesionesDeTutorUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(USUARIO_DIRECTORY_PORT)
    private readonly directory: IUsuarioDirectoryPort,
  ) {}

  async ejecutar(
    tutorUserId: string,
  ): Promise<ParticipanteEnSesionConNombre[]> {
    const participaciones =
      await this.repo.listarParticipantesDeTutor(tutorUserId);
    const estudianteIds = [
      ...new Set(participaciones.map((p) => p.estudianteUserId)),
    ];
    const usuarios =
      estudianteIds.length > 0
        ? await this.directory.getMany(estudianteIds)
        : [];
    const nombrePorId = new Map(
      usuarios.map((u) => [u.userId, `${u.nombre} ${u.apellido}`]),
    );
    return participaciones.map((p) => ({
      ...p,
      estudianteNombre: nombrePorId.get(p.estudianteUserId) ?? null,
    }));
  }
}
