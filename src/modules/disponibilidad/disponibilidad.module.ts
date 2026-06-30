import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { EventPublisherModule } from '../../shared/infrastructure/messaging/event-publisher.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { TutoriasModule } from '../tutorias/tutorias.module';
import { DesactivarDisponibilidadUseCase } from './application/use-cases/desactivar-disponibilidad.use-case';
import { EditarDisponibilidadUseCase } from './application/use-cases/editar-disponibilidad.use-case';
import { ListarDisponibilidadesDeTutorUseCase } from './application/use-cases/listar-disponibilidades-de-tutor.use-case';
import { MaterializarVentanaUseCase } from './application/use-cases/materializar-ventana.use-case';
import { PublicarDisponibilidadUseCase } from './application/use-cases/publicar-disponibilidad.use-case';
import { DISPONIBILIDAD_REPOSITORY } from './domain/ports/outbound/disponibilidad.repository.port';
import { DisponibilidadController } from './infrastructure/http/controllers/disponibilidad.controller';
import { MaterializacionController } from './infrastructure/http/controllers/materializacion.controller';
import { PrismaDisponibilidadRepository } from './infrastructure/persistence/prisma-disponibilidad.repository';
import { DisponibilidadPublicadaListener } from './infrastructure/scheduling/disponibilidad-publicada.listener';
import { MaterializacionJob } from './infrastructure/scheduling/materializacion.job';

/**
 * Slice `disponibilidad`: plantillas recurrentes + job de materialización.
 * Depende de `catalogos` (puertos públicos de consulta tutor-materia y franja) y
 * de `tutorias` (puerto `TUTORIA_REPOSITORY` para persistir los slots).
 */
@Module({
  imports: [AuthModule, CatalogosModule, TutoriasModule, EventPublisherModule],
  controllers: [DisponibilidadController, MaterializacionController],
  providers: [
    PublicarDisponibilidadUseCase,
    EditarDisponibilidadUseCase,
    DesactivarDisponibilidadUseCase,
    ListarDisponibilidadesDeTutorUseCase,
    MaterializarVentanaUseCase,
    MaterializacionJob,
    DisponibilidadPublicadaListener,
    {
      provide: DISPONIBILIDAD_REPOSITORY,
      useClass: PrismaDisponibilidadRepository,
    },
  ],
})
export class DisponibilidadModule {}
