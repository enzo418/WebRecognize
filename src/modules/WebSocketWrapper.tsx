interface EventData extends Event {
    /**
     * Returns the data of the message.
     */
    readonly data: object;
}

interface IWrapperWebSocket {
    onError(listener: (ev: Event) => any): void;
    onClose(listener: (ev: Event) => any): void;
    onOpen(listener: (ev: Event) => any): void;
    onMessage(messageID:string, listener: (ev: EventData) => any): void;
}

type Callback = (ev: Event) => any;
type MessageCallback = (ev: EventData) => any

/**
 * Wrappers the WebSocket default implementation
 * to enable the user to easily subscribe to custom
 * event (id) sended from our server.
 *
 * Since our server sends the message with the format
 * {key: content}
 * this wrapper just calls all the subscribers to key.
 *
 * There are two default id that are not treated as
 * messages: 'open' and 'close'.
 *
 * The idea behind this wrapper is to have a single
 * callback to when a message is received,
 * and from that function determine the id and call
 * all the subscribers of that id.
 */
export class WrapperWebSocket implements IWrapperWebSocket {
    m_socket: WebSocket;
    m_messageHandlerRegistered: boolean;
    m_openHandlerRegistered: boolean;
    m_closeHandlerRegistered: boolean;
    m_errorHandlerRegistered: boolean;

    // internal websocket handlers for open, close and message
    m_handlers: Record<string, Callback[]>;

    // handler for each message id
    m_messageHandlers: Record<string, MessageCallback[]>;

    constructor(url:string) {
        this.m_socket = new WebSocket(url);
        this.m_messageHandlerRegistered = false;
        this.m_openHandlerRegistered = false;
        this.m_closeHandlerRegistered = false;
        this.m_errorHandlerRegistered = false;

        this.m_handlers = {open: [], close: []};
        this.m_messageHandlers = {};
    }

    public onError(listener: (ev: Event) => any): void {
        this.registerErrorEventHandler(listener);
    }

    public onClose(listener: (ev: Event) => any): void {
        this.registerCloseEventHandler(listener);
    }

    public onOpen(listener: (ev: Event) => any): void {
        this.registerOpenEventHandler(listener);
    }

    public onMessage(id: string, listener: MessageCallback): void {
        this.registerMessageEventHandler(id, listener);
    }

    private onmessage(ev: Event) {
        const evData = (ev as MessageEvent<any>).data;
        let message;

        try {
            message = JSON.parse(evData);
        } catch (error) {
            throw new Error('Couldn\'t parse the websocket data event.');
        }

        const keys = Object.keys(message);

        if (keys.length === 1) {
            const id = keys[0];
            const content = message[id];
            const res: EventData = {data: content, ...ev};

            // call the handlers
            this.callMessageHandlers(id, res);
        } else {
            console.warn(`WARNING: couldn\'t handle event,
            probably wrong format sended from server.`);
        }
    }

    private onclose(ev: Event) : void {
        this.callInternalHandlers('close', ev);
    }

    private onopen(ev: Event) : void {
        this.callInternalHandlers('open', ev);
    }

    private onerror(ev: Event) : void {
        this.callInternalHandlers('error', ev);
    }

    private registerMessageEventHandler(
        id: string,
        callback: MessageCallback) {
        if (!this.m_messageHandlerRegistered) {
            this.m_socket.addEventListener('message', this.onmessage.bind(this));
            this.m_messageHandlerRegistered = true;
        }

        if (id in this.m_messageHandlers) {
            this.m_messageHandlers[id].push(callback);
        } else {
            this.m_messageHandlers[id] = [callback];
        }
    }

    private registerCloseEventHandler(callback: Callback) {
        if (!this.m_closeHandlerRegistered) {
            // we need to use arrow function to save the context
            // since addEventListener callback needs two parameters,
            // 'this', a WebSocket and 'event', an Event.
            this.m_socket.addEventListener('close', (ev: Event) => {
                this.onclose(ev);
            });
            this.m_closeHandlerRegistered = true;
        }

        this.m_handlers.close.push(callback);
    }

    private registerOpenEventHandler(callback: Callback) {
        if (!this.m_openHandlerRegistered) {
            this.m_socket.addEventListener('open', (ev: Event) => {
                this.onopen(ev);
            });
            this.m_openHandlerRegistered = true;
        }

        this.m_handlers.open.push(callback);
    }

    private registerErrorEventHandler(callback: Callback) {
        if (!this.m_errorHandlerRegistered) {
            this.m_socket.addEventListener('error', (ev: Event) => {
                this.onerror(ev);
            });
            this.m_errorHandlerRegistered = true;
        }

        this.m_handlers.error.push(callback);
    }

    private callInternalHandlers(id:string, ev: Event) {
        for (let i = 0; i < this.m_handlers[id].length; i++) {
            this.m_handlers[id][i](ev);
        }
    }

    private callMessageHandlers(id: string, ev: EventData) {
        for (let i = 0; i < this.m_handlers[id].length; i++) {
            this.m_messageHandlers[id][i](ev);
        }
    }
}
