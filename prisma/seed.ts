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
async function sembrarFranjas(prisma: PrismaClient): Promise<void> {
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
  logger.log(`Franjas sembradas: ${grilla.length} (idempotente).`);
}

// Edificios y salones disponibles POR EL MOMENTO. Ampliar esta lista cuando la
// universidad confirme los demás edificios/salones.
const EDIFICIOS = ['A', 'B', 'C'];
const SALON_DESDE = 100;
const SALON_HASTA = 110; // inclusive

/**
 * Lista de salas a sembrar. `codigo` = "<EDIFICIO>-<NUMERO>" (p.ej. "A-100"),
 * formato consistente con el resto del catálogo. 3 edificios × 11 salones = 33.
 */
function construirSalas(): { codigo: string; edificio: string }[] {
  const salas: { codigo: string; edificio: string }[] = [];
  for (const edificio of EDIFICIOS) {
    for (let numero = SALON_DESDE; numero <= SALON_HASTA; numero++) {
      salas.push({ codigo: `${edificio}-${numero}`, edificio });
    }
  }
  return salas;
}

/**
 * Siembra las salas físicas. Idempotente vía `upsert` por `codigo` (único):
 * re-ejecutar no duplica ni falla.
 */
async function sembrarSalas(prisma: PrismaClient): Promise<void> {
  const salas = construirSalas();
  for (const s of salas) {
    await prisma.sala.upsert({
      where: { codigo: s.codigo },
      create: { codigo: s.codigo, edificio: s.edificio, activa: true },
      update: { edificio: s.edificio, activa: true },
    });
  }
  logger.log(`Salas sembradas: ${salas.length} (idempotente).`);
}

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await sembrarFranjas(prisma);
    await sembrarSalas(prisma);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  logger.error('Seed falló', error instanceof Error ? error.stack : error);
  process.exit(1);
});
