import Camera from '../../../domain/Camera';
import TypedPromise from '../../../TypedPromise';
import IProblemJson from './IProblemJson';

export default abstract class ICameraService {
    abstract get(id: string): TypedPromise<Camera, IProblemJson>;
}
