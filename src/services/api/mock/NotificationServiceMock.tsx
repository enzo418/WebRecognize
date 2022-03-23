import { INotificationService } from '../interfaces/INotificationService';
import Notification, {ENotificationType} from '../../../domain/Notification';
import ICameraService from '../interfaces/ICameraService';
import { parseNotification, parseNotifications } from '../convert/ConvertDTOtoNotification';
import DTONotification from '../interfaces/DTONotification';
import {ensure} from '../../../utils/error';
import { subSeconds, subHours } from 'date-fns';
import {random} from '../../../utils/random';
import {getEnumAt, getEnumKeysNames} from '../../../utils/enum';


const videos:string[] = [
    'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-20s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-30s.mp4'];

const generateNotifications = (n:number, numberCams:number) => {
    const generated:DTONotification[] = [];
    // let lastID:number = -1;
    let lastDate:Date = new Date();

    const types = getEnumKeysNames(ENotificationType);

    let lastNID = -1;
    for (let i = 0; i < n; i++) {
        types.forEach((t, ti) => {
            let content:string = '';

            switch (getEnumAt(ENotificationType, t)) {
            case ENotificationType.IMAGE:
                content = `https://picsum.photos/640/360?random=1&cache=${random(i, 100000)}`;
                break;
            case ENotificationType.VIDEO:
                content = videos[random(0, videos.length-1)];
                break;
            case ENotificationType.TEXT:
                content = 'random text with lucky number: ' + random(0, 999);
                break;
            }

            const g:DTONotification = {
                id: '' + (lastNID + ti + 1),
                group: i,
                cameraID: '' + random(0, numberCams),
                date: subSeconds(lastDate, random(0, 15 * 60)),
                type: t,
                content,
            };

            if (random(0, 10) > 3) {
                generated.push(g);
                lastNID = parseInt(g.id);
            }

            lastDate = subHours(g.date, random(1, 1));
        });
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

type CallbackWS = (n:Notification) => Promise<boolean>;

export default class NotificationServiceMock implements INotificationService {
    private cameraService: ICameraService;
    private notifications: DTONotification[];
    private pulseSender: NodeJS.Timer;
    private pulseCallers: CallbackWS[];
    private lastNotifSended: number;
    private pulseInterval:number;

    constructor(pCameraService: ICameraService, pNots: DTONotification[]=notificationsMock) {
        this.notifications=pNots;
        this.cameraService=pCameraService;
        this.lastNotifSended = 0;
        this.pulseCallers = [];

        this.pulseInterval = 2 * 1000;

        this.pulseSender = setInterval(this.pulseHandler.bind(this), this.pulseInterval);
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

    subscribe(callback: CallbackWS): void {
        this.pulseCallers.push(callback);

        // notificationWS.addEventListener('message', (ev) => {
        //     callback(parseNotification(ev.data, this.cameraService));
        // });
    }

    private async pulseHandler() : Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            clearInterval(this.pulseSender);

            const not = await parseNotification(
                this.notifications[this.lastNotifSended],
                this.cameraService,
            );

            const promises = this.pulseCallers.map((call) => call(not));

            Promise.allSettled(promises).then((results) => {
                const rejected = results.filter((r) => r.status == 'rejected');
                if (rejected.length > 0) {
                    console.error('Error! a callback was rejected', rejected);
                }

                if (this.notifications.length > this.lastNotifSended -1) {
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
    };
}
