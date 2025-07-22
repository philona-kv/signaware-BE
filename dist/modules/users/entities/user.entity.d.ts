import { UserRole } from '@/common/enums/user-role.enum';
import { Document } from '@/modules/documents/entities/document.entity';
import { ChatMessage } from '@/modules/chat/entities/chat-message.entity';
export declare class User {
    id: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    googleId?: string;
    avatar?: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    documents: Document[];
    chatMessages: ChatMessage[];
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    get fullName(): string;
}
