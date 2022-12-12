import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import DTOObserverStatus from './interfaces/DTOObserverStatus';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class ObserverService extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api');
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
            this.client.get(this.baseUrl + '/observerStatus', {}),
        );
    }
}
