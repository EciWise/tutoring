import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';
import { CrearFranjaUseCase } from '../../../application/use-cases/crear-franja.use-case';
import { ListarFranjasUseCase } from '../../../application/use-cases/listar-franjas.use-case';
import { FranjaResponseDto } from '../dto/catalogo-response.dto';
import { CrearFranjaDto } from '../dto/crear-franja.dto';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos/franjas')
export class FranjasController {
  constructor(
    private readonly crear: CrearFranjaUseCase,
    private readonly listar: ListarFranjasUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Crear franja horaria (solo admin)' })
  @ApiOkResponse({ type: FranjaResponseDto })
  async crearFranja(@Body() dto: CrearFranjaDto): Promise<FranjaResponseDto> {
    return FranjaResponseDto.desde(await this.crear.ejecutar(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Listar franjas (opcional ?dia=1..5)' })
  @ApiQuery({ name: 'dia', required: false, example: 1 })
  @ApiOkResponse({ type: FranjaResponseDto, isArray: true })
  async listarFranjas(
    @Query('dia', new ParseIntPipe({ optional: true })) dia?: number,
  ): Promise<FranjaResponseDto[]> {
    const franjas = await this.listar.ejecutar(dia);
    return franjas.map((f) => FranjaResponseDto.desde(f));
  }
}
