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
import DTOCamera from '../interfaces/DTOCamera';
import { ensure } from '../../../utils/error';

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

function mergeNotificationAndCameraDTOs(
    pNot: DTONotification,
    camera: DTOCamera,
): Notification {
    let notification: Notification = {
        id: pNot.id,
        date: new Date(pNot.datetime * 1000),
        group: pNot.groupID,
        camera: camera,
        type: tryGetEnumValueFromDirtyString(ENotificationType, pNot.type),
        configurationID: pNot.configurationID,
    };

    const absoluteURL = new URL(pNot.content, config.server).href;

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

    return notification;
}

export async function parseNotification(
    pNot: DTONotification,
    cameraService: ICameraService,
): Promise<Notification> {
    return new Promise((resolve, reject) => {
        cameraService
            .get(pNot.camera.id)
            .ok(camera => {
                let notification = mergeNotificationAndCameraDTOs(pNot, camera);

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

            // TL;DR: Memorizes promises to reduce parallel camera requests.

            // A Service cache layer would be valid too, but that's a solution too wide.
            // The current problem is that we receive over 50 notifications from the same
            // camera and thus we make > 50 request at once. Also, that's why a
            // browser-cache solution is not applicable here.
            //
            // So far, if we had 100 notifications corresponding to two cameras,
            // we would have made 100 requests to get those cameras for each notification.
            // We now make two requests.

            let memoizedCamerasRequests: Map<
                string,
                Promise<DTOCamera>
            > = new Map();

            const getCamera = (pNot: DTONotification) => {
                const id = pNot.camera.id;
                if (memoizedCamerasRequests.has(id)) {
                    return ensure<Promise<DTOCamera>>(
                        memoizedCamerasRequests.get(id),
                    );
                } else {
                    // typed promise doesn't allow chained then/ok
                    const promise = new Promise<DTOCamera>((res, rej) => {
                        cameraService.get(id).ok(res).fail(rej);
                    });

                    memoizedCamerasRequests.set(id, promise);

                    return promise;
                }
            };

            // get a promise per notification
            const promises: Promise<Notification>[] = pDTONotifications.map(
                DTONot => {
                    return new Promise<Notification>(
                        async (resolve, reject) => {
                            const cameraPromise = getCamera(DTONot);

                            cameraPromise
                                .then(camera => {
                                    resolve(
                                        mergeNotificationAndCameraDTOs(
                                            DTONot,
                                            camera,
                                        ),
                                    );

                                    // return the camera for the next .then
                                    return camera;
                                })
                                .catch(e => {
                                    reject(
                                        new Error(
                                            `Couldn't get the camera with id: '${
                                                DTONot.camera.id
                                            }', error: ${
                                                (e as IProblemJson).title
                                            }`,
                                        ),
                                    );
                                });
                        },
                    );
                },
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
