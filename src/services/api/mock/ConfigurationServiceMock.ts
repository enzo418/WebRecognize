import IHttpClient from '../../../Http/IHttpClient';
import processPromise from '../../../Http/ProcessPromise';
import IProblemJson from '../interfaces/IProblemJson';
import Service from '../Service';

const getBlobFromObject = (body: object) => {
    return new Blob([JSON.stringify(body, null, 2)], {
        type: 'application/json',
    });
};

const getField = (path: string) => {
    const split = path.split('/');
    const field = split[split.length - 1];
    return field;
};

export default class ConfigurationServiceMock extends Service {
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/configuration/');
    }

    public getField(id: string, path: string) {
        const field = getField(path);
        if (field === 'name') {
            return processPromise<any, IProblemJson>(
                Promise.resolve(
                    new Response(
                        getBlobFromObject({
                            value: 'got this value from mock!',
                        }),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    ),
                ),
            );
        } else {
            return processPromise<any, IProblemJson>(
                Promise.resolve(
                    new Response(getBlobFromObject({}), {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }),
                ),
            );
        }
    }

    public setField(id: string, data: { field: string; value: any }) {
        const field = getField(data.field);

        let promise;

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

            promise = Promise.resolve(
                new Response(getBlobFromObject(problem), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/problem+json',
                    },
                }),
            );
        } else {
            promise = Promise.resolve(
                new Response(getBlobFromObject({}), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
            );
        }

        return processPromise<any, IProblemJson>(promise);
    }
}
