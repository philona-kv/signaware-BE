import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { ChatMessage } from './entities/chat-message.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { SendMessageDto, ChatMessageResponseDto } from './dto/chat.dto';
import { AnalysisService } from '@/modules/analysis/analysis.service';
export declare class ChatService {
    private chatMessageRepository;
    private documentRepository;
    private configService;
    private eventEmitter;
    private analysisService;
    private openai;
    private activeStreams;
    constructor(chatMessageRepository: Repository<ChatMessage>, documentRepository: Repository<Document>, configService: ConfigService, eventEmitter: EventEmitter2, analysisService: AnalysisService);
    sendMessage(sendMessageDto: SendMessageDto, userId: string): Promise<ChatMessageResponseDto>;
    sendMessageStream(sendMessageDto: SendMessageDto, userId: string): Promise<Observable<string>>;
    getChatHistory(documentId: string, userId: string, sessionId?: string): Promise<ChatMessageResponseDto[]>;
    getChatSessions(documentId: string, userId: string): Promise<string[]>;
    private generateAIResponse;
    private generateStreamingAIResponse;
    private buildChatPrompt;
    deleteChatSession(documentId: string, sessionId: string, userId: string): Promise<void>;
}
