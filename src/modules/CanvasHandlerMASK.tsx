import React from 'react';
import PropTypes from 'prop-types';
import CanvasHandler from './CanvasHandler';
import { Point, Rectangle, Size, Mask } from '../Geometry';
import simplify from 'simplify-js';
import { pointPolygonTest } from '../utils/geometry';

interface CanvasHandlerMaskProps {
    image: string;
    initialMasks: Mask[];
    enableEditing: boolean;
    canvasSize: Size;
    fullScreen?: boolean;

    // Called when a mask was added, takes all the masks as parameter
    onMasksChanged: (masks: Mask[]) => any;
}

export default class CanvasHandlerMask extends CanvasHandler<CanvasHandlerMaskProps> {
    masks: Mask[];
    currentMask: Mask;
    p1: Point;
    p2: Point;
    currentMode: 'add' | 'delete';

    // on mask-removed -> data = removed mask
    editHistory: { type: 'mask-removed' | 'point-removed'; data: any }[];

    constructor(props: CanvasHandlerMaskProps) {
        super(props);

        this.masks = props.initialMasks;
        this.currentMask = [];

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
        console.log({ before: this.masks });
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

            if (this.currentMask.length > 1) {
                var first = this.currentMask[0];
                this.ctx.moveTo(first.x, first.y);

                for (let index = 1; index < this.currentMask.length; index++) {
                    const element = this.currentMask[index];

                    this.ctx.lineTo(element.x, element.y);
                }
            }

            //this.ctx.closePath();

            this.ctx.stroke();

            fillBlackAlpha();

            //  Draw the current mask points
            // ------------------------------
            this.ctx.beginPath();

            this.ctx.strokeStyle = 'Red';
            this.currentMask.forEach(point => {
                this.ctx.moveTo(point.x, point.y);
                this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            });

            this.ctx.stroke();

            //  Draw the areas saved
            // ----------------------
            this.masks.forEach(poly => {
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#f55d42';
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

            //if (this.masks.length) alert('after draw image');
            afterDrawImage();

            console.log({ after: this.masks });
        };

        image.src = this.props.image;
    }

    move(/*e: any*/) {}

    shouldCloseCurrentMask(minProximity: number) {
        for (var i = 0; i < this.currentMask.length - 1; i++) {
            for (var j = i + 1; j < this.currentMask.length; j++) {
                const p1 = this.currentMask[i];
                const p2 = this.currentMask[j];
                if (
                    Math.abs(p1.x - p2.x) < minProximity &&
                    Math.abs(p1.y - p2.y) < minProximity
                ) {
                    this.currentMask[j] = this.currentMask[i];

                    return true;
                }
            }
        }

        return false;
    }

    // Click or touch pressed
    pressed(e: any) {
        console.log('pressed');

        if (!this.props.enableEditing) return;

        e.preventDefault();
        e = (e.touches || [])[0] || e;
        const x = e.clientX - this.x;
        const y = e.clientY - this.y;

        if (this.currentMode == 'delete') {
            for (let i = 0; i < this.masks.length; i++) {
                if (pointPolygonTest(this.masks[i], { x, y }) > 0) {
                    this.editHistory.push({
                        type: 'mask-removed',
                        data: this.masks.splice(i, 1),
                    });
                    this.props.onMasksChanged(this.masks);
                    break;
                }
            }
        } else {
            this.currentMask.push({ x, y });

            const epsilon = 5;

            this.currentMask = simplify(this.currentMask, epsilon, false);

            if (this.shouldCloseCurrentMask(4)) {
                this.masks.push(simplify(this.currentMask, epsilon + 1, false));
                this.currentMask = [];
                this.props.onMasksChanged(this.masks);
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
        if (this.currentMask.length > 0) {
            this.editHistory.push({
                type: 'point-removed',
                data: this.currentMask.pop(),
            });
        } else {
            this.editHistory.push({
                type: 'mask-removed',
                data: this.masks.pop(),
            });
            this.props.onMasksChanged(this.masks);
        }

        this.drawAll(() => {});
    }

    redo() {
        // Redo last undo
        const last = this.editHistory.pop();

        if (last) {
            if (last.type === 'point-removed') {
                this.currentMask.push(last.data);
            } else if (last.type === 'mask-removed') {
                this.masks.push(last.data);
                this.props.onMasksChanged(this.masks);
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
