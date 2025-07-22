import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { AnalysisModule } from '@/modules/analysis/analysis.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Document]), AnalysisModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {} 