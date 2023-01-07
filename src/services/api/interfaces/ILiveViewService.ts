import TypedPromise from '../../../TypedPromise';
import IProblemJson from './IProblemJson';

export default interface ILiveViewService {
    getCameraView(
        camera_id: string,
    ): TypedPromise<{ ws_feed_id: string }, IProblemJson>;

    getAllCamerasView(): TypedPromise<{ ws_feed_id: string }, IProblemJson>;
}
