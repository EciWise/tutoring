import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearMateriaDto {
  @ApiProperty({
    example: 'MATD1101',
    maxLength: 20,
    description: 'Código único de la materia',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo!: string;

  @ApiProperty({ example: 'Cálculo Diferencial', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;
}
