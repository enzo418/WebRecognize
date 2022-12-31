import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import TypedPromise from '../../TypedPromise';
import DTOCamera from './interfaces/DTOCamera';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class ServerConfigurationService extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/server_configuration');
    }

    public setField(data: { field: string; value: any }) {
        // should be a patch following the verb rules!
        return processPromise<any, IProblemJson>(
            this.client.post(this.baseUrl, data),
        );
    }

    public getField(field: string) {
        // rnd is used to avoid browser cache
        return processPromise<any, IProblemJson>(
            this.client.get(this.baseUrl, {
                field: field,
                rnd: Math.random(),
            }),
        );
    }
}
