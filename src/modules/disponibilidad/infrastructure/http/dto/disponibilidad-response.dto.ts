import { ApiProperty } from '@nestjs/swagger';
import { Modalidad } from '../../../../../shared/domain/enums/modalidad.enum';
import { DisponibilidadTutor } from '../../../domain/entities/disponibilidad-tutor.entity';

export class DisponibilidadResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) tutorUserId!: string;
  @ApiProperty({ format: 'uuid' }) franjaId!: string;
  @ApiProperty({ example: 1 }) franjaDiaSemana!: number;
  @ApiProperty({ format: 'uuid' }) materiaId!: string;
  @ApiProperty({ format: 'uuid', nullable: true }) salaId!: string | null;
  @ApiProperty({ enum: Modalidad }) modalidad!: Modalidad;
  @ApiProperty() cuposMaximos!: number;
  @ApiProperty({ format: 'date' }) vigenciaDesde!: string;
  @ApiProperty({ format: 'date' }) vigenciaHasta!: string;
  @ApiProperty() activa!: boolean;

  static desde(d: DisponibilidadTutor): DisponibilidadResponseDto {
    return {
      id: d.id,
      tutorUserId: d.tutorUserId,
      franjaId: d.franjaId,
      franjaDiaSemana: d.franjaDiaSemana,
      materiaId: d.materiaId,
      salaId: d.salaId,
      modalidad: d.modalidad,
      cuposMaximos: d.cuposMaximos,
      vigenciaDesde: d.vigencia.desde.toISOString().slice(0, 10),
      vigenciaHasta: d.vigencia.hasta.toISOString().slice(0, 10),
      activa: d.activa,
    };
  }
}
