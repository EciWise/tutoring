import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import type {
  RolUsuario as PrismaRolUsuario,
  UsuarioLocal,
} from '../../../../shared/infrastructure/prisma/prisma-client';
import { RolUsuario } from '../../../../shared/domain/enums/rol-usuario.enum';
import {
  IUsuarioDirectoryPort,
  JwtUserClaims,
  UsuarioLocalView,
} from '../../domain/ports/outbound/usuario-directory.port';

/**
 * Adapter Prisma del puerto `IUsuarioDirectoryPort` sobre la tabla
 * `usuario_local`. Traduce entre el modelo de persistencia y la vista de
 * dominio. El enum de dominio y el de Prisma comparten valores idénticos.
 */
@Injectable()
export class PrismaUsuarioLocalRepository implements IUsuarioDirectoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getById(userId: string): Promise<UsuarioLocalView | null> {
    const row = await this.prisma.usuarioLocal.findUnique({
      where: { userId },
    });
    return row ? this.toView(row) : null;
  }

  async getMany(userIds: string[]): Promise<UsuarioLocalView[]> {
    if (userIds.length === 0) {
      return [];
    }
    const rows = await this.prisma.usuarioLocal.findMany({
      where: { userId: { in: userIds } },
    });
    return rows.map((row) => this.toView(row));
  }

  async upsertFromJwt(claims: JwtUserClaims): Promise<void> {
    const rol = claims.rol as unknown as PrismaRolUsuario;
    await this.prisma.usuarioLocal.upsert({
      where: { userId: claims.id },
      create: {
        userId: claims.id,
        nombre: claims.nombre,
        apellido: claims.apellido,
        email: claims.email,
        rol,
      },
      update: {
        nombre: claims.nombre,
        apellido: claims.apellido,
        email: claims.email,
        rol,
        ultimaSync: new Date(),
      },
    });
  }

  private toView(row: UsuarioLocal): UsuarioLocalView {
    return {
      userId: row.userId,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      rol: row.rol as unknown as RolUsuario,
    };
  }
}
