import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CoreOutput {
  @IsString()
  @IsOptional()
  error?: string;

  @IsBoolean()
  ok: boolean;
}
