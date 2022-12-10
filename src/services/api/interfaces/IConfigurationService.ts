import TypedPromise from '../../../TypedPromise';
import IProblemJson from './IProblemJson';

/* eslint-disable semi */
export default interface IConfigurationService {
    setField(
        id: string,
        data: { field: string; value: any },
    ): TypedPromise<any, IProblemJson>;
    getField(id: string, field: string): TypedPromise<any, IProblemJson>;
}
