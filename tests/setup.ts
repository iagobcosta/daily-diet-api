import { execSync } from "node:child_process"
import { beforeAll, beforeEach, afterAll } from "vitest"
import { app } from "../src/app" // já vamos criar esse arquivo
import { db } from "../src/db/database"

beforeAll(async () => {
  await app.ready()
})

// beforeEach(async () => {
//   execSync("npm run rollback && npm run migrate")
// })

afterAll(async () => {
  await app.close()
  // await db.destroy()
})
