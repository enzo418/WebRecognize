import ICameraService from '../../services/api/interfaces/ICameraService';
import Camera from '../../domain/Camera';
import Notification, {
    ENotificationType,
    MediaNotification,
    TextNotification,
} from '../../domain/Notification';
import DTONotification from '../../services/api/interfaces/DTONotification';
import {
    parseNotification,
    parseNotifications,
} from '../../services/api/convert/ConvertDTOtoNotification';
import { tryGetEnumValueFromDirtyString } from '../../utils/enum';
import { dateToUnix, parseDate } from '../../utils/date';
import TypedPromise from '../../TypedPromise';
import IProblemJson from '../../services/api/interfaces/IProblemJson';

function ensure<T>(
    argument: T | undefined | null,
    message: string = 'Value cannot be null or undefined.',
): T {
    if (argument === undefined || argument === null) {
        throw new TypeError(message);
    }

    return argument;
}

class MockCameraService implements ICameraService {
    cameras: Array<Camera>;
    constructor(pCameras: Array<Camera>) {
        this.cameras = pCameras;
    }

    get(id: string): TypedPromise<Camera, IProblemJson> {
        return new TypedPromise<Camera, IProblemJson>((resolve, reject) => {
            resolve(ensure(this.cameras.find(c => c.id == id)));
        });
    }
}

const getNotificationContent = (n: Notification) => {
    let content = '';
    switch (n.type) {
        case ENotificationType.IMAGE:
            content = (n as MediaNotification).mediaURI;
            break;
        case ENotificationType.VIDEO:
            content = (n as MediaNotification).mediaURI;
            break;
        case ENotificationType.TEXT:
            content = (n as TextNotification).text;
            break;
    }
    return content;
};

describe('Notification Service', () => {
    it('should do request a notifications, request a camera and be correct', async () => {
        const date = new Date(1000, 0, 24, 0, 0, 0, 0);

        const not: DTONotification = {
            id: '1',
            datetime: dateToUnix(parseDate('24/01/1000 00:00:00')),
            camera: { id: '123456', name: 'test' },
            groupID: 99,
            type: 'image',
            content: 'aaa',
        };

        const cameras: Array<Camera> = [
            { id: '123456', name: 'test', url: 't' },
        ];

        const camService: MockCameraService = new MockCameraService(cameras);

        const spyGetCam = jest.spyOn(camService, 'get');

        //

        const response: Notification = await parseNotification(not, camService);

        //

        expect(spyGetCam).toHaveBeenCalledTimes(1);
        expect(spyGetCam).toHaveBeenCalledWith(not.camera.id);

        expect(response.id).toBe(not.id);
        expect(response.group).toBe(not.groupID);
        expect(response.date).toStrictEqual(date);
        expect(response.camera).toMatchObject(cameras[0]);
        expect(response.type).toBe(ENotificationType.IMAGE);
        expect(getNotificationContent(response)).toBe(not.content);
    });

    it('should request all the notifications and all the cameras', async () => {
        const date = new Date(2010, 4, 28, 23, 33, 15);

        const notResponse: DTONotification[] = [
            {
                id: '1',
                datetime: dateToUnix(parseDate('28/05/2010 23:33:15')),
                camera: { id: '1', name: 'c1' },
                groupID: 99,
                type: 'text',
                content: 'hi',
            },
            {
                id: '2',
                datetime: dateToUnix(parseDate('28/05/2010 23:33:15')),
                camera: { id: '2', name: 'c2' },
                groupID: 99,
                type: 'image',
                content: 'this_is_a_uri',
            },
            {
                id: '3',
                datetime: dateToUnix(parseDate('28/05/2010 23:33:15')),
                camera: { id: '2', name: 'c2' },
                groupID: 1,
                type: 'video',
                content: 'this_is_a_uri2',
            },
        ];

        const cameras: Array<Camera> = [
            { id: '1', name: 'a', url: 'u' },
            { id: '2', name: 'b', url: 'u' },
        ];

        const camAt = (id: string) => ensure(cameras.find(c => c.id == id));

        const camService: MockCameraService = new MockCameraService(cameras);

        const spyGetCam = jest.spyOn(camService, 'get');

        //

        const response: Notification[] = await parseNotifications(
            notResponse,
            camService,
        );

        //

        expect(spyGetCam).toHaveBeenCalledTimes(notResponse.length);
        notResponse.forEach(({ camera }, index) => {
            // call number starts at 1
            expect(spyGetCam).toHaveBeenNthCalledWith(index + 1, camera.id);
            expect(spyGetCam).toHaveBeenNthCalledWith(index + 1, camera.id);
            expect(spyGetCam).toHaveBeenNthCalledWith(index + 1, camera.id);
        });

        const inputVsExpected = response.map((n, i) => [n, notResponse[i]]);

        inputVsExpected.forEach(([pInput, pExpected]) => {
            const actual: Notification = pInput as Notification;
            const expected: DTONotification = pExpected as DTONotification;

            expect(actual.id).toBe(expected.id);
            expect(actual.group).toBe(expected.groupID);
            expect(actual.date).toStrictEqual(date);
            expect(actual.camera).toMatchObject(camAt(expected.camera.id));
            expect(actual.type).toBe(
                tryGetEnumValueFromDirtyString(
                    ENotificationType,
                    expected.type,
                ),
            );

            expect(getNotificationContent(actual)).toBe(expected.content);
        });
    });
});
