import { Injectable } from '@nestjs/common';
import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  BuscarTutoriasFiltros,
  ITutoriaQueryPort,
  TutoriaDetalle,
  TutoriaResumen,
} from '../../domain/ports/outbound/tutoria-query.port';

/** `@db.Time` (Date sobre la época, UTC) → "HH:MM". */
function deTime(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const INCLUDE = {
  franja: { select: { diaSemana: true, horaInicio: true, horaFin: true } },
  materia: { select: { codigo: true, nombre: true } },
  sala: { select: { codigo: true } },
} as const;

type FilaConRelaciones = {
  id: string;
  tutorUserId: string;
  fecha: Date;
  materiaId: string;
  modalidad: string;
  estado: string;
  enlaceVirtual: string | null;
  temaGeneral: string | null;
  cuposMaximos: number;
  cuposOcupados: number;
  franja: { diaSemana: number; horaInicio: Date; horaFin: Date };
  materia: { codigo: string; nombre: string };
  sala: { codigo: string } | null;
};

/**
 * Adapter Prisma de lectura (CQRS) de tutorías. Hace los joins a franja/materia/
 * sala y devuelve proyecciones planas. El filtro "con cupo disponible" se aplica
 * en memoria porque Prisma no compara dos columnas (`cuposOcupados < cuposMaximos`)
 * en `where`; para el volumen del MVP es suficiente.
 */
@Injectable()
export class PrismaTutoriaQueryRepository implements ITutoriaQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(filtros: BuscarTutoriasFiltros): Promise<TutoriaResumen[]> {
    const filas = await this.prisma.tutoria.findMany({
      where: {
        estado: 'PROGRAMADA',
        materiaId: filtros.materiaId,
        tutorUserId: filtros.tutorUserId,
        modalidad: filtros.modalidad,
        fecha: filtros.fecha,
      },
      include: INCLUDE,
      orderBy: [{ fecha: 'asc' }, { franjaId: 'asc' }],
    });
    return (filas as unknown as FilaConRelaciones[])
      .filter((f) => f.cuposOcupados < f.cuposMaximos)
      .map((f) => this.toResumen(f));
  }

  async obtenerDetalle(id: string): Promise<TutoriaDetalle | null> {
    const fila = await this.prisma.tutoria.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!fila) {
      return null;
    }
    const f = fila as unknown as FilaConRelaciones;
    return {
      ...this.toResumen(f),
      estado: f.estado as EstadoTutoria,
      temaGeneral: f.temaGeneral,
    };
  }

  private toResumen(f: FilaConRelaciones): TutoriaResumen {
    return {
      id: f.id,
      tutorUserId: f.tutorUserId,
      fecha: f.fecha,
      diaSemana: f.franja.diaSemana,
      horaInicio: deTime(f.franja.horaInicio),
      horaFin: deTime(f.franja.horaFin),
      materiaId: f.materiaId,
      materiaCodigo: f.materia.codigo,
      materiaNombre: f.materia.nombre,
      modalidad: f.modalidad as Modalidad,
      salaCodigo: f.sala?.codigo ?? null,
      enlaceVirtual: f.enlaceVirtual,
      cuposMaximos: f.cuposMaximos,
      cuposDisponibles: f.cuposMaximos - f.cuposOcupados,
    };
  }
}
