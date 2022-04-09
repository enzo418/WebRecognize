import {INotificationService} from './interfaces/INotificationService';
import IHttpClient from '../../Http/IHttpClient';
import Notification from '../../domain/Notification';
import ICameraService from './interfaces/ICameraService';
import config from '../../config';
import { parseNotification, parseNotifications } from './convert/ConvertDTOtoNotification';
import DTONotification from './interfaces/DTONotification';

function serialize(date: Date | string | any): string {
    return (typeof date == 'string') ? date : date.toISOString();
}

/**
 * There will be only a instance of this websocket for the whole app
 */
const notificationWS = new WebSocket(config.endpoints.websocket.notification);

notificationWS.addEventListener('open', (ev) => {
    console.debug('Notification ws connected');
});

notificationWS.addEventListener('close', (ev) => {
    console.debug('Notification ws disconnected');
});

type NotificationCallback = (notification:Notification[]) => any;

export default class NotificationService implements INotificationService {
    private http: IHttpClient;
    private cameraService: ICameraService;
    private wsCallbacks: NotificationCallback[];

    constructor(pHttpClient: IHttpClient, pCameraService: ICameraService) {
        this.http = pHttpClient;
        this.cameraService = pCameraService;
        this.wsCallbacks = [];

        notificationWS.addEventListener('message', async (ev) => this.handleNewWsNotification(ev));
    }

    get(id: string): Promise<Notification> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {id})
                .then((res) => res.json())
                .then((res) => parseNotification(res, this.cameraService))
                .then(resolve)
                .catch(reject);
        });
    }

    getAll(limit = 100): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/api/notifications/', {limit})
                .then((res) => res.json())
                .then((res) => parseNotifications(res, this.cameraService))
                .then(resolve)
                .catch(reject);
        });
    }

    getBefore(before: string | Date, limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {
                before: serialize(before),
                limit,
            })
                .then((res) => res.json())
                .then((res) => parseNotifications(res, this.cameraService))
                .then(resolve)
                .catch(reject);
        });
    }

    getAfter(after: string | Date, limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {
                after: serialize(after),
                limit,
            })
                .then((res) => res.json())
                .then((res) => parseNotifications(res, this.cameraService))
                .then(resolve)
                .catch(reject);
        });
    }

    getBetween<T, U extends T>(
        before: T,
        after: U,
        limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {
                before: serialize(before),
                after: serialize(after),
                limit,
            })
                .then((res) => res.json())
                .then((res) => parseNotifications(res, this.cameraService))
                .then(resolve)
                .catch(reject);
        });
    }

    subscribe(callback: NotificationCallback): void {
        this.wsCallbacks.push(callback);
    }

    unsubscribe(callback: NotificationCallback): void {
        this.wsCallbacks = this.wsCallbacks.filter((c) => c != callback);
    }

    private async handleNewWsNotification(ev: MessageEvent<any>) {
        let data:string;
        if (ev.data instanceof Blob) {
            data = await ev.data.text();
        } else {
            data = ev.data;
        }

        const parsed:DTONotification | DTONotification[] = JSON.parse(data);
        const nots:DTONotification[] = parsed instanceof Array ? parsed : [parsed];

        this.callWsCallbacks(await parseNotifications(nots, this.cameraService));
    }

    private callWsCallbacks(notifications:Notification[]) {
        this.wsCallbacks.forEach((callback) => {
            callback(notifications);
        });
    }
}
