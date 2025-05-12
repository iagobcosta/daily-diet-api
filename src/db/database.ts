import "dotenv/config"
import { knex } from "knex"
import { env } from "../env"

export const knexConfig = {
  client: env.DATABASE_CLIENT,
  connection: {
    connectionString:
      env.DATABASE_CLIENT === "sqlite3"
        ? { filename: env.DATABASE_URL }
        : env.DATABASE_URL,
    ssl: env.DATABASE_CLIENT === "pg" ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    directory:
      env.NODE_ENV === "production" ? "./db/migrations" : "./src/db/migrations",
    extension: env.NODE_ENV === "production" ? "js" : "ts",
  },
  useNullAsDefault: true, // necessário para sqlite
}

export const db = knex(knexConfig)
