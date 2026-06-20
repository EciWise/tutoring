import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { EventPublisherModule } from './shared/infrastructure/messaging/event-publisher.module';
import { AuthModule } from './auth/auth.module';
import { IdentidadModule } from './modules/identidad/identidad.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { TutoriasModule } from './modules/tutorias/tutorias.module';
import { DisponibilidadModule } from './modules/disponibilidad/disponibilidad.module';
import { ReservasModule } from './modules/reservas/reservas.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    EventPublisherModule,
    AuthModule,
    IdentidadModule,
    CatalogosModule,
    TutoriasModule,
    DisponibilidadModule,
    ReservasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
