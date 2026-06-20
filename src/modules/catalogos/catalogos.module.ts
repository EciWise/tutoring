import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AsignarTutorMateriaUseCase } from './application/use-cases/asignar-tutor-materia.use-case';
import { CambiarAutorizacionTutorMateriaUseCase } from './application/use-cases/cambiar-autorizacion-tutor-materia.use-case';
import { CambiarEstadoMateriaUseCase } from './application/use-cases/cambiar-estado-materia.use-case';
import { CrearFranjaUseCase } from './application/use-cases/crear-franja.use-case';
import { CrearMateriaUseCase } from './application/use-cases/crear-materia.use-case';
import { CrearSalaUseCase } from './application/use-cases/crear-sala.use-case';
import { ListarFranjasUseCase } from './application/use-cases/listar-franjas.use-case';
import { ListarMateriasDeTutorUseCase } from './application/use-cases/listar-materias-de-tutor.use-case';
import { ListarMateriasUseCase } from './application/use-cases/listar-materias.use-case';
import { ListarSalasUseCase } from './application/use-cases/listar-salas.use-case';
import { FRANJA_HORARIA_CONSULTA } from './domain/ports/outbound/franja-horaria-consulta.port';
import { FRANJA_HORARIA_REPOSITORY } from './domain/ports/outbound/franja-horaria.repository.port';
import { MATERIA_REPOSITORY } from './domain/ports/outbound/materia.repository.port';
import { SALA_REPOSITORY } from './domain/ports/outbound/sala.repository.port';
import { TUTOR_MATERIA_CONSULTA } from './domain/ports/outbound/tutor-materia-consulta.port';
import { TUTOR_MATERIA_REPOSITORY } from './domain/ports/outbound/tutor-materia.repository.port';
import { FranjasController } from './infrastructure/http/controllers/franjas.controller';
import { MateriasController } from './infrastructure/http/controllers/materias.controller';
import { SalasController } from './infrastructure/http/controllers/salas.controller';
import { TutorMateriasController } from './infrastructure/http/controllers/tutor-materias.controller';
import { PrismaFranjaHorariaRepository } from './infrastructure/persistence/prisma-franja-horaria.repository';
import { PrismaMateriaRepository } from './infrastructure/persistence/prisma-materia.repository';
import { PrismaSalaRepository } from './infrastructure/persistence/prisma-sala.repository';
import { PrismaTutorMateriaRepository } from './infrastructure/persistence/prisma-tutor-materia.repository';

/**
 * Slice `catalogos`: materias, salas, franjas horarias y asignaciones
 * tutor-materia. Primer slice vertical completo. `PrismaService` es global
 * (vía `PrismaModule`); `AuthModule` aporta los guards de las escrituras.
 */
@Module({
  imports: [AuthModule],
  controllers: [
    MateriasController,
    SalasController,
    FranjasController,
    TutorMateriasController,
  ],
  providers: [
    CrearMateriaUseCase,
    ListarMateriasUseCase,
    CambiarEstadoMateriaUseCase,
    CrearSalaUseCase,
    ListarSalasUseCase,
    CrearFranjaUseCase,
    ListarFranjasUseCase,
    AsignarTutorMateriaUseCase,
    CambiarAutorizacionTutorMateriaUseCase,
    ListarMateriasDeTutorUseCase,
    // Adapters Prisma registrados como clase para poder ligar varios tokens
    // (repositorio + puerto público de consulta) a una sola instancia.
    PrismaMateriaRepository,
    PrismaSalaRepository,
    PrismaFranjaHorariaRepository,
    PrismaTutorMateriaRepository,
    { provide: MATERIA_REPOSITORY, useExisting: PrismaMateriaRepository },
    { provide: SALA_REPOSITORY, useExisting: PrismaSalaRepository },
    {
      provide: FRANJA_HORARIA_REPOSITORY,
      useExisting: PrismaFranjaHorariaRepository,
    },
    {
      provide: FRANJA_HORARIA_CONSULTA,
      useExisting: PrismaFranjaHorariaRepository,
    },
    {
      provide: TUTOR_MATERIA_REPOSITORY,
      useExisting: PrismaTutorMateriaRepository,
    },
    {
      provide: TUTOR_MATERIA_CONSULTA,
      useExisting: PrismaTutorMateriaRepository,
    },
  ],
  exports: [TUTOR_MATERIA_CONSULTA, FRANJA_HORARIA_CONSULTA],
})
export class CatalogosModule {}
