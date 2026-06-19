import { Injectable } from '@nestjs/common';
import type { TutorMateria as TutorMateriaRow } from '../../../../shared/infrastructure/prisma/prisma-client';
import { mapUniqueViolation } from '../../../../shared/infrastructure/prisma/prisma-error.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TutorMateria } from '../../domain/entities/tutor-materia.entity';
import { ITutorMateriaRepository } from '../../domain/ports/outbound/tutor-materia.repository.port';

/** Adapter Prisma del puerto `ITutorMateriaRepository`. */
@Injectable()
export class PrismaTutorMateriaRepository implements ITutorMateriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(tm: TutorMateria): Promise<void> {
    try {
      await this.prisma.tutorMateria.create({
        data: {
          id: tm.id,
          materiaId: tm.materiaId,
          tutorUserId: tm.tutorUserId,
          autorizada: tm.autorizada,
        },
      });
    } catch (error) {
      mapUniqueViolation(error, 'La materia ya está asignada a ese tutor.');
    }
  }

  async actualizar(tm: TutorMateria): Promise<void> {
    await this.prisma.tutorMateria.update({
      where: { id: tm.id },
      data: { autorizada: tm.autorizada },
    });
  }

  async obtenerPorId(id: string): Promise<TutorMateria | null> {
    const row = await this.prisma.tutorMateria.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async listarPorTutor(tutorUserId: string): Promise<TutorMateria[]> {
    const rows = await this.prisma.tutorMateria.findMany({
      where: { tutorUserId },
      orderBy: { creadoEn: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: TutorMateriaRow): TutorMateria {
    return TutorMateria.reconstituir({
      id: row.id,
      materiaId: row.materiaId,
      tutorUserId: row.tutorUserId,
      autorizada: row.autorizada,
      creadoEn: row.creadoEn,
    });
  }
}
