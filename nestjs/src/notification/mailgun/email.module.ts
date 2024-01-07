import { DynamicModule, Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({})
@Global()
export class EmailModule {
  static forRoot(): DynamicModule {
    return {
      module: EmailModule,
      providers: [EmailService],
      exports: [EmailService],
    };
  }
}
