import React, { ReactEventHandler } from 'react';
import config from '../config';
import TypedPromise from '../TypedPromise';
import { liveViewService } from '../services/api/Services';
import { ensure } from '../utils/error';
import { LiveViewType } from '../services/api/interfaces/ILiveViewService';

const emptyImage =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export interface WebRTCLiveViewProps {
    onLoad?: any;
    style?: object;
    source: {
        cameraID?: string;
        uri?: string;
        observer?: boolean;
    };
    onError?: ReactEventHandler<HTMLVideoElement>;
}

interface WebRTCLiveViewState {}

class WebRTCLiveView extends React.Component<
    WebRTCLiveViewProps,
    WebRTCLiveViewState
> {
    // img element
    video: React.RefObject<any>;

    // peer connection - initialized in setupPeer()
    pc!: RTCPeerConnection;
    peerId!: string;

    lastPendingPromise: any;

    state: WebRTCLiveViewState = {};

    constructor(props: WebRTCLiveViewProps) {
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

    private setupPeer() {
        if (!this.pc || this.pc.connectionState === 'closed') {
            this.pc = new RTCPeerConnection();

            this.pc.onicegatheringstatechange = () => {
                if (this.pc.iceGatheringState === 'complete') {
                    this.lastPendingPromise = liveViewService.answer(
                        this.peerId,
                        ensure(this.pc.localDescription),
                    );
                }
            };

            const liveViewType = this.props.source.observer
                ? LiveViewType.OBSERVER
                : this.props.source.cameraID !== undefined
                ? LiveViewType.CAMERA
                : LiveViewType.SOURCE;

            this.lastPendingPromise = liveViewService
                .call(
                    liveViewType,
                    this.props.source.cameraID || this.props.source.uri,
                )
                .ok(({ clientId, offer }) => {
                    this.peerId = clientId;
                    this.pc.setRemoteDescription(JSON.parse(offer));

                    this.pc
                        .createAnswer()
                        .then(answer => this.pc.setLocalDescription(answer));
                });

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
        }
    }

    public play() {
        this.setupPeer();
    }

    componentDidMount() {
        if (!this.video.current) {
            console.error('Video element not found');
        } else {
            console.log('Video element found');
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
                    onError={this.props.onError}
                    onLoadedData={this.props.onLoad}
                    style={this.props.style || {}}
                    crossOrigin={'anonymous'}></video>
            </>
        );
    }
}

export default WebRTCLiveView;
