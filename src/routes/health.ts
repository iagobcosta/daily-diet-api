import { FastifyInstance } from "fastify"
import { onRequestMetrics, onResponseMetrics } from "../plugins/metrics"

export async function health(app: FastifyInstance) {
  app.addHook("onRequest", async (req) => {
    await onRequestMetrics(req)
  })

  app.get("/health", async (req, res) => {
    return res.status(200).send({ status: "ok" })
  })

  app.addHook("onResponse", async (req, reply) => {
    await onResponseMetrics(req, reply)
  })
}
