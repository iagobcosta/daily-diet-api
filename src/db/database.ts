import "dotenv/config"
import { knex } from "knex"
import { env } from "../env"
import path from "node:path"

export const knexConfig = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === "sqlite3"
      ? { filename: env.DATABASE_URL }
      : env.DATABASE_URL,
  migrations: {
    directory: path.resolve(__dirname, "../db/migrations"),
    extension: "ts",
  },
  useNullAsDefault: true, // necessário para sqlite
}

export const db = knex(knexConfig)
