/**
 * Constantes de mensajería RabbitMQ compartidas por los puentes de integración
 * (gamificación y notificaciones). Los nombres de exchange/routing-key deben
 * coincidir con los que declaran los servicios consumidores.
 */

/** Exchange de eventos de dominio que consume gamificación (.NET). */
export const EXCHANGE_EVENTS = 'eciwise.events';

/** Exchange de notificaciones que consume el servicio `notifications`. */
export const EXCHANGE_NOTIFICATIONS = 'notifications';
export const RK_NOTIFICATION_INDIVIDUAL = 'notification.individual';

/** Routing keys (== eventType) de los eventos de dominio que premia gamificación. */
export const RK_TUTORIA_REALIZADA = 'tutoria.realizada';
export const RK_TUTORIA_DICTADA = 'tutoria.dictada';
export const RK_TUTORIA_CALIFICADA = 'tutoria.calificada';
