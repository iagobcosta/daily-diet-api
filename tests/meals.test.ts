import request from "supertest"
import { app } from "../src/app"
import { describe, expect, it } from "vitest"

describe("Meals Routes", () => {
  it("deve criar uma refeição para o usuário autenticado", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "João Diet",
      email: "joao@diet.com",
    })

    expect(createUserResponse.statusCode).toBe(201)
    expect(createUserResponse.headers["set-cookie"]).toBeDefined()

    const cookies = createUserResponse.get("Set-Cookie")

    const response = await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Almoço saudável",
        description: "Peito de frango e legumes",
        is_on_diet: true,
        date: new Date().toISOString(),
      })

    expect(response.statusCode).toBe(201)
  })

  it("deve listar todas as refeições do usuário", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "Listador",
      email: "listador@example.com",
    })

    const cookies = createUserResponse.get("Set-Cookie")

    await request(app.server).post("/meals").set("Cookie", cookies!).send({
      name: "Café da manhã",
      description: "Ovos e pão integral",
      is_on_diet: true,
      date: new Date().toISOString(),
    })

    const response = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)

    expect(response.statusCode).toBe(200)
    expect(response.body.meals).toHaveLength(1)
    expect(response.body.meals[0]).toMatchObject({
      name: "Café da manhã",
    })
  })

  it("deve retornar métricas de refeições", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "Metricado",
      email: "metricado@example.com",
    })

    const cookies = createUserResponse.get("Set-Cookie")

    // Refeições
    await request(app.server).post("/meals").set("Cookie", cookies!).send({
      name: "Refeição 1",
      description: "Na dieta",
      is_on_diet: true,
      date: new Date().toISOString(),
    })

    await request(app.server).post("/meals").set("Cookie", cookies!).send({
      name: "Refeição 2",
      description: "Fora da dieta",
      is_on_diet: false,
      date: new Date().toISOString(),
    })

    await request(app.server).post("/meals").set("Cookie", cookies!).send({
      name: "Refeição 3",
      description: "Na dieta",
      is_on_diet: true,
      date: new Date().toISOString(),
    })

    const response = await request(app.server)
      .get("/meals/metrics")
      .set("Cookie", cookies!)

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      total: 3,
      totalOnDiet: 2,
      totalOffDiet: 1,
    })
  })

  it("deve retornar uma refeição específica do usuário", async () => {
    const createUser = await request(app.server).post("/users").send({
      name: "Visualizador",
      email: "visualizador@example.com",
    })

    const cookies = createUser.get("Set-Cookie")

    const createMeal = await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Lanche da tarde",
        description: "Banana e aveia",
        is_on_diet: true,
        date: new Date().toISOString(),
      })

    const mealsList = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)

    const mealId = mealsList.body.meals[0].id

    const response = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies!)

    expect(response.statusCode).toBe(200)
    expect(response.body.meal).toMatchObject({
      name: "Lanche da tarde",
      description: "Banana e aveia",
    })
  })

  it("deve editar uma refeição do usuário", async () => {
    const createUser = await request(app.server).post("/users").send({
      name: "Editor",
      email: "editor@example.com",
    })

    const cookies = createUser.get("Set-Cookie")

    await request(app.server).post("/meals").set("Cookie", cookies!).send({
      name: "Refeição original",
      description: "Descrição original",
      is_on_diet: true,
      date: new Date().toISOString(),
    })

    const mealsList = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)

    const mealId = mealsList.body.meals[0].id

    const response = await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies!)
      .send({
        name: "Refeição editada",
        description: "Nova descrição",
        is_on_diet: false,
        date: new Date().toISOString(),
      })

    expect(response.statusCode).toBe(204)
  })

  it("deve deletar uma refeição do usuário", async () => {
    const createUser = await request(app.server).post("/users").send({
      name: "Deletador",
      email: "deletador@example.com",
    })

    const cookies = createUser.get("Set-Cookie")

    await request(app.server).post("/meals").set("Cookie", cookies!).send({
      name: "Refeição a ser deletada",
      description: "Para teste de deleção",
      is_on_diet: false,
      date: new Date().toISOString(),
    })

    const mealsList = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)

    const mealId = mealsList.body.meals[0].id

    const response = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies!)

    expect(response.statusCode).toBe(204)
  })
})
