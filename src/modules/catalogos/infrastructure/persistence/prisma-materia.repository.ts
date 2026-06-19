import { Injectable } from '@nestjs/common';
import type { Materia as MateriaRow } from '../../../../shared/infrastructure/prisma/prisma-client';
import { mapUniqueViolation } from '../../../../shared/infrastructure/prisma/prisma-error.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Materia } from '../../domain/entities/materia.entity';
import { IMateriaRepository } from '../../domain/ports/outbound/materia.repository.port';

/** Adapter Prisma del puerto `IMateriaRepository`. No expone tipos de Prisma. */
@Injectable()
export class PrismaMateriaRepository implements IMateriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(materia: Materia): Promise<void> {
    try {
      await this.prisma.materia.create({
        data: {
          id: materia.id,
          codigo: materia.codigo,
          nombre: materia.nombre,
          activa: materia.activa,
        },
      });
    } catch (error) {
      mapUniqueViolation(
        error,
        `Ya existe una materia con código ${materia.codigo}.`,
      );
    }
  }

  async actualizar(materia: Materia): Promise<void> {
    await this.prisma.materia.update({
      where: { id: materia.id },
      data: {
        codigo: materia.codigo,
        nombre: materia.nombre,
        activa: materia.activa,
      },
    });
  }

  async obtenerPorId(id: string): Promise<Materia | null> {
    const row = await this.prisma.materia.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async listar(soloActivas?: boolean): Promise<Materia[]> {
    const rows = await this.prisma.materia.findMany({
      where: soloActivas ? { activa: true } : undefined,
      orderBy: { codigo: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: MateriaRow): Materia {
    return Materia.reconstituir({
      id: row.id,
      codigo: row.codigo,
      nombre: row.nombre,
      activa: row.activa,
      creadoEn: row.creadoEn,
    });
  }
}
