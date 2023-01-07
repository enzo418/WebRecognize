import IHttpClient from '../../../Http/IHttpClient';
import processPromise from '../../../Http/ProcessPromise';
import CachedConfiguration from '../../../modules/CachedConfiguration';
import TypedPromise from '../../../TypedPromise';
import { random, randomString } from '../../../utils/random';
import DTOCamera from '../interfaces/DTOCamera';
import DTOConfigurationDetails from '../interfaces/DTOConfigurationDetails';
import IConfigurationService from '../interfaces/IConfigurationService';
import IProblemJson from '../interfaces/IProblemJson';
import Service from '../Service';
import { configurations } from './mockData';

const getField = (path: string) => {
    const split = path.split('/');
    const field = split[split.length - 1];
    return field;
};

export default class ConfigurationServiceMock
    extends Service
    implements IConfigurationService
{
    cachedCfg: CachedConfiguration;

    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/configuration/');

        this.cachedCfg = new CachedConfiguration(configurations[0]);
    }

    public getField(id: string, path: string) {
        if (id != configurations[0].id) {
            const config = configurations.find(c => c.id == id);
            this.cachedCfg = new CachedConfiguration(config);
        }

        return new TypedPromise<any, IProblemJson>((ok, fail) => {
            setTimeout(() => {
                ok(this.cachedCfg.get(path));
            }, random(100, 800));
        });
    }

    public setField(id: string, data: { field: string; value: any }) {
        return new TypedPromise<any, IProblemJson>((ok, fail) => {
            const field = getField(data.field);

            if (field == 'url' && data.value.indexOf('418') !== 0) {
                // only sim error on name field
                const problem: IProblemJson = {
                    status: 400,
                    title: 'invalid field',
                    invalidParams: {
                        url: {
                            code: 'TYPE_INVALID',
                            reason: "The field value is invalid, it must start with '418'",
                        },
                    },
                };
                fail(problem);
            } else {
                setTimeout(() => {
                    this.cachedCfg.update(data.field, data.value);
                    ok(true);
                }, random(100, 800));
            }
        });
    }

    public getAvailable() {
        return new TypedPromise<DTOConfigurationDetails[], IProblemJson>(
            (ok, fail) => {
                ok(configurations.map(c => ({ id: c.id, name: c.name })));
            },
        );
    }

    // Creates
    public create(configuration?: object) {
        return new TypedPromise<{ id: string }, IProblemJson>((ok, fail) => {
            const copy = configuration
                ? configuration
                : JSON.parse(JSON.stringify(configurations[0]));
            copy.id = randomString(18);
            copy.name = 'new cfg';
            configurations.push(copy);
            ok({ id: copy.id });
        });
    }

    public clone(id: string) {
        return this.create();
    }

    public createCamera(configurationID: string, toCloneID?: string) {
        const config = configurations.find(c => c.id == toCloneID);

        if (!config) throw 'cfg not found';

        const cloneID = toCloneID ? toCloneID : Object.keys(config.cameras)[0];

        const copy = JSON.parse(
            JSON.stringify((config.cameras as any)[cloneID]),
        );

        if (!toCloneID) {
            copy.url = '';
            copy.name = 'new camera';
        }

        let newID = randomString(19);

        (config.cameras as any)['' + newID] = copy;

        return new TypedPromise<{ id: string }, IProblemJson>((ok, fail) => {
            ok({ id: newID });
        });
    }

    public deleteCamera(configurationID: string, cameraID: string) {
        const config = configurations.find(c => c.id == configurationID);

        if (!config) throw 'cfg not found';

        delete (config.cameras as any)[cameraID];

        return new TypedPromise<{ id: string }, IProblemJson>((ok, fail) => {
            ok({ id: cameraID });
        });
    }

    public deleteConfiguration(configurationID: string) {
        return new TypedPromise<{ id: string }, IProblemJson>((ok, fail) => {
            ok({ id: configurationID });
        });
    }

    public getConfigurationCameras(configurationId: string) {
        const config = configurations.find(c => c.id == configurationId);

        if (!config) throw 'cfg not found';

        return new TypedPromise<DTOCamera[], IProblemJson>((ok, fail) => {
            ok(
                Object.keys(config.cameras).map(k => ({
                    id: k,
                    ...(config.cameras as any)[k],
                })),
            );
        });
    }
}
