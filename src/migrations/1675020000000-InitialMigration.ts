import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1675020000000 implements MigrationInterface {
    name = 'InitialMigration1675020000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('legal_advisor', 'customer', 'admin')`);
        await queryRunner.query(`CREATE TYPE "public"."document_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."document_type_enum" AS ENUM('terms_of_service', 'privacy_policy', 'contract', 'agreement', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."message_role_enum" AS ENUM('user', 'assistant', 'system')`);

        // Create users table
        await queryRunner.query(`CREATE TABLE "users" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "email" character varying NOT NULL,
            "password" character varying,
            "firstName" character varying,
            "lastName" character varying,
            "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer',
            "googleId" character varying,
            "avatar" character varying,
            "isEmailVerified" boolean NOT NULL DEFAULT false,
            "emailVerificationToken" character varying,
            "passwordResetToken" character varying,
            "passwordResetExpires" TIMESTAMP,
            "isActive" boolean NOT NULL DEFAULT true,
            "lastLoginAt" TIMESTAMP,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
            CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )`);

        // Create documents table
        await queryRunner.query(`CREATE TABLE "documents" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "title" character varying NOT NULL,
            "content" text NOT NULL,
            "originalFileName" character varying,
            "filePath" character varying,
            "fileSize" integer,
            "mimeType" character varying,
            "type" "public"."document_type_enum" NOT NULL DEFAULT 'other',
            "status" "public"."document_status_enum" NOT NULL DEFAULT 'pending',
            "analysis" jsonb,
            "maskedContent" jsonb,
            "processingStartedAt" TIMESTAMP,
            "processingCompletedAt" TIMESTAMP,
            "errorMessage" character varying,
            "userId" uuid NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id")
        )`);

        // Create chat_messages table
        await queryRunner.query(`CREATE TABLE "chat_messages" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "content" text NOT NULL,
            "role" "public"."message_role_enum" NOT NULL DEFAULT 'user',
            "sessionId" character varying,
            "metadata" jsonb,
            "userId" uuid NOT NULL,
            "documentId" uuid NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_6d7b5b5a10c94e57dd6b95b04ad" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_84ba0281f2ed8a0b5b893e2a68e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_4cc5b4c7d1f78f66d3c66e6d7c4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_5f3e41b61e4a0b2e78c31b7b8c6" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
        await queryRunner.query(`CREATE INDEX "IDX_documents_userId" ON "documents" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_documents_status" ON "documents" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_documents_type" ON "documents" ("type")`);
        await queryRunner.query(`CREATE INDEX "IDX_chat_messages_userId" ON "chat_messages" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_chat_messages_documentId" ON "chat_messages" ("documentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_chat_messages_sessionId" ON "chat_messages" ("sessionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_chat_messages_sessionId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_chat_messages_documentId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_chat_messages_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_documents_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_documents_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_documents_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_5f3e41b61e4a0b2e78c31b7b8c6"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_4cc5b4c7d1f78f66d3c66e6d7c4"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_84ba0281f2ed8a0b5b893e2a68e"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "public"."message_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }
} 