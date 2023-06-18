import config from '../../config';
import IHttpClient from '../../Http/IHttpClient';
import processPromise, {
    processPromiseAsArrayBuffer,
} from '../../Http/ProcessPromise';
import TypedPromise from '../../TypedPromise';
import DTOCamera, { DTOCameraDefaults } from './interfaces/DTOCamera';
import {
    DTOCameraStatus,
    CameraType as ECameraType,
} from './interfaces/DTOObserverStatus';
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
                .ok(response => {
                    const blob = new Blob([response.buffer], {
                        type: format,
                    });

                    ok(blob);
                })
                .fail(e => fail(e));
        });
    }

    public snooze(camera_name: string, duration_seconds: number) {
        return processPromise<DTOCameraStatus, IProblemJson>(
            this.client.post(this.baseUrl + camera_name + '/snooze', {
                seconds: duration_seconds,
            }),
        );
    }

    public wake(camera_name: string) {
        return processPromise<DTOCameraStatus, IProblemJson>(
            this.client.post(this.baseUrl + camera_name + '/wake', {}),
        );
    }

    public changeTemporalType(
        camera_name: string,
        temporal_type: ECameraType,
        duration_seconds: number,
    ): TypedPromise<DTOCameraStatus, IProblemJson> {
        return processPromise<DTOCameraStatus, IProblemJson>(
            this.client.post(this.baseUrl + camera_name + '/type/temporarily', {
                type: temporal_type,
                seconds: duration_seconds,
            }),
        );
    }

    public changeIndefinitelyType(
        camera_name: string,
        type: ECameraType,
    ): TypedPromise<DTOCameraStatus, IProblemJson> {
        return processPromise<DTOCameraStatus, IProblemJson>(
            this.client.post(
                this.baseUrl + camera_name + '/type/indefinitely',
                {
                    type,
                },
            ),
        );
    }
}
