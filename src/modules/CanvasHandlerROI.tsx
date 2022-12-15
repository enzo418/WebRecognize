import React from 'react';
import PropTypes from 'prop-types';
import CanvasHandler from './CanvasHandler';
import { Point, Rectangle, Size } from '../Geometry';
import { getRectangleDimensions } from '../utils/geometry';

type ROI = Rectangle;

interface CanvasHandlerROIProps {
    image: string;
    initialROI: ROI;
    onRoiUpdated: (roi: ROI) => any;
    enableEditing: boolean;
    canvasSize: Size;
    fullScreen?: boolean;
}

export default class CanvasHandlerROI extends CanvasHandler<CanvasHandlerROIProps> {
    ROI: ROI;
    p1: Point;
    p2: Point;

    constructor(props: CanvasHandlerROIProps) {
        super(props);
        this.ROI = props.initialROI;
        this.p1 = { x: 0, y: 0 }; // lt or rb
        this.p2 = { x: 0, y: 0 }; // rb or lt

        this.handlers = {
            onMouseMove: this.move.bind(this),
            onTouchMove: this.move.bind(this),
            onMouseDown: this.pressed.bind(this),
            onTouchStart: this.pressed.bind(this),
            onMouseUp: this.release.bind(this),
            onTouchEnd: this.release.bind(this),
        };
    }

    componentDidMount() {
        super.componentDidMount();

        if (this.props.fullScreen) {
            /**
             * Insted of doing
             *  this.canvas.current?.requestFullscreen();
             * we request it to the body because otherwise the canvas will
             * appear in the center, which causes problems in detecting its boundaries.
             * It's better to make it the only element on the screen with a modal
             * and then request the full screen in the body.
             */
            document.body.requestFullscreen();
        }

        this.onReady(this.props.image, this.props.initialROI);

        this.updateCanvasPosition();
    }

    move(e: any) {
        if (!this.props.enableEditing) return;

        e.preventDefault();
        e = (e.touches || [])[0] || e;

        if (this.clickPressed) {
            var image = new Image();
            image.onload = () => {
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

                const x1 = e.clientX - this.x;
                const y1 = e.clientY - this.y;

                this.p2 = { x: x1, y: y1 };

                const x0 = this.p1.x;
                const y0 = this.p1.y;
                const width = x1 - x0;
                const height = y1 - y0;

                this.ctx.strokeRect(x0, y0, width, height);
            };

            image.src = this.lastImage;
        }
    }

    // Click or touch pressed
    pressed(e: any) {
        if (!this.props.enableEditing) return;

        e.preventDefault();
        e = (e.touches || [])[0] || e;
        this.clickPressed = true;
        const x = e.clientX - this.x;
        const y = e.clientY - this.y;

        this.p1 = { x, y };
    }

    // Click or touch released
    release(e: any) {
        if (!this.props.enableEditing) return;

        this.clickPressed = false;

        const { lt, width, height } = getRectangleDimensions(this.p1, this.p2);

        this.ROI = {
            x: lt.x,
            y: lt.y,
            width,
            height,
        };

        this.props.onRoiUpdated(this.ROI);

        e.preventDefault();
    }

    /**
     * Callback to update the image displayed in the canvas
     */
    onReady(frame: string, roi?: ROI) {
        this.ROI = roi || { x: 0, y: 0, width: 0, height: 0 };

        let image = new Image();
        image.onload = () => {
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

            this.ctx.strokeStyle = 'Red';
            this.ctx.lineWidth = 5;

            if (
                this.ROI.x + this.ROI.y + this.ROI.width + this.ROI.height >
                0
            ) {
                this.ctx.strokeRect(
                    this.ROI.x,
                    this.ROI.y,
                    this.ROI.width,
                    this.ROI.height,
                );
            }

            this.updateCanvasPosition();
        };

        image.src = frame;

        this.lastImage = frame;
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
