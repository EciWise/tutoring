import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
import { CrearSalaUseCase } from '../../../application/use-cases/crear-sala.use-case';
import { ListarSalasUseCase } from '../../../application/use-cases/listar-salas.use-case';
import { SalaResponseDto } from '../dto/catalogo-response.dto';
import { CrearSalaDto } from '../dto/crear-sala.dto';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos/salas')
export class SalasController {
  constructor(
    private readonly crear: CrearSalaUseCase,
    private readonly listar: ListarSalasUseCase,
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
}
