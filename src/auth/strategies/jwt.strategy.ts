import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RolUsuario } from '../../shared/domain/enums/rol-usuario.enum';
import { AuthenticatedUser } from '../types/authenticated-user';

/** Forma del payload firmado por el servicio `auth`. */
interface JwtPayload {
  sub: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
}

/**
 * Valida el JWT HS256 emitido por `auth`. Fija el algoritmo a HS256 para evitar
 * ataques de confusión de algoritmo y rechaza tokens expirados. El secreto se
 * comparte vía `JWT_SECRET`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload?.sub || !payload.email || !payload.rol) {
      throw new UnauthorizedException('Token inválido: payload incompleto');
    }
    return {
      id: payload.sub,
      email: payload.email,
      nombre: payload.nombre,
      apellido: payload.apellido,
      rol: payload.rol,
    };
  }
}
