import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CancelarTutoriaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tutoriaId!: string;

  @ApiProperty({ example: 'Incapacidad médica', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo!: string;
}
