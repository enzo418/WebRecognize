import ICameraService from '../interfaces/ICameraService';
import DTONotification from '../interfaces/DTONotification';
import Camera from '../../../domain/Camera';
import Notification from '../../../domain/Notification';

export async function parseNotification(
    pNot: DTONotification,
    cameraService: ICameraService): Promise<Notification> {
    return new Promise(async (resolve, reject) => {
        const camera: Camera = await cameraService.get(pNot.cameraID);

        if (camera) {
            const notification: Notification = {
                id: pNot.id,
                date: new Date(pNot.date),
                group: pNot.group,
                camera: camera,
            };

            resolve(notification);
        } else {
            reject(new Error(`Couldn't get the camera with id: '${pNot.cameraID}'`));
        }
    });
}

export function parseNotifications(
    pDTONotifs: Array<DTONotification>,
    cameraService: ICameraService): Promise<Array<Notification>> {
    return new Promise((resolve, reject) => {
        const notifications: Array<Notification> = [];

        // get a promise per notification
        const promises:Promise<Notification>[] = pDTONotifs.map(
            (DTONot) => parseNotification(DTONot, cameraService),
        );

        // resolve once all the promises are settled (rejected/fullfiled)
        Promise.allSettled(promises)
            .then((results) => {
                results.forEach((result) => {
                    if (result.status === 'rejected') {
                        reject(result.reason);
                    } else {
                        notifications.push(result.value);
                    }
                });

                resolve(notifications);
            })
            .catch(reject);
    });
}
