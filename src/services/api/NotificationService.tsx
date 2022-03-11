import {INotificationService} from './interfaces/INotificationService';
import HttpClient from '../../Http/HttpClient';
import INotification from '../../domain/INotification';

function serialize(date: Date | string | any): string {
    return (typeof date == 'string') ? date : date.toISOString();
}

export default class NotificationService implements INotificationService {
    private http: HttpClient;

    constructor(pHttpClient:HttpClient) {
        this.http = pHttpClient;
    }

    get(id: string): Promise<INotification> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {id})
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    }

    getAll(limit = 100): Promise<Array<INotification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {limit})
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    }

    getBefore(before: string | Date, limit: number): Promise<Array<INotification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {
                before: serialize(before),
                limit,
            })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    }

    getAfter(after: string | Date, limit: number): Promise<Array<INotification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {
                after: serialize(after),
                limit,
            })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    }

    getBetween<T, U extends T>(
        before: T,
        after: U,
        limit: number): Promise<Array<INotification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {
                before: serialize(before),
                after: serialize(after),
                limit,
            })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    }

    subscribe(callback: (not: INotification) => void): void {

    }
}
