import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { EventPublisherModule } from '../../shared/infrastructure/messaging/event-publisher.module';
import { IdentidadModule } from '../identidad/identidad.module';
import { CancelarReservaUseCase } from './application/use-cases/cancelar-reserva.use-case';
import { CalificarTutoriaUseCase } from './application/use-cases/calificar-tutoria.use-case';
import { CancelarTutoriaPorTutorUseCase } from './application/use-cases/cancelar-tutoria-por-tutor.use-case';
import { FinalizarTutoriaUseCase } from './application/use-cases/finalizar-tutoria.use-case';
import { ListarReservasDeEstudianteUseCase } from './application/use-cases/listar-reservas-de-estudiante.use-case';
import { ListarSesionesDeTutorUseCase } from './application/use-cases/listar-sesiones-de-tutor.use-case';
import { ReprogramarTutoriaUseCase } from './application/use-cases/reprogramar-tutoria.use-case';
import { ReservarTutoriaUseCase } from './application/use-cases/reservar-tutoria.use-case';
import { RESERVA_REPOSITORY } from './domain/ports/outbound/reserva.repository.port';
import { ReservasController } from './infrastructure/http/controllers/reservas.controller';
import { PrismaReservaRepository } from './infrastructure/persistence/prisma-reserva.repository';

/**
 * Slice `reservas`: reservar/cancelar/reprogramar (estudiante) y cancelar la
 * tutoría completa (tutor). Las escrituras son transaccionales y atómicas sobre
 * `participante` + `tutoria` (cupos). No depende de otros slices.
 */
@Module({
  imports: [AuthModule, EventPublisherModule, IdentidadModule],
  controllers: [ReservasController],
  providers: [
    ReservarTutoriaUseCase,
    CancelarReservaUseCase,
    ReprogramarTutoriaUseCase,
    CancelarTutoriaPorTutorUseCase,
    FinalizarTutoriaUseCase,
    CalificarTutoriaUseCase,
    ListarReservasDeEstudianteUseCase,
    ListarSesionesDeTutorUseCase,
    { provide: RESERVA_REPOSITORY, useClass: PrismaReservaRepository },
  ],
})
export class ReservasModule {}
