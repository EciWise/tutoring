import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Expone `PrismaService` como provider global a todos los slices. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
