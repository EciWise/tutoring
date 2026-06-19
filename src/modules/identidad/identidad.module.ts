import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '../../auth/auth.module';
import { USUARIO_DIRECTORY_PORT } from './domain/ports/outbound/usuario-directory.port';
import { PrismaUsuarioLocalRepository } from './infrastructure/persistence/prisma-usuario-local.repository';
import { JwtCaptureInterceptor } from './infrastructure/http/jwt-capture.interceptor';
import { IdentidadController } from './infrastructure/http/identidad.controller';

/**
 * Slice `identidad`: espejo local de usuarios poblado desde el JWT. Registra el
 * interceptor de captura como `APP_INTERCEPTOR` global y expone el puerto de
 * directorio para que otros slices resuelvan nombre/apellido sin llamar a `auth`.
 */
@Module({
  imports: [AuthModule],
  controllers: [IdentidadController],
  providers: [
    {
      provide: USUARIO_DIRECTORY_PORT,
      useClass: PrismaUsuarioLocalRepository,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: JwtCaptureInterceptor,
    },
  ],
  exports: [USUARIO_DIRECTORY_PORT],
})
export class IdentidadModule {}
