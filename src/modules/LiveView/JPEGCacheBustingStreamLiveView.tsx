import React, { ReactEventHandler } from 'react';
import config from '../../config';
import TypedPromise from '../../TypedPromise';
import ILiveView, { ILiveViewProps } from './ILiveView';
import { ILiveViewResponse } from '../../services/api/interfaces/ILiveViewService';

const emptyImage =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface JPEGCacheBustingStreamLiveViewState {}

interface JPEGCacheBustingStreamLiveViewProps extends ILiveViewProps {
    response: ILiveViewResponse & {
        stream_url: string;
    };
}

class JPEGCacheBustingStreamLiveView
    extends React.Component<
        JPEGCacheBustingStreamLiveViewProps,
        JPEGCacheBustingStreamLiveViewState
    >
    implements ILiveView
{
    // img element
    image: React.RefObject<any>;

    // canvas used to get the current image as a url
    canvas: React.RefObject<HTMLCanvasElement>;

    // current img element source
    url: string;

    // url that points to the backend
    public readonly realSource: string;

    state: JPEGCacheBustingStreamLiveViewState = {};

    onLoadCalled = false;

    constructor(props: JPEGCacheBustingStreamLiveViewProps) {
        super(props);

        this.image = React.createRef();
        this.canvas = React.createRef();

        this.url = config.server + this.props.response.stream_url;

        console.log('JPEGCacheBustingStreamLiveView', this.url);

        this.realSource = this.url;
    }

    tryPictureInPicture(onClose: () => any): Promise<boolean> {
        return new Promise<boolean>((res, _) => {
            const features =
                'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=400,height=300';
            const newWindow = window.open('', '_blank', features);
            if (!newWindow) return res(false);

            newWindow.document.write(`
        <html>
            <head>
            <title>Image Window</title>
            </head>
            <body style="margin:0">
            <img src="${this.url}" alt="Image" style="display: block; width: 100%; height: 100%;">
            </body>
        </html>
        `);

            newWindow.addEventListener('beforeunload', () => {
                console.log('closing pip...');
                onClose();
            });

            res(true);
        });
    }

    public stop(isUnmounting = false) {
        if (this.image.current) {
            if (this.image.current.src == this.realSource && !isUnmounting) {
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
            } else {
                this.image.current.src = emptyImage;
            }

            if (this.props.onStopped) this.props.onStopped();
        }
    }

    public play() {
        if (this.image.current) {
            if (this.image.current.src.startsWith('blob:')) {
                URL.revokeObjectURL(this.image.current.src);
            }

            this.image.current.src = this.url + '?t=' + Date.now();

            if (this.props.onPlaying) this.props.onPlaying();
        }
    }

    onImageLoaded = (e: any) => {
        if (!this.onLoadCalled) {
            if (this.props.onLoad) this.props.onLoad(e);
            this.onLoadCalled = true;
        }

        // Request a new image every 0.5 seconds
        setTimeout(() => {
            this.play();
        }, 500);
    };

    componentDidMount() {}

    componentWillUnmount() {
        this.stop(true);
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
                    onError={e => this.props.onError()}
                    style={this.props.style || {}}
                    src={this.url}
                    crossOrigin={'anonymous'}></img>

                <canvas ref={this.canvas} style={{ display: 'none' }}></canvas>
            </>
        );
    }
}

export default JPEGCacheBustingStreamLiveView;
