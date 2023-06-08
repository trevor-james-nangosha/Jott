import { KnexConnection } from "../db";

export async function up(conn: KnexConnection): Promise<void> {
    await conn.schema.createTableIfNotExists("entries", table => {
        table.string('id')
        table.string('date')
        table.text('content')
        table.timestamps(true, true, true)

        table.primary(['id'])
    })
}

export async function down(conn: KnexConnection): Promise<void> {
    await conn.schema.dropTable('entries');
}

