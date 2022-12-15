import config from '../../config';
import IHttpClient from '../../Http/IHttpClient';
import processPromise, {
    processPromiseAsArrayBuffer,
} from '../../Http/ProcessPromise';
import TypedPromise from '../../TypedPromise';
import DTOCamera, { DTOCameraDefaults } from './interfaces/DTOCamera';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class CameraService extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/');
    }

    public getDefaults(id: { uri?: string; camera_id?: string }) {
        return processPromise<DTOCameraDefaults, IProblemJson>(
            this.client.get(this.baseUrl + 'getCameraDefaults', id),
        );
    }

    /**
     * Resolves correctly to a image/jpeg by default
     * @param id camera id/uri
     * @returns a blob
     */
    public getFrame(
        id: { uri?: string; camera_id?: string },
        format: string = 'image/jpeg',
    ) {
        // rnd is used to avoid browser cache
        return new TypedPromise<Blob, IProblemJson>((ok, fail) => {
            processPromiseAsArrayBuffer(
                this.client.get(this.baseUrl + 'getCameraFrame', id),
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
