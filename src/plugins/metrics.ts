import { FastifyInstance } from "fastify"
import { collectDefaultMetrics, Counter, register } from "prom-client"

collectDefaultMetrics()

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total de requisições HTTP por rota, método e status",
  labelNames: ["method", "route", "status"],
})

export async function metricsPlugin(app: FastifyInstance) {
  // Expor endpoint /metrics
  app.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", register.contentType)
    return register.metrics()
  })

  // Contar requisições HTTP por rota
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
