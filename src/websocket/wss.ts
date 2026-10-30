import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";

/** State of the websocket connection */
export enum WssStatus {
    /** Client not started, or deliberately stopped with `disconnect()`. No reconnection will happen */
    INACTIVE = "INACTIVE",
    /** A connection attempt (initial or automatic reconnection) is in progress */
    CONNECTING = "CONNECTING",
    /** Connected to the server; subscriptions are active and messages are received */
    CONNECTED = "CONNECTED",
    /** Connection lost unexpectedly; the client is waiting before its next reconnection attempt (exponential backoff) */
    DISCONNECTED = "DISCONNECTED",
}

type MessageCallback = (message: IMessage) => void | Promise<void>;

export default class WssConnection {
    url: string;
    endpoint: string;
    client: Client | undefined;
    /** Wanted subscriptions, kept across reconnections */
    topics: Map<string, MessageCallback>;
    /** Live subscriptions, lost when the socket closes */
    stompSubscriptions: Map<string, StompSubscription>;
    queuedMessages: Array<{ message: IMessage; callback: MessageCallback }>;
    processingMsg: boolean;
    onStatusChange: (status: WssStatus) => void;

    /**
   * @param url url of the wss
   * @param endpoint of the wss
   * @param onStatusChange called each time the connection status changes
   */
    constructor(
        url: string,
        endpoint: string,
        onStatusChange: (status: WssStatus) => void = () => {},
    ) {
        this.url = url;
        this.endpoint = endpoint;
        this.client = undefined;
        this.topics = new Map();
        this.stompSubscriptions = new Map();
        this.queuedMessages = [];
        this.processingMsg = false;
        this.onStatusChange = onStatusChange;
    }

    async processQueuedMessages() {
        if (this.processingMsg) {
            return;
        }
        const queued = this.queuedMessages.shift();
        if (!queued) {
            return;
        }
        this.processingMsg = true;
        try {
            await queued.callback(queued.message);
        } catch (error) {
            console.error(error);
        }
        this.processingMsg = false;
        this.processQueuedMessages();
    }

    /**
   * Start the client. Does not wait for the connection to be opened: the
   * client keeps retrying until `disconnect()` is called, and subscriptions
   * are applied as soon as it is connected.
   */
    async connect(): Promise<void> {
        if (this.client?.active) {
            return;
        }
        const [{ default: SockJS }, stompModule] = await Promise.all([
            import("sockjs-client/dist/sockjs"),
            import("@stomp/stompjs"),
        ]);
        // In browsers, stompjs resolves to its UMD bundle, which Vite only exposes
        // as a default export
        const { Client, ReconnectionTimeMode } =
            (stompModule as { default?: typeof stompModule }).default ?? stompModule;
        this.client = new Client({
            webSocketFactory: () =>
                new SockJS("https://" + this.url + "/" + this.endpoint),
            heartbeatIncoming: 2000,
            heartbeatOutgoing: 2000,
            reconnectDelay: 1000,
            maxReconnectDelay: 30000,
            reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
            beforeConnect: () => this.onStatusChange(WssStatus.CONNECTING),
            onConnect: () => {
                this.stompSubscriptions.clear();
                this.topics.forEach((callback, topic) =>
                    this.doSubscribe(topic, callback),
                );
                this.onStatusChange(WssStatus.CONNECTED);
            },
            onWebSocketClose: () =>
                this.onStatusChange(
                    this.client?.active ? WssStatus.DISCONNECTED : WssStatus.INACTIVE,
                ),
            onStompError: (frame) => console.error(frame.headers.message),
        });
        this.client.activate();
    }

    subscribe(topic: string, callback: MessageCallback): void {
        this.topics.set(topic, callback);
        if (this.client?.connected) {
            this.doSubscribe(topic, callback);
        }
    }

    unsubscribe(topic: string): void {
        if (!topic) {
            throw new Error(
                "Cannot remove subscription if no search pattern is founded",
            );
        }
        this.topics.delete(topic);
        try {
            this.stompSubscriptions.get(topic)?.unsubscribe();
        } catch {
            console.warn("Error while unsubscribing from " + topic);
        }
        this.stompSubscriptions.delete(topic);
    }

    async disconnect(): Promise<void> {
        await this.client?.deactivate();
        this.onStatusChange(WssStatus.INACTIVE);
    }

    private doSubscribe(topic: string, callback: MessageCallback): void {
        if (!this.client) {
            return;
        }
        this.stompSubscriptions.set(
            topic,
            this.client.subscribe(topic, (message) => {
                this.queuedMessages.push({ message, callback });
                this.processQueuedMessages();
            }),
        );
    }
}
