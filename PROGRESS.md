# PROGRESS

> Estado de avance por fases. Se **sobreescribe** cada fin de fase (no acumular).

## Fase completada: Fase 3 — `disponibilidad` + job materialización + `tutorias`

Primer cruce real entre slices y primeros eventos de dominio. Build limpio, **70 tests / 20 suites**
en verde, lint limpio, y flujo end-to-end verificado contra Neon (publicar → materializar →
buscar, idempotente; negativos 403/400).

### Slices / componentes implementados
- **`tutorias`**: agregado `Tutoria` (factory `programar`, coherencia modalidad↔sala, `tieneCupo`);
  lectura CQRS `BuscarTutorias` (RF-04, solo PROGRAMADA con cupo) y `ObtenerDetalle` (RF-09/10),
  con nombre del tutor vía `IUsuarioDirectoryPort`. Puertos `TUTORIA_REPOSITORY` (write, exportado)
  y `TUTORIA_QUERY` (read). Evento `TutoriaMaterializada`.
- **`disponibilidad`**: agregado `DisponibilidadTutor` (VOs `RangoVigencia` + `Cupos`; invariantes
  vigencia, cupos≥1, modalidad↔sala; `materializarEn(fecha) → Tutoria`). Casos de uso Publicar
  (RN-03/05), Editar, Desactivar, Listar, y `MaterializarVentana` (idempotente). Job `@Cron` +
  endpoint manual `POST /disponibilidad/materializacion`. Evento `DisponibilidadPublicada`.
- **`catalogos`**: dos puertos públicos de consulta (`TUTOR_MATERIA_CONSULTA.estaAutorizada`,
  `FRANJA_HORARIA_CONSULTA.obtenerPorId`) expuestos vía `useExisting`.
- **shared**: enums `Modalidad`/`EstadoTutoria`, VO `Cupos`.
- **wiring**: `ScheduleModule.forRoot()`; 7 rutas nuevas mapeadas.

### Decisiones de esta sesión (confirmadas con el usuario)
- **Materialización doc-literal**: `Tutoria` vive en `tutorias` (API pública); `disponibilidad`
  importa el agregado y persiste vía `TUTORIA_REPOSITORY`. Dependencia `disponibilidad → {tutorias, catalogos}`.
- **Publicar disponibilidad: tutor o admin** (`@Roles(TUTOR, ADMIN)`; tutor=sub del JWT, admin pasa `tutorUserId`).
- Patrón normativo nuevo: un slice expone **puertos públicos de consulta** (solo lectura) para
  consumo cross-slice, ligando varios tokens a un mismo adapter con `useExisting`.

### Desviaciones / notas
- `enlaceVirtual` de `Tutoria` queda `null` al materializar (se asignará por sesión en fase posterior);
  invariante de coherencia enforcado = modalidad↔sala (per pedido del usuario).
- `franjaDiaSemana` de la disponibilidad se hidrata por join a `franja` (sin columna ni cambio de schema).
- Búsqueda "con cupo" filtra en memoria (Prisma no compara dos columnas en `where`).
- Sin migración de BD: las tablas `tutoria` y `disponibilidad_tutor` ya existían en el schema.
- Deuda menor: datos de prueba (`materia` DEMO/DISP, una disponibilidad y 6 tutorías) en Neon — borrar o ignorar.

## Pendientes — próxima fase (Fase 4: `reservas`)
- Métodos de mutación de `Tutoria` diferidos: `agregarParticipante` (RN-09/RF-21, UPDATE atómico),
  `cancelar(motivo)` (RF-07), entidad hija `Participante`.
- Slice `reservas`: reservar (RN-01 sin traslapes), cancelar reserva, reprogramar (RF-05/06/08).
- Eventos `TutoriaReservada`, `ReservaCancelada`, `TutoriaCanceladaPorTutor`.
- (Luego) `asistencia` → `evaluaciones` → `reputacion` → `historial`.
