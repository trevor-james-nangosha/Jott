/* eslint-disable no-multi-str */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	const insertTrigger = `\
    CREATE TRIGGER content_insert_trigger\
    AFTER INSERT\
    ON entries\
    FOR EACH ROW\
    BEGIN\
        INSERT INTO entries_changes (content, id)\
        VALUES (NEW.content, NEW.id);\
    END;\
    `;

	const updateTrigger = `\
    CREATE TRIGGER content_update_trigger\
    AFTER UPDATE OF content ON entries\
    FOR EACH ROW\
    BEGIN\
        UPDATE entries_changes\
        SET content = NEW.content,\
            sync_state = "pending"\
        WHERE id = NEW.id;\
    END;\
    `;

	await knex.schema.createTableIfNotExists("entries", (table) => {
		table.string("id");
		table.string("date");
		table.text("content");
		table.timestamps(true, true, true);

		table.primary(["id"]);
	});

	await knex.raw(insertTrigger).catch((err) => console.error(err));
	await knex.raw(updateTrigger).catch((err) => console.error(err));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
	await knex.schema.dropTable("entries");
};

//TODO;
// right now there are a lot of issues with how these migrations are run
// depending on the node environment
// let me hope i can find it in myself to clean everything up
