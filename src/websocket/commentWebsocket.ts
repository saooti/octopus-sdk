import { CommentMessage } from "@/stores/class/config/commentsConfig";
import WssConnection, { WssStatus } from "./wss";

export default class CommentEngine {
    uri: string;
    connection: WssConnection | undefined;
    subscribedEventComment: number|undefined;
    onStatusChange: (status: WssStatus) => void;

    constructor(wssDomain: string, onStatusChange: (status: WssStatus) => void = () => {}) {
        this.uri = wssDomain;
        this.connection = undefined;
        this.subscribedEventComment = undefined;
        this.onStatusChange = onStatusChange;
    }

    async initialize(): Promise<void> {
        this.connection = new WssConnection(this.uri, "websocket", this.onStatusChange);
        await this.connection.connect();
    }
    async close(): Promise<void> {
        if (!this.connection) {
            return;
        }
        await this.connection.disconnect();
        this.connection = undefined;
    }

    subscribeToPodcastCommentEventBus(
        podcastId: number,
        queueName: string,
        callback: (jsonMessage: CommentMessage) => void,
    ): void {
        if (!this.connection) {
            throw new Error(
                "Websocket engine must be initialized, before it can subscribe to any events",
            );
        }
        if (podcastId) {
            this.connection.subscribe(
                queueName,
                (message) => {
                    const jsonMessage = JSON.parse(message.body);
                    callback.call(this, jsonMessage);
                },
            );
            this.subscribedEventComment = podcastId;
        }
    }

    unsubscribeToPodcastCommentEventBus(podcastId: number, queueName: string): void {
        if (!this.connection) {
            throw new Error(
                "Websocket engine must be initialized, before it can unsubscribe to any events",
            );
        }
        if (!podcastId) {
            throw new Error(
                "Cannot unsubscribe to comments event bus if no id provided",
            );
        }
        this.connection.unsubscribe(queueName);
        this.subscribedEventComment = undefined;
    }

    isPodcastCommentEventConnected(podcastId: number): boolean {
        return podcastId===this.subscribedEventComment;
    }
}
