import TypedPromise from '../../../TypedPromise';
import IProblemJson from './IProblemJson';

export enum LiveViewType {
    CAMERA = 'camera',
    OBSERVER = 'observer',
    SOURCE = 'uri',
}

export default interface ILiveViewService {
    getCameraView(
        camera_id: string,
    ): TypedPromise<{ ws_feed_id: string }, IProblemJson>;

    getAllCamerasView(): TypedPromise<{ ws_feed_id: string }, IProblemJson>;

    call(
        type: LiveViewType,
        data: string | undefined | null,
    ): TypedPromise<{ clientId: string; offer: string }, IProblemJson>;

    answer(
        client_id: string,
        answer: string | object,
    ): TypedPromise<void, IProblemJson>;

    hangUp(client_id: string): TypedPromise<void, IProblemJson>;
}
