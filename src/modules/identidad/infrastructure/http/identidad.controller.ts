import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../../../auth/types/authenticated-user';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import {
  USUARIO_DIRECTORY_PORT,
  type IUsuarioDirectoryPort,
  type UsuarioLocalView,
} from '../../domain/ports/outbound/usuario-directory.port';

/**
 * Endpoints de verificación de identidad. Requieren JWT válido de `auth`. Al
 * pasar por el guard, el `JwtCaptureInterceptor` global sincroniza al usuario en
 * el espejo local `usuario_local`.
 */
@ApiTags('identidad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('identidad')
export class IdentidadController {
  constructor(
    @Inject(USUARIO_DIRECTORY_PORT)
    private readonly directory: IUsuarioDirectoryPort,
  ) {}

  /** Devuelve los claims del usuario autenticado (lo que `auth` firmó en el JWT). */
  @Get('me')
  @ApiOperation({ summary: 'Usuario autenticado (claims del JWT)' })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  /** Lee un usuario del espejo local; sirve para comprobar la captura perezosa. */
  @Get('usuarios/:userId')
  @ApiOperation({ summary: 'Usuario del espejo local usuario_local' })
  async getUsuario(@Param('userId') userId: string): Promise<UsuarioLocalView> {
    const usuario = await this.directory.getById(userId);
    if (!usuario) {
      throw new NotFoundError(
        `No existe usuario en el espejo local: ${userId}`,
      );
    }
    return usuario;
  }
}
