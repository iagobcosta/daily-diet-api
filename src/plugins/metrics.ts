import { FastifyInstance } from "fastify"
import { collectDefaultMetrics, Counter, register } from "prom-client"

collectDefaultMetrics()

const httpRequestCounter = new Counter({
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
  app.addHook("onResponse", async (request, reply) => {
    if (request.routerPath) {
      httpRequestCounter
        .labels({
          method: request.method,
          route: request.routerPath,
          status: reply.statusCode.toString(),
        })
        .inc()
    }
  })
}
