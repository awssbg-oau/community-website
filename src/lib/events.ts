import type { CollectionEntry } from 'astro:content';

export type EventEntry = CollectionEntry<'events'>;

const TZ = 'Africa/Lagos';

const part = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...options }).format(date);

export const monthShort = (date: Date) => part(date, { month: 'short' }).toUpperCase();
export const dayOfMonth = (date: Date) => part(date, { day: '2-digit' });
export const longDate = (date: Date) =>
  part(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(',', '');
export const shortDate = (date: Date) =>
  part(date, { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
const clock = (date: Date) => part(date, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export const timeRange = (start: Date, end?: Date) =>
  end ? `${clock(start)}–${clock(end)} WAT` : `${clock(start)} WAT`;

const endsAt = (event: EventEntry) => event.data.end ?? event.data.start;

export const isUpcoming = (event: EventEntry, now: Date) => endsAt(event).getTime() >= now.getTime();

export function splitEvents(events: EventEntry[], now: Date) {
  const upcoming = events
    .filter((event) => isUpcoming(event, now))
    .sort((a, b) => a.data.start.getTime() - b.data.start.getTime());
  const past = events
    .filter((event) => !isUpcoming(event, now))
    .sort((a, b) => b.data.start.getTime() - a.data.start.getTime());
  return { upcoming, past };
}
