import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarSalaDto {
  @ApiPropertyOptional({ maxLength: 20, example: 'B-201' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiPropertyOptional({ maxLength: 80, example: 'Bloque B', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  edificio?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
