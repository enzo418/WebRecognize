import React, { ReactEventHandler } from 'react';
import config from '../config';
import TypedPromise from '../TypedPromise';

const emptyImage =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export interface LiveViewProps {
    onLoad?: any;
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
    // img element
    image: React.RefObject<any>;

    // canvas used to get the current image as a url
    canvas: React.RefObject<HTMLCanvasElement>;

    // current img element source
    url: string;

    // url that points to the backend
    public readonly realSource: string;

    state: LiveViewState = {};

    constructor(props: LiveViewProps) {
        super(props);

        this.image = React.createRef();
        this.canvas = React.createRef();

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

        this.realSource = this.url;
    }

    public stop() {
        if (this.image.current) {
            if (this.image.current.src == this.realSource) {
                this.getCurrentAsUrl()
                    .ok(url => {
                        this.image.current.src = url;
                    })
                    .catch((e: string) => {
                        console.error("Couldn't get url", e);

                        if (this.image.current) {
                            // trigger onError
                            this.image.current.src = '';
                        }
                    });
            }
        }
    }

    public play() {
        if (this.image.current) {
            if (this.image.current.src.startsWith('blob:')) {
                URL.revokeObjectURL(this.image.current.src);
            }

            this.image.current.src = this.url;
        }
    }

    onImageLoaded = (e: any) => {
        if (this.props.onLoad) this.props.onLoad(e);
    };

    componentDidMount() {}

    componentWillUnmount() {
        this.stop();
    }

    private getCurrentAsUrl(): TypedPromise<string, string> {
        return new TypedPromise((resolve, reject) => {
            if (!this.canvas.current) {
                reject('Could not get canvas');
                return;
            }

            const imageElement = this.image.current;
            const context = this.canvas.current.getContext('2d');

            if (!context) {
                reject('Could not get canvas context');
                return;
            }

            this.canvas.current.width = imageElement.naturalWidth;
            this.canvas.current.height = imageElement.naturalHeight;

            context.drawImage(imageElement, 0, 0);

            this.canvas.current.toBlob(blob => {
                if (!blob) {
                    reject('Could not get blob data');
                    return;
                }

                const imageUrl = URL.createObjectURL(blob);

                resolve(imageUrl);
            }, 'image/png');
        });
    }

    render() {
        return (
            <>
                <img
                    ref={this.image}
                    onLoad={this.onImageLoaded}
                    onError={this.props.onError}
                    style={this.props.style || {}}
                    src={this.url}
                    crossOrigin={'anonymous'}></img>

                <canvas ref={this.canvas} style={{ display: 'none' }}></canvas>
            </>
        );
    }
}

export default LiveView;
