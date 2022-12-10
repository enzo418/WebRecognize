import { parse, format } from 'date-fns';

export function parseDate(date: string): Date {
    return parse(date, 'dd/MM/yyyy HH:mm:ss', new Date());
}

export function formatDate(date: Date): string {
    return format(date, 'dd/MM/yyyy HH:mm:ss');
}

/**
 * Parse a date into unix time.
 * If it's not a date object returns 0.
 *
 * @export
 * @param {(Date|any)} date
 * @return {number}
 */
export function dateToUnix(date: Date | any): number {
    return date instanceof Date ? Math.floor(date.getTime() / 1000) : 0;
}
