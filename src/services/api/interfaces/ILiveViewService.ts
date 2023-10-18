import TypedPromise from '../../../TypedPromise';
import { BrowserCapabilities } from '../../BrowserCapabilities/BrowserCapabilities';
import IProblemJson from './IProblemJson';

export enum LiveViewType {
    CAMERA = 'camera',
    OBSERVER = 'observer',
    SOURCE = 'uri',
}

export enum LiveViewStreamSource {
    WEBRTC = 'webrtc',
    MJPEGSTREAM = 'mjpeg',
    JPEGCacheBusting = 'jpeg_cache_busting',
}

export interface ILiveViewResponse {
    type: LiveViewStreamSource;

    [x: string]: any; // Defined by the server
}

export default interface ILiveViewService {
    getCameraView(
        camera_id: string,
        capabilities: BrowserCapabilities,
    ): TypedPromise<ILiveViewResponse, IProblemJson>;

    getSourceView(
        source: string,
        capabilities: BrowserCapabilities,
    ): TypedPromise<ILiveViewResponse, IProblemJson>;

    getObserverView(
        capabilities: BrowserCapabilities,
    ): TypedPromise<ILiveViewResponse, IProblemJson>;

    answer(
        client_id: string,
        answer: string | object,
    ): TypedPromise<void, IProblemJson>;

    hangUp(client_id: string): TypedPromise<void, IProblemJson>;
}
