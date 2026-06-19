import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';
import { construirGrillaFranjas } from '../src/modules/catalogos/domain/franja-grilla';

const logger = new Logger('Seed');

/** "HH:MM" -> Date sobre la época en UTC, para columnas `@db.Time`. */
function aTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0));
}

/**
 * Siembra la grilla de franjas horarias (L-V × 8 bloques de 90 min). Idempotente
 * vía `upsert` por la clave única `(diaSemana, horaInicio)`: re-ejecutar no
 * duplica. La grilla es requisito previo de cualquier disponibilidad.
 */
async function main(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const grilla = construirGrillaFranjas();
    for (const f of grilla) {
      await prisma.franjaHoraria.upsert({
        where: {
          diaSemana_horaInicio: {
            diaSemana: f.diaSemana,
            horaInicio: aTime(f.horaInicio),
          },
        },
        create: {
          diaSemana: f.diaSemana,
          horaInicio: aTime(f.horaInicio),
          horaFin: aTime(f.horaFin),
          orden: f.orden,
          activa: true,
        },
        update: {
          horaFin: aTime(f.horaFin),
          orden: f.orden,
          activa: true,
        },
      });
    }
    logger.log(
      `Grilla sembrada: ${grilla.length} franjas horarias (idempotente).`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  logger.error('Seed falló', error instanceof Error ? error.stack : error);
  process.exit(1);
});
