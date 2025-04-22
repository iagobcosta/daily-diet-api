import request from "supertest"
import { app } from "../src/app"
import { execSync } from "node:child_process"
import { beforeEach } from "vitest"

describe("Users Routes", () => {
  beforeEach(async () => {
    execSync("npm run rollback && npm run migrate")
  })

  it("deve criar um novo usuário", async () => {
    const response = await request(app.server).post("/users").send({
      name: "Teste",
      email: "teste@example.com",
    })

    expect(response.statusCode).toBe(201)
    expect(response.headers["set-cookie"]).toBeDefined()
  })
})
