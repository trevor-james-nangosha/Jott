
import dayjs from 'dayjs'
import { Knex } from 'knex';

// provide type support for stuff like this that is giving me a hard time
// import Synchroniser from './Synchroniser';
// /// <reference path="../@types/" />

export interface JournalBase{
    id: string;
    date: dayjs.Dayjs;
    content: string;
}

export interface JournalEntry extends JournalBase{
    createdAt?:Date;
    updatedAt?: Date;
}

export declare enum DB_ERROR {
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
