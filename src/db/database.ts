import "dotenv/config"
import { knex } from "knex"
import { env } from "../env"

export const knexConfig = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === "sqlite3"
      ? { filename: "./db/test.sqlite" }
      : env.DATABASE_URL,
  migrations: {
    directory: "./src/db/migrations",
    extension: "ts",
  },
  useNullAsDefault: true, // necessário para sqlite
}

export const db = knex(knexConfig)
