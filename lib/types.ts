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
