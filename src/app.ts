import Fastify from "fastify"
import cookie from "@fastify/cookie"
import { userRoutes } from "./routes/users"
import { mealRoutes } from "./routes/meals"
import { metricsPlugin } from "./plugins/metrics"
import { health } from "./routes/health"

export const app = Fastify({
  logger: true,
})

app.register(cookie)
app.register(userRoutes)
app.register(mealRoutes)

app.register(health)
app.register(metricsPlugin)
