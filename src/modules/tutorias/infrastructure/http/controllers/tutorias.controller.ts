import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { BuscarTutoriasUseCase } from '../../../application/use-cases/buscar-tutorias.use-case';
import { ObtenerDetalleTutoriaUseCase } from '../../../application/use-cases/obtener-detalle-tutoria.use-case';
import { BuscarTutoriasQueryDto } from '../dto/buscar-tutorias.query.dto';
import {
  TutoriaDetalleDto,
  TutoriaResumenDto,
} from '../dto/tutoria-response.dto';

@ApiTags('tutorias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutorias')
export class TutoriasController {
  constructor(
    private readonly buscar: BuscarTutoriasUseCase,
    private readonly detalle: ObtenerDetalleTutoriaUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Buscar slots PROGRAMADOS con cupo (RF-04)' })
  @ApiOkResponse({ type: TutoriaResumenDto, isArray: true })
  async buscarTutorias(
    @Query() filtros: BuscarTutoriasQueryDto,
  ): Promise<TutoriaResumenDto[]> {
    const resultados = await this.buscar.ejecutar(filtros);
    return resultados.map((r) => TutoriaResumenDto.desde(r));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una tutoría' })
  @ApiOkResponse({ type: TutoriaDetalleDto })
  async obtenerDetalle(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TutoriaDetalleDto> {
    return TutoriaDetalleDto.desdeDetalle(await this.detalle.ejecutar(id));
  }
}
