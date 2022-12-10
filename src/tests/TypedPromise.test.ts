/* eslint-disable no-throw-literal */
import TypedPromise from '../TypedPromise';

describe('Typed promise general tests', () => {
    it('should call ok', () => {
        //
        const promise = new TypedPromise<string, number>((ok, fail) => ok('a'));

        const callbackok = jest.fn();

        //
        promise.ok(callbackok);

        //
        expect(callbackok).toHaveBeenCalledTimes(1);
        expect(callbackok).toHaveBeenCalledWith('a');
    });

    it('should call ok with timeout', done => {
        //
        const promise = new TypedPromise<string, number>(function (ok, fail) {
            setTimeout(() => ok('a'), 100);
        });

        //
        expect.assertions(2);

        promise.ok(v => {
            expect(v).toBe('a');
            expect(typeof v).toBe('string');

            // finish test
            done();
        });
    });

    it('should call fail', () => {
        //
        const promise = new TypedPromise<string, { title: string }>(
            (ok, fail) => fail({ title: 'invalid name' }),
        );

        const callbackfail = jest.fn();

        //
        promise.ok(() => {}).fail(callbackfail);

        //
        expect(callbackfail).toHaveBeenCalledTimes(1);
        expect(callbackfail).toHaveBeenCalledWith({ title: 'invalid name' });
    });

    it('should call ok, then chain and catch', done => {
        //
        const N = 100;
        const numbers: number[] = Array.from(new Array(N), (_, i) => i); // 0 - N

        const promise = new TypedPromise<number[], any>((ok, fail) =>
            setTimeout(() => ok(numbers), 500),
        );

        // return pair numbers
        const callbackOk = (okNumbers: number[]) => {
            expect(okNumbers).toHaveLength(N);

            return okNumbers.filter(v => v % 2 == 0);
        };

        // leave only a 2
        const callbackThen1 = (pairs: number[]) => {
            expect(pairs).toHaveLength(N / 2);

            return pairs.filter(v => v == 2)[0];
        };

        // throw
        const callbackThen2 = (two: number) => {
            expect(two).toBe(2);

            // eslint-disable-next-line no-throw-literal
            throw 33;
        };

        const callbackCatch = jest.fn(e => {
            expect(e).toBe(33);
            done();
        });

        // action
        promise
            .ok(callbackOk)
            .then(callbackThen1)
            .then(callbackThen2)
            .catch(callbackCatch);
    });

    it('should call first catch if ok fails', done => {
        const promise = new TypedPromise<number, any>((ok, fail) =>
            setTimeout(() => ok(1), 500),
        );

        promise
            .ok(v => {
                throw 44;
            })
            .then((v: any) => v)
            .catch((e: any) => {
                expect(e).toBe(44);

                done();
            });
    });

    it('should catch an expection at some level and then call finally', done => {
        const promise = new TypedPromise<number, any>((ok, fail) =>
            setTimeout(() => ok(418), 500),
        );

        promise
            .ok(v => v)
            .then((v: any) => v)
            .catch((e: any) => expect(1).toBe(0)) // never
            .then((v: any) => {
                expect(v).toBe(418);

                throw 'test';
            })
            .catch((e: any) => {
                expect(e).toBe('test');

                return 'catched';
            })
            .finally((lastOk: any, lastError: any) => {
                expect(lastOk).toBe(418);
                expect(lastError).toBe('catched');

                done();
            });
    });

    it('should call finally with the rejected value', done => {
        const promise = new TypedPromise<any, number>((ok, fail) =>
            setTimeout(() => fail(418), 500),
        );

        promise
            .ok(v => v)
            .finally((lastOk: any, lastError: any) => {
                expect(typeof lastOk).toBe('undefined');
                expect(lastError).toBe(418);

                done();
            })
            .fail(e => {
                expect(e).toBe(418);
            });
    });
});
