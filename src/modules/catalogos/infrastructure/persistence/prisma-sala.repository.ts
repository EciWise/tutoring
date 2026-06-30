import { Injectable } from '@nestjs/common';
import type { Sala as SalaRow } from '../../../../shared/infrastructure/prisma/prisma-client';
import { mapUniqueViolation } from '../../../../shared/infrastructure/prisma/prisma-error.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { Sala } from '../../domain/entities/sala.entity';
import {
  ActualizarSalaCambios,
  ISalaRepository,
} from '../../domain/ports/outbound/sala.repository.port';

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

  async obtenerPorId(id: string): Promise<Sala | null> {
    const row = await this.prisma.sala.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async actualizar(id: string, cambios: ActualizarSalaCambios): Promise<Sala> {
    try {
      const row = await this.prisma.sala.update({
        where: { id },
        data: {
          ...(cambios.codigo !== undefined ? { codigo: cambios.codigo } : {}),
          ...(cambios.edificio !== undefined
            ? { edificio: cambios.edificio }
            : {}),
          ...(cambios.activa !== undefined ? { activa: cambios.activa } : {}),
        },
      });
      return this.toDomain(row);
    } catch (error) {
      mapUniqueViolation(error, `Ya existe una sala con ese código.`);
      throw error;
    }
  }

  async eliminar(id: string): Promise<void> {
    const row = await this.prisma.sala.findUnique({ where: { id } });
    if (!row) throw new NotFoundError(`No existe la sala: ${id}`);
    await this.prisma.sala.delete({ where: { id } });
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
