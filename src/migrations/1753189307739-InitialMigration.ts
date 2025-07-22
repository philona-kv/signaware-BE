import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1753189307739 implements MigrationInterface {
    name = 'InitialMigration1753189307739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."documents_type_enum" AS ENUM('terms_of_service', 'privacy_policy', 'contract', 'agreement', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" text NOT NULL, "originalFileName" character varying, "filePath" character varying, "fileSize" integer, "mimeType" character varying, "type" "public"."documents_type_enum" NOT NULL DEFAULT 'other', "status" "public"."documents_status_enum" NOT NULL DEFAULT 'pending', "analysis" jsonb, "maskedContent" jsonb, "processingStartedAt" TIMESTAMP, "processingCompletedAt" TIMESTAMP, "errorMessage" character varying, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_messages_role_enum" AS ENUM('user', 'assistant', 'system')`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "role" "public"."chat_messages_role_enum" NOT NULL DEFAULT 'user', "sessionId" character varying, "metadata" jsonb, "userId" uuid NOT NULL, "documentId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('legal_advisor', 'customer', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "firstName" character varying, "lastName" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "googleId" character varying, "avatar" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_43d968962b9e24e1e3517c0fbff" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_76feca4aea6aa179bdbf2f2cf40" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_76feca4aea6aa179bdbf2f2cf40"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_43d968962b9e24e1e3517c0fbff"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TYPE "public"."chat_messages_role_enum"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."documents_type_enum"`);
    }

}
