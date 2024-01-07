import { ApiProperty } from '@nestjs/swagger';

export class CoreEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  firtstTime: Date;

  @ApiProperty()
  lastTime: Date;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  updatedBy: string;

  @ApiProperty()
  used: boolean;
}
