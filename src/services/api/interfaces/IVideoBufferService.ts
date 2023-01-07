import { Size } from '../../../Geometry';
import TypedPromise from '../../../TypedPromise';
import DTOVideoBuffer from './DTOVideoBuffer';
import IProblemJson from './IProblemJson';

export interface IVideoBufferService {
    getAvailable(
        cameraId: string,
    ): TypedPromise<DTOVideoBuffer[], IProblemJson>;

    createBuffer(data: {
        camera_id: string;
        duration: number;
        delay: number;
        resize: Size;
    }): TypedPromise<DTOVideoBuffer, IProblemJson>;

    deleteBuffer(id: string): TypedPromise<void, IProblemJson>;

    getStreamBufferUrl(id: string, type: 'diff' | 'raw'): string;
}
