import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';
import {
  MaterializarVentanaUseCase,
  type ResultadoMaterializacion,
} from '../../../application/use-cases/materializar-ventana.use-case';

/**
 * Disparo manual del job de materialización (para operación/pruebas, sin esperar
 * al cron). Idempotente. Solo admin.
 */
@ApiTags('disponibilidad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disponibilidad/materializacion')
export class MaterializacionController {
  constructor(private readonly materializar: MaterializarVentanaUseCase) {}

  @Post()
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Materializar la ventana ahora (solo admin)' })
  async ejecutar(): Promise<ResultadoMaterializacion> {
    return this.materializar.ejecutar();
  }
}
