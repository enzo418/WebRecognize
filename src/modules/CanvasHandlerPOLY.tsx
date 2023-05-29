import React from 'react';
import CanvasHandler from './CanvasHandler';
import { Point, Rectangle, Size, Polygon } from '../Geometry';
import simplify from 'simplify-js';
import { pointPolygonTest } from '../utils/geometry';

interface CanvasHandlerPolyProps {
    image: string;
    initialPolys: Polygon[];
    enableEditing: boolean;
    canvasSize: Size;
    fullScreen?: boolean;
    borderColor?: string;

    // Called when a polygon was added, takes all the polygons as parameter
    onPolygonsChanged: (polys: Polygon[]) => any;

    // Called when the user starts drawing a new polygon
    onPolyStarted?: () => any;
}

export default class CanvasHandlerPOLY extends CanvasHandler<CanvasHandlerPolyProps> {
    polys: Polygon[];
    currentPoly: Polygon;
    p1: Point;
    p2: Point;
    currentMode: 'add' | 'delete';

    // on poly-removed -> data = removed poly
    editHistory: { type: 'poly-removed' | 'point-removed'; data: any }[];

    constructor(props: CanvasHandlerPolyProps) {
        super(props);

        this.polys = props.initialPolys;
        this.currentPoly = [];

        this.currentMode = 'add';

        this.editHistory = [];

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

        this.drawAll();

        this.updateCanvasPosition();
    }

    drawAll(afterDrawImage = () => {}) {
        const image = new Image();

        const fillBlackAlpha = () => {
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = 'black';
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
        };

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

            //  Draw the lines that connects the points
            // -----------------------------------------
            this.ctx.save();

            this.ctx.beginPath();

            this.ctx.lineWidth = 5;
            this.ctx.strokeStyle = 'Green';

            if (this.currentPoly.length > 1) {
                var first = this.currentPoly[0];
                this.ctx.moveTo(first.x, first.y);

                for (let index = 1; index < this.currentPoly.length; index++) {
                    const element = this.currentPoly[index];

                    this.ctx.lineTo(element.x, element.y);
                }
            }

            //this.ctx.closePath();

            this.ctx.stroke();

            fillBlackAlpha();

            //  Draw the current polygon points
            // ------------------------------
            this.ctx.beginPath();

            this.ctx.strokeStyle = 'Red';
            this.currentPoly.forEach(point => {
                this.ctx.moveTo(point.x, point.y);
                this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            });

            this.ctx.stroke();

            //  Draw the areas saved
            // ----------------------
            this.polys.forEach(poly => {
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.props.borderColor || '#f55d42';
                var first = poly[0];
                this.ctx.moveTo(first.x, first.y);

                for (let index = 1; index < poly.length; index++) {
                    const element = poly[index];

                    this.ctx.lineTo(element.x, element.y);
                }

                this.ctx.closePath();
                this.ctx.stroke();

                fillBlackAlpha();
            });

            this.ctx.restore();

            afterDrawImage();
        };

        image.src = this.props.image;
    }

    move(/*e: any*/) {}

    shouldCloseCurrentPoly(minProximity: number) {
        for (var i = 0; i < this.currentPoly.length - 1; i++) {
            for (var j = i + 1; j < this.currentPoly.length; j++) {
                const p1 = this.currentPoly[i];
                const p2 = this.currentPoly[j];
                if (
                    Math.abs(p1.x - p2.x) < minProximity &&
                    Math.abs(p1.y - p2.y) < minProximity
                ) {
                    this.currentPoly[j] = this.currentPoly[i];

                    return true;
                }
            }
        }

        return false;
    }

    // Click or touch pressed
    pressed(e: any) {
        if (!this.props.enableEditing) return;

        e.preventDefault();
        e = (e.touches || [])[0] || e;
        const x = e.clientX - this.x;
        const y = e.clientY - this.y;

        if (this.currentMode == 'delete') {
            for (let i = 0; i < this.polys.length; i++) {
                if (pointPolygonTest(this.polys[i], { x, y }) > 0) {
                    this.editHistory.push({
                        type: 'poly-removed',
                        data: this.polys.splice(i, 1),
                    });
                    this.props.onPolygonsChanged(this.polys);
                    break;
                }
            }
        } else {
            if (this.currentPoly.length == 0) {
                this.props.onPolyStarted?.();
            }

            this.currentPoly.push({ x, y });

            const epsilon = 5;

            this.currentPoly = simplify(this.currentPoly, epsilon, false);

            if (this.shouldCloseCurrentPoly(4)) {
                this.polys.push(simplify(this.currentPoly, epsilon + 1, false));
                this.currentPoly = [];
                this.props.onPolygonsChanged(this.polys);
            }
        }

        this.drawAll(() => {});
    }

    // Click or touch released
    release(e: any) {
        e.preventDefault();
    }

    undo() {
        // Undo last action
        if (this.currentPoly.length > 0) {
            this.editHistory.push({
                type: 'point-removed',
                data: this.currentPoly.pop(),
            });
        } else {
            this.editHistory.push({
                type: 'poly-removed',
                data: this.polys.pop(),
            });
            this.props.onPolygonsChanged(this.polys);
        }

        this.drawAll(() => {});
    }

    redo() {
        // Redo last undo
        const last = this.editHistory.pop();

        if (last) {
            if (last.type === 'point-removed') {
                this.currentPoly.push(last.data);
            } else if (last.type === 'poly-removed') {
                this.polys.push(last.data);
                this.props.onPolygonsChanged(this.polys);
            }
        }

        this.drawAll(() => {});
    }

    enterDeleteMode() {
        this.currentMode = 'delete';
    }

    enterAddMode() {
        this.currentMode = 'add';
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
