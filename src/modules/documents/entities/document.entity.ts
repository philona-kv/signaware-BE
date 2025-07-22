import { ChatMessage } from "@/modules/chat/entities/chat-message.entity";
import { User } from "@/modules/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum DocumentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum DocumentType {
  TERMS_OF_SERVICE = "terms_of_service",
  PRIVACY_POLICY = "privacy_policy",
  CONTRACT = "contract",
  AGREEMENT = "agreement",
  OTHER = "other",
}

@Entity("documents")
export class Document {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  content: string;

  @Column({ nullable: true })
  originalFileName?: string;

  @Column({ nullable: true })
  filePath?: string;

  @Column({ nullable: true })
  fileSize?: number;

  @Column({ nullable: true })
  mimeType?: string;

  @Column({
    type: "enum",
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type: DocumentType;

  @Column({
    type: "enum",
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ type: "jsonb", nullable: true })
  analysis?: any;

  @Column({ type: "jsonb", nullable: true })
  maskedContent?: string;

  @Column({ nullable: true })
  processingStartedAt?: Date;

  @Column({ nullable: true })
  processingCompletedAt?: Date;

  @Column({ nullable: true })
  errorMessage?: string;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => ChatMessage, (message) => message.document)
  chatMessages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
