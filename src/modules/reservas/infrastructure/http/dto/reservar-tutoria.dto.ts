import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReservarTutoriaDto {
  @ApiProperty({ format: 'uuid', description: 'Tutoría (slot) a reservar' })
  @IsUUID()
  tutoriaId!: string;

  @ApiPropertyOptional({ maxLength: 200, example: 'Recursión y backtracking' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  temaEspecifico?: string;

  @ApiPropertyOptional({ example: 'No entiendo cómo plantear el caso base.' })
  @IsOptional()
  @IsString()
  descripcionDudas?: string;
}
