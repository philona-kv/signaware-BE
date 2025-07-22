import { User } from '@/modules/users/entities/user.entity';
import { Document } from '@/modules/documents/entities/document.entity';
export declare enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}
export declare class ChatMessage {
    id: string;
    content: string;
    role: MessageRole;
    sessionId?: string;
    metadata?: {
        tokens?: number;
        processingTime?: number;
        model?: string;
        temperature?: number;
    };
    user: User;
    userId: string;
    document: Document;
    documentId: string;
    createdAt: Date;
    updatedAt: Date;
}
