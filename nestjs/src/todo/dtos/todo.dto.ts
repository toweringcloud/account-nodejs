import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class UpdateTodoDto {
  @ApiProperty()
  @IsString()
  title?: string;
  @ApiProperty()
  @IsBoolean()
  completed?: boolean;
}
