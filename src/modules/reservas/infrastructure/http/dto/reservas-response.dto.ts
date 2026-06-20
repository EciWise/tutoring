import { ApiProperty } from '@nestjs/swagger';
import { EstadoAsistencia } from '../../../../../shared/domain/enums/estado-asistencia.enum';
import { Participante } from '../../../domain/entities/participante.entity';

export class ParticipanteResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) tutoriaId!: string;
  @ApiProperty({ format: 'uuid' }) estudianteUserId!: string;
  @ApiProperty({ enum: EstadoAsistencia }) estadoAsistencia!: EstadoAsistencia;
  @ApiProperty({ nullable: true }) temaEspecifico!: string | null;
  @ApiProperty({ nullable: true }) descripcionDudas!: string | null;
  @ApiProperty({ nullable: true, format: 'date-time' }) canceladoEn!:
    | string
    | null;
  @ApiProperty({ nullable: true }) motivoCancelacion!: string | null;

  static desde(p: Participante): ParticipanteResponseDto {
    return {
      id: p.id,
      tutoriaId: p.tutoriaId,
      estudianteUserId: p.estudianteUserId,
      estadoAsistencia: p.estadoAsistencia,
      temaEspecifico: p.temaEspecifico,
      descripcionDudas: p.descripcionDudas,
      canceladoEn: p.canceladoEn ? p.canceladoEn.toISOString() : null,
      motivoCancelacion: p.motivoCancelacion,
    };
  }
}

export class ReprogramacionResponseDto {
  @ApiProperty({ type: ParticipanteResponseDto })
  origen!: ParticipanteResponseDto;
  @ApiProperty({ type: ParticipanteResponseDto })
  destino!: ParticipanteResponseDto;
}

export class CancelacionTutoriaResponseDto {
  @ApiProperty({ format: 'uuid' }) tutoriaId!: string;
  @ApiProperty({ example: 3 }) participantesLiberados!: number;
}
