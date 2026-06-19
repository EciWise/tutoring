import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Matches, Max, Min } from 'class-validator';

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CrearFranjaDto {
  @ApiProperty({
    example: 1,
    minimum: 1,
    maximum: 5,
    description: '1=Lun ... 5=Vie (ISODOW)',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  diaSemana!: number;

  @ApiProperty({ example: '07:00', description: 'Hora de inicio HH:MM (24h)' })
  @Matches(HHMM, { message: 'horaInicio debe tener formato HH:MM (24h)' })
  horaInicio!: string;

  @ApiProperty({
    example: '08:30',
    description: 'Hora de fin HH:MM (inicio + 90 min)',
  })
  @Matches(HHMM, { message: 'horaFin debe tener formato HH:MM (24h)' })
  horaFin!: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    maximum: 8,
    description: 'Bloque del día (1..8)',
  })
  @IsInt()
  @Min(1)
  @Max(8)
  orden!: number;
}
