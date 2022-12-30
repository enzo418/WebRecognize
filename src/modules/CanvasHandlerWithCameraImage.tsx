import React from 'react';
import CanvasHandler, { ICanvasHandlerState } from './CanvasHandler';
import { Size } from '../Geometry';
import { cameraService } from '../services/api/Services';

export interface CanvasHandlerWithCameraImageProps {
    image?: string;
    canvasSize: Size;

    // fetch a camera frame on mount
    autoGetImage?: {
        id: { uri: string } | { camera_id: string };
    };
}

interface State extends ICanvasHandlerState {
    image?: string;
}

export default abstract class CanvasHandlerWithCameraImage<
    P extends CanvasHandlerWithCameraImageProps,
> extends CanvasHandler<P, State> {
    pendingPromise: any;

    constructor(props: P) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();

        if (this.props.autoGetImage) {
            this.pendingPromise = cameraService
                .getFrame(this.props.autoGetImage.id)
                .ok(blob => {
                    this.setState({ image: URL.createObjectURL(blob) });
                })
                .fail(e => console.error('could not get camera frame', e))
                .cancelled(() => console.debug('canvas image cancelled'));
        } else if (!this.props.image)
            throw Error('No image provided and no auto get is set');

        this.drawImage();

        this.updateCanvasPosition();
    }

    componentWillUnmount(): void {
        if (super.componentWillUnmount) super.componentWillUnmount();

        if (this.pendingPromise) this.pendingPromise.cancel();

        if (this.props.autoGetImage) {
            URL.revokeObjectURL(this.state?.image as string);
        }
    }

    abstract onDraw(): void;

    componentDidUpdate(prevProps: P) {
        if (
            this.props.image !== prevProps.image ||
            this.props.canvasSize != prevProps.canvasSize
        ) {
            this.drawImage();
        }
    }

    drawImage(afterDrawImage = () => {}) {
        const imageSrc =
            this.props.autoGetImage !== undefined
                ? this.state?.image
                : this.props.image;

        if (!imageSrc) {
            console.debug('skipping draw, there is no image');
            return;
        }

        this.repaintCanvas(image => {
            this.ctx.drawImage(
                image,
                0,
                0,
                image.width,
                image.height,
                0,
                0,
                this.props.canvasSize.width,
                this.props.canvasSize.height,
            );

            this.onDraw();

            afterDrawImage();
        }, imageSrc);
    }

    render() {
        return (
            <canvas
                style={{ width: 'max-content' }}
                ref={this.canvas}
                {...this.handlers}
                width={this.props.canvasSize.width + ''}
                height={this.props.canvasSize.height + ''}
            />
        );
    }
}
