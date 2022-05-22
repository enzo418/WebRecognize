import ConfigurationHandler from '../../handlers/ConfigurationHandler';
import IHttpClient from '../../Http/IHttpClient';
import ConfigurationService from '../../services/api/ConfigurationService';
import IProblemJson from '../../services/api/interfaces/IProblemJson';

const getBlobFromObject = (body:object) =>{
    return new Blob([JSON.stringify(body, null, 2)], {type: 'application/json'});
};

class MockHttp extends IHttpClient {
    private response: () => Promise<Response>;

    constructor(mockResponseCallback: () => Promise<Response>) {
        super();
        this.response = mockResponseCallback;
    }

    public post(path:string, body: object, init:RequestInit = {}) : Promise<Response> {
        return this.response();
    }

    public get(
        path:string, parameters: object = {}, init:RequestInit = {}) : Promise<Response> {
        return this.response();
    }

    public put(
        path: string,
        body: object = {},
        query: object = {},
        init: RequestInit = {},
    ): Promise<Response> {
        return this.response();
    }
}

describe('Configuration service tree call', () => {
    it('Should register a field and callback on successful update', (done) => {
        /** **/
        const client = new MockHttp(() => {
            return Promise.resolve(new Response(
                getBlobFromObject({}), {status: 200},
            ));
        });

        const service = new ConfigurationService(client);
        const config = new ConfigurationHandler(service, '0');

        const section = config.createSectionHandler('section1');
        const field = section.createFieldHandler('field1');

        field.subscribeToUpdateResponse((isOk:boolean, message:string) => {
            expect(isOk).toBe(true);
            done();
        });

        const spySectionUpdate = jest.spyOn(section, 'update');
        const spyConfigUpdate = jest.spyOn(config, 'update');

        const newValue1 = 'stringvaluetest';
        const newValue2 = [{x: 23, y: 42}, {x: 33, y: 418}];

        /** **/
        field.update(newValue1);
        field.update(newValue2);

        /** **/
        expect(spyConfigUpdate).toHaveBeenCalledTimes(2);
        expect(spyConfigUpdate).toHaveBeenNthCalledWith(
            1,
            'section1/field1',
            expect.objectContaining({ value: newValue1 }),
        );
        expect(spyConfigUpdate).toHaveBeenNthCalledWith(
            2,
            'section1/field1',
            expect.objectContaining({ value: newValue2 }),
        );

        expect(spySectionUpdate).toHaveBeenCalledTimes(2);
        expect(spySectionUpdate).toHaveBeenNthCalledWith(
            1,
            'field1',
            expect.objectContaining({value: newValue1}),
        );
        expect(spySectionUpdate).toHaveBeenNthCalledWith(
            2,
            'field1',
            expect.objectContaining({value: newValue2}),
        );
    });

    it('Should register a field and callback on failed update', (done) => {
        const client = new MockHttp(() => {
            // have in mind that fetch only rejects on network failure or
            // if anything prevented the request from completing
            // so we might need to make 2 separated tests

            // On a server inability to respond as we wanted,
            // it should respond with a problem+json type.
            const promblem:IProblemJson = {
                status: 400,
                title: 'invalid field',
                invalidParams: {
                    field1: {
                        code: 'TYPE_REQUIRED',
                        reason: 'This field is required',
                    },
                },
            };

            return Promise.resolve(new Response(
                getBlobFromObject(promblem), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/problem+json',
                    },
                },
            ));
        });

        const service = new ConfigurationService(client);
        const config = new ConfigurationHandler(service, '0');

        const section = config.createSectionHandler('section1');
        const field = section.createFieldHandler('field1');

        field.subscribeToUpdateResponse((isOk:boolean, message:string) => {
            expect(isOk).toBe(false);
            expect(message).toBe('This field is required');
            done();
        });

        const newValue2 = [{x: 23, y: 42}, {x: 33, y: 418}];

        /** **/
        field.update(newValue2);

        /** **/
        // no more tests other than the stated in update
    });
});
