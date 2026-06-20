import { BusinessRuleViolation } from '../../../../shared/domain/errors/domain-error';

/** Actor que opera sobre una disponibilidad: el propio tutor o un admin. */
export interface ActorDisponibilidad {
  userId: string;
  esAdmin: boolean;
}

/** Un tutor solo puede tocar sus propias disponibilidades; el admin, cualquiera. */
export function exigirPropietario(
  tutorUserId: string,
  actor: ActorDisponibilidad,
): void {
  if (!actor.esAdmin && tutorUserId !== actor.userId) {
    throw new BusinessRuleViolation(
      'No puede modificar la disponibilidad de otro tutor.',
    );
  }
}
