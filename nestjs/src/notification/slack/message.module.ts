import { Module } from '@nestjs/common';
import { SlackModule } from 'nestjs-slack';

@Module({
  imports: [SlackModule.forRoot({ type: 'webhook' })],
})
export class MessageModule {}
