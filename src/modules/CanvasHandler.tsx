import React from "react";

interface Size {
    width: number;
    height: number;
}

interface ICanvasHandlerState {
    size: Size;
}

/**
 * abstract class that adds functionality to a canvas
 */
export default class CanvasHandler<Props> extends React.Component<Props, ICanvasHandlerState> {
    lastImage: string;
    x: number;
    y: number;
    clickPressed: boolean;
    handlers: {};
    headers: null;
    canvas: React.RefObject<HTMLCanvasElement>;
    ctx: any;
    
    state = {
        size: {
            width: 640,
            height: 360,
        },
    };

    constructor(props: Props) {
        super(props);
        this.lastImage = "";

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
        return "";
    }

    setImage(image:string) {
        this.lastImage = image;
    }

    componentDidMount() {
        if (this.canvas.current)
            this.ctx = this.canvas.current.getContext("2d");
        else throw "Missing canvas element."
    }

    setCanvasSize({width, height}: Size) {
        this.setState((prev) => {
            if (width) {
                prev.size.width = width;
            }

            if (height) {
                prev.size.height = height;
            }
        });
    }

    repaintCanvas(callbackOnImageLoaded: () => any) {
        var image = new Image();
        image.onload = () => callbackOnImageLoaded();
        image.src = this.lastImage;
    }

    updateCanvasPosition() {
        if (!this.canvas.current) throw "Missing canvas element";

        var bounds = this.canvas.current.getBoundingClientRect();
        this.x = bounds.left;
        this.y = bounds.top;
    }
}