import { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "crypto"
import { db } from "../db/database"
import { httpRequestCounter } from "../plugins/metrics"

export async function userRoutes(app: FastifyInstance) {
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
    // fallback completo
    const rawUrl = req.url
    const method = req.method
    const status = reply.statusCode.toString()

    const route =
      (reply.context?.config?.url as string) ??
      (req as any).routerPath ??
      rawUrl ??
      "unknown"

    console.log("🔥 MÉTRICA", { method, route, status })

    httpRequestCounter
      .labels({
        method,
        route,
        status,
      })
      .inc()
  })
}
