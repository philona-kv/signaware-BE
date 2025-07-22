import { User } from '@/modules/users/entities/user.entity';
import { ChatMessage } from '@/modules/chat/entities/chat-message.entity';
export declare enum DocumentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum DocumentType {
    TERMS_OF_SERVICE = "terms_of_service",
    PRIVACY_POLICY = "privacy_policy",
    CONTRACT = "contract",
    AGREEMENT = "agreement",
    OTHER = "other"
}
export declare class Document {
    id: string;
    title: string;
    content: string;
    originalFileName?: string;
    filePath?: string;
    fileSize?: number;
    mimeType?: string;
    type: DocumentType;
    status: DocumentStatus;
    analysis?: {
        summary: string;
        riskScore: number;
        keyConcerns: string[];
        loopholes: string[];
        obligations: string[];
        recommendations: string[];
        processingTime: number;
    };
    maskedContent?: string;
    processingStartedAt?: Date;
    processingCompletedAt?: Date;
    errorMessage?: string;
    user: User;
    userId: string;
    chatMessages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}
