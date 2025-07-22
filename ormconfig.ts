import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";

// Load environment variables
config();

const configService = new ConfigService();

const isSupabase = configService.get("DB_HOST")?.includes("supabase.co");

export default new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST", "localhost"),
  port: parseInt(configService.get("DB_PORT", "5432")),
  username: configService.get("DB_USERNAME", "postgres"),
  password: configService.get("DB_PASSWORD", "postgres"),
  database: configService.get("DB_DATABASE", "signaware"),
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: configService.get("NODE_ENV") === "development",
  ssl:
    isSupabase || configService.get("NODE_ENV") === "production"
      ? { rejectUnauthorized: false }
      : false,
  extra: isSupabase
    ? {
        ssl: {
          rejectUnauthorized: false, // Required for Supabase
        },
      }
    : {},
});
