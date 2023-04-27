import dayjs from 'dayjs'

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
    ER_NO_SUCH_TABLE      = "ER_NO_SUCH_TABLE"
}