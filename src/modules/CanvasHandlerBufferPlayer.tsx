import React from 'react';
import CanvasHandler, { ICanvasHandlerState } from './CanvasHandler';
import { Point, Polygon, Rectangle, Size } from '../Geometry';
import { DTOBlob } from '../services/api/interfaces/DTOVideoBuffer';
import { ImageBitmapStore } from '../utils/TiffImage';

interface CanvasHandlerBufferPlayerProps {
    canvasSize: Size;

    cameraFrameStore: ImageBitmapStore;
    diffFrameStore: ImageBitmapStore;
    contours?: Array<Polygon[]>; // one poly array per frame
    blobs?: DTOBlob[];

    fps: number;

    draw: {
        cameraFrame: boolean;
        diff: boolean;
        contours: boolean;
        blobs: boolean;
    };
}

/**
 * Draws the frame at current frame.
 * To draw the contours and blobs it draws the frames again and then draws the polygons over it
 */
export default class CanvasHandlerBufferPlayer extends CanvasHandler<CanvasHandlerBufferPlayerProps> {
    private currentFrame: number;
    private intervalID: number | null;
    private showCurrentPositionText: boolean;

    constructor(props: CanvasHandlerBufferPlayerProps) {
        super(props);

        this.handlers = {
            onMouseMove: this.move.bind(this),
            onTouchMove: this.move.bind(this),
            onMouseDown: this.pressed.bind(this),
            onTouchStart: this.pressed.bind(this),
            onMouseUp: this.release.bind(this),
            onTouchEnd: this.release.bind(this),
        };

        this.currentFrame = 0;
        this.intervalID = null;
        this.showCurrentPositionText = true;

        props.cameraFrameStore.subscribeToFetchDone(
            this.drawToCurrentFrame.bind(this),
        );

        props.diffFrameStore.subscribeToFetchDone(
            this.drawToCurrentFrame.bind(this),
        );
    }

    public play() {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }

        const id = setInterval(() => {
            let next = this.currentFrame + 1;
            if (next > this.props.cameraFrameStore.getTotalImages() - 1) {
                next = 0;
            }

            this.currentFrame = next;

            this.drawToCurrentFrame();
        }, 1000 / this.props.fps);

        this.intervalID = id as unknown as number;
    }

    public pause() {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    public previous() {
        this.pause();
        this.currentFrame--;
        this.drawToCurrentFrame();
    }

    public next() {
        this.pause();
        this.currentFrame++;
        this.drawToCurrentFrame();
    }

    public restart() {
        this.currentFrame = 0;
        this.drawToCurrentFrame();
    }

    componentDidMount() {
        super.componentDidMount();

        this.updateCanvasPosition();

        this.drawToCurrentFrame();
    }

    componentDidUpdate(
        prevProps: Readonly<CanvasHandlerBufferPlayerProps>,
    ): void {
        //if (prevProps.currentFrame != this.props.currentFrame) {
        //    this.moveToFrame(this.props.currentFrame);
        //}
    }

    move(e: any) {
        e.preventDefault();
        e = (e.touches || [])[0] || e;
    }

    // Click or touch pressed
    pressed(e: any) {
        e.preventDefault();
        e = (e.touches || [])[0] || e;
        this.clickPressed = true;
        const x = e.clientX - this.x;
        const y = e.clientY - this.y;
    }

    // Click or touch released
    release(e: any) {
        e.preventDefault();
    }

    drawToCurrentFrame() {
        const total = this.props.cameraFrameStore.getTotalImages();
        if (
            !this.ctx ||
            total == 0 ||
            this.currentFrame > total ||
            this.currentFrame < 0
        ) {
            // TODO: Draw a loading graph
            return;
        }

        const draw = [];
        if (this.props.draw.cameraFrame) {
            draw.push({
                image: this.props.cameraFrameStore.getImage(this.currentFrame),
                cb: () => {},
            });
        }

        if (this.props.draw.diff) {
            draw.push({
                image: this.props.diffFrameStore.getImage(this.currentFrame),
                cb: () => {},
            });
        }

        if (this.props.draw.contours) {
            draw.push({
                image: this.props.cameraFrameStore.getImage(this.currentFrame),
                cb: (
                    frameIndex: number,
                    startXY: Point,
                    scaleX: number,
                    scaleY: number,
                ) => {
                    if (!this.props.contours) return;

                    this.ctx.save();
                    this.ctx.strokeStyle = '#fafa';
                    this.ctx.lineWidth = 2;

                    for (
                        let i = 0;
                        i < this.props.contours[frameIndex].length;
                        i++
                    ) {
                        const contour = this.props.contours[frameIndex][i];

                        // draw poly
                        this.ctx.beginPath();
                        this.ctx.moveTo(
                            startXY.x + contour[0].x * scaleX,
                            startXY.y + contour[0].y * scaleY,
                        );

                        for (let j = 1; j < contour.length; j++) {
                            this.ctx.lineTo(
                                startXY.x + contour[j].x * scaleX,
                                startXY.y + contour[j].y * scaleY,
                            );
                        }

                        this.ctx.closePath();
                        this.ctx.stroke();
                    }

                    this.ctx.restore();
                },
            });
        }

        if (this.props.draw.blobs) {
            draw.push({
                image: this.props.cameraFrameStore.getImage(this.currentFrame),
                cb: (
                    frameIndex: number,
                    startXY: Point,
                    scaleX: number,
                    scaleY: number,
                    bounds: { w: number; h: number },
                ) => {
                    if (!this.props.blobs) return;

                    this.ctx.font = '900 20px system-ui';

                    this.ctx.save();

                    this.ctx.lineWidth = 4;
                    const text = this.ctx.measureText('A');
                    const textHeight =
                        text.actualBoundingBoxAscent +
                        text.actualBoundingBoxDescent;

                    for (let i = 0; i < this.props.blobs.length; i++) {
                        const blob = this.props.blobs[i];

                        const color = this.getBlobColor(blob.internal_id);

                        this.ctx.fillStyle = color;
                        this.ctx.strokeStyle = color;

                        if (
                            frameIndex >= blob.first_appearance &&
                            frameIndex <= blob.last_appearance
                        ) {
                            let rect =
                                blob.rects[frameIndex - blob.first_appearance];

                            if (rect.width == 0 || rect.height == 0) continue;

                            rect = {
                                x: startXY.x + rect.x * scaleX,
                                y: startXY.y + rect.y * scaleY,
                                width: rect.width * scaleX,
                                height: rect.height * scaleY,
                            };

                            const tPos = this.getTextPosition(
                                rect,
                                textHeight + 3,
                                bounds.w,
                                bounds.h,
                                startXY,
                            );

                            this.ctx.fillText(
                                `${blob.internal_id}`,
                                tPos.x,
                                tPos.y,
                            );

                            this.ctx.beginPath();
                            this.ctx.rect(
                                rect.x,
                                rect.y,
                                rect.width,
                                rect.height,
                            );
                            this.ctx.stroke();
                        }
                    }

                    this.ctx.restore();
                },
            });
        }

        this.renderImages(draw, Math.min(2, draw.length));

        if (this.showCurrentPositionText) {
            this.ctx.font = '20px system-ui';
            this.ctx.fillStyle = 'green';
            const text = this.ctx.measureText('A');
            this.ctx.fillText(
                `${
                    this.currentFrame + 1
                }/${this.props.cameraFrameStore.getTotalImages()}`,
                3,
                20,
            );
        }
    }

    redrawWithNewData() {
        this.ctx.clearRect(
            0,
            0,
            this.props.canvasSize.width,
            this.props.canvasSize.height,
        );

        this.drawToCurrentFrame();
    }

    toggleFrameCounter() {
        this.showCurrentPositionText = !this.showCurrentPositionText;
        this.drawToCurrentFrame();
    }

    private renderImages(
        images: {
            image: ImageBitmap;
            cb: (
                i: number,
                offset: Point,
                scaleX: number,
                scaleY: number,
                bounds: { w: number; h: number },
            ) => any;
        }[],
        maxH: number,
    ) {
        if (images.length == 0) return;

        const w = this.props.canvasSize.width / maxH;
        const h = images.length == 1 ? this.props.canvasSize.height : w / 1.77;
        const scaleX = w / images[0].image.width;
        const scaleY = h / images[0].image.height;

        for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
            if (!images[imageIndex]) {
                console.debug('Camera image missing: ', {
                    images,
                    image: images[imageIndex],
                });
                continue;
            }

            let startXY: Point = {
                x: (imageIndex % maxH) * w,
                y: Math.floor(imageIndex / maxH) * h,
            };

            this.ctx.drawImage(
                images[imageIndex].image,
                0,
                0,
                images[imageIndex].image.width,
                images[imageIndex].image.height,
                startXY.x,
                startXY.y,
                w,
                h,
            );

            images[imageIndex].cb(this.currentFrame, startXY, scaleX, scaleY, {
                w: startXY.x + w,
                h: startXY.y + h,
            });
        }
    }

    private getTextPosition(
        r: Rectangle,
        margin: number = 30,
        w: number,
        h: number,
        start: Point,
    ): Point {
        // top edge?
        if (r.y - start.y >= margin) return { x: r.x, y: r.y - 5 };
        // then use bottom
        else if (Math.abs(r.y + r.height - h) >= margin)
            return { x: r.x, y: r.y + r.height + margin };
        else return { x: 0, y: 0 }; // if this happens the blob has size = canvasSize
    }

    private getBlobColor(id: number): string {
        return `rgb(${((id + 1) * 350) % 255}, ${((id + 5) * 80) % 255}, ${
            ((id + 20) * 200) % 255
        })`;
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
