import { FastifyInstance } from "fastify"
import { httpRequestCounter } from "../plugins/metrics"

export async function health(app: FastifyInstance) {
  app.get("/health", async (req, res) => {
    return res.status(200).send({ status: "ok" })
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
