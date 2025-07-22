import { MessageRole } from '../entities/chat-message.entity';
export declare class SendMessageDto {
    content: string;
    documentId: string;
    sessionId?: string;
}
export declare class ChatMessageResponseDto {
    id: string;
    content: string;
    role: MessageRole;
    createdAt: Date;
    sessionId?: string;
    metadata?: {
        tokens?: number;
        processingTime?: number;
        model?: string;
        temperature?: number;
    };
}
export declare class ChatHistoryDto {
    documentId: string;
    sessionId?: string;
}
