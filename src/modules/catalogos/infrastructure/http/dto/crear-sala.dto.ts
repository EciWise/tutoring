import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearSalaDto {
  @ApiProperty({
    example: 'B-201',
    maxLength: 20,
    description: 'Código único de la sala',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo!: string;

  @ApiPropertyOptional({ example: 'Bloque B', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  edificio?: string;

  @ApiPropertyOptional({ example: 30, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacidad?: number;
}
