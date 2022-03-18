import ICameraService from '../../services/api/interfaces/ICameraService';
import Camera from '../../domain/Camera';
import Notification from '../../domain/Notification';
import DTONotification from '../../services/api/interfaces/DTONotification';
import {
    parseNotification,
    parseNotifications,
} from '../../services/api/convert/ConvertDTOtoNotification';

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

    get(id: string): Camera {
        return ensure(this.cameras.find((c) => c.id == id));
    }
}

describe('Notification Service', () => {
    it('should do request a notifications, request a camera and be correct', async () => {
        const not: DTONotification = {
            date: new Date(1000, 1, 10, 0, 0, 0, 0),
            cameraID: '123456',
            group: 99,
        };

        const cameras: Array<Camera> = [
            { id: '123456', name: 'a' },
        ];

        const camService: MockCameraService = new MockCameraService(cameras);

        const spyGetCam = jest.spyOn(camService, 'get');

        //

        const response: Notification = parseNotification(not, camService);

        //

        expect(spyGetCam).toHaveBeenCalledTimes(1);
        expect(spyGetCam).toHaveBeenCalledWith(not.cameraID);

        expect(response.group).toBe(not.group);
        expect(response.date).toStrictEqual(not.date);
        expect(response.camera).toMatchObject(cameras[0]);
    });

    it('should request all the notifications and all the cameras', () => {
        const notResponse: DTONotification[] = [{
            date: new Date(1000, 1, 10, 0, 0, 0, 0),
            cameraID: '1',
            group: 99,
        }, {
            date: new Date(1000, 1, 10, 2, 0, 0, 3),
            cameraID: '2',
            group: 99,
        }, {
            date: new Date(423, 1, 10, 4, 0, 0, 3),
            cameraID: '2',
            group: 1,
        }];

        const cameras: Array<Camera> = [
            { id: '1', name: 'a' },
            { id: '2', name: 'b' },
        ];

        const camAt = (id: string) => ensure(cameras.find((c) => c.id == id));

        const camService: MockCameraService = new MockCameraService(cameras);

        const spyGetCam = jest.spyOn(camService, 'get');

        //

        const response: Notification[] = parseNotifications(notResponse, camService);

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

            expect(actual.group).toBe(expected.group);
            expect(actual.date).toStrictEqual(expected.date);
            expect(actual.camera).toMatchObject(camAt(expected.cameraID));
        });
    });
});
