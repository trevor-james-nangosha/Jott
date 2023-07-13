/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	await knex.schema.createTableIfNotExists("entries_changes", (table) => {
		table.string("id");
		table.text("content");
		table.datetime("last_synced").nullable();
		table.string("sync_state").defaultTo("pending");
		table.text("file_hash").nullable();
		table.timestamps(true, true, true);

		table.primary(["id"]);
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
	await knex.schema.dropTable("entries_changes");
};

// TODO;
// ----------------- syncing process, detecting outdated files etc. ---------------------------------------------
// the initial plan was to use something like "file_hash" for versioning of the entry content
// but i am having problems with including the logic as a part of  my update and insert triggers
// in the meantime, I will use the "sync_state" flag until we can come up
// with a better idea/solution.

// i have thought about using custom functions, but this is still
// very vague as of writing.
