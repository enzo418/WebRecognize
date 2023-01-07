import config from '../../config';
import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import ILiveViewService from './interfaces/ILiveViewService';
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
                this.baseUrl + '/camera/' + camera_id + '/stream',
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
}
