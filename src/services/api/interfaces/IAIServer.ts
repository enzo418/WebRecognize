import TypedPromise from '../../../TypedPromise';
import { DTOAIServer } from './DTOAIServer';
import IProblemJson from './IProblemJson';

export default abstract class IAIServer {
    abstract findAnyService(): TypedPromise<DTOAIServer, IProblemJson>;
}
