import { app } from "./app"
import { env } from "./env"

app.listen({ port: Number(env.PORT) || 3333 }).then(() => {
  console.log(`🚀 HTTP server running! at port ${Number(env.PORT) || 3333}`)
})
