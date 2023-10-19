import config from '../../config';
import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import DTOObserverStatus from './interfaces/DTOObserverStatus';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

const observerStatusWs = new WebSocket(
    config.endpoints.websocket.observerStatus,
);

observerStatusWs.addEventListener('open', ev => {
    console.debug('Observer status ws connected');
});

observerStatusWs.addEventListener('close', ev => {
    console.debug('Observer status ws disconnected');
});

export default class ObserverService extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/observer');
    }

    public start(config_id: string) {
        return processPromise<DTOObserverStatus, IProblemJson>(
            this.client.get(this.baseUrl + '/start/' + config_id, {}),
        );
    }

    public stop() {
        return processPromise<DTOObserverStatus, IProblemJson>(
            this.client.get(this.baseUrl + '/stop', {}),
        );
    }

    public status() {
        return processPromise<DTOObserverStatus, IProblemJson>(
            this.client.get(this.baseUrl + '/status', {}),
        );
    }

    public onStatusChange(callback: (status: DTOObserverStatus) => any) {
        observerStatusWs.addEventListener('message', async ev => {
            let data: string;
            if (ev.data instanceof Blob) {
                data = await ev.data.text();
            } else {
                data = ev.data;
            }

            const status = JSON.parse(data) as DTOObserverStatus;
            callback(status);
        });
    }
}
