import {INotificationService} from './interfaces/INotificationService';
import IHttpClient from '../../Http/IHttpClient';
import Notification from '../../domain/Notification';
import ICameraService from './interfaces/ICameraService';
import Camera from '../../domain/Camera';
import config from '../../config';

function serialize(date: Date | string | any): string {
    return (typeof date == 'string') ? date : date.toISOString();
}

/**
 * JSON-like transfer object that the server sends to us.
 *
 * @interface DTONotification
 * @typedef {DTONotification}
 */
export interface DTONotification {
    date: Date;
    group: number;
    cameraID: string;
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

export default class NotificationService implements INotificationService {
    private http: IHttpClient;
    private cameraService: ICameraService;

    constructor(pHttpClient: IHttpClient, pCameraService: ICameraService) {
        this.http = pHttpClient;
        this.cameraService = pCameraService;

        this.parseNotification = this.parseNotification.bind(this);
        this.parseNotifications = this.parseNotifications.bind(this);
    }

    get(id: string): Promise<Notification> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {id})
                .then((res) => res.json())
                .then(this.parseNotification)
                .then(resolve)
                .catch(reject);
        });
    }

    getAll(limit = 100): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            this.http.get('/', {limit})
                .then((res) => res.json())
                .then(this.parseNotifications)
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
                .then(this.parseNotifications)
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
                .then(this.parseNotifications)
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
                .then(this.parseNotifications)
                .then(resolve)
                .catch(reject);
        });
    }

    subscribe(callback: (not: Notification) => any): void {
        notificationWS.addEventListener('message', (ev) => {
            callback(this.parseNotification(ev.data));
        });
    }

    protected parseNotification(pNot: DTONotification): Notification {
        const camera: Camera = this.cameraService.get(pNot.cameraID);

        if (camera) {
            const notification: Notification = {
                date: new Date(pNot.date),
                group: pNot.group,
                camera: camera,
            };

            return notification;
        } else {
            throw new Error(`Couldn't get the camera with id: '${pNot.cameraID}'`);
        }
    }

    protected parseNotifications(pNots: Array<DTONotification>) : Array<Notification> {
        const result: Array<Notification> = [];

        pNots.forEach((not) => {
            result.push(this.parseNotification(not));
        });

        return result;
    }
}
