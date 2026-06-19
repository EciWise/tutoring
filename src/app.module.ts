import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { EventPublisherModule } from './shared/infrastructure/messaging/event-publisher.module';
import { AuthModule } from './auth/auth.module';
import { IdentidadModule } from './modules/identidad/identidad.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    PrismaModule,
    EventPublisherModule,
    AuthModule,
    IdentidadModule,
    CatalogosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
