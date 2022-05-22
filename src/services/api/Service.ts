import IHttpClient from '../../Http/IHttpClient';
import TypedPromise from '../../TypedPromise';
import IProblemJson from './interfaces/IProblemJson';

export default class Service {
    protected client: IHttpClient;
    protected baseUrl: string;

    constructor(httpClient: IHttpClient, baseURL: string) {
        this.client = httpClient;
        this.baseUrl = baseURL;
    }

    /**
     * Handles the first interaction with a promise from the backend response.
     *
     * It tries to be a failsafe middleware to get the status and body of the
     * response, in wich if the status is not in the range of 200 - 299 it
     * returns a Promise.reject with the response body.
     *
     * As defined in the backend, this body might contain a title, status
     * and traceId.
     *
     * @protected
     * @template T
     * @param {Promise<Response>} promise
     * @return {Promise<T>}
     */
    protected processPromise<T, Problem extends IProblemJson>(
        promise:Promise<Response>,
    ) : TypedPromise<T, Problem> {
        return new TypedPromise<T, Problem>((ok, fail) => {
            promise
                .then(async (r) => ({
                    status: r.status,
                    headers: r.headers,
                    ok: r.ok, // r oks if status is in [200-299]
                    body: await r.text(),
                }))
                .then((r) => {
                    if (!r.ok) {
                        let rejectedJSON:any = {status: -1};

                        if (r.headers.has('Content-Type') &&
                            r.headers.get('Content-Type') == 'application/problem+json') {
                            try {
                                rejectedJSON = JSON.parse(r.body);
                            } catch (e) {
                                console.warn('Error parsing json on failed response', e);
                            }
                        } else {
                            console.warn('Api server is misbehaving!' +
                            'didn\'t respond with a problem+json');
                        }

                        fail(rejectedJSON);
                    } else {
                        let json:any = {};

                        try {
                            json = JSON.parse(r.body);
                        } catch (e) {
                            console.warn('Error parsing json on sucessfull response', e);
                        }

                        return ok(json);
                    }
                });
        });
    }
}
