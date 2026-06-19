import { ApiProperty } from '@nestjs/swagger';
import { FranjaHoraria } from '../../../domain/entities/franja-horaria.entity';
import { Materia } from '../../../domain/entities/materia.entity';
import { Sala } from '../../../domain/entities/sala.entity';
import { TutorMateria } from '../../../domain/entities/tutor-materia.entity';

/**
 * DTOs de respuesta (presenters). Documentan la API en Swagger y son el único
 * tipo que sale de la capa HTTP: nunca se expone una entidad de dominio ni un
 * modelo de Prisma. Los mapeadores estáticos viven aquí, junto al contrato.
 */
export class MateriaResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'MATD1101' }) codigo!: string;
  @ApiProperty({ example: 'Cálculo Diferencial' }) nombre!: string;
  @ApiProperty() activa!: boolean;
  @ApiProperty({ format: 'date-time' }) creadoEn!: string;

  static desde(m: Materia): MateriaResponseDto {
    return {
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      activa: m.activa,
      creadoEn: m.creadoEn.toISOString(),
    };
  }
}

export class SalaResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'B-201' }) codigo!: string;
  @ApiProperty({ nullable: true, example: 'Bloque B' }) edificio!:
    | string
    | null;
  @ApiProperty({ nullable: true, example: 30 }) capacidad!: number | null;
  @ApiProperty() activa!: boolean;
  @ApiProperty({ format: 'date-time' }) creadoEn!: string;

  static desde(s: Sala): SalaResponseDto {
    return {
      id: s.id,
      codigo: s.codigo,
      edificio: s.edificio,
      capacidad: s.capacidad,
      activa: s.activa,
      creadoEn: s.creadoEn.toISOString(),
    };
  }
}

export class FranjaResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 1, description: '1=Lun ... 5=Vie' })
  diaSemana!: number;
  @ApiProperty({ example: '07:00' }) horaInicio!: string;
  @ApiProperty({ example: '08:30' }) horaFin!: string;
  @ApiProperty({ example: 1 }) orden!: number;
  @ApiProperty() activa!: boolean;

  static desde(f: FranjaHoraria): FranjaResponseDto {
    return {
      id: f.id,
      diaSemana: f.diaSemana,
      horaInicio: f.horaInicio,
      horaFin: f.horaFin,
      orden: f.orden,
      activa: f.activa,
    };
  }
}

export class TutorMateriaResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) materiaId!: string;
  @ApiProperty({ format: 'uuid' }) tutorUserId!: string;
  @ApiProperty() autorizada!: boolean;
  @ApiProperty({ format: 'date-time' }) creadoEn!: string;

  static desde(tm: TutorMateria): TutorMateriaResponseDto {
    return {
      id: tm.id,
      materiaId: tm.materiaId,
      tutorUserId: tm.tutorUserId,
      autorizada: tm.autorizada,
      creadoEn: tm.creadoEn.toISOString(),
    };
  }
}
