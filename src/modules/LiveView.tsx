import React, { ReactEventHandler } from 'react';
import config from '../config';

interface LiveViewProps {
    onLoad: any;
    style?: object;
    source: {
        cameraID?: string;
        uri?: string;
        observer?: boolean;
    };
    onError?: ReactEventHandler<HTMLImageElement>;
}

interface LiveViewState {}

class LiveView extends React.Component<LiveViewProps, LiveViewState> {
    image: React.RefObject<any>;
    url: string;
    state: LiveViewState = {};

    constructor(props: LiveViewProps) {
        super(props);

        this.image = React.createRef();

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

        this.url =
            config.server +
            (this.props.source.observer
                ? config.endpoints.api.stream.observer
                : this.props.source.cameraID !== undefined
                ? config.endpoints.api.stream.camera +
                  this.props.source.cameraID
                : config.endpoints.api.stream.uri +
                  '?uri=' +
                  encodeURI(this.props.source.uri as string));
    }

    onImageLoaded = (e: any) => {
        this.props.onLoad(e);
    };

    componentDidMount() {
        console.info("LiveView's MOUNT");
    }

    componentWillUnmount() {
        console.info("LiveView's UNMOUNT");

        if (this.image.current) {
            // Stop http stream
            this.image.current.src = '';
        }
    }

    render() {
        return (
            <img
                ref={this.image}
                onLoad={this.onImageLoaded}
                onError={this.props.onError}
                style={this.props.style || {}}
                src={this.url}></img>
        );
    }
}

export default LiveView;
