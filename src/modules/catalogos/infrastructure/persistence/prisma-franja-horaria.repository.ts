import { Injectable } from '@nestjs/common';
import type { FranjaHoraria as FranjaRow } from '../../../../shared/infrastructure/prisma/prisma-client';
import { mapUniqueViolation } from '../../../../shared/infrastructure/prisma/prisma-error.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';
import { IFranjaHorariaRepository } from '../../domain/ports/outbound/franja-horaria.repository.port';

// ponytail: round-trip de @db.Time vía UTC sobre la época (1970-01-01); si algún
// día entra zona horaria local, encapsular en un VO de tiempo dedicado.
function aTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0));
}

function deTime(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Adapter Prisma del puerto `IFranjaHorariaRepository`. */
@Injectable()
export class PrismaFranjaHorariaRepository implements IFranjaHorariaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(franja: FranjaHoraria): Promise<void> {
    try {
      await this.prisma.franjaHoraria.create({
        data: {
          id: franja.id,
          diaSemana: franja.diaSemana,
          horaInicio: aTime(franja.horaInicio),
          horaFin: aTime(franja.horaFin),
          orden: franja.orden,
          activa: franja.activa,
        },
      });
    } catch (error) {
      mapUniqueViolation(
        error,
        `Ya existe una franja para el día ${franja.diaSemana} a las ${franja.horaInicio} (u orden ${franja.orden}).`,
      );
    }
  }

  async listarPorDia(dia?: number): Promise<FranjaHoraria[]> {
    const rows = await this.prisma.franjaHoraria.findMany({
      where: dia !== undefined ? { diaSemana: dia } : undefined,
      orderBy: [{ diaSemana: 'asc' }, { orden: 'asc' }],
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: FranjaRow): FranjaHoraria {
    return FranjaHoraria.reconstituir({
      id: row.id,
      diaSemana: row.diaSemana,
      horaInicio: deTime(row.horaInicio),
      horaFin: deTime(row.horaFin),
      orden: row.orden,
      activa: row.activa,
      creadoEn: row.creadoEn,
    });
  }
}
