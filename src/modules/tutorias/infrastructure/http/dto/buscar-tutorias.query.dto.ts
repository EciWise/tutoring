import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Modalidad } from '../../../../../shared/domain/enums/modalidad.enum';

export class BuscarTutoriasQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  materiaId?: string;

  @ApiPropertyOptional({ enum: Modalidad })
  @IsOptional()
  @IsEnum(Modalidad)
  modalidad?: Modalidad;

  @ApiPropertyOptional({ format: 'date', example: '2026-06-22' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tutorUserId?: string;
}
