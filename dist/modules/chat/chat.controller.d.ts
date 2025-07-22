import { Response } from 'express';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { SendMessageDto, ChatMessageResponseDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(sendMessageDto: SendMessageDto, userId: string): Promise<ChatMessageResponseDto>;
    sendMessageStream(sendMessageDto: SendMessageDto, userId: string, res: Response): Promise<void>;
    streamChat(documentId: string, userId: string, sessionId?: string): Observable<MessageEvent>;
    getChatHistory(documentId: string, userId: string, sessionId?: string): Promise<ChatMessageResponseDto[]>;
    getChatSessions(documentId: string, userId: string): Promise<string[]>;
    deleteChatSession(documentId: string, sessionId: string, userId: string): Promise<void>;
}
