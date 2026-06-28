# PROGRESS

> Estado de avance por fases. Se **sobreescribe** cada fin de fase (no acumular).

## Fase completada: Fase 4 — slice `reservas` (corazón transaccional)

Reservar / cancelar / reprogramar (estudiante) y cancelar la tutoría completa (tutor):
RF-05/06/07/08 + RN-01/04/08/09. Build limpio, **89 tests / 23 suites**, lint limpio, y flujo
end-to-end + **concurrencia real** verificados contra Neon.

### Implementado (`src/modules/reservas/`)
- **Dominio**: `Participante` (reservar→CONFIRMADA, cancelar(motivo)→CANCELADA), `exigirMotivo`
  (RN-08), eventos `TutoriaReservada`/`ReservaCancelada`/`TutoriaCanceladaPorTutor`,
  puerto `IReservaRepository` (operaciones transaccionales).
- **Casos de uso**: `ReservarTutoria` (RN-01 traslape, RN-09 cupo, no doble inscripción),
  `CancelarReserva`, `ReprogramarTutoria` (atómica), `CancelarTutoriaPorTutor` (autoriza dueño/admin).
- **Infra**: `PrismaReservaRepository` con `$transaction` + `$executeRaw` (UPDATE condicional
  `WHERE cupos_ocupados < cupos_maximos`); controller `POST /reservas`, `/:tutoriaId/cancelar`,
  `/reprogramar`, `/cancelacion-tutoria`. Registrado en `app.module`.
- **shared**: enum `EstadoAsistencia`.

### Decisiones confirmadas con el usuario
- **Atomicidad de cupos = transacción en `reservas`** (escribe `tutoria.cupos_ocupados`/`estado`
  directamente vía SQL crudo; excepción documentada al ownership de slice, por atomicidad).
- **Reprogramar = atómica** (todo-o-nada: si el destino está lleno, el origen queda intacto).

### Notas / decisiones de diseño
- **`Participante` vive en `reservas/domain`**; NO se añadieron `Tutoria.agregarParticipante/cancelar`
  (el invariante RN-09 lo garantiza el UPDATE atómico, no un método en memoria).
- **Reservar = reactivar-o-crear (`upsert`)**: la fila CANCELADA se conserva para historial
  (RF-18), así que reservar de nuevo reusa esa fila sin violar la unicidad `(tutoria, estudiante)`.
  (Bug encontrado y corregido en el e2e: el `create` chocaba con la fila cancelada.)
- `ponytail:` la fuga de cupo solo es posible en un auto-doble-reserva concurrente del mismo
  estudiante sobre la misma tutoría (RN-01 lo cubre en el caso secuencial); reconciliable si importa.
- Sin migración: `participante` y `EstadoAsistencia` ya existían en el schema.
- Deuda menor: datos de prueba (materias RSV/DEMO/DISP, disponibilidades, tutorías, participantes) en Neon.

### Verificación e2e ejecutada (contra Neon)
reservar→cupo 0 · cancelar→cupo 1 · reservar de nuevo→201 · reprogramar→origen libre/destino ocupado ·
traslape→422 · lleno→409 · **2 reservas en paralelo sobre cupos=1 → una 201 y una 409** ·
tutor cancela→libera N + estado CANCELADA · otro tutor→422.

## Pendientes — próxima fase (Fase 5: `asistencia` → `evaluaciones`)
- `asistencia` (RF-11/12): el tutor marca `Participante` ASISTIDA/INASISTIDA y observaciones;
  marcar `Tutoria` REALIZADA (habilita evaluar, RN-06).
- `evaluaciones` (RF-13/22): calificación única 1-5 (VO `Calificacion` ya existe) estudiante→tutor
  y tutor→estudiante; unicidad por participante (RN-07); emite `TutoriaRealizada`/`EvaluacionRegistrada`.
- (Luego) `reputacion` (proyección CQRS por eventos) → `historial`.
