import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { EventPublisherModule } from '../../shared/infrastructure/messaging/event-publisher.module';
import { CancelarReservaUseCase } from './application/use-cases/cancelar-reserva.use-case';
import { CancelarTutoriaPorTutorUseCase } from './application/use-cases/cancelar-tutoria-por-tutor.use-case';
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
  imports: [AuthModule, EventPublisherModule],
  controllers: [ReservasController],
  providers: [
    ReservarTutoriaUseCase,
    CancelarReservaUseCase,
    ReprogramarTutoriaUseCase,
    CancelarTutoriaPorTutorUseCase,
    { provide: RESERVA_REPOSITORY, useClass: PrismaReservaRepository },
  ],
})
export class ReservasModule {}
