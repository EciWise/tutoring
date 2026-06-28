import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class EditarDisponibilidadDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  materiaId?: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  salaId?: string;

  @ApiPropertyOptional({ enum: Modalidad })
  @IsOptional()
  @IsEnum(Modalidad)
  modalidad?: Modalidad;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cuposMaximos?: number;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vigenciaDesde?: Date;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vigenciaHasta?: Date;
}
