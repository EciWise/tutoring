import {
  Body,
  Controller,
  Get,
  Param,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';
import { AsignarTutorMateriaUseCase } from '../../../application/use-cases/asignar-tutor-materia.use-case';
import { CambiarAutorizacionTutorMateriaUseCase } from '../../../application/use-cases/cambiar-autorizacion-tutor-materia.use-case';
import { ListarMateriasDeTutorUseCase } from '../../../application/use-cases/listar-materias-de-tutor.use-case';
import { TutorMateriaResponseDto } from '../dto/catalogo-response.dto';
import { AsignarTutorMateriaDto } from '../dto/asignar-tutor-materia.dto';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos/tutor-materias')
export class TutorMateriasController {
  constructor(
    private readonly asignar: AsignarTutorMateriaUseCase,
    private readonly cambiarAutorizacion: CambiarAutorizacionTutorMateriaUseCase,
    private readonly listarDeTutor: ListarMateriasDeTutorUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({
    summary: 'Asignar materia a un tutor (solo admin) — RN-03/RN-05',
  })
  @ApiOkResponse({ type: TutorMateriaResponseDto })
  async asignarMateria(
    @Body() dto: AsignarTutorMateriaDto,
  ): Promise<TutorMateriaResponseDto> {
    return TutorMateriaResponseDto.desde(await this.asignar.ejecutar(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Listar materias asignadas a un tutor' })
  @ApiQuery({ name: 'tutorUserId', required: true, format: 'uuid' })
  @ApiOkResponse({ type: TutorMateriaResponseDto, isArray: true })
  async listarMaterias(
    @Query('tutorUserId', ParseUUIDPipe) tutorUserId: string,
  ): Promise<TutorMateriaResponseDto[]> {
    const asignaciones = await this.listarDeTutor.ejecutar(tutorUserId);
    return asignaciones.map((tm) => TutorMateriaResponseDto.desde(tm));
  }

  @Patch(':id/autorizar')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Autorizar asignación tutor-materia (solo admin)' })
  async autorizar(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TutorMateriaResponseDto> {
    return TutorMateriaResponseDto.desde(
      await this.cambiarAutorizacion.ejecutar(id, true),
    );
  }

  @Patch(':id/desautorizar')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({
    summary: 'Desautorizar asignación tutor-materia (solo admin)',
  })
  async desautorizar(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TutorMateriaResponseDto> {
    return TutorMateriaResponseDto.desde(
      await this.cambiarAutorizacion.ejecutar(id, false),
    );
  }
}
