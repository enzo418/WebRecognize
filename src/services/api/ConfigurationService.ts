import IHttpClient from '../../Http/IHttpClient';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class ConfigurationService extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/configuration/');
    }

    public setField(id:string, data: {field: string, value: any}) {
        return this.processPromise<any, IProblemJson>(this.client.put(this.baseUrl + id, data));
    }
}
