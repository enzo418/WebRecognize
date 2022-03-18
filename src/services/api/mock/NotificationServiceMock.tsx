import { INotificationService } from '../interfaces/INotificationService';
import Notification from '../../../domain/Notification';
import ICameraService from '../interfaces/ICameraService';
import { parseNotification, parseNotifications } from '../convert/ConvertDTOtoNotification';
import DTONotification from '../interfaces/DTONotification';
import { ensure } from '../../../utils/error';
import { min } from 'date-fns';

function serialize(date: Date | string | any): string {
    return (typeof date == 'string') ? date : date.toISOString();
}

const notificationsMock: DTONotification[] = [{
    id: '1',
    group: 1,
    cameraID: '1',
    date: new Date(),
}];

export default class NotificationServiceMock implements INotificationService {
    private cameraService: ICameraService;
    private notifications: DTONotification[];
    // private pulseSender: number;
    // private pulseCallers: any;

    constructor(pCameraService: ICameraService, pNots: DTONotification[] = notificationsMock) {
        this.notifications = pNots;
        this.cameraService = pCameraService;

        // this.pulseSender = setInterval(() => {
        //     this.pulseCallers.forEach(call => call()})
        // });
    }

    get(id: string): Promise<Notification> {
        return new Promise((resolve, reject) => {
            const found = ensure(this.notifications.find((not) => not.id == id));

            resolve(parseNotification(found, this.cameraService));
        });
    }

    getAll(limit = 100): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            const found = [];
            for (let i = 0; i < Math.min(limit, this.notifications.length); i++) {
                found.push(this.notifications[i]);
            }

            resolve(parseNotifications(found, this.cameraService));
        });
    }

    getBefore(before: string | Date, limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            const found: DTONotification[] = [];
            this.notifications.forEach((not) => {
                if (before instanceof Date && not.date < before) {
                    found.push(not);
                } else if (typeof before === 'string' && not.id < before) {
                    found.push(not);
                }
            });

            resolve(parseNotifications(found, this.cameraService));
        });
    }

    getAfter(after: string | Date, limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            const found: DTONotification[] = [];
            this.notifications.forEach((not) => {
                if (after instanceof Date && not.date > after) {
                    found.push(not);
                } else if (typeof after === 'string' && not.id > after) {
                    found.push(not);
                }
            });

            resolve(parseNotifications(found, this.cameraService));
        });
    }

    getBetween<T, U extends T>(
        before: T,
        after: U,
        limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            const found: DTONotification[] = [];
            this.notifications.forEach((not) => {
                if (after instanceof Date &&
                    before instanceof Date &&
                    not.date >= after && not.date <= before) {
                    found.push(not);
                } else if (typeof after === 'string' && not.id > after) {
                    found.push(not);
                }
            });

            resolve(parseNotifications(found, this.cameraService));
        });
    }

    subscribe(callback: (not: Notification) => any): void {
        // notificationWS.addEventListener('message', (ev) => {
        //     callback(parseNotification(ev.data, this.cameraService));
        // });
    }
}
