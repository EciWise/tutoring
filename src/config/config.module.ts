import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env.validation';

/**
 * Configuración global de la aplicación. Valida el entorno con Joi al arranque
 * y expone `ConfigService` de forma global (no requiere reimportar en cada
 * módulo). Si una variable requerida falta o es inválida, la app no arranca.
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
})
export class ConfigModule {}
