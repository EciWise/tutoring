import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from './prisma-client';

/**
 * Cliente Prisma único y compartido (provider global vía `PrismaModule`).
 *
 * Prisma 7 no define `url` en el datasource: la conexión se inyecta en runtime
 * mediante el driver adapter de PostgreSQL (`@prisma/adapter-pg`) usando
 * `DATABASE_URL` (la URL pooled de Neon). Las migraciones usan `DIRECT_URL` por
 * separado (ver `prisma.config.ts`).
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
