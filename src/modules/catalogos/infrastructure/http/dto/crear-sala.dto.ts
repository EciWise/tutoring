import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
