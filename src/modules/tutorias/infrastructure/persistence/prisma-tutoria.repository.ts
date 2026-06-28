import { Injectable } from '@nestjs/common';
import { mapUniqueViolation } from '../../../../shared/infrastructure/prisma/prisma-error.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Tutoria } from '../../domain/entities/tutoria.entity';
import { ITutoriaRepository } from '../../domain/ports/outbound/tutoria.repository.port';

/** Adapter Prisma de escritura del agregado `Tutoria`. */
@Injectable()
export class PrismaTutoriaRepository implements ITutoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(tutoria: Tutoria): Promise<void> {
    try {
      await this.prisma.tutoria.create({
        data: {
          id: tutoria.id,
          tutorUserId: tutoria.tutorUserId,
          franjaId: tutoria.franjaId,
          fecha: tutoria.fecha,
          materiaId: tutoria.materiaId,
          salaId: tutoria.salaId,
          disponibilidadId: tutoria.disponibilidadId,
          modalidad: tutoria.modalidad,
          estado: tutoria.estado,
          cuposMaximos: tutoria.cuposMaximos,
          cuposOcupados: tutoria.cuposOcupados,
          enlaceVirtual: tutoria.enlaceVirtual,
        },
      });
    } catch (error) {
      mapUniqueViolation(
        error,
        `Ya existe una tutoría para ese tutor, franja y fecha (${tutoria.fecha.toISOString().slice(0, 10)}).`,
      );
    }
  }
}
