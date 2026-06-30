import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarMateriaDto {
  @ApiPropertyOptional({ maxLength: 20, example: 'MATD1101' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiPropertyOptional({ maxLength: 100, example: 'Cálculo Diferencial' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
