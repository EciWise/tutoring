import { Inject, Injectable } from '@nestjs/common';
import {
  USUARIO_DIRECTORY_PORT,
  type IUsuarioDirectoryPort,
} from '../../../identidad/domain/ports/outbound/usuario-directory.port';
import {
  TUTORIA_QUERY,
  type BuscarTutoriasFiltros,
  type ITutoriaQueryPort,
  type TutoriaResumen,
} from '../../domain/ports/outbound/tutoria-query.port';

export type TutoriaResumenConTutor = TutoriaResumen & {
  tutorNombre: string | null;
};

/**
 * RF-04: busca slots PROGRAMADOS con cupo disponible. El puerto de consulta hace
 * el filtrado; este caso de uso enriquece el nombre del tutor desde el espejo
 * local (`IUsuarioDirectoryPort`), sin llamar a `auth`.
 */
@Injectable()
export class BuscarTutoriasUseCase {
  constructor(
    @Inject(TUTORIA_QUERY)
    private readonly query: ITutoriaQueryPort,
    @Inject(USUARIO_DIRECTORY_PORT)
    private readonly directory: IUsuarioDirectoryPort,
  ) {}

  async ejecutar(
    filtros: BuscarTutoriasFiltros,
  ): Promise<TutoriaResumenConTutor[]> {
    const resumenes = await this.query.buscar(filtros);
    const tutorIds = [...new Set(resumenes.map((r) => r.tutorUserId))];
    const usuarios = await this.directory.getMany(tutorIds);
    const nombrePorId = new Map(
      usuarios.map((u) => [u.userId, `${u.nombre} ${u.apellido}`]),
    );
    return resumenes.map((r) => ({
      ...r,
      tutorNombre: nombrePorId.get(r.tutorUserId) ?? null,
    }));
  }
}
