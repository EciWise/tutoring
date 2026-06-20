import { ValidationError } from '../../../shared/domain/errors/domain-error';

/**
 * Toda cancelación exige un motivo (RN-08; no hay política de anticipación). Es
 * regla de dominio reutilizada por la cancelación de reserva (estudiante) y de
 * tutoría (tutor). Devuelve el motivo saneado.
 */
export function exigirMotivo(motivo: string): string {
  const limpio = motivo?.trim() ?? '';
  if (limpio.length === 0) {
    throw new ValidationError('La cancelación requiere un motivo.');
  }
  return limpio;
}
