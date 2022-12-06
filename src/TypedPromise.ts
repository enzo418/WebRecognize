
interface CatchCallback {
    upToIndex: number;
    callback: Function;
};

/**
 * Shared context between promises.
 *
 * @class PromiseContext
 * @typedef {PromiseContext}
 * @template OkType
 * @template FailType
 */
class PromiseContext<OkType, FailType> {
    public status: string = 'pending';

    public thenCallbacks: Function[] = [];

    // value returned from each call to `then`, but initially is the same as `value`
    // if resolved, else undefined.
    public thenValue : any;

    public catchCallback: CatchCallback[] = [];

    // value returned from each call to `catch`, initially after resolve/reject is undefined
    // its initialized in the first `catch` call.
    public thenError : any;

    public okCallback : Function = () => {};
    public value! : OkType;

    public failCallback : Function = () => {};
    public error! : FailType;

    public finallyCallback: Function = () => {};

    /**
     * Calls the function passed with all the parameters
     * expect to a `finally` call.
     *
     * @param {Function} func
     */
    public callAsFinally = (func:Function) => {
        // thenValue is undefined if rejected, else it's processed `value`
        // we might have an error produced by reject call (error) or an
        // error produced by a throw inside a `then` call.
        func.apply(null, [this.thenValue, this.error || this.thenError]);
    };

    /**
     * Register a catch callback for all the `then` registered.
     *
     * @param {Function} callback
     */
    public registerCatch = (callback: Function) => {
        /** it works since we only allow calls to catch
         * after a call to then, making each call to
         * this function to have a different this.thenCallbacks.length
        **/
        this.catchCallback.push({
            upToIndex: this.thenCallbacks.length - 1,
            callback,
        });
    };

    /**
     * Call the catch callback for a given `then` index.
     * Return the returned value from the call.
     *
     * @param {number} thenIndex
     * @param {*} error
     * @return {any}
     */
    public callCatchCallbackOrPropagate = (thenIndex:number, error:any): any => {
        if (this.catchCallback.length === 0) {
            throw error;
        }

        const i = thenIndex;
        const found = this.catchCallback.reduce((a, b) => {
            if (a.upToIndex <= i && b.upToIndex > i) return a;
            else return b;
        });

        if (found.upToIndex > i) {
            throw error;
        } else {
            return found.callback(error);
        }
    };
}

class NotCatchableTypedPromise<OkType, FailType> {
    protected context: PromiseContext<OkType, FailType>;

    constructor(context: PromiseContext<OkType, FailType>) {
        this.context = context;
    }

    /**
     * Fail is called only when the requests to the server responded with an error
     * status code.
     * This method isn't called if a `then` call throws.
     *
     * After fail is registered, no more `ok` or `then` are allowed.
     *
     * @public
     * @param {Function} callback
     */
    public fail(callback: (v:FailType) => any) : void {
        if (this.context.status === 'rejected') {
            callback(this.context.error);
        } else {
            this.context.failCallback = callback;
        }
    }

    /**
     * Then is called only after the return of ok.
     * If this throws, the registered `catch` function will catch it.
     *
     * @public
     * @param {Function} callback
     * @return {CatchableTypedPromise<OkType, FailType>}
     */
    public then(callback:Function) : CatchableTypedPromise<OkType, FailType> {
        if (this.context.status === 'resolved') {
            this.context.thenValue = callback(this.context.thenValue);
        } else {
            this.context.thenCallbacks.push(callback);
        }

        return new CatchableTypedPromise<OkType, FailType>(this.context);
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
     * @param {Function} callback
     * @return {NotCatchableTypedPromise<OkType, FailType>}
     */
    public finally(callback: (lastOkResult: any, lastError: any) => any)
    : NotCatchableTypedPromise<OkType, FailType> {
        if (this.context.status === 'resolved' || this.context.status === 'rejected') {
            this.context.callAsFinally(callback);
        } else {
            this.context.finallyCallback = callback;
        }

        return this;
    }
}

class CatchableTypedPromise<OkType, FailType> extends NotCatchableTypedPromise<OkType, FailType> {
    constructor(context: PromiseContext<OkType, FailType>) {
        super(context);
    }

    /**
     * Catch is called only when `then` or `ok` throws.
     *
     * @public
     * @param {Function} callback
     * @return {NotCatchableTypedPromise<OkType, FailType>}
     */
    public catch(callback: Function): NotCatchableTypedPromise<OkType, FailType> {
        if (this.context.status === 'rejected') {
            callback(this.context.error);
        } else {
            this.context.registerCatch(callback);
        }

        return new NotCatchableTypedPromise<OkType, FailType>(this.context);
    }
}

/**
 * This class represents a promise, used mainly to fullfill the need of a
 * typed reject from the current js Promise implementation.
 *
 * It defeers in Promise in two thing:
 * - Ok function
 * - Fail function
 *
 * Ok function is the equivalent to the first `then` in a normal Promise. The type
 * of the callback argument is `OkType`.
 *
 * Fail function is the equivalent to the first catch in a normal Promise. The callback
 * expects an argument of type `FailType`.
 *
 * You can think it as if Ok and Fail gives you access to the response, allowing you
 * to chain functions to modify it.
 *
 * It only allows catch afer `then` calls. And this will catch all the expections
 * thrown from the callbacks above it.
 *
 * @export
 * @class ServiceRequestPromise
 * @typedef {TypedPromise}
 * @template OkType
 * @template FailType
 * @implements {ISubscribableServiceRequest}
 */
export default class TypedPromise<OkType, FailType> {
    // internal members are stored in a separated class to
    // make it possible to only shows certains function,
    // following the State pattern
    private context: PromiseContext<OkType, FailType>;

    constructor(action: (
        okCallback: (val: OkType) => OkType | void,
        failCallback: (val: FailType) => any) => void) {
        this.context = new PromiseContext<OkType, FailType>();

        // if action throws it will propagate
        action(this.resolve.bind(this), this.reject.bind(this));
    }

    public ok(callback: (val: OkType) => OkType|void) : NotCatchableTypedPromise<OkType, FailType> {
        if (this.context.status === 'resolved') {
            try {
                this.context.value = callback(this.context.value) || this.context.value;
            } catch (error) {
                this.context.thenError = this.context.callCatchCallbackOrPropagate(0, error);
            }
        } else {
            this.context.okCallback = callback;
        }

        return new NotCatchableTypedPromise<OkType, FailType>(this.context);
    }

    private resolve(value: OkType) {
        this.context.status = 'resolved';
        this.context.value = value;
        this.context.thenValue = value;

        // call ok
        try {
            this.context.thenValue = this.context.okCallback(this.context.value);
        } catch (error) {
            this.context.thenError = this.context.callCatchCallbackOrPropagate(0, error);
            return; // skip then
        }

        // call all the "then"
        this.context.thenCallbacks.forEach((thenCallback, index) => {
            try {
                this.context.thenValue = thenCallback(this.context.thenValue);
            } catch (error) {
                this.context.thenError = this.context.callCatchCallbackOrPropagate(index, error);
            }
        });

        this.context.callAsFinally(this.context.finallyCallback);
    }

    private reject(value: FailType) {
        this.context.status = 'rejected';
        this.context.error = value;

        this.context.failCallback(this.context.error);

        this.context.callAsFinally(this.context.finallyCallback);
    }
};
