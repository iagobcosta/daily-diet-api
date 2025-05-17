import Fastify from "fastify"
import cookie from "@fastify/cookie"
import { userRoutes } from "./routes/users"
import { mealRoutes } from "./routes/meals"
import { metricsPlugin } from "./plugins/metrics"

export const app = Fastify({
  logger: true,
})

app.register(cookie)
app.register(metricsPlugin)
app.register(userRoutes)
app.register(mealRoutes)

app.get("/health", async (req, res) => {
  return res.status(200).send({ status: "ok" })
})
