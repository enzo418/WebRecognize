import React from 'react';
import { Rectangle, Size } from '../Geometry';
import CanvasHandlerWithCameraImage, {
    CanvasHandlerWithCameraImageProps,
} from './CanvasHandlerWithCameraImage';

interface Props extends CanvasHandlerWithCameraImageProps {
    area: number;
}

export default class CanvasDisplaySampleArea extends CanvasHandlerWithCameraImage<Props> {
    rectangle: Rectangle;

    constructor(props: Props) {
        super(props);

        this.rectangle = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }

    componentDidUpdate(prevProps: Props) {
        super.componentDidUpdate(prevProps);

        if (this.props.area !== prevProps.area) {
            this.drawImage();
        }
    }

    onDraw(): void {
        const drawRectangle = (r: Rectangle) => {
            this.ctx.beginPath();
            this.ctx.rect(r.x, r.y, r.width, r.height);
            this.ctx.stroke();
        };

        const canvasCenter = {
            x: this.props.canvasSize.width / 2,
            y: this.props.canvasSize.height / 2,
        };

        this.rectangle.width = this.props.area / 2;
        this.rectangle.height = this.props.area / 2;

        // calculate rectangles position
        this.rectangle.x = canvasCenter.x - this.rectangle.width / 2;
        this.rectangle.y = canvasCenter.y - this.rectangle.height / 2;

        // draw rectangles
        this.ctx.lineWidth = 2;

        this.ctx.strokeStyle = 'red';
        drawRectangle(this.rectangle);

        // fill them
        this.fillRectangleWithLines(this.rectangle, 3, {
            color: 'red',
            customDashStyle: [0],
            lineWidth: 1,
        });

        this.ctx.restore();
    }
}
