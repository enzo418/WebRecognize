import IHttpClient from '../../Http/IHttpClient';
import config from '../../config';
import processPromise from '../../Http/ProcessPromise';
import DTOVideoBuffer from './interfaces/DTOVideoBuffer';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';
import {
    jsonParser,
    stringParser,
    WrapperWebSocket,
} from '../../modules/WebSocketWrapper';
import { Size } from '../../Geometry';

export class VideoBufferWebSocket extends WrapperWebSocket {
    constructor(id: string) {
        super(config.endpoints.websocket.videoBuffer + id);
    }

    onTaskCanceled(listener: (error: string) => any) {
        this.onMessage(
            'canceled',
            ev => listener(ev.data as string),
            stringParser,
        );
    }

    onDetectionFinished(listener: () => any) {
        this.onMessage('detection_finished', () => listener(), stringParser);
    }

    onBufferReady(listener: () => any) {
        this.onMessage('ready', () => listener(), stringParser);
    }

    onUpdated(listener: (videoBuffer: DTOVideoBuffer) => any) {
        this.onMessage(
            'updated',
            ev => listener(ev.data as DTOVideoBuffer),
            jsonParser,
        );
    }

    close() {
        super.close();
    }
}

export default class VideoBufferService extends Service {
    constructor(pHttpClient: IHttpClient) {
        super(pHttpClient, '/api/buffer/');
    }

    getAvailable(cameraId: string) {
        return processPromise<DTOVideoBuffer[], IProblemJson>(
            this.client.get(this.baseUrl, { camera_id: cameraId }),
        );
    }

    createBuffer(data: {
        camera_id: string;
        duration: number;
        delay: number;
        resize: Size;
    }) {
        return processPromise<DTOVideoBuffer, IProblemJson>(
            this.client.put(this.baseUrl, data),
        );
    }

    deleteBuffer(id: string) {
        return processPromise<void, IProblemJson>(
            this.client.delete(this.baseUrl + id, {}),
        );
    }
}
