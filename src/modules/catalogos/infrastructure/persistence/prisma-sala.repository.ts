import { Injectable } from '@nestjs/common';
import type { Sala as SalaRow } from '../../../../shared/infrastructure/prisma/prisma-client';
import { mapUniqueViolation } from '../../../../shared/infrastructure/prisma/prisma-error.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Sala } from '../../domain/entities/sala.entity';
import { ISalaRepository } from '../../domain/ports/outbound/sala.repository.port';

/** Adapter Prisma del puerto `ISalaRepository`. */
@Injectable()
export class PrismaSalaRepository implements ISalaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(sala: Sala): Promise<void> {
    try {
      await this.prisma.sala.create({
        data: {
          id: sala.id,
          codigo: sala.codigo,
          edificio: sala.edificio,
          activa: sala.activa,
        },
      });
    } catch (error) {
      mapUniqueViolation(
        error,
        `Ya existe una sala con código ${sala.codigo}.`,
      );
    }
  }

  async listar(): Promise<Sala[]> {
    const rows = await this.prisma.sala.findMany({
      orderBy: { codigo: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: SalaRow): Sala {
    return Sala.reconstituir({
      id: row.id,
      codigo: row.codigo,
      edificio: row.edificio,
      activa: row.activa,
      creadoEn: row.creadoEn,
    });
  }
}
