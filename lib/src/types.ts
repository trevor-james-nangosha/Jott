import dayjs from 'dayjs'
import { Knex } from 'knex';

export interface JournalBase{
    id: string;
    date: dayjs.Dayjs;
    content: string;
}

export interface JournalEntry extends JournalBase{
    createdAt?:Date;
    updatedAt?: Date;
}

export enum DB_ERROR {
    ECONNREFUSED            = "ECONNREFUSED",
    ER_NO_SUCH_TABLE      = "ER_NO_SUCH_TABLE",
}

export enum SQLITE_ERRORS {
    ER_NO_SUCH_TABLE = 1
}

export interface DbConfigConnection{
    host?: string,
    port?: number, 
    user?: string, 
    password?: string,
    database?: string,
    filename?: string
}

export interface DbConfig{
    client: string,
    connection: DbConfigConnection,
    pool?: {
        min: number,
        max: number
    },
    migrations?: {
        tableName: string
    }
}

export type KnexConnection = Knex;
