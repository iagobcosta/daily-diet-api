import { FastifyInstance } from "fastify"
import {
  collectDefaultMetrics,
  Counter,
  register,
  Histogram,
} from "prom-client"

collectDefaultMetrics()

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total de requisições HTTP por rota, método e status",
  labelNames: ["method", "route", "status"],
})

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duração das requisições HTTP em segundos por rota",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5], // você pode ajustar conforme sua realidade
})

register.setDefaultLabels({ app: "daily-diet" })
register.registerMetric(httpRequestCounter)
register.registerMetric(httpRequestDuration)

export async function onRequestMetrics(req: any) {
  ;(req as any).startTime = Date.now()
}

export async function onResponseMetrics(req: any, reply: any) {
  // fallback completo
  const rawUrl = req.url
  const method = req.method
  const status = reply.statusCode.toString()

  const route =
    (reply.context?.config?.url as string) ??
    (req as any).routerPath ??
    rawUrl ??
    "unknown"

  if (route === "/metrics") {
    return
  }

  console.log("🔥 MÉTRICA", { method, route, status })

  httpRequestCounter
    .labels({
      method,
      route,
      status,
    })
    .inc()

  const startTime = (req as any).startTime || Date.now()
  const duration = (Date.now() - startTime) / 1000

  httpRequestDuration.labels({ method, route, status }).observe(duration)
}

export async function metricsPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (req) => {
    await onRequestMetrics(req)
  })

  // Expor endpoint /metrics
  app.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", register.contentType)
    return register.metrics()
  })

  // Contar requisições HTTP por rota
  app.addHook("onResponse", async (req, reply) => {
    await onResponseMetrics(req, reply)
  })
}
