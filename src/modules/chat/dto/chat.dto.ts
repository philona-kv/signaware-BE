import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageRole } from '../entities/chat-message.entity';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsUUID()
  documentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class ChatMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: MessageRole })
  role: MessageRole;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  sessionId?: string;

  @ApiPropertyOptional()
  metadata?: {
    tokens?: number;
    processingTime?: number;
    model?: string;
    temperature?: number;
  };
}

export class ChatHistoryDto {
  @ApiProperty()
  @IsUUID()
  documentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
} 