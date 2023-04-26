import dayjs, { Dayjs } from "dayjs";

export function isDateToday(date: Dayjs): boolean {
      return dayjs().diff(date, "day") <= 0;
}
