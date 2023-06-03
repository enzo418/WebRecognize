import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import TypedPromise from '../../TypedPromise';
import DTOCamera from './interfaces/DTOCamera';
import DTOConfigurationDetails from './interfaces/DTOConfigurationDetails';
import IConfigurationService from './interfaces/IConfigurationService';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class ConfigurationService
    extends Service
    implements IConfigurationService
{
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/configuration/');
    }

    public setField(id: string, data: { field: string; value: any }) {
        // should be a patch following the verb rules!
        return processPromise<any, IProblemJson>(
            this.client.post(this.baseUrl + id, data),
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

    /**
     * Get the configurations that backend has stored
     * @returns
     */
    public getAvailable() {
        return processPromise<DTOConfigurationDetails[], IProblemJson>(
            this.client.get(this.baseUrl, {}),
        );
    }

    // Creates
    public create(configuration?: object) {
        const body = configuration ? configuration : {};

        return processPromise<{ id: string }, IProblemJson>(
            this.client.post(this.baseUrl, body),
        );
    }

    public clone(id: string) {
        return processPromise<{ id: string }, IProblemJson>(
            this.client.post(this.baseUrl, {
                clone_id: id,
            }),
        );
    }

    public createCamera(configurationID: string, toCloneID?: string) {
        const body = toCloneID ? { clone_id: toCloneID } : {};

        return processPromise<{ id: string }, IProblemJson>(
            this.client.post(this.baseUrl + configurationID + '/camera/', body),
        );
    }

    public deleteCamera(configurationID: string, cameraID: string) {
        return processPromise<{ id: string }, IProblemJson>(
            this.client.delete(
                this.baseUrl + configurationID + '/camera/' + cameraID,
            ),
        );
    }

    public deleteConfiguration(configurationID: string) {
        return processPromise<{ id: string }, IProblemJson>(
            this.client.delete(this.baseUrl + configurationID),
        );
    }

    public getConfigurationCameras(configurationId: string) {
        // TODO: Improve this, we are getting the whole camera
        return new TypedPromise<DTOCamera[], IProblemJson>((ok, fail) => {
            this.getField(configurationId, 'cameras')
                .ok(res =>
                    ok(res.map((cfg: any) => ({ id: cfg.id, name: cfg.name }))),
                )
                .fail(e => fail(e));
        });
    }

    public exportConfiguration(configurationId: string) {
        return processPromise<string, IProblemJson>(
            this.client.get(this.baseUrl + configurationId + '/export', {}),
        );
    }
}
