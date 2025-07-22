import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { join } from "path";

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: this.configService.get("DB_HOST") || process.env.DB_HOST,
      port: this.configService.get("DB_PORT", 5432),
      username: this.configService.get("DB_USERNAME") || process.env.DB_USERNAME,
      password: this.configService.get("DB_PASSWORD") || process.env.DB_PASSWORD,
      database: this.configService.get("DB_DATABASE") || process.env.DB_DATABASE,
      entities: [join(__dirname, "..", "**", "*.entity.{ts,js}")],
      migrations: [join(__dirname, "..", "migrations", "*.{ts,js}")],
      synchronize: true, // Auto-create tables in development
      logging: this.configService.get("NODE_ENV") === "development",
      ssl:
        this.configService.get("NODE_ENV") === "production"
          ? { rejectUnauthorized: false }
          : false,
      extra:
        this.configService.get("NODE_ENV") === "production"
          ? {
              ssl: {
                rejectUnauthorized: false, // Required for Supabase
              },
            }
          : {},
    };
  }
}
