import React from 'react';
import { Point, Rectangle, Size } from '../Geometry';
import { ensure } from '../utils/error';

export interface ICanvasHandlerState {
    size: Size;
}

/**
 * abstract class that adds functionality to a canvas
 */
export default class CanvasHandler<
    Props,
    TState extends ICanvasHandlerState = ICanvasHandlerState,
> extends React.Component<Props, TState> {
    lastImage: string;
    x: number;
    y: number;
    clickPressed: boolean;
    handlers: {};
    headers: null;
    canvas: React.RefObject<HTMLCanvasElement>;
    ctx!: CanvasRenderingContext2D;

    constructor(props: Props) {
        super(props);
        this.lastImage = '';

        this.x = 0; // canvas position in x
        this.y = 0; // canvas position in y (with scrollbar)

        this.clickPressed = false;

        // canvas event handlers
        this.handlers = {};

        this.headers = null;

        this.canvas = React.createRef();
    }

    getHeaders() {
        return this.headers;
    }

    // get the value
    getValue() {
        return '';
    }

    setImage(image: string) {
        this.lastImage = image;
    }

    componentDidMount() {
        if (this.canvas.current)
            this.ctx = ensure<CanvasRenderingContext2D>(
                this.canvas.current.getContext('2d'),
            );
        else throw 'Missing canvas element.';
    }

    setCanvasSize({ width, height }: Size) {
        this.setState(prev => {
            if (width) {
                prev.size.width = width;
            }

            if (height) {
                prev.size.height = height;
            }
        });
    }

    repaintCanvas(
        callbackOnImageLoaded: (image: HTMLImageElement) => any,
        imageSrc?: string,
    ) {
        var image = new Image();
        image.onload = () => callbackOnImageLoaded(image);
        image.src = imageSrc ? imageSrc : this.lastImage;
    }

    updateCanvasPosition() {
        if (!this.canvas.current) throw 'Missing canvas element';

        var bounds = this.canvas.current.getBoundingClientRect();
        this.x = bounds.left;
        this.y = bounds.top;
    }

    /**
     * Fills a rectangle with lines at 45°
     * @param rectangle
     * @param spacingY space between the lines
     */
    fillRectangleWithLines(
        rectangle: Rectangle,
        spacingY: number,
        config?: {
            color?: string;
            style?: 'grid' | 'dashed-lines' | 'solid-lines';
            customDashStyle?: number[];
            lineWidth?: number;
        },
    ) {
        config = Object.assign(
            {
                color: 'green',
                style: 'grid',
                lineWidth: 2,
            },
            config,
        );

        this.ctx.save();

        const tl = { x: rectangle.x, y: rectangle.y };
        const br = {
            x: rectangle.x + rectangle.width,
            y: rectangle.y + rectangle.height,
        };

        let i = 1;

        this.ctx.beginPath();

        if (config.customDashStyle) {
            this.ctx.setLineDash(config.customDashStyle);
        } else {
            switch (config.style) {
                case 'grid':
                    this.ctx.setLineDash([2, 5]);
                    break;
                case 'grid':
                    this.ctx.setLineDash([5]);
                    break;
                default:
                    break;
            }
        }

        this.ctx.strokeStyle = config.color as string;
        this.ctx.lineWidth = config.lineWidth as number;
        while (i < 200) {
            let Y = tl.y + spacingY * i; // start drawing from tl
            let X = tl.x;

            // this line is described by L: y = -m(x - X) + Y
            // -m because the Y axis is inverted, it's 0 at the top.
            // A line at 45° means that m = 1 => L: y = -x + X + Y

            let startX = X,
                startY = Y,
                toY = 0,
                toX = 0;

            // 1. find intersection with top line
            // the top line is described by y = tl.y, if we replace it in L,
            // tl.y = -x + X + Y => x = - tl.y + X + Y
            const intersectionXTopLine = -tl.y + X + Y;

            if (Y >= br.y) {
                // This means that we need to start drawing from the bottom line,
                // for that we find X. If we consider the bottom line as y = br.y,
                // and replace it in L we get br.y = -x + X + Y, finding x
                // => x = - br.y + X + Y
                startX = -br.y + X + Y;
                startY = br.y; // we start drawing from the bottom line
            }

            if (startX > br.x) break;

            if (intersectionXTopLine <= br.x) {
                // draw a line from (X, Y) to (intersectionXTopLine, tl.y)
                toX = intersectionXTopLine;
                toY = tl.y;
            } else {
                // find where it intersect in the Y coordinate
                // with the right bound, x = br.x replacing in L
                // then y = - br.x + X + Y
                toY = -br.x + X + Y;
                toX = br.x;
            }

            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(toX, toY);

            i++;
        }

        this.ctx.stroke();

        this.ctx.restore();
    }
}
