import "dotenv/config"
import { knex } from "knex"
import { env } from "../env"

function connectionDatabasePg() {
  return {
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_CLIENT === "pg" ? { rejectUnauthorized: false } : false,
  }
}

function connectionDatabaseSqlite() {
  return {
    filename: env.DATABASE_URL,
  }
}

export const knexConfig = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === "pg"
      ? connectionDatabasePg()
      : connectionDatabaseSqlite(),
  migrations: {
    directory:
      env.NODE_ENV === "production" ? "./db/migrations" : "./src/db/migrations",
    extension: env.NODE_ENV === "production" ? "js" : "ts",
  },
  useNullAsDefault: true, // necessário para sqlite
}

export const db = knex(knexConfig)
