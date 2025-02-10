import { defineConfig } from "drizzle-kit";

// Neon接続文字列：環境変数DATABASE_URLが未設定の場合、デフォルト値としてNeonのシークレットを使用
const connectionString = process.env.DATABASE_URL || "postgres://neondb_owner:npg_PZbT8fiKDwI9@ep-proud-truth-a1nt0r4w-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
