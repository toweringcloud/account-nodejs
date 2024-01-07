import { Module } from '@nestjs/common';
import { PrismaService } from './common.service';

@Module({
  exports: [PrismaService],
  providers: [PrismaService],
})
export class CommonModule {}
