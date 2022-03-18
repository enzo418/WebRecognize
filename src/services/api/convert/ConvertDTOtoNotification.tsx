import ICameraService from '../interfaces/ICameraService';
import DTONotification from '../interfaces/DTONotification';
import Camera from '../../../domain/Camera';
import Notification from '../../../domain/Notification';

export function parseNotification(
    pNot: DTONotification,
    cameraService: ICameraService): Notification {
    const camera: Camera = cameraService.get(pNot.cameraID);

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

export function parseNotifications(
    pNots: Array<DTONotification>,
    cameraService: ICameraService): Array<Notification> {
    const result: Array<Notification> = [];

    pNots.forEach((not) => {
        result.push(parseNotification(not, cameraService));
    });

    return result;
}
