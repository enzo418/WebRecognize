import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class LiveViewService extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api');
    }

    public getCameraView(uri: string) {
        return processPromise<{ ws_feed_id: string }, IProblemJson>(
            this.client.get(this.baseUrl + '/requestCameraStream', { uri }),
        );
    }

    public getAllCamerasView() {
        return processPromise<{ ws_feed_id: string }, IProblemJson>(
            this.client.get(this.baseUrl + '/requestObserverStream', {
                rnd: Math.random(),
            }),
        );
    }
}
