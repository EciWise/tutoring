import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Exige un JWT válido. Aplica `JwtStrategy` y puebla `req.user`. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
