import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedUser } from '../../../../auth/types/authenticated-user';
import {
  USUARIO_DIRECTORY_PORT,
  type IUsuarioDirectoryPort,
} from '../../domain/ports/outbound/usuario-directory.port';

/**
 * Captura perezosa: en cada request autenticada hace upsert del usuario en el
 * espejo local `usuario_local` con los claims del JWT. Es fire-and-forget — no
 * bloquea ni altera la respuesta, y un fallo de sincronización solo se loguea.
 */
@Injectable()
export class JwtCaptureInterceptor implements NestInterceptor {
  private readonly logger = new Logger(JwtCaptureInterceptor.name);

  constructor(
    @Inject(USUARIO_DIRECTORY_PORT)
    private readonly directory: IUsuarioDirectoryPort,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();

    if (user?.id) {
      void this.directory
        .upsertFromJwt({
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol,
        })
        .catch((error: unknown) => {
          const detalle =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `No se pudo sincronizar usuario_local (${user.id}): ${detalle}`,
          );
        });
    }

    return next.handle();
  }
}
