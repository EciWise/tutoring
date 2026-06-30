import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';
import { ActualizarSalaUseCase } from '../../../application/use-cases/actualizar-sala.use-case';
import { CrearSalaUseCase } from '../../../application/use-cases/crear-sala.use-case';
import { EliminarSalaUseCase } from '../../../application/use-cases/eliminar-sala.use-case';
import { ListarSalasUseCase } from '../../../application/use-cases/listar-salas.use-case';
import { SalaResponseDto } from '../dto/catalogo-response.dto';
import { ActualizarSalaDto } from '../dto/actualizar-sala.dto';
import { CrearSalaDto } from '../dto/crear-sala.dto';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos/salas')
export class SalasController {
  constructor(
    private readonly crear: CrearSalaUseCase,
    private readonly listar: ListarSalasUseCase,
    private readonly actualizar: ActualizarSalaUseCase,
    private readonly eliminar: EliminarSalaUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Crear sala (solo admin)' })
  @ApiOkResponse({ type: SalaResponseDto })
  async crearSala(@Body() dto: CrearSalaDto): Promise<SalaResponseDto> {
    return SalaResponseDto.desde(await this.crear.ejecutar(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Listar salas' })
  @ApiOkResponse({ type: SalaResponseDto, isArray: true })
  async listarSalas(): Promise<SalaResponseDto[]> {
    const salas = await this.listar.ejecutar();
    return salas.map((s) => SalaResponseDto.desde(s));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Actualizar sala (solo admin)' })
  @ApiOkResponse({ type: SalaResponseDto })
  async actualizarSala(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarSalaDto,
  ): Promise<SalaResponseDto> {
    return SalaResponseDto.desde(await this.actualizar.ejecutar(id, dto));
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar sala (solo admin)' })
  @ApiNoContentResponse()
  async eliminarSala(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.eliminar.ejecutar(id);
  }
}
