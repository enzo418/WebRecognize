import IHttpClient from '../../Http/IHttpClient';
import TypedPromise from '../../TypedPromise';
import IProblemJson from './interfaces/IProblemJson';

export default abstract class Service {
    protected client: IHttpClient;
    protected baseUrl: string;

    constructor(httpClient: IHttpClient, baseURL: string) {
        this.client = httpClient;
        this.baseUrl = baseURL;
    }
}
