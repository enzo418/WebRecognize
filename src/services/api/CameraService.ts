import config from '../../config';
import IHttpClient from '../../Http/IHttpClient';
import processPromise, {
    processPromiseAsArrayBuffer,
} from '../../Http/ProcessPromise';
import TypedPromise from '../../TypedPromise';
import DTOCamera, { DTOCameraDefaults } from './interfaces/DTOCamera';
import ICameraService from './interfaces/ICameraService';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class CameraService extends Service implements ICameraService {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/camera/');
    }

    public get(id: string) {
        return processPromise<DTOCamera, IProblemJson>(
            this.client.get(this.baseUrl + id, {}),
        );
    }

    public getDefaults(camera_id: string) {
        return processPromise<DTOCameraDefaults, IProblemJson>(
            this.client.get(this.baseUrl + camera_id + '/info', {}),
        );
    }

    /**
     * Resolves correctly to a image/jpeg by default
     * @param camera_id camera id
     * @returns a blob
     */
    public getFrame(camera_id: string, format: string = 'image/jpeg') {
        // rnd is used to avoid browser cache
        return new TypedPromise<Blob, IProblemJson>((ok, fail) => {
            processPromiseAsArrayBuffer(
                this.client.get(this.baseUrl + camera_id + '/frame', {}),
            )
                .ok(bufferImage => {
                    const blob = new Blob([bufferImage], {
                        type: format,
                    });

                    ok(blob);
                })
                .fail(e => fail(e));
        });
    }
}
