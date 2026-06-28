import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { IdentidadModule } from '../identidad/identidad.module';
import { BuscarTutoriasUseCase } from './application/use-cases/buscar-tutorias.use-case';
import { ObtenerDetalleTutoriaUseCase } from './application/use-cases/obtener-detalle-tutoria.use-case';
import { TUTORIA_QUERY } from './domain/ports/outbound/tutoria-query.port';
import { TUTORIA_REPOSITORY } from './domain/ports/outbound/tutoria.repository.port';
import { TutoriasController } from './infrastructure/http/controllers/tutorias.controller';
import { PrismaTutoriaQueryRepository } from './infrastructure/persistence/prisma-tutoria-query.repository';
import { PrismaTutoriaRepository } from './infrastructure/persistence/prisma-tutoria.repository';

/**
 * Slice `tutorias`: lectura/búsqueda de slots (RF-04/09/10) y escritura del
 * agregado `Tutoria`. Exporta `TUTORIA_REPOSITORY` para que el job de
 * materialización (`disponibilidad`) persista las tutorías. Importa
 * `IdentidadModule` para resolver el nombre del tutor en las lecturas.
 */
@Module({
  imports: [AuthModule, IdentidadModule],
  controllers: [TutoriasController],
  providers: [
    BuscarTutoriasUseCase,
    ObtenerDetalleTutoriaUseCase,
    { provide: TUTORIA_REPOSITORY, useClass: PrismaTutoriaRepository },
    { provide: TUTORIA_QUERY, useClass: PrismaTutoriaQueryRepository },
  ],
  exports: [TUTORIA_REPOSITORY],
})
export class TutoriasModule {}
