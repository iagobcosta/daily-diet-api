import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary()
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE")
    table.string("name").notNullable()
    table.text("description")
    table.boolean("is_on_diet").notNullable()
    table.timestamp("date").notNullable()
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("meals")
}
