import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user', (table) => {
    table.uuid('id').primary(),
      table.string('name', 255).notNullable(),
      table.string('email', 255).notNullable(),
      table.string('password', 50).notNullable(),
      table.string('avatar', 255).defaultTo(''),
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('user')
}
