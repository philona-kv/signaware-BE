import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

import { ChatMessage, MessageRole } from './entities/chat-message.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { SendMessageDto, ChatMessageResponseDto } from './dto/chat.dto';
import { AnalysisService } from '@/modules/analysis/analysis.service';

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private activeStreams = new Map<string, Subject<string>>();

  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private analysisService: AnalysisService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async sendMessage(sendMessageDto: SendMessageDto, userId: string): Promise<ChatMessageResponseDto> {
    const { content, documentId, sessionId } = sendMessageDto;

    // Verify document exists and belongs to user
    const document = await this.documentRepository.findOne({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Save user message
    const userMessage = this.chatMessageRepository.create({
      content,
      role: MessageRole.USER,
      userId,
      documentId,
      sessionId: sessionId || uuidv4(),
    });

    await this.chatMessageRepository.save(userMessage);

    // Generate AI response
    const aiResponse = await this.generateAIResponse(content, document, sessionId);

    // Save AI message
    const aiMessage = this.chatMessageRepository.create({
      content: aiResponse.content,
      role: MessageRole.ASSISTANT,
      userId,
      documentId,
      sessionId: sessionId || userMessage.sessionId,
      metadata: aiResponse.metadata,
    });

    const savedAiMessage = await this.chatMessageRepository.save(aiMessage);

    return {
      id: savedAiMessage.id,
      content: savedAiMessage.content,
      role: savedAiMessage.role,
      createdAt: savedAiMessage.createdAt,
      sessionId: savedAiMessage.sessionId,
      metadata: savedAiMessage.metadata,
    };
  }

  async sendMessageStream(sendMessageDto: SendMessageDto, userId: string): Promise<Observable<string>> {
    const { content, documentId, sessionId } = sendMessageDto;

    // Verify document exists and belongs to user
    const document = await this.documentRepository.findOne({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Save user message
    const userMessage = this.chatMessageRepository.create({
      content,
      role: MessageRole.USER,
      userId,
      documentId,
      sessionId: sessionId || uuidv4(),
    });

    await this.chatMessageRepository.save(userMessage);

    // Create stream subject
    const streamId = `${userId}-${documentId}-${Date.now()}`;
    const streamSubject = new Subject<string>();
    this.activeStreams.set(streamId, streamSubject);

    // Generate streaming AI response
    this.generateStreamingAIResponse(content, document, sessionId || userMessage.sessionId, streamSubject, streamId);

    return streamSubject.asObservable();
  }

  async getChatHistory(documentId: string, userId: string, sessionId?: string): Promise<ChatMessageResponseDto[]> {
    // Verify document exists and belongs to user
    const document = await this.documentRepository.findOne({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const whereClause: any = { documentId, userId };
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    const messages = await this.chatMessageRepository.find({
      where: whereClause,
      order: { createdAt: 'ASC' },
    });

    return messages.map(message => ({
      id: message.id,
      content: message.content,
      role: message.role,
      createdAt: message.createdAt,
      sessionId: message.sessionId,
      metadata: message.metadata,
    }));
  }

  async getChatSessions(documentId: string, userId: string): Promise<string[]> {
    // Verify document exists and belongs to user
    const document = await this.documentRepository.findOne({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const sessions = await this.chatMessageRepository
      .createQueryBuilder('message')
      .select('DISTINCT message.sessionId', 'sessionId')
      .where('message.documentId = :documentId', { documentId })
      .andWhere('message.userId = :userId', { userId })
      .getRawMany();

    return sessions.map(session => session.sessionId);
  }

  private async generateAIResponse(
    userMessage: string,
    document: Document,
    sessionId?: string,
  ): Promise<{ content: string; metadata?: any }> {
    const startTime = Date.now();

    try {
      // Get recent chat history for context
      const recentMessages = await this.chatMessageRepository.find({
        where: { documentId: document.id, sessionId },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      const conversationHistory = recentMessages
        .reverse()
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = this.buildChatPrompt(userMessage, document, conversationHistory);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a legal document assistant. You help users understand legal documents by answering their questions about the document content, terms, conditions, and implications. Be helpful, accurate, and provide clear explanations. Always refer to the specific document content when answering questions.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
      const processingTime = Date.now() - startTime;

      return {
        content: response,
        metadata: {
          tokens: completion.usage?.total_tokens,
          processingTime,
          model: 'gpt-4',
          temperature: 0.7,
        },
      };
    } catch (error) {
      console.error('AI response generation error:', error);
      return {
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        metadata: {
          processingTime: Date.now() - startTime,
          error: error.message,
        },
      };
    }
  }

  private async generateStreamingAIResponse(
    userMessage: string,
    document: Document,
    sessionId: string,
    streamSubject: Subject<string>,
    streamId: string,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Get recent chat history for context
      const recentMessages = await this.chatMessageRepository.find({
        where: { documentId: document.id, sessionId },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      const conversationHistory = recentMessages
        .reverse()
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = this.buildChatPrompt(userMessage, document, conversationHistory);

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a legal document assistant. You help users understand legal documents by answering their questions about the document content, terms, conditions, and implications. Be helpful, accurate, and provide clear explanations. Always refer to the specific document content when answering questions.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      let fullResponse = '';
      let tokenCount = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          tokenCount++;
          
          // Send chunk to client
          streamSubject.next(`data: ${JSON.stringify({ content, type: 'chunk' })}\n\n`);
        }
      }

      // Save the complete AI message
      const aiMessage = this.chatMessageRepository.create({
        content: fullResponse,
        role: MessageRole.ASSISTANT,
        userId: document.userId,
        documentId: document.id,
        sessionId,
        metadata: {
          tokens: tokenCount,
          processingTime: Date.now() - startTime,
          model: 'gpt-4',
          temperature: 0.7,
        },
      });

      await this.chatMessageRepository.save(aiMessage);

      // Send completion signal
      streamSubject.next(`data: ${JSON.stringify({ type: 'complete', messageId: aiMessage.id })}\n\n`);
      streamSubject.complete();

    } catch (error) {
      console.error('Streaming AI response error:', error);
      streamSubject.next(`data: ${JSON.stringify({ 
        content: 'I apologize, but I encountered an error while processing your request.',
        type: 'error',
        error: error.message 
      })}\n\n`);
      streamSubject.complete();
    } finally {
      // Clean up stream
      this.activeStreams.delete(streamId);
    }
  }

  private buildChatPrompt(userMessage: string, document: Document, conversationHistory: string): string {
    return `Document Title: ${document.title}
Document Type: ${document.type}

Document Content:
${document.content.substring(0, 6000)}${document.content.length > 6000 ? '...' : ''}

${conversationHistory ? `Previous Conversation:\n${conversationHistory}\n` : ''}

User Question: ${userMessage}

Please answer the user's question about this legal document. Be specific and reference the document content when possible. If the question is not related to the document, politely redirect the conversation back to the document.`;
  }

  async deleteChatSession(documentId: string, sessionId: string, userId: string): Promise<void> {
    // Verify document exists and belongs to user
    const document = await this.documentRepository.findOne({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.chatMessageRepository.delete({
      documentId,
      sessionId,
      userId,
    });
  }
} 