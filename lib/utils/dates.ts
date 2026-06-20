import { addMinutes, format, isSameDay, parse, parseISO } from "date-fns";

export const TIME_FORMAT = "HH:mm";

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(total: number) {
  const hours = Math.floor(total / 60).toString().padStart(2, "0");
  const minutes = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function addMinutesToTime(time: string, minutes: number) {
  const date = parse(time, TIME_FORMAT, new Date());
  return format(addMinutes(date, minutes), TIME_FORMAT);
}

export function isToday(date: string) {
  return isSameDay(parseISO(date), new Date());
}

export function generateSlots(openTime: string, closeTime: string, slotLengthMins: number) {
  const slots: string[] = [];
  let cursor = toMinutes(openTime);
  const end = toMinutes(closeTime);
  while (cursor < end) {
    slots.push(fromMinutes(cursor));
    cursor += slotLengthMins;
  }
  return slots;
}

export function dayOfWeek(date: string) {
  return format(parseISO(date), "EEEE").toLowerCase();
}

export function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(endA) > toMinutes(startB);
}
