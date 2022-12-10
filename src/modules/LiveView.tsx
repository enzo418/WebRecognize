import React from 'react';
import config from '../config';

interface LiveViewProps {
    onLoad: any;
    style?: object;
    feedID: string;
}

interface LiveViewState {
    socket: WebSocket | null;
}

class LiveView extends React.Component<LiveViewProps, LiveViewState> {
    image: React.RefObject<any>;
    state: LiveViewState = {
        socket: null,
    };

    constructor(props: LiveViewProps) {
        super(props);

        this.image = React.createRef();
    }

    onImageLoaded = (e: any) => {
        // Moz.org: Browsers will release object URLs automatically
        // when the document is unloaded; however, for optimal
        // performance and memory usage, if there are safe times
        // when you can explicitly unload them, you should do so.
        URL.revokeObjectURL(this.image.current.src);

        this.props.onLoad(e);
    };

    componentDidMount() {
        if (this.state.socket == null) {
            console.log('connecting to socket');
            this.setState({
                socket: this.getAndSetLiveView(this.props.feedID),
            });
        }
    }

    componentWillUnmount() {
        this.state.socket?.close();
    }

    getAndSetLiveView = (feed: string) => {
        const socket = new WebSocket(
            `${config.endpoints.websocket.liveView}${feed}`,
        );

        // set socket as binary
        socket.binaryType = 'blob';

        // Listen for frames
        socket.addEventListener('message', event => {
            // - Blob:
            // eslint-disable-next-line max-len
            //   https://developer.mozilla.org/en-US/docs/Web/API/Blob#creating_a_url_representing_the_contents_of_a_typed_array
            // - Blob to file:
            // eslint-disable-next-line max-len
            //   https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#example_using_object_urls_to_display_images

            // console.log(event.data);
            const blob = new Blob([event.data], { type: 'image/jpeg' });

            if (this.image.current) {
                this.image.current.src = URL.createObjectURL(blob);
            }
        });

        return socket;
    };

    render() {
        return (
            <img
                ref={this.image}
                onLoad={this.onImageLoaded}
                style={this.props.style || {}}></img>
        );
    }
}

export default LiveView;
