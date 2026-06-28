import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';
import { CambiarEstadoMateriaUseCase } from '../../../application/use-cases/cambiar-estado-materia.use-case';
import { CrearMateriaUseCase } from '../../../application/use-cases/crear-materia.use-case';
import { ListarMateriasUseCase } from '../../../application/use-cases/listar-materias.use-case';
import { MateriaResponseDto } from '../dto/catalogo-response.dto';
import { CrearMateriaDto } from '../dto/crear-materia.dto';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos/materias')
export class MateriasController {
  constructor(
    private readonly crear: CrearMateriaUseCase,
    private readonly listar: ListarMateriasUseCase,
    private readonly cambiarEstado: CambiarEstadoMateriaUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Crear materia (solo admin)' })
  @ApiOkResponse({ type: MateriaResponseDto })
  async crearMateria(
    @Body() dto: CrearMateriaDto,
  ): Promise<MateriaResponseDto> {
    return MateriaResponseDto.desde(await this.crear.ejecutar(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Listar materias (opcional ?soloActivas=true)' })
  @ApiOkResponse({ type: MateriaResponseDto, isArray: true })
  async listarMaterias(
    @Query('soloActivas', new ParseBoolPipe({ optional: true }))
    soloActivas?: boolean,
  ): Promise<MateriaResponseDto[]> {
    const materias = await this.listar.ejecutar(soloActivas);
    return materias.map((m) => MateriaResponseDto.desde(m));
  }

  @Patch(':id/activar')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Activar materia (solo admin)' })
  async activar(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MateriaResponseDto> {
    return MateriaResponseDto.desde(
      await this.cambiarEstado.ejecutar(id, true),
    );
  }

  @Patch(':id/desactivar')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Desactivar materia (solo admin)' })
  async desactivar(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MateriaResponseDto> {
    return MateriaResponseDto.desde(
      await this.cambiarEstado.ejecutar(id, false),
    );
  }
}
