import TypedPromise from '../../../TypedPromise';
import DTOCamera from './DTOCamera';
import DTOConfigurationDetails from './DTOConfigurationDetails';
import IProblemJson from './IProblemJson';

/* eslint-disable semi */
export default interface IConfigurationService {
    setField(
        id: string,
        data: { field: string; value: any },
    ): TypedPromise<any, IProblemJson>;
    getField(id: string, field: string): TypedPromise<any, IProblemJson>;

    getAvailable(): TypedPromise<DTOConfigurationDetails[], IProblemJson>;

    // Creates
    create(configuration?: object): TypedPromise<{ id: string }, IProblemJson>;

    clone(id: string): TypedPromise<{ id: string }, IProblemJson>;

    createCamera(
        configurationID: string,
        toCloneID?: string,
    ): TypedPromise<{ id: string }, IProblemJson>;

    deleteCamera(
        configurationID: string,
        cameraID: string,
    ): TypedPromise<{ id: string }, IProblemJson>;

    deleteConfiguration(
        configurationID: string,
    ): TypedPromise<{ id: string }, IProblemJson>;

    getConfigurationCameras(
        configurationId: string,
    ): TypedPromise<DTOCamera[], IProblemJson>;
}
