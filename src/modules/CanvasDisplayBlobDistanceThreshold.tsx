import React from 'react';
import { Rectangle, Size } from '../Geometry';
import CanvasHandlerWithCameraImage, {
    CanvasHandlerWithCameraImageProps,
} from './CanvasHandlerWithCameraImage';

interface Props extends CanvasHandlerWithCameraImageProps {
    distance: number;
}

export default class CanvasDisplayBlobDistanceThreshold extends CanvasHandlerWithCameraImage<Props> {
    rectangleLeft: Rectangle;
    rectangleRight: Rectangle;
    rectangleSize: Size;

    constructor(props: Props) {
        super(props);

        this.rectangleSize = {
            width: props.canvasSize.width * 0.08,
            height: props.canvasSize.height * 0.15,
        };

        this.rectangleLeft = {
            x: 0,
            y: 0,
            width: this.rectangleSize.width,
            height: this.rectangleSize.height,
        };

        this.rectangleRight = {
            x: 0,
            y: 0,
            width: this.rectangleSize.width,
            height: this.rectangleSize.height,
        };
    }

    componentDidUpdate(prevProps: Props) {
        super.componentDidUpdate(prevProps);

        if (this.props.distance !== prevProps.distance) {
            this.drawImage();
        }
    }

    onDraw(): void {
        const isVertical =
            this.props.canvasSize.height > this.props.canvasSize.width;

        const drawRectangle = (r: Rectangle) => {
            this.ctx.beginPath();
            this.ctx.rect(r.x, r.y, r.width, r.height);
            this.ctx.stroke();
        };

        const drawCenter = (r: Rectangle, radius: number = 5) => {
            this.ctx.beginPath();
            this.ctx.arc(
                r.x + r.width / 2,
                r.y + r.height / 2,
                radius,
                0,
                2 * Math.PI,
            );
            this.ctx.fill();
        };

        const canvasCenter = {
            x: this.props.canvasSize.width / 2,
            y: this.props.canvasSize.height / 2,
        };

        const halfDistance = this.props.distance / 2;

        // calculate rectangles position
        if (isVertical) {
            this.rectangleRight.y =
                canvasCenter.y + halfDistance - this.rectangleRight.height / 2;

            this.rectangleLeft.y =
                canvasCenter.y - halfDistance - this.rectangleLeft.height / 2;

            this.rectangleLeft.x = this.rectangleRight.x =
                canvasCenter.x - this.rectangleRight.height / 2;
        } else {
            this.rectangleRight.x =
                canvasCenter.x + halfDistance - this.rectangleRight.width / 2;

            this.rectangleLeft.x =
                canvasCenter.x - halfDistance - this.rectangleLeft.width / 2;

            this.rectangleLeft.y = this.rectangleRight.y =
                canvasCenter.y - this.rectangleRight.height / 2;
        }

        console.log({ rl: this.rectangleLeft, rr: this.rectangleRight });

        this.ctx.save();

        // draw rectangles
        this.ctx.lineWidth = 5;

        this.ctx.strokeStyle = 'red';
        drawRectangle(this.rectangleLeft);

        this.ctx.strokeStyle = 'green';
        drawRectangle(this.rectangleRight);

        // fill them
        this.fillRectangleWithLines(this.rectangleLeft, 3, {
            color: 'red',
            customDashStyle: [0],
            lineWidth: 1,
        });

        this.fillRectangleWithLines(this.rectangleRight, 3, {
            color: 'green',
            customDashStyle: [0],
            lineWidth: 1,
        });

        // draw center line
        this.ctx.strokeStyle = 'black';

        this.ctx.beginPath();

        this.ctx.moveTo(canvasCenter.x, canvasCenter.y);

        if (isVertical) {
            this.ctx.lineTo(canvasCenter.x, canvasCenter.y + halfDistance);
            this.ctx.lineTo(canvasCenter.x, canvasCenter.y - halfDistance);
        } else {
            this.ctx.lineTo(canvasCenter.x + halfDistance, canvasCenter.y);
            this.ctx.lineTo(canvasCenter.x - halfDistance, canvasCenter.y);
        }

        this.ctx.stroke();

        // draw rectangle center
        this.ctx.fillStyle = 'black';

        drawCenter(this.rectangleRight);
        drawCenter(this.rectangleLeft);

        this.ctx.restore();
    }
}
