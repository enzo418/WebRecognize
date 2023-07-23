import config from '../../config';
import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import ILiveViewService, { LiveViewType } from './interfaces/ILiveViewService';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class LiveViewService
    extends Service
    implements ILiveViewService
{
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api');
    }

    public getCameraView(camera_id: string) {
        return processPromise<{ ws_feed_id: string }, IProblemJson>(
            this.client.get(
                this.baseUrl + '/camera/' + camera_id + '/request_stream',
                {},
            ),
        );
    }

    public getAllCamerasView() {
        return processPromise<{ ws_feed_id: string }, IProblemJson>(
            this.client.get(this.baseUrl + '/observer/stream', {
                rnd: Math.random(),
            }),
        );
    }

    public call(type: LiveViewType, data: string | null | undefined) {
        let url = '';

        switch (type) {
            case LiveViewType.OBSERVER:
                url = config.endpoints.api.stream.observer;
                break;
            case LiveViewType.CAMERA:
                url = config.endpoints.api.stream.camera + data;
                break;
            case LiveViewType.SOURCE:
                url =
                    config.endpoints.api.stream.uri +
                    '?uri=' +
                    encodeURI(data as string);
                break;
            default:
                throw new Error('Invalid LiveViewType');
        }

        return processPromise<
            { clientId: string; offer: string },
            IProblemJson
        >(this.client.get(url, {}));
    }

    public answer(client_id: string, answer: string | object) {
        return processPromise<void, IProblemJson>(
            this.client.post(this.baseUrl + '/stream/answer', {
                clientId: client_id,
                answer,
            }),
        );
    }

    public hangUp(client_id: string) {
        return processPromise<void, IProblemJson>(
            this.client.post(this.baseUrl + '/stream/hangup', {
                clientId: client_id,
            }),
        );
    }
}
