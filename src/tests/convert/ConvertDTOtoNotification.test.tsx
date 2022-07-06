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
import {tryGetEnumValueFromDirtyString} from '../../utils/enum';
import {dateToUnix, parseDate} from '../../utils/date';

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

    get(id: string): Promise<Camera> {
        return new Promise((resolve, reject) => {
            resolve(ensure(this.cameras.find((c) => c.id == id)));
        });
    }
}

const getNotificationContent = (n:Notification) => {
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
            date: dateToUnix(parseDate('24/01/1000 00:00:00')),
            cameraID: '123456',
            group: 99,
            type: 'image',
            content: 'aaa',
        };

        const cameras: Array<Camera> = [
            { id: '123456', name: 'a' },
        ];

        const camService: MockCameraService = new MockCameraService(cameras);

        const spyGetCam = jest.spyOn(camService, 'get');

        //

        const response: Notification = await parseNotification(not, camService);

        //

        expect(spyGetCam).toHaveBeenCalledTimes(1);
        expect(spyGetCam).toHaveBeenCalledWith(not.cameraID);

        expect(response.id).toBe(not.id);
        expect(response.group).toBe(not.group);
        expect(response.date).toStrictEqual(date);
        expect(response.camera).toMatchObject(cameras[0]);
        expect(response.type).toBe(ENotificationType.IMAGE);
        expect(getNotificationContent(response)).toBe(not.content);
    });

    it('should request all the notifications and all the cameras', async () => {
        const date = new Date(2010, 4, 28, 23, 33, 15);

        const notResponse: DTONotification[] = [{
            id: '1',
            date: dateToUnix(parseDate('28/05/2010 23:33:15')),
            cameraID: '1',
            group: 99,
            type: 'text',
            content: 'hi',
        }, {
            id: '2',
            date: dateToUnix(parseDate('28/05/2010 23:33:15')),
            cameraID: '2',
            group: 99,
            type: 'image',
            content: 'this_is_a_uri',
        }, {
            id: '3',
            date: dateToUnix(parseDate('28/05/2010 23:33:15')),
            cameraID: '2',
            group: 1,
            type: 'video',
            content: 'this_is_a_uri2',
        }];

        const cameras: Array<Camera> = [
            { id: '1', name: 'a' },
            { id: '2', name: 'b' },
        ];

        const camAt = (id: string) => ensure(cameras.find((c) => c.id == id));

        const camService: MockCameraService = new MockCameraService(cameras);

        const spyGetCam = jest.spyOn(camService, 'get');

        //

        const response: Notification[] = await parseNotifications(notResponse, camService);

        //

        expect(spyGetCam).toHaveBeenCalledTimes(notResponse.length);
        notResponse.forEach(({ cameraID }, index) => {
            // call number starts at 1
            expect(spyGetCam).toHaveBeenNthCalledWith(index + 1, cameraID);
            expect(spyGetCam).toHaveBeenNthCalledWith(index + 1, cameraID);
            expect(spyGetCam).toHaveBeenNthCalledWith(index + 1, cameraID);
        });

        const inputVsExpected = response.map((n, i) => [n, notResponse[i]]);

        inputVsExpected.forEach(([pInput, pExpected]) => {
            const actual: Notification = pInput as Notification;
            const expected: DTONotification = pExpected as DTONotification;

            expect(actual.id).toBe(expected.id);
            expect(actual.group).toBe(expected.group);
            expect(actual.date).toStrictEqual(date);
            expect(actual.camera).toMatchObject(camAt(expected.cameraID));
            expect(actual.type)
                .toBe(tryGetEnumValueFromDirtyString(ENotificationType, expected.type));

            expect(getNotificationContent(actual)).toBe(expected.content);
        });
    });
});
