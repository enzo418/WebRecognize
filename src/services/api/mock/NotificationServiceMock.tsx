import { INotificationService } from '../interfaces/INotificationService';
import Notification, { ENotificationType } from '../../../domain/Notification';
import ICameraService from '../interfaces/ICameraService';
import {
    parseNotification,
    parseNotifications,
} from '../convert/ConvertDTOtoNotification';
import DTONotification from '../interfaces/DTONotification';
import { ensure } from '../../../utils/error';
import { subSeconds, subHours, addSeconds, addHours, format } from 'date-fns';
import { random } from '../../../utils/random';
import { getEnumAt, getEnumKeysNames } from '../../../utils/enum';
import { dateToUnix, parseDate } from '../../../utils/date';
import IProblemJson from '../interfaces/IProblemJson';
import TypedPromise from '../../../TypedPromise';
import {
    getRandomImage,
    getRandomVideo,
    mapGroupToBuffer,
    notificationsMock,
} from './mockData';

type CallbackWS = (n: Notification[]) => any;

export default class NotificationServiceMock implements INotificationService {
    private cameraService: ICameraService;
    private notifications: DTONotification[];
    private pulseSender!: NodeJS.Timer;
    private pulseCallers: CallbackWS[];
    private lastNotifSended: number;
    private pulseInterval: number;

    constructor(
        pCameraService: ICameraService,
        pNots: DTONotification[] = notificationsMock,
    ) {
        this.notifications = pNots;
        this.cameraService = pCameraService;
        this.lastNotifSended = 0;
        this.pulseCallers = [];

        this.pulseInterval = 2 * 1000;

        //this.pulseSender = setInterval(
        //    this.pulseHandler.bind(this),
        //    this.pulseInterval,
        //);
    }

    get(id: string): TypedPromise<Notification, IProblemJson> {
        return new TypedPromise<Notification, IProblemJson>(
            async (resolve, reject) => {
                const found = ensure(
                    this.notifications.find(not => not.id == id),
                );

                resolve(await parseNotification(found, this.cameraService));
            },
        );
    }

    getAll(limit = 100): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (resolve, reject) => {
                const found = [];
                for (
                    let i = 0;
                    i < Math.min(limit, this.notifications.length);
                    i++
                ) {
                    found.push(this.notifications[i]);
                }

                parseNotifications(found, this.cameraService)
                    .ok(resolve)
                    .fail(reject);
            },
        );
    }

    getBefore(
        before: string | Date,
        limit: number,
    ): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (resolve, reject) => {
                const found: DTONotification[] = [];
                const unixTimeBefore = dateToUnix(before);
                this.notifications.forEach(not => {
                    if (
                        before instanceof Date &&
                        not.datetime < unixTimeBefore
                    ) {
                        found.push(not);
                    } else if (typeof before === 'string' && not.id < before) {
                        found.push(not);
                    }
                });

                parseNotifications(found, this.cameraService)
                    .ok(resolve)
                    .fail(reject);
            },
        );
    }

    getAfter(
        after: string | Date,
        limit: number,
    ): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (resolve, reject) => {
                const found: DTONotification[] = [];
                const unixTimeAfter = dateToUnix(after);
                this.notifications.forEach(not => {
                    if (after instanceof Date && not.datetime > unixTimeAfter) {
                        found.push(not);
                    } else if (typeof after === 'string' && not.id > after) {
                        found.push(not);
                    }
                });

                parseNotifications(found, this.cameraService)
                    .ok(resolve)
                    .fail(reject);
            },
        );
    }

    getBetween<T, U extends T>(
        before: T,
        after: U,
        limit: number,
    ): TypedPromise<Array<Notification>, IProblemJson> {
        return new TypedPromise<Array<Notification>, IProblemJson>(
            (resolve, reject) => {
                const found: DTONotification[] = [];
                const unixTimeAfter = dateToUnix(after);
                const unixTimeBefore = dateToUnix(before);
                this.notifications.forEach(not => {
                    if (
                        after instanceof Date &&
                        before instanceof Date &&
                        not.datetime >= unixTimeAfter &&
                        not.datetime <= unixTimeBefore
                    ) {
                        found.push(not);
                    } else if (typeof after === 'string' && not.id > after) {
                        found.push(not);
                    }
                });

                parseNotifications(found, this.cameraService)
                    .ok(resolve)
                    .fail(reject);
            },
        );
    }

    subscribe(callback: CallbackWS): void {
        this.pulseCallers.push(callback);

        // notificationWS.addEventListener('message', (ev) => {
        //     callback(parseNotification(ev.data, this.cameraService));
        // });
    }

    unsubscribe(callback: CallbackWS): void {
        this.pulseCallers = this.pulseCallers.filter(c => c != callback);
    }

    getNotificationDebugBuffer(groupID: number) {
        return new TypedPromise<
            { reclaimed: boolean; videoBufferID?: string },
            IProblemJson
        >((ok, f) => {
            ok({
                reclaimed: Object.keys(mapGroupToBuffer).includes(
                    groupID.toString(),
                ),
                videoBufferID: (mapGroupToBuffer as any)[groupID],
            });
        });
    }

    tryCreateDebugBuffer(groupID: number) {
        const hasVideo = Object.keys(mapGroupToBuffer).includes(
            groupID.toString(),
        );

        return new TypedPromise<{ videoBufferID: string }, IProblemJson>(
            (ok, fail) => {
                if (hasVideo) {
                    ok({ videoBufferID: (mapGroupToBuffer as any)[groupID] });
                } else {
                    fail({
                        status: 400,
                        title: 'missing debug video',
                    });
                }
            },
        );
    }

    private async pulseHandler(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            clearInterval(this.pulseSender);

            const not = await parseNotification(
                this.notifications[this.lastNotifSended],
                this.cameraService,
            );

            const promises = this.pulseCallers.map(call => call([not]));

            Promise.allSettled(promises).then(results => {
                const rejected = results.filter(r => r.status == 'rejected');
                if (rejected.length > 0) {
                    console.error('Error! a callback was rejected', rejected);
                }

                if (this.notifications.length > this.lastNotifSended - 1) {
                    this.lastNotifSended++;
                    this.pulseSender = setInterval(
                        this.pulseHandler.bind(this),
                        this.pulseInterval,
                    );
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}
