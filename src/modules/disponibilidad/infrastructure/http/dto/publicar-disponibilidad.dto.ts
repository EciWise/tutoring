import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Modalidad } from '../../../../../shared/domain/enums/modalidad.enum';

export class PublicarDisponibilidadDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Franja institucional (de las sembradas)',
  })
  @IsUUID()
  franjaId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  materiaId!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Obligatoria si PRESENCIAL; opcional si VIRTUAL',
  })
  @IsOptional()
  @IsUUID()
  salaId?: string;

  @ApiProperty({ enum: Modalidad })
  @IsEnum(Modalidad)
  modalidad!: Modalidad;

  @ApiProperty({ minimum: 1, example: 4 })
  @IsInt()
  @Min(1)
  cuposMaximos!: number;

  @ApiProperty({ format: 'date', example: '2026-06-22' })
  @Type(() => Date)
  @IsDate()
  vigenciaDesde!: Date;

  @ApiProperty({ format: 'date', example: '2026-12-15' })
  @Type(() => Date)
  @IsDate()
  vigenciaHasta!: Date;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Solo admin: tutor en cuyo nombre se publica. Un tutor lo omite.',
  })
  @IsOptional()
  @IsUUID()
  tutorUserId?: string;
}
