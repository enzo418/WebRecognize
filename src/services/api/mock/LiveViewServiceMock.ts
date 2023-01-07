import config from '../../../config';
import IHttpClient from '../../../Http/IHttpClient';
import processPromise, {
    processPromiseAsArrayBuffer,
} from '../../../Http/ProcessPromise';
import TypedPromise from '../../../TypedPromise';
import ILiveViewService from '../interfaces/ILiveViewService';
import IProblemJson from '../interfaces/IProblemJson';
import Service from '../Service';
import { cameraToImageUrl } from './mockData';

export default class LiveViewServiceMock
    extends Service
    implements ILiveViewService
{
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api');

        // override live view socket
        window.WebSocket = new Proxy(window.WebSocket, {
            construct(
                target,
                argArray: [string, string | undefined],
                newTarget,
            ) {
                if (argArray[0].includes(config.endpoints.websocket.liveView)) {
                    let ws!: any;
                    try {
                        ws = new WebSocketLiveView(argArray[0]);
                    } catch (error) {}

                    return ws;
                } else {
                    return new target(...argArray);
                }
            },
        });
    }

    public getCameraView(camera_id: string) {
        return new TypedPromise<{ ws_feed_id: string }, IProblemJson>(
            (ok, fail) => {
                ok({ ws_feed_id: camera_id });
            },
        );
    }

    public getAllCamerasView() {
        return new TypedPromise<{ ws_feed_id: string }, IProblemJson>(
            (ok, fail) => {
                ok({ ws_feed_id: 'all' });
            },
        );
    }
}

class WebSocketLiveView {
    onMessage!: (ev: MessageEvent<any>) => any;
    url: string;
    feed_id: string;
    image: ArrayBuffer | null;

    constructor(url: string) {
        this.url = url;
        this.image = null;
        this.feed_id = url.substring(url.lastIndexOf('/') + 1);
    }

    async addEventListener<K extends keyof WebSocketEventMap>(
        type: K,
        listener: (ev: WebSocketEventMap[K]) => any,
        options?: any,
    ) {
        if (type == 'message') {
            this.onMessage = listener as any;

            if (!this.image) {
                // i could event handle several cameras from the url
                const { buffer } = await processPromiseAsArrayBuffer(
                    fetch((cameraToImageUrl as any)[this.feed_id]),
                );

                this.image = buffer;

                this.onMessage({
                    data: this.image,
                } as MessageEvent<any>);
            }
        }
    }

    send() {}

    close() {}
}
