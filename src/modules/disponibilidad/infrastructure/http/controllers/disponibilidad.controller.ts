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
import { CurrentUser } from '../../../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../../../../../auth/types/authenticated-user';
import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';
import { ValidationError } from '../../../../../shared/domain/errors/domain-error';
import type { ActorDisponibilidad } from '../../../application/use-cases/autorizacion';
import { DesactivarDisponibilidadUseCase } from '../../../application/use-cases/desactivar-disponibilidad.use-case';
import { EditarDisponibilidadUseCase } from '../../../application/use-cases/editar-disponibilidad.use-case';
import { ListarDisponibilidadesDeTutorUseCase } from '../../../application/use-cases/listar-disponibilidades-de-tutor.use-case';
import { PublicarDisponibilidadUseCase } from '../../../application/use-cases/publicar-disponibilidad.use-case';
import { DisponibilidadResponseDto } from '../dto/disponibilidad-response.dto';
import { EditarDisponibilidadDto } from '../dto/editar-disponibilidad.dto';
import { PublicarDisponibilidadDto } from '../dto/publicar-disponibilidad.dto';

@ApiTags('disponibilidad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disponibilidad')
export class DisponibilidadController {
  constructor(
    private readonly publicar: PublicarDisponibilidadUseCase,
    private readonly editar: EditarDisponibilidadUseCase,
    private readonly desactivar: DesactivarDisponibilidadUseCase,
    private readonly listar: ListarDisponibilidadesDeTutorUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.TUTOR, RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Publicar disponibilidad (tutor o admin) — RF-01' })
  @ApiOkResponse({ type: DisponibilidadResponseDto })
  async publicarDisponibilidad(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PublicarDisponibilidadDto,
  ): Promise<DisponibilidadResponseDto> {
    const tutorUserId = this.resolverTutor(user, dto.tutorUserId);
    const d = await this.publicar.ejecutar({
      tutorUserId,
      franjaId: dto.franjaId,
      materiaId: dto.materiaId,
      salaId: dto.salaId,
      modalidad: dto.modalidad,
      cuposMaximos: dto.cuposMaximos,
      vigenciaDesde: dto.vigenciaDesde,
      vigenciaHasta: dto.vigenciaHasta,
    });
    return DisponibilidadResponseDto.desde(d);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.TUTOR, RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Editar disponibilidad — RF-02' })
  async editarDisponibilidad(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EditarDisponibilidadDto,
  ): Promise<DisponibilidadResponseDto> {
    const d = await this.editar.ejecutar({
      id,
      actor: this.actor(user),
      cambios: dto,
    });
    return DisponibilidadResponseDto.desde(d);
  }

  @Patch(':id/desactivar')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.TUTOR, RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Desactivar disponibilidad — RF-02' })
  async desactivarDisponibilidad(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DisponibilidadResponseDto> {
    const d = await this.desactivar.ejecutar(id, this.actor(user));
    return DisponibilidadResponseDto.desde(d);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.TUTOR, RolUsuario.ADMIN)
  @ApiOperation({
    summary: 'Listar mis disponibilidades (admin: ?tutorUserId) — RF-03',
  })
  @ApiQuery({ name: 'tutorUserId', required: false, format: 'uuid' })
  @ApiOkResponse({ type: DisponibilidadResponseDto, isArray: true })
  async listarDisponibilidades(
    @CurrentUser() user: AuthenticatedUser,
    @Query('tutorUserId') tutorUserId?: string,
  ): Promise<DisponibilidadResponseDto[]> {
    const objetivo =
      user.rol === RolUsuario.ADMIN && tutorUserId ? tutorUserId : user.id;
    const ds = await this.listar.ejecutar(objetivo);
    return ds.map((d) => DisponibilidadResponseDto.desde(d));
  }

  /** El tutor publica para sí mismo; un admin debe indicar el `tutorUserId`. */
  private resolverTutor(user: AuthenticatedUser, bodyTutorId?: string): string {
    if (user.rol === RolUsuario.ADMIN) {
      if (!bodyTutorId) {
        throw new ValidationError(
          'Un admin debe indicar tutorUserId al publicar disponibilidad.',
        );
      }
      return bodyTutorId;
    }
    return user.id;
  }

  private actor(user: AuthenticatedUser): ActorDisponibilidad {
    return { userId: user.id, esAdmin: user.rol === RolUsuario.ADMIN };
  }
}
