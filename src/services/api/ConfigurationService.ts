import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import TypedPromise from '../../TypedPromise';
import DTOCamera from './interfaces/DTOCamera';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class ConfigurationService extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/configuration/');
    }

    public setField(id: string, data: { field: string; value: any }) {
        // should be a patch following the verb rules!
        return processPromise<any, IProblemJson>(
            this.client.post(this.baseUrl + id, data, { headers: {} }),
        );
    }

    public getField(id: string, field: string) {
        // rnd is used to avoid browser cache
        return processPromise<any, IProblemJson>(
            this.client.get(this.baseUrl + id, {
                field: field,
                rnd: Math.random(),
            }),
        );
    }

    public getAvailable() {
        return processPromise<any, IProblemJson>(
            this.client.get(this.baseUrl, {}),
        );
    }

    // Creates
    public create(configuration?: string) {
        const body = configuration ? configuration : {};

        return processPromise<{ id: string }, IProblemJson>(
            this.client.post(this.baseUrl, body, { headers: {} }),
        );
    }

    public getConfigurationCameras(configurationId: string) {
        return new TypedPromise<DTOCamera[], IProblemJson>((ok, fail) => {
            this.getField(configurationId, 'cameras')
                .ok(res =>
                    ok(res.map((cfg: any) => ({ id: cfg.id, name: cfg.name }))),
                )
                .fail(e => fail(e));
        });
    }
}
