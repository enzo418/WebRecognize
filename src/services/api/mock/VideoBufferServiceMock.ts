import { toast } from 'react-toastify';
import { Size } from '../../../Geometry';
import IHttpClient from '../../../Http/IHttpClient';
import processPromise from '../../../Http/ProcessPromise';
import TypedPromise from '../../../TypedPromise';
import DTOVideoBuffer from '../interfaces/DTOVideoBuffer';
import IProblemJson from '../interfaces/IProblemJson';
import { IVideoBufferService } from '../interfaces/IVideoBufferService';
import Service from '../Service';
import { mapVBIDtoFile, videoBufferDTOs } from './mockData';

let buffers: DTOVideoBuffer[] = [];

export default class VideoBufferServiceMock
    extends Service
    implements IVideoBufferService
{
    constructor(pHttpClient: IHttpClient) {
        super(pHttpClient, '/api/buffer/');

        window.WebSocket = new Proxy(window.WebSocket, {
            construct(
                target,
                argArray: [string, string | undefined],
                newTarget,
            ) {
                const match = argArray[0].match(/\/buffer\/(?<id>\d+)/);

                if (match !== null && match.groups) {
                    let ws!: any;
                    try {
                        ws = new WebSocketBuffer(argArray[0], match.groups.id);
                    } catch (error) {}

                    return ws;
                } else {
                    return new target(...argArray);
                }
            },
        });
    }

    getAvailable(cameraId: string) {
        return new TypedPromise<DTOVideoBuffer[], IProblemJson>(
            async (ok, _) => {
                if (buffers === undefined || buffers.length == 0) {
                    if (typeof videoBufferDTOs === 'string') {
                        buffers = await processPromise<
                            DTOVideoBuffer[],
                            IProblemJson
                        >(fetch(videoBufferDTOs));

                        if (typeof buffers === 'string') {
                            console.warn('bad video buffer url');

                            buffers = [];
                        }
                    } else {
                        buffers = videoBufferDTOs;
                    }
                }

                ok(buffers.filter(b => b.camera_id == cameraId));
            },
        );
    }

    createBuffer(data: {
        camera_id: string;
        duration: number;
        delay: number;
        resize: Size;
    }) {
        return new TypedPromise<DTOVideoBuffer, IProblemJson>((ok, _) =>
            ok(buffers[0]),
        );
    }

    deleteBuffer(id: string) {
        return new TypedPromise<void, IProblemJson>((ok, _) => {
            buffers = buffers.filter(b => b.id != id);
            ok();
        });
    }

    getStreamBufferUrl(id: string, type: 'diff' | 'raw'): string {
        return (mapVBIDtoFile as any)[id][type];
    }
}

class WebSocketBuffer {
    onMessage!: (ev: MessageEvent<any>) => any;
    id: string;
    url: string;
    image: ArrayBuffer | null;

    constructor(url: string, id: string) {
        this.url = url;
        this.id = id;
        this.image = null;
    }

    async addEventListener<K extends keyof WebSocketEventMap>(
        type: K,
        listener: (ev: WebSocketEventMap[K]) => any,
        options?: any,
    ) {
        if (type == 'message') {
            this.onMessage = listener as any;

            if (!this.image) {
                const msg =
                    'updated: ' +
                    JSON.stringify(buffers.filter(b => b.id == this.id)[0]);
                setTimeout(() => {
                    this.onMessage({
                        data: msg,
                    } as unknown as MessageEvent<any>);
                }, 300);
            }
        }
    }

    send(e: any) {
        if (e === 'do_detection') {
            setTimeout(() => {
                this.onMessage({
                    data: "canceled: Mock mode, won't do anything.",
                } as unknown as MessageEvent<any>);
            }, 300);
        }
    }

    close() {}
}
