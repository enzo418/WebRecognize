import ICameraService from '../interfaces/ICameraService';
import DTONotification from '../interfaces/DTONotification';
import Camera from '../../../domain/Camera';
import Notification, {
    ENotificationType,
    MediaNotification,
    TextNotification,
} from '../../../domain/Notification';
import {
    getEnumKeysNames,
    tryGetEnumValueFromDirtyString,
} from '../../../utils/enum';

import { parseDate } from '../../../utils/date';

import config from '../../../config';
import TypedPromise from '../../../TypedPromise';
import IProblemJson from '../interfaces/IProblemJson';

// function notificationStringTypeToEnum(type:string) : ENotificationType {
//    const names = getEnumKeysNames(ENotificationType).map((t:string) => t.toLowerCase());
//    const cleanType:string = type.toLowerCase().trim();
//    const indx = names.indexOf(cleanType);
//    if (indx != -1) {
//        // why so many conversions? We cannot use cleanType since
//        // it's on lower case but the type might be on upper case.
//        const t = ENotificationType[indx] as keyof typeof ENotificationType;
//        return ENotificationType[t];
//    } else {
//        throw new Error(`Wrong notification type '${type}'`);
//    }
// }

export async function parseNotification(
    pNot: DTONotification,
    cameraService: ICameraService,
): Promise<Notification> {
    return new Promise((resolve, reject) => {
        console.log(pNot);
        cameraService
            .get(pNot.camera.id)
            .ok(camera => {
                let notification: Notification = {
                    id: pNot.id,
                    date: new Date(pNot.datetime * 1000),
                    group: pNot.groupID,
                    camera: camera,
                    type: tryGetEnumValueFromDirtyString(
                        ENotificationType,
                        pNot.type,
                    ),
                    configurationID: pNot.configurationID,
                };

                const absoluteURL =
                    process.env.PUBLIC_URL +
                    (pNot.content.startsWith('/')
                        ? pNot.content
                        : '/' + pNot.content);

                switch (notification.type) {
                    case ENotificationType.IMAGE:
                        notification = {
                            ...notification,
                            mediaURI: absoluteURL,
                        } as MediaNotification;
                        break;
                    case ENotificationType.VIDEO:
                        notification = {
                            ...notification,
                            mediaURI: absoluteURL,
                        } as MediaNotification;
                        break;
                    case ENotificationType.TEXT:
                        notification = {
                            ...notification,
                            text: pNot.content,
                        } as TextNotification;
                        break;
                }

                resolve(notification);
            })
            .fail(e => {
                reject(
                    new Error(
                        `Couldn't get the camera with id: '${pNot.camera.id}', error: ${e.title}`,
                    ),
                );
            });
    });
}

export function parseNotifications(
    pDTONotifications: Array<DTONotification>,
    cameraService: ICameraService,
): TypedPromise<Array<Notification>, IProblemJson> {
    return new TypedPromise<Array<Notification>, IProblemJson>(
        (resolve, reject) => {
            const notifications: Array<Notification> = [];

            // get a promise per notification
            const promises: Promise<Notification>[] = pDTONotifications.map(
                DTONot => parseNotification(DTONot, cameraService),
            );

            // resolve once all the promises are settled (rejected/fullfiled)
            Promise.allSettled(promises)
                .then(results => {
                    results.forEach(result => {
                        if (result.status === 'rejected') {
                            reject({
                                title: result.reason,
                                status: 0,
                            });
                        } else {
                            notifications.push(result.value);
                        }
                    });

                    resolve(notifications);
                })
                .catch(reject);
        },
    );
}
