import ICameraService from '../interfaces/ICameraService';
import Camera from '../../../domain/Camera';
import DTOCamera, { DTOCameraDefaults } from '../interfaces/DTOCamera';
import { ensure } from '../../../utils/error';
import TypedPromise from '../../../TypedPromise';
import IProblemJson from '../interfaces/IProblemJson';
import processPromise, {
    processPromiseAsArrayBuffer,
} from '../../../Http/ProcessPromise';
import { cameraDefaults, camerasMock, cameraToImageUrl } from './mockData';

export default class CameraServiceMock implements ICameraService {
    cameras: DTOCamera[];

    constructor() {
        this.cameras = camerasMock;
    }

    get(id: string) {
        return new TypedPromise<Camera, IProblemJson>((resolve, reject) => {
            resolve(ensure(this.cameras.find(cam => cam.id === id)));
        });
    }

    public getDefaults(camera_id: string) {
        return new TypedPromise<DTOCameraDefaults, IProblemJson>(
            (resolve, reject) => {
                resolve(cameraDefaults);
            },
        );
    }

    public getFrame(camera_id: string, format: string = 'image/jpeg') {
        // rnd is used to avoid browser cache
        return new TypedPromise<Blob, IProblemJson>((ok, fail) => {
            processPromiseAsArrayBuffer(
                fetch((cameraToImageUrl as any)[camera_id]),
            )
                .ok(response => {
                    const blob = new Blob([response.buffer], {
                        type: format,
                    });

                    ok(blob);
                })
                .fail(e => fail(e));
        });
    }
}
