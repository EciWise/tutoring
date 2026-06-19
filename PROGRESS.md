# PROGRESS

> Estado de avance por fases. Se **sobreescribe** cada fin de fase (no acumular).

## Fase completada: Fase 2 — slice `catalogos` (primer slice vertical completo)

Valida todo el stack end-to-end (dominio puro → puertos → casos de uso → adapters Prisma → controllers REST → módulo). Build limpio, **44 tests** en verde, lint limpio, e2e verificado contra Neon.

### Slices / componentes implementados
- **`catalogos`**: `Materia`, `Sala`, `FranjaHoraria`, `TutorMateria`.
  - VOs: `DiaSemana` (L-V), `RangoHorario` (90 min exactos).
  - 10 casos de uso (CRUD + activar/desactivar materia + autorizar/desautorizar tutor-materia).
  - 12 endpoints bajo `/catalogos` (JWT obligatorio; escrituras solo `admin`).
- **Seed** (`prisma/seed.ts`, idempotente): 40 franjas (L-V × 8 bloques 07:00–19:00) + 33 salas (edificios A/B/C × salones 100–110, código `A-100`).
- Reutilizados de Fase 0/1: `PrismaService`, `auth` (guards/decorators), errores de dominio + `DomainExceptionFilter`, `ValueObject` base.

### Decisiones de esta sesión (las normativas ya están en CLAUDE.md)
Movidas a CLAUDE.md por ser project-wide: inbound ports → casos de uso como clases inyectadas por clase (§3.3); id generado en dominio con `crypto.randomUUID()` + `crear`/`reconstituir` (§9); `P2002`→`ConflictError` vía `mapUniqueViolation` confiando en `@@unique` (§9); guards `JwtAuthGuard` a nivel clase + `RolesGuard`/`@Roles` por método en escrituras (§9); `migrate dev` NO regenera el cliente → `prisma generate` siempre (§8); DTO props con `!` e `import type` en params `@Inject` (§9).

Solo de esta fase (no normativas): toggles activar/desactivar y autorizar/desautorizar comparten un caso de uso parametrizado con 2 endpoints; `@db.Time` se mapea `"HH:MM"` ↔ `Date.UTC(1970,0,1,h,m)`; la lista de salas vive en el seed (dato de referencia), a diferencia de la grilla de franjas que es un invariante de dominio.

### Desviaciones del plan
- Hubo que añadir un bloque `"ts-node": { transpileOnly, experimentalResolver }` a `tsconfig.json` para que el seed resuelva los imports `.js`→`.ts` del cliente Prisma generado.
- `npx prisma generate` explícito tras `migrate dev` (el plan asumía que migrate lo hacía) — al eliminar `Sala.capacidad` el cliente quedó stale y el seed falló hasta regenerar.
- Ajustes no anticipados para compilar bajo `strict`: `!` en DTOs e `import type` en params `@Inject`.

## Pendientes — próxima fase (Fase 3: `disponibilidad` → job materialización → `tutorias`)
- VOs compartidos aún no creados: `Cupos`, `RangoVigencia`, `Modalidad` (VO).
- `DisponibilidadTutor` (agregado): `materializarEn(fecha)`, unicidad `(tutor, franja)` RN-02, coherencia modalidad-recurso.
- Job de materialización (ventana móvil `MATERIALIZACION_VENTANA_SEMANAS`) → genera `Tutoria`.
- `tutorias`: búsqueda/consulta de slots (índice `idx_tutoria_busqueda`).
- Validar RN-03/RN-05 en publicación de disponibilidad usando `tutor_materia.autorizada` (ya soportado por `catalogos`).
- Deuda menor: dato `DEMO<timestamp>` de prueba en `materia` (Neon) — borrar o ignorar.
