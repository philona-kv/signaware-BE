import { Document } from "@/modules/documents/entities/document.entity";
import { User } from "@/modules/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  content: string;

  @Column({
    type: "enum",
    enum: MessageRole,
    default: MessageRole.USER,
  })
  role: MessageRole;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    tokens?: number;
    processingTime?: number;
    model?: string;
    temperature?: number;
  };

  @ManyToOne(() => User, (user) => user.chatMessages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Document, (document) => document.chatMessages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "documentId" })
  document: Document;

  @Column()
  documentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
