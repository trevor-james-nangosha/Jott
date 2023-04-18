import dayjs from 'dayjs'

export interface JournalEntry{
    id?: string;
    date?: dayjs.Dayjs;
    content?: string;
    oldContent?: string; // delete this line
    createdAt?:Date;
    updatedAt?: Date;
}

export interface JournalEntryDb{
    id?: string;
    date?: string;
    content?: string;
    createdAt?:Date;
    updatedAt?: Date;
}
