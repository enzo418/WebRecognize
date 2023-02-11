import { INotificationService } from './interfaces/INotificationService';
import IHttpClient from '../../Http/IHttpClient';
import Notification from '../../domain/Notification';
import ICameraService from './interfaces/ICameraService';
import config from '../../config';
import {
    parseNotification,
    parseNotifications,
} from './convert/ConvertDTOtoNotification';
import DTONotification from './interfaces/DTONotification';
import processPromise from '../../Http/ProcessPromise';
import IProblemJson from './interfaces/IProblemJson';
import TypedPromise from '../../TypedPromise';
import eventBus from '../../EventBus';

function serialize(date: Date | string | any): string {
    return typeof date == 'string' ? date : date.toISOString();
}

/**
 * There will be only a instance of this websocket for the whole app
 */
const notificationWS = new WebSocket(config.endpoints.websocket.notification);

notificationWS.addEventListener('open', ev => {
    console.debug('Notification ws connected');
});

notificationWS.addEventListener('close', ev => {
    console.debug('Notification ws disconnected');

    // bring the user attention
    eventBus.dispatch('notification-sound-play', null);

    setTimeout(() => {
        // block execution, maximum alert
        alert('WARNING: Lost connection to the server');
    }, 5000);
});

type NotificationCallback = (notification: Notification[]) => any;

export default class NotificationService implements INotificationService {
    private http: IHttpClient;
    private cameraService: ICameraService;
    private wsCallbacks: NotificationCallback[];

    constructor(pHttpClient: IHttpClient, pCameraService: ICameraService) {
        this.http = pHttpClient;
        this.cameraService = pCameraService;
        this.wsCallbacks = [];

        notificationWS.addEventListener('message', async ev =>
            this.handleNewWsNotification(ev),
        );
    }

    get(id: string): TypedPromise<Notification, IProblemJson> {
        return new TypedPromise<Notification, IProblemJson>(
            (resolve, reject) => {
                this.http
                    .get('/', { id })
                    .then(res => res.json())
                    .then(res => parseNotification(res, this.cameraService))
                    .then(resolve)
                    .catch(reject);
            },
        );
    }

    getAll(
        limit = 100,
        page: number = 1,
    ): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (ok, fail) => {
                return processPromise<Array<DTONotification>, IProblemJson>(
                    this.http.get('/api/notifications/', { limit, page }),
                )
                    .ok(res => {
                        parseNotifications(res, this.cameraService)
                            .ok(parsed => ok(parsed))
                            .fail(fail);
                    })
                    .fail(fail);
            },
        );
    }

    getBefore(
        before: string | Date,
        limit: number,
        page: number,
    ): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (ok, fail) => {
                return processPromise<Array<DTONotification>, IProblemJson>(
                    this.http.get('/', {
                        before: serialize(before),
                        limit,
                        page,
                    }),
                )
                    .ok(res => {
                        parseNotifications(res, this.cameraService)
                            .ok(parsed => ok(parsed))
                            .fail(fail);
                    })
                    .fail(fail);
            },
        );
    }

    getAfter(
        after: string | Date,
        limit: number,
        page: number,
    ): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (ok, fail) => {
                return processPromise<Array<DTONotification>, IProblemJson>(
                    this.http.get('/', {
                        after: serialize(after),
                        limit,
                        page,
                    }),
                )
                    .ok(res => {
                        parseNotifications(res, this.cameraService)
                            .ok(parsed => ok(parsed))
                            .fail(fail);
                    })
                    .fail(fail);
            },
        );
    }

    getBetween<T, U extends T>(
        before: T,
        after: U,
        limit: number,
        page: number,
    ): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (ok, fail) => {
                return processPromise<Array<DTONotification>, IProblemJson>(
                    this.http.get('/', {
                        before: serialize(before),
                        after: serialize(after),
                        limit,
                        page,
                    }),
                )
                    .ok(res => {
                        parseNotifications(res, this.cameraService)
                            .ok(parsed => ok(parsed))
                            .fail(fail);
                    })
                    .fail(fail);
            },
        );
    }

    subscribe(callback: NotificationCallback): void {
        this.wsCallbacks.push(callback);
    }

    unsubscribe(callback: NotificationCallback): void {
        this.wsCallbacks = this.wsCallbacks.filter(c => c != callback);
    }

    getNotificationDebugBuffer(groupID: number) {
        return processPromise<
            { reclaimed: boolean; videoBufferID?: string },
            IProblemJson
        >(this.http.get(`/api/notifications/${groupID}/buffer/`, {}));
    }

    tryCreateDebugBuffer(groupID: number) {
        return processPromise<{ videoBufferID: string }, IProblemJson>(
            this.http.post(`/api/notifications/${groupID}/buffer/`, {}),
        );
    }

    private async handleNewWsNotification(ev: MessageEvent<any>) {
        let data: string;
        if (ev.data instanceof Blob) {
            data = await ev.data.text();
        } else {
            data = ev.data;
        }

        const parsed: DTONotification | DTONotification[] = JSON.parse(data);
        const nots: DTONotification[] =
            parsed instanceof Array ? parsed : [parsed];

        parseNotifications(nots, this.cameraService)
            .ok(nts => {
                this.callWsCallbacks(nts);
            })
            .fail(console.error);
    }

    private callWsCallbacks(notifications: Notification[]) {
        this.wsCallbacks.forEach(callback => {
            callback(notifications);
        });
    }
}
