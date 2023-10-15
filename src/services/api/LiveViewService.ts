import config from '../../config';
import IHttpClient from '../../Http/IHttpClient';
import processPromise from '../../Http/ProcessPromise';
import { BrowserCapabilities } from '../BrowserCapabilities/BrowserCapabilities';
import ILiveViewService, {
    ILiveViewResponse,
    LiveViewType,
} from './interfaces/ILiveViewService';
import IProblemJson from './interfaces/IProblemJson';
import Service from './Service';

export default class LiveViewService
    extends Service
    implements ILiveViewService
{
    constructor(httpClient: IHttpClient) {
        super(httpClient, '/api/stream');
    }

    public getCameraView(camera_id: string, capabilities: BrowserCapabilities) {
        return processPromise<ILiveViewResponse, IProblemJson>(
            this.client.post(
                this.baseUrl + '/camera/' + camera_id,
                capabilities,
            ),
        );
    }

    public getSourceView(source: string, capabilities: BrowserCapabilities) {
        return processPromise<ILiveViewResponse, IProblemJson>(
            this.client.post(this.baseUrl + '/source', {
                source,
                capabilities,
            }),
        );
    }

    public getObserverView(capabilities: BrowserCapabilities) {
        return processPromise<ILiveViewResponse, IProblemJson>(
            this.client.post(this.baseUrl + '/observer', capabilities),
        );
    }

    public answer(client_id: string, answer: string | object) {
        return processPromise<void, IProblemJson>(
            this.client.post(this.baseUrl + '/webrtc/answer', {
                clientId: client_id,
                answer,
            }),
        );
    }

    public hangUp(client_id: string) {
        return processPromise<void, IProblemJson>(
            this.client.post(this.baseUrl + '/webrtc/hangup', {
                clientId: client_id,
            }),
        );
    }
}
