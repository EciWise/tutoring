import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class AsignarTutorMateriaDto {
  @ApiProperty({ format: 'uuid', description: 'Id de la materia del catálogo' })
  @IsUUID()
  materiaId!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'userId del tutor (referencia externa de auth)',
  })
  @IsUUID()
  tutorUserId!: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Si el tutor queda autorizado a publicar (RN-05)',
  })
  @IsOptional()
  @IsBoolean()
  autorizada?: boolean;
}
