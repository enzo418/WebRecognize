import Camera from '../../../domain/Camera';
import TypedPromise from '../../../TypedPromise';
import DTOCamera, { DTOCameraDefaults } from './DTOCamera';
import IProblemJson from './IProblemJson';

export default abstract class ICameraService {
    abstract get(id: string): TypedPromise<DTOCamera, IProblemJson>;

    abstract getDefaults(
        camera_id: string,
    ): TypedPromise<DTOCameraDefaults, IProblemJson>;

    abstract getFrame(
        camera_id: string,
        format: string,
    ): TypedPromise<Blob, IProblemJson>;
}
