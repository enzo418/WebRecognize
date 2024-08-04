import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import { DTOAIServer } from './interfaces/DTOAIServer';
import IAIServer from './interfaces/IAIServer';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class AIServer extends Service implements IAIServer {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/ai/');
    }

    public findAnyService() {
        return processPromise<DTOAIServer, IProblemJson>(
            this.client.get(this.baseUrl + 'find-any-server', {}),
        );
    }
}
