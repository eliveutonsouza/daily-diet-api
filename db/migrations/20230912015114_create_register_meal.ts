import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('register_meal', (table) => {
    table.uuid('id').primary(),
    table.string('name').notNullable(),
    table.string('description').notNullable(),
    table.dateTime('date_time').defaultTo(knex.fn.now()).notNullable()
    table.boolean('in_diet').defaultTo(false).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.uuid('user_id').index()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('register_meal')
}

