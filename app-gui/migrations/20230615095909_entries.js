/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTableIfNotExists("entries", table => {
        table.string('id')
        table.string('date')
        table.text('content')
        table.timestamps(true, true, true)

        table.primary(['id'])
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('entries');
};
