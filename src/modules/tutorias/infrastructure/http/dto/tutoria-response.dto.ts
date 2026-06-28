import { ApiProperty } from '@nestjs/swagger';
import { EstadoTutoria } from '../../../../../shared/domain/enums/estado-tutoria.enum';
import { Modalidad } from '../../../../../shared/domain/enums/modalidad.enum';
import type { TutoriaResumenConTutor } from '../../../application/use-cases/buscar-tutorias.use-case';
import type { TutoriaDetalleConTutor } from '../../../application/use-cases/obtener-detalle-tutoria.use-case';

/** Slot de tutoría para búsqueda (RF-04). VIRTUAL expone enlace, PRESENCIAL sala. */
export class TutoriaResumenDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) tutorUserId!: string;
  @ApiProperty({ nullable: true }) tutorNombre!: string | null;
  @ApiProperty({ format: 'date-time' }) fecha!: string;
  @ApiProperty({ example: 1, description: '1=Lun ... 5=Vie' })
  diaSemana!: number;
  @ApiProperty({ example: '07:00' }) horaInicio!: string;
  @ApiProperty({ example: '08:30' }) horaFin!: string;
  @ApiProperty({ format: 'uuid' }) materiaId!: string;
  @ApiProperty() materiaCodigo!: string;
  @ApiProperty() materiaNombre!: string;
  @ApiProperty({ enum: Modalidad }) modalidad!: Modalidad;
  @ApiProperty({ nullable: true }) salaCodigo!: string | null;
  @ApiProperty({ nullable: true }) enlaceVirtual!: string | null;
  @ApiProperty() cuposMaximos!: number;
  @ApiProperty() cuposDisponibles!: number;

  static desde(r: TutoriaResumenConTutor): TutoriaResumenDto {
    return {
      id: r.id,
      tutorUserId: r.tutorUserId,
      tutorNombre: r.tutorNombre,
      fecha: r.fecha.toISOString().slice(0, 10),
      diaSemana: r.diaSemana,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      materiaId: r.materiaId,
      materiaCodigo: r.materiaCodigo,
      materiaNombre: r.materiaNombre,
      modalidad: r.modalidad,
      salaCodigo: r.salaCodigo,
      enlaceVirtual: r.enlaceVirtual,
      cuposMaximos: r.cuposMaximos,
      cuposDisponibles: r.cuposDisponibles,
    };
  }
}

export class TutoriaDetalleDto extends TutoriaResumenDto {
  @ApiProperty({ enum: EstadoTutoria }) estado!: EstadoTutoria;
  @ApiProperty({ nullable: true }) temaGeneral!: string | null;

  static desdeDetalle(d: TutoriaDetalleConTutor): TutoriaDetalleDto {
    return {
      ...TutoriaResumenDto.desde(d),
      estado: d.estado,
      temaGeneral: d.temaGeneral,
    };
  }
}
