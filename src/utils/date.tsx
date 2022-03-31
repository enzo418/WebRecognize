import { parse, format } from 'date-fns';

export function parseDate(date:string) : Date {
    return parse(date, 'dd/MM/yyyy HH:mm:ss', new Date());
}

export function formatDate(date:Date) : string {
    return format(date, 'dd/MM/yyyy HH:mm:ss');
}
