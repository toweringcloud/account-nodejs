import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from './common.service';

@Module({
  exports: [PrismaService, JwtService],
  providers: [PrismaService, JwtService],
})
export class CommonModule {}
