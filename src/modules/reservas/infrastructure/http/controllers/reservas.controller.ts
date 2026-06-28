import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../../../../../auth/types/authenticated-user';
import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';
import { CancelarReservaUseCase } from '../../../application/use-cases/cancelar-reserva.use-case';
import {
  CancelarTutoriaPorTutorUseCase,
  type ResultadoCancelacionTutoria,
} from '../../../application/use-cases/cancelar-tutoria-por-tutor.use-case';
import { ReprogramarTutoriaUseCase } from '../../../application/use-cases/reprogramar-tutoria.use-case';
import { ReservarTutoriaUseCase } from '../../../application/use-cases/reservar-tutoria.use-case';
import { CancelarReservaDto } from '../dto/cancelar-reserva.dto';
import { CancelarTutoriaDto } from '../dto/cancelar-tutoria.dto';
import { ReprogramarTutoriaDto } from '../dto/reprogramar-tutoria.dto';
import { ReservarTutoriaDto } from '../dto/reservar-tutoria.dto';
import {
  CancelacionTutoriaResponseDto,
  ParticipanteResponseDto,
  ReprogramacionResponseDto,
} from '../dto/reservas-response.dto';

@ApiTags('reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservas')
export class ReservasController {
  constructor(
    private readonly reservar: ReservarTutoriaUseCase,
    private readonly cancelar: CancelarReservaUseCase,
    private readonly reprogramar: ReprogramarTutoriaUseCase,
    private readonly cancelarPorTutor: CancelarTutoriaPorTutorUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ESTUDIANTE)
  @ApiOperation({ summary: 'Reservar una tutoría (RF-05)' })
  @ApiOkResponse({ type: ParticipanteResponseDto })
  async reservarTutoria(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReservarTutoriaDto,
  ): Promise<ParticipanteResponseDto> {
    const p = await this.reservar.ejecutar({
      tutoriaId: dto.tutoriaId,
      estudianteUserId: user.id,
      temaEspecifico: dto.temaEspecifico,
      descripcionDudas: dto.descripcionDudas,
    });
    return ParticipanteResponseDto.desde(p);
  }

  @Post(':tutoriaId/cancelar')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ESTUDIANTE)
  @ApiOperation({ summary: 'Cancelar mi reserva (RF-06)' })
  @ApiOkResponse({ type: ParticipanteResponseDto })
  async cancelarReserva(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tutoriaId', ParseUUIDPipe) tutoriaId: string,
    @Body() dto: CancelarReservaDto,
  ): Promise<ParticipanteResponseDto> {
    const p = await this.cancelar.ejecutar({
      tutoriaId,
      estudianteUserId: user.id,
      motivo: dto.motivo,
    });
    return ParticipanteResponseDto.desde(p);
  }

  @Post('reprogramar')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ESTUDIANTE)
  @ApiOperation({ summary: 'Reprogramar a otra tutoría (RF-08, atómico)' })
  @ApiOkResponse({ type: ReprogramacionResponseDto })
  async reprogramarTutoria(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReprogramarTutoriaDto,
  ): Promise<ReprogramacionResponseDto> {
    const r = await this.reprogramar.ejecutar({
      estudianteUserId: user.id,
      tutoriaOrigenId: dto.tutoriaOrigenId,
      tutoriaDestinoId: dto.tutoriaDestinoId,
      motivo: dto.motivo,
      temaEspecifico: dto.temaEspecifico,
      descripcionDudas: dto.descripcionDudas,
    });
    return {
      origen: ParticipanteResponseDto.desde(r.origen),
      destino: ParticipanteResponseDto.desde(r.destino),
    };
  }

  @Post('cancelacion-tutoria')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.TUTOR, RolUsuario.ADMIN)
  @ApiOperation({ summary: 'El tutor cancela la tutoría completa (RF-07)' })
  @ApiOkResponse({ type: CancelacionTutoriaResponseDto })
  async cancelarTutoria(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CancelarTutoriaDto,
  ): Promise<ResultadoCancelacionTutoria> {
    return this.cancelarPorTutor.ejecutar({
      tutoriaId: dto.tutoriaId,
      actor: { userId: user.id, esAdmin: user.rol === RolUsuario.ADMIN },
      motivo: dto.motivo,
    });
  }
}
