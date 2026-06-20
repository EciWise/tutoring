import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ReprogramarTutoriaDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Tutoría donde está la reserva actual',
  })
  @IsUUID()
  tutoriaOrigenId!: string;

  @ApiProperty({ format: 'uuid', description: 'Nueva tutoría destino' })
  @IsUUID()
  tutoriaDestinoId!: string;

  @ApiProperty({ example: 'Prefiero el horario de la tarde', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo!: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  temaEspecifico?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcionDudas?: string;
}
