import React, { ReactEventHandler } from 'react';
import { liveViewService } from '../../services/api/Services';
import { ensure } from '../../utils/error';
import {
    ILiveViewResponse,
    LiveViewType,
} from '../../services/api/interfaces/ILiveViewService';
import ILiveView, { ILiveViewProps } from './ILiveView';

interface WebRTCLiveViewState {}

interface IWebRTCLiveViewProps extends ILiveViewProps {
    response: ILiveViewResponse & {
        clientId: string;
        offer: string;
    };
}

class WebRTCLiveView
    extends React.Component<IWebRTCLiveViewProps, WebRTCLiveViewState>
    implements ILiveView
{
    // video element
    video: React.RefObject<HTMLVideoElement>;

    // peer connection - initialized in setupPeer()
    pc!: RTCPeerConnection;
    peerId!: string;

    lastPendingPromise: any;

    state: WebRTCLiveViewState = {};

    constructor(props: IWebRTCLiveViewProps) {
        super(props);

        this.video = React.createRef();

        if (
            this.props.source === undefined ||
            (this.props.source.cameraID === undefined &&
                this.props.source.observer === undefined &&
                this.props.source.uri === undefined)
        ) {
            throw new Error(
                'LiveView component must have at least one of the following props: cameraID, uri, observer',
            );
        }
    }

    tryPictureInPicture(onClose: () => any): Promise<boolean> {
        return new Promise<boolean>((res, _) => {
            if (this.video.current) {
                if (this.video.current.requestPictureInPicture) {
                    this.video.current
                        .requestPictureInPicture()
                        .then(() => res(true))
                        .catch(() => res(false));
                }
            }
            res(false);
        });
    }

    private setupPeer() {
        if (!this.pc || this.pc.connectionState === 'closed') {
            this.pc = new RTCPeerConnection();

            this.pc.onicegatheringstatechange = () => {
                if (this.pc.iceGatheringState === 'complete') {
                    this.lastPendingPromise = liveViewService
                        .answer(this.peerId, ensure(this.pc.localDescription))
                        .fail(err => this.props.onError(err));
                }
            };

            this.peerId = this.props.response.clientId;
            this.pc.setRemoteDescription(JSON.parse(this.props.response.offer));

            this.pc
                .createAnswer()
                .then(answer => this.pc.setLocalDescription(answer));

            this.pc.addEventListener('track', (event: any) => {
                if (!this.video.current) {
                    console.error('Video element not found');
                    return;
                }

                if (event.streams && event.streams[0]) {
                    this.video.current.srcObject = event.streams[0];
                    this.video.current.play();
                }
            });
        }
    }

    public stop(isUnmounting = false) {
        if (this.pc && this.peerId) {
            this.pc.close();
            this.lastPendingPromise = liveViewService.hangUp(this.peerId);

            if (this.props.onStopped) this.props.onStopped();
        }
    }

    public play() {
        this.setupPeer();
    }

    componentDidMount() {
        if (this.video.current) {
            this.video.current.addEventListener('play', () => {
                if (this.props.onPlaying) this.props.onPlaying();
            });

            this.video.current.addEventListener('pause', () => {
                if (this.props.onStopped) this.props.onStopped();
            });
        }

        this.setupPeer();
    }

    componentWillUnmount() {
        if (this.lastPendingPromise) this.lastPendingPromise.cancel();

        this.stop(true);
    }

    render() {
        return (
            <>
                <video
                    ref={this.video}
                    onError={() => this.props.onError()}
                    onLoadedData={this.props.onLoad}
                    style={this.props.style || {}}
                    crossOrigin={'anonymous'}></video>
            </>
        );
    }
}

export default WebRTCLiveView;
