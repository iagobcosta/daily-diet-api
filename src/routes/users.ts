import { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "crypto"
import { db } from "../db/database"
import { onRequestMetrics, onResponseMetrics } from "../plugins/metrics"

export async function userRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (req) => {
    await onRequestMetrics(req)
  })

  app.post("/users", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const sessionId = randomUUID()
    const userId = randomUUID()

    await db("users").insert({
      id: userId,
      name,
      email,
      session_id: sessionId,
    })

    reply.setCookie("session_id", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return reply.status(201).send({ message: "Usuário criado com sucesso." })
  })

  app.addHook("onResponse", async (req, reply) => {
    await onResponseMetrics(req, reply)
  })
}
