import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { SendMessageDto, ChatMessageResponseDto, ChatHistoryDto } from './dto/chat.dto';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message to chat with document' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: ChatMessageResponseDto })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser('id') userId: string,
  ): Promise<ChatMessageResponseDto> {
    return this.chatService.sendMessage(sendMessageDto, userId);
  }

  @Post('send/stream')
  @ApiOperation({ summary: 'Send a message and get streaming response' })
  @ApiResponse({ status: 201, description: 'Streaming response initiated' })
  async sendMessageStream(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    const stream = await this.chatService.sendMessageStream(sendMessageDto, userId);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    stream.subscribe({
      next: (data) => {
        res.write(data);
      },
      error: (error) => {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
      },
      complete: () => {
        res.end();
      },
    });
  }

  @Sse('stream/:documentId')
  @ApiOperation({ summary: 'Server-Sent Events stream for real-time chat' })
  streamChat(
    @Param('documentId') documentId: string,
    @CurrentUser('id') userId: string,
    @Query('sessionId') sessionId?: string,
  ): Observable<MessageEvent> {
    // This endpoint can be used for real-time updates
    // For now, it returns a simple heartbeat
    return new Observable(subscriber => {
      const interval = setInterval(() => {
        subscriber.next({
          data: { type: 'heartbeat', timestamp: new Date().toISOString() },
        } as MessageEvent);
      }, 30000); // Send heartbeat every 30 seconds

      return () => clearInterval(interval);
    });
  }

  @Get('history/:documentId')
  @ApiOperation({ summary: 'Get chat history for a document' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved successfully', type: [ChatMessageResponseDto] })
  async getChatHistory(
    @Param('documentId') documentId: string,
    @CurrentUser('id') userId: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<ChatMessageResponseDto[]> {
    return this.chatService.getChatHistory(documentId, userId, sessionId);
  }

  @Get('sessions/:documentId')
  @ApiOperation({ summary: 'Get all chat sessions for a document' })
  @ApiResponse({ status: 200, description: 'Chat sessions retrieved successfully' })
  async getChatSessions(
    @Param('documentId') documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<string[]> {
    return this.chatService.getChatSessions(documentId, userId);
  }

  @Post('sessions/:documentId/:sessionId/delete')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiResponse({ status: 200, description: 'Chat session deleted successfully' })
  async deleteChatSession(
    @Param('documentId') documentId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.chatService.deleteChatSession(documentId, sessionId, userId);
  }
} 