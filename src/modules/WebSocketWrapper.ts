export {};

interface EventData extends Event {
    /**
     * Returns the data of the message.
     */
    readonly data: any;
}

type Callback = (ev: Event) => any;
type MessageCallback = (ev: EventData) => any;

export interface EventTypeMap {
    [key: string]: 'int' | 'double' | 'object' | 'boolean' | 'string';
}

export function intParser(data: string): number {
    return parseInt(data);
}

export function floatParser(data: string): number {
    return parseFloat(data);
}

export function stringParser(data: string): string {
    return data;
}

export function jsonParser(data: string): object {
    return JSON.parse(data);
}

export function booleanParser(data: string): boolean {
    return data == 'true' || data == '1';
}

/**
 * Wrappers the WebSocket default implementation
 * to enable the user to easily subscribe to custom
 * event (id) sended from our server.
 *
 * Since our server sends the message with the format
 * key: content
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
export class WrapperWebSocket {
    protected m_socket: WebSocket;
    protected m_messageHandlerRegistered: boolean;
    protected m_openHandlerRegistered: boolean;
    protected m_closeHandlerRegistered: boolean;
    protected m_errorHandlerRegistered: boolean;

    // internal websocket handlers for open, close and message
    protected m_handlers: Record<string, Callback[]>;

    // handler for each message id
    protected m_messageHandlers: Record<string, MessageCallback[]>;

    // parser for each message id
    protected m_messageParsers: Record<string, (data: string) => any>;

    constructor(url: string) {
        this.m_socket = new WebSocket(url);
        this.m_messageHandlerRegistered = false;
        this.m_openHandlerRegistered = false;
        this.m_closeHandlerRegistered = false;
        this.m_errorHandlerRegistered = false;

        this.m_handlers = { open: [], close: [] };
        this.m_messageHandlers = {};
        this.m_messageParsers = {};
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

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        this.m_socket.send(data);
    }

    public close() {
        this.m_socket.close();
    }

    /**
     * Register a message callback with a function to parse the data received
     * @param id event id
     * @param listener callback
     * @param parser parse the string into some type, parsers are provided by this unit.
     */
    public onMessage(
        id: string,
        listener: MessageCallback,
        parser: (data: string) => any,
    ): void {
        this.m_messageParsers[id] = parser;

        this.registerMessageEventHandler(id, listener);
    }

    private onmessage(ev: Event) {
        const evData = (ev as MessageEvent<any>).data;

        const processStringEventData = (eventData: string) => {
            const [id, data] = eventData.split(/:(.*)/s);

            if (!id) {
                throw Error('Invalid server message');
            }

            let parsed;
            try {
                parsed = this.m_messageParsers[id](data);
            } catch (e) {
                throw Error(`Couldn't parse the data, expected got ${data}`);
            }

            const res: EventData = { ...ev, data: parsed };

            // call the handlers
            this.callMessageHandlers(id, res);
        };

        if (evData instanceof Blob) {
            evData.text().then(res => {
                processStringEventData(res);
            });
        } else {
            processStringEventData(evData);
        }
    }

    private onclose(ev: Event): void {
        this.callInternalHandlers('close', ev);
    }

    private onopen(ev: Event): void {
        this.callInternalHandlers('open', ev);
    }

    private onerror(ev: Event): void {
        this.callInternalHandlers('error', ev);
    }

    private registerMessageEventHandler(id: string, callback: MessageCallback) {
        if (!this.m_messageHandlerRegistered) {
            this.m_socket.addEventListener(
                'message',
                this.onmessage.bind(this),
            );
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

    private callInternalHandlers(id: string, ev: Event) {
        for (let i = 0; i < this.m_handlers[id].length; i++) {
            this.m_handlers[id][i](ev);
        }
    }

    private callMessageHandlers(id: string, ev: EventData) {
        for (let i = 0; i < this.m_messageHandlers[id].length; i++) {
            this.m_messageHandlers[id][i](ev);
        }
    }
}
