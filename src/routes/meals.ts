import { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "crypto"
import { db } from "../db/database"
import { checkSessionId } from "../middlewares/check-session-id"

export async function mealRoutes(app: FastifyInstance) {
  // Criar uma refeição
  app.post(
    "/meals",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.boolean(),
        date: z.string().datetime(),
      })

      const { name, description, is_on_diet, date } = createMealSchema.parse(
        request.body
      )

      const sessionId = request.cookies.session_id

      const user = await db("users").where("session_id", sessionId).first()
      if (!user) {
        return reply.status(401).send({ error: "Usuário não encontrado." })
      }

      await db("meals").insert({
        id: randomUUID(),
        user_id: user.id,
        name,
        description,
        is_on_diet,
        date,
      })

      return reply.status(201).send()
    }
  )

  // Listar todas as refeições do usuário
  app.get("/meals", { preHandler: [checkSessionId] }, async (request) => {
    const sessionId = request.cookies.session_id

    const user = await db("users").where("session_id", sessionId).first()

    const meals = await db("meals")
      .where("user_id", user.id)
      .orderBy("date", "desc")

    return { meals }
  })

  app.put(
    "/meals/:id",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.boolean(),
        date: z.string().datetime(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)
      const { name, description, is_on_diet, date } =
        updateMealBodySchema.parse(request.body)
      const sessionId = request.cookies.session_id

      const user = await db("users").where("session_id", sessionId).first()
      if (!user)
        return reply.status(401).send({ error: "Usuário não encontrado." })

      const meal = await db("meals").where({ id, user_id: user.id }).first()
      if (!meal)
        return reply.status(404).send({ error: "Refeição não encontrada." })

      await db("meals").where({ id }).update({
        name,
        description,
        is_on_diet,
        date,
      })

      return reply.status(204).send()
    }
  )

  app.delete(
    "/meals/:id",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)
      const sessionId = request.cookies.session_id

      const user = await db("users").where("session_id", sessionId).first()
      const meal = await db("meals").where({ id, user_id: user.id }).first()
      if (!meal)
        return reply.status(404).send({ error: "Refeição não encontrada." })

      await db("meals").where({ id }).delete()

      return reply.status(204).send()
    }
  )

  app.get(
    "/meals/:id",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)
      const sessionId = request.cookies.session_id

      const user = await db("users").where("session_id", sessionId).first()
      const meal = await db("meals").where({ id, user_id: user.id }).first()

      if (!meal) {
        return reply.status(404).send({ error: "Refeição não encontrada." })
      }

      return { meal }
    }
  )

  app.get(
    "/meals/metrics",
    { preHandler: [checkSessionId] },
    async (request) => {
      const sessionId = request.cookies.session_id
      const user = await db("users").where("session_id", sessionId).first()

      const meals = await db("meals").where("user_id", user.id).orderBy("date")

      const total = meals.length
      const totalOnDiet = meals.filter((m) => m.is_on_diet).length
      const totalOffDiet = meals.filter((m) => !m.is_on_diet).length

      let bestSequence = 0
      let currentSequence = 0

      for (const meal of meals) {
        if (meal.is_on_diet) {
          currentSequence++
          if (currentSequence > bestSequence) bestSequence = currentSequence
        } else {
          currentSequence = 0
        }
      }

      return {
        total,
        totalOnDiet,
        totalOffDiet,
        bestOnDietSequence: bestSequence,
      }
    }
  )
}
