import { INotificationService } from '../interfaces/INotificationService';
import Notification from '../../../domain/Notification';
import ICameraService from '../interfaces/ICameraService';
import { parseNotification, parseNotifications } from '../convert/ConvertDTOtoNotification';
import DTONotification from '../interfaces/DTONotification';
import {ensure} from '../../../utils/error';
import { subDays, addMinutes } from 'date-fns';
import {random} from '../../../utils/random';

const generateNotifications = (n:number, numberCams:number) => {
    const generated:DTONotification[] = [];
    let lastID:number = 0;
    let lastDate:Date = new Date();

    for (let i=0; i < n; i++) {
        const g = {
            id: '' + lastID+1,
            group: random(0, n),
            cameraID: '' + random(0, numberCams),
            date: addMinutes(subDays(lastDate, 1), random(20, 60)),
        };
        generated.push(g);

        lastID++;
        lastDate = g.date;
    }

    return generated;
};


const notificationsMock: DTONotification[] = generateNotifications(1000, 450);


// const baseDate = new Date();
// const notificationsMock: DTONotification[] = [{
//    id: '1',
//    group: 1,
//    cameraID: '1',
//    date: addMinutes(subDays(baseDate, 9), 5),
// }, {
//    id: '2',
//    group: 2,
//    cameraID: '1',
//    date: addMinutes(subDays(baseDate, 8), 10),
// }, {
//    id: '3',
//    group: 1,
//    cameraID: '1',
//    date: addMinutes(subDays(baseDate, 7), 15),
// }, {
//    id: '4',
//    group: 3,
//    cameraID: '3',
//    date: addMinutes(subDays(baseDate, 6), 20),
// }];

export default class NotificationServiceMock implements INotificationService {
    private cameraService: ICameraService;
    private notifications: DTONotification[];
    // private pulseSender: number;
    // private pulseCallers: any;

    constructor(pCameraService: ICameraService, pNots: DTONotification[]=notificationsMock) {
        this.notifications=pNots;
        this.cameraService=pCameraService;

        // this.pulseSender = setInterval(() => {
        //     this.pulseCallers.forEach(call => call()})
        // });
    }

    get(id: string): Promise<Notification> {
        return new Promise((resolve, reject) => {
            const found=ensure(this.notifications.find((not) => not.id==id));

            resolve(parseNotification(found, this.cameraService));
        });
    }

    getAll(limit=100): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            const found=[];
            for (let i=0; i<Math.min(limit, this.notifications.length); i++) {
                found.push(this.notifications[i]);
            }

            resolve(parseNotifications(found, this.cameraService));
        });
    }

    getBefore(before: string|Date, limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            const found: DTONotification[]=[];
            this.notifications.forEach((not) => {
                if (before instanceof Date&&not.date<before) {
                    found.push(not);
                } else if (typeof before==='string'&&not.id<before) {
                    found.push(not);
                }
            });

            resolve(parseNotifications(found, this.cameraService));
        });
    }

    getAfter(after: string|Date, limit: number): Promise<Array<Notification>> {
        return new Promise((resolve, reject) => {
            const found: DTONotification[]=[];
            this.notifications.forEach((not) => {
                if (after instanceof Date&&not.date>after) {
                    found.push(not);
                } else if (typeof after==='string'&&not.id>after) {
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
            const found: DTONotification[]=[];
            this.notifications.forEach((not) => {
                if (after instanceof Date&&
                    before instanceof Date &&
                    not.date >= after && not.date <= before) {
                    found.push(not);
                } else if (typeof after==='string'&&not.id>after) {
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
