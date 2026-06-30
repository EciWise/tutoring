/** Token de inyección del publicador de eventos de materias. */
export const SUBJECT_EVENT_PUBLISHER = Symbol('SUBJECT_EVENT_PUBLISHER');

/** Payload mínimo que community necesita para sincronizar su copia local. */
export interface SubjectEventPayload {
  id: string;
  codigo: string;
  nombre: string;
}

/** Puerto de salida: publica eventos de dominio de materias hacia la cola compartida. */
export interface ISubjectEventPublisher {
  publishCreated(payload: SubjectEventPayload): void;
  publishUpdated(payload: SubjectEventPayload): void;
  publishDeleted(id: string): void;
}
