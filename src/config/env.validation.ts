import * as Joi from 'joi';

/**
 * Esquema de validación de variables de entorno. El arranque falla si falta o
 * es inválida una variable requerida (`abortEarly: false` reporta todas).
 * `DATABASE_URL` (pooled, runtime) y `DIRECT_URL` (direct, migraciones) NO se
 * mezclan. `unknown(true)` permite el resto de variables del entorno
 * (p.ej. RABBITMQ_URL, PATH) sin declararlas aquí.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),

  // Base de datos (Neon)
  DATABASE_URL: Joi.string().uri().required(),
  DIRECT_URL: Joi.string().uri().required(),

  // JWT emitido por el servicio `auth` (HS256, secreto compartido)
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRATION: Joi.string().default('1h'),

  // Ventana móvil del job de materialización de disponibilidades
  MATERIALIZACION_VENTANA_SEMANAS: Joi.number().integer().min(1).default(2),
}).unknown(true);
