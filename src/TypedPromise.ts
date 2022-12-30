/**
 * Shared context between promises.
 *
 * @class PromiseContext
 * @typedef {PromiseContext}
 * @template OkType
 * @template FailType
 */
class PromiseContext<OkType, FailType> {
    public status: 'pending' | 'resolved' | 'rejected' | 'cancelled' =
        'pending';

    // value returned from each call to `then`, but initially is the same as `value`
    // if resolved, else undefined.
    public thenValue: any;

    public catchCallback: Function | null = null;

    // value returned from each call to `catch`, initially after resolve/reject is undefined
    // its initialized in the first `catch` call.
    public thenError: any;

    public okCallback: Function = () => {};
    public value!: OkType;

    public failCallback: Function = () => {};
    public error!: FailType;

    public finallyCallback: Function = () => {};

    public cancelledCallback: Function | null = null;

    public isAwaited: boolean = false;

    /**
     * Calls the function passed with all the parameters
     * expect to a `finally` call.
     *
     * @param {Function} func
     */
    public callAsFinally = (func: Function) => {
        // thenValue is undefined if rejected, else it's processed `value`
        // we might have an error produced by reject call (error) or an
        // error produced by a throw inside a `then` call.
        func.apply(null, [this.thenValue, this.error || this.thenError]);
    };

    /**
     * Call the catch callback, throws if not found, else returns the
     * value returned from the catch
     *
     * @param {*} error
     * @return {any}
     */
    public callCatchCallbackOrPropagate = (error: any): any => {
        if (!this.catchCallback) {
            throw error;
        }

        return this.catchCallback(error);
    };
}

interface TPHasOk<OkType, FailType> {
    /**
     *
     * @param callback callback on success
     * @param rejected callback on fail. Is preferred to use a following call to catch.
     * This argument is needed enable await support.
     */
    ok(
        callback: (val: OkType) => OkType | void,
        rejected?: (error: FailType) => any,
    ): any;
}

interface TPHasCancel {
    /**
     * Sets the promise as cancelled, when it resolves cancelled will be called
     */
    cancel(): any;
}

interface TPHasFail<FailType> {
    /**
     * Fail is called only when the promise is rejected.
     * This method isn't called if `ok` or `finally` throws.
     *
     * @param {(v: FailType) => any} callback
     */
    fail(callback: (v: FailType) => any): any;
}

interface TPHasFinally {
    /**
     * If succeed, finally is called after the last catch/then, ok if there are no then registered.
     * If failed it's called after fail.
     *
     * Callback it's expected to have 2 parameters.
     *
     * - The first is the same as `ok` if the promise was resolved, if there are `then` callbacks
     *   it would be the same as the last value returned from those calls. Else if the promise was
     *   rejected it's undefined.
     *
     * - The second parameter is the error returned by the last catch call to `catch` if the promise
     *   was resolved and a throw happened, else if the promise was rejected, is the same as the
     *   value passed to `fail`.
     *
     * @public
     * @param {(lastOkResult: any, lastError: any) => any} callback
     */
    finally(callback: (lastOkResult: any, lastError: any) => any): any;
}

interface TPHasCancelled {
    /**
     * Sets a listener to cancelled
     * @param callback
     */
    cancelled(callback: () => any): any;
}

interface TPHasCatch {
    /**
     * Catch will be called if `then` or `ok` throws.
     *
     * @public
     * @param {Function} callback
     */
    catch(callback: Function): any;
}

type TPHasAll<OkType, FailType> = TPHasOk<OkType, FailType> &
    TPHasCancel &
    TPHasFail<FailType> &
    TPHasFinally &
    TPHasCancelled &
    TPHasCatch;

// Constructs a type with a set of function properties that eliminate themselves if called
type RecursiveReduce<T> = {
    [P in keyof T]: T[P] extends (...args: infer A) => any
        ? (...args: A) => RecursiveReduce<Omit<T, P>>
        : never;
}; // pg: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgBJwM4FkJgBYD2AJgILIDeAUMjQPQBU91N9yCBAthxOMgSGkw58xEgDo4zZPVrM4ACgCUALmQA3AsCIBuSgF9KlUJFiIU6bLkJEAQhSkMmNaW07de-QZZG2xAIykZZj95NTgAG1UQAFcOP2gVdU0dfUNjaHgkL2FrAGF7OkZA1y4eMD4BCxziXLEEQNkaBCVVDS1dA0owAE8AB3NMEht8gF5sq1FkADJxnzsZqomiXN0jcAyzZABpAB4AJQA+AuQFRIB5DmAwfYAaZAByOHuD1ZoQ88vrvbv7v2fXtgtZAXK63B4If6pSi0WjsEAYcpgZQABTgUDg3BMGB2uxicWgBwA2o97gBdF6GLp9FAAFWROxpRzGVBohORyFAyAA1hBugQYMgaaTVDS2aTkBAAB6QEBEDDIeRiJVogDmGFUoBg0GQJEUyBGRzgIG6yAA-AqlRIoGrVLr9Uc6TsQdcaXdkQcjlEIGpoB1DAhwph5QANHYASRAV2AESOLOQjmK7FKHgEwYkDTkQMdzvDkbA0fCPyeHuONCguGiUAE+GA8swyGiIC5IAIAHcBPXs59c1GIkXnhSaJ1Ck4WCV3OVPGmAs4gm9QhEorF4lBEl3QRHe4WHn8S3GyxWq8ga3X5Y3m22O-L19dN-m+zuB7oh4YR4m3GUKsg0-VZ41AWu9I5neBY-BCe5SMg5ZgJW1Z4LWJxnk2LbtohgpAd2IEPvc4GDsgBidHCCLIJK+rICAECtt+OwWEMuQHEoqyShISj+EohgwiRLGKIYPT9Dq4ThGRiw+GQCxCEs8yzHkqxUvxJCCQAMhAGAYKMwLdgp248nyAoiXkFJySgWnKapZBjDmWl3Dp-LSaIhlrCYmS0hK0o8HKAnhKZGBkFQUJEYiyg0mRVAIKoMCNgg+b8ECbREPY+BQG25GUcgACiUBJVA8gAEQAGKRdFAgtuUwAcL04QQBOEBEGIOWKB0NyUH44WFcAMWJHFCV4ElVEUVRGVZblBUgFF7XFQQpXlZV1W1fVfp6EAA

class BaseTypedPromise<OkType, FailType, InitialCallable> {
    // internal members are stored in a separated class to
    // make it possible to only shows certain function,
    // following the State pattern
    protected context: PromiseContext<OkType, FailType>;

    constructor(context: PromiseContext<OkType, FailType>) {
        this.context = context;
    }

    /**
     * Function to call on resolved
     * @param callback callback on success
     * @param rejected callback on fail. Is preferred to use a following call to catch.
     * This argument is needed enable await support.
     */
    ok(
        callback: (val: OkType) => OkType | void,
    ): RecursiveReduce<Omit<InitialCallable, keyof TPHasOk<OkType, FailType>>> {
        if (this.context.status === 'resolved') {
            try {
                this.context.value =
                    callback(this.context.value) || this.context.value;
            } catch (error) {
                this.context.thenError =
                    this.context.callCatchCallbackOrPropagate(error);
            }
        } else {
            this.context.okCallback = callback;
        }

        return this as RecursiveReduce<
            Omit<InitialCallable, keyof TPHasOk<OkType, FailType>>
        >;
    }

    /**
     * Fail is called only when the promise is rejected.
     * This method isn't called if `ok` or `finally` throws.
     *
     * @public
     * @param {(v: FailType) => any} callback
     */
    fail(
        callback: (v: FailType) => any,
    ): RecursiveReduce<Omit<InitialCallable, keyof TPHasFail<FailType>>> {
        if (this.context.status === 'rejected') {
            callback(this.context.error);
        } else {
            this.context.failCallback = callback;
        }

        return this as RecursiveReduce<
            Omit<InitialCallable, keyof TPHasFail<FailType>>
        >;
    }

    /**
     * Catch will be called if `then` or `ok` throws.
     *
     * @public
     * @param {Function} callback
     */
    catch(
        callback: Function,
    ): RecursiveReduce<Omit<InitialCallable, keyof TPHasCatch>> {
        if (this.context.status === 'rejected') {
            callback(this.context.error);
        } else {
            this.context.catchCallback = callback;
        }

        return this as RecursiveReduce<Omit<InitialCallable, keyof TPHasCatch>>;
    }

    /**
     * Sets a listener to cancelled
     *
     * @public
     * @param callback
     */
    cancelled(
        callback: () => any,
    ): RecursiveReduce<Omit<InitialCallable, keyof TPHasCancelled>> {
        if (this.context.status === 'cancelled') {
            callback();
        } else {
            this.context.cancelledCallback = callback;
        }

        return this as RecursiveReduce<
            Omit<InitialCallable, keyof TPHasCancelled>
        >;
    }

    /**
     * If succeed, finally is called after the last catch/then, ok if there are no then registered.
     * If failed it's called after fail.
     *
     * Callback it's expected to have 2 parameters.
     *
     * - The first is the same as `ok` if the promise was resolved, if there are `then` callbacks
     *   it would be the same as the last value returned from those calls. Else if the promise was
     *   rejected it's undefined.
     *
     * - The second parameter is the error returned by the last catch call to `catch` if the promise
     *   was resolved and a throw happened, else if the promise was rejected, is the same as the
     *   value passed to `fail`.
     *
     * @public
     * @param {(lastOkResult: any, lastError: any) => any} callback
     */
    finally(
        callback: (lastOkResult: any, lastError: any) => any,
    ): RecursiveReduce<Omit<InitialCallable, keyof TPHasFinally>> {
        if (
            this.context.status === 'resolved' ||
            this.context.status === 'rejected'
        ) {
            this.context.callAsFinally(callback);
        } else {
            this.context.finallyCallback = callback;
        }
        return this as RecursiveReduce<
            Omit<InitialCallable, keyof TPHasFinally>
        >;
    }

    /**
     * Sets the promise as cancelled, when it resolves cancelled will be called
     */
    cancel() {
        this.context.status = 'cancelled';
    }
}

/**
 * This class represents a promise, used mainly to fullfil the need of a
 * typed reject from the current js Promise implementation.
 *
 * It defers in Promise in two thing:
 * - Ok function
 * - Fail function
 * - Doesn't allow chained then/catch, it breaks the types.
 *
 * Ok function is the equivalent to the first `then` in a normal Promise. The type
 * of the callback argument is `OkType`.
 *
 * Fail function is the equivalent to the first catch in a normal Promise. The callback
 * expects an argument of type `FailType`.
 *
 * An additional catch function is provided to catch exceptions thrown in the `ok` listener.
 *
 * If the promise is cancelled it doesn't care if it was resolved or rejected, it will call
 * to `cancelled` once it was resolved/rejected. But, if it's used with await it will throw
 * {cancelled: true} so you can catch it in a try{}catch{}, there is an example in the tests.
 *
 * @export
 * @class ServiceRequestPromise
 * @typedef {TypedPromise}
 * @template OkType
 * @template FailType
 */
export default class TypedPromise<OkType, FailType> extends BaseTypedPromise<
    OkType,
    FailType,
    TPHasAll<OkType, FailType>
> {
    constructor(
        action: (
            okCallback: (val: OkType) => OkType | void,
            failCallback: (val: FailType) => any,
        ) => void,
    ) {
        super(new PromiseContext<OkType, FailType>());

        // if action throws it will propagate
        action(this.resolve.bind(this), this.reject.bind(this));
    }

    /**
     * Function added to support await
     * @param callback on success. Await registers its "success" callback here.
     * @param rejected on error. Await registers its "catch" callback here that
     * it converts into an error catchable by a try{}catch{}.
     * @returns
     */
    protected then(
        callback: (val: OkType) => OkType | void,
        rejected?: (error: FailType) => any,
    ): void {
        this.context.isAwaited = true;

        if (this.context.status === 'resolved') {
            try {
                this.context.value =
                    callback(this.context.value) || this.context.value;
            } catch (error) {
                this.context.thenError =
                    this.context.callCatchCallbackOrPropagate(error);
            }
        } else {
            this.context.okCallback = callback;
        }

        if (rejected) this.context.failCallback = rejected;
    }

    private resolve(value: OkType) {
        // if it was cancelled
        if (this.context.status === 'cancelled') {
            if (this.context.cancelledCallback)
                this.context.cancelledCallback();

            // await subscribed to fail through then(ok, fail)
            if (this.context.isAwaited)
                this.context.failCallback({ cancelled: true });
            return;
        }

        this.context.status = 'resolved';
        this.context.value = value;
        this.context.thenValue = value;

        // call ok
        try {
            this.context.thenValue =
                this.context.okCallback(this.context.value) || value;
        } catch (error) {
            this.context.thenError =
                this.context.callCatchCallbackOrPropagate(error);
        }

        this.context.callAsFinally(this.context.finallyCallback);
    }

    private reject(value: FailType) {
        // if it was cancelled
        if (this.context.status === 'cancelled') {
            if (this.context.cancelledCallback)
                this.context.cancelledCallback();

            // await subscribed to fail through then(ok, fail)
            if (this.context.isAwaited)
                this.context.failCallback({ cancelled: true });
            return;
        }

        this.context.status = 'rejected';
        this.context.error = value;

        if (this.context.failCallback) {
            this.context.failCallback(this.context.error);
        } else throw this.context.error;

        this.context.callAsFinally(this.context.finallyCallback);
    }
}
