import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IMessage, StompConfig } from '@stomp/stompjs';

import WssConnection, { WssStatus } from '@/websocket/wss';

/** Minimal stand-in for the stompjs Client, driven manually by the tests */
class FakeClient {
    static instance: FakeClient;
    config: StompConfig;
    connected = false;
    active = false;
    subscribe = vi.fn<(topic: string, callback: (message: IMessage) => void) => { unsubscribe: () => void }>(() => ({ unsubscribe: vi.fn() }));

    constructor(config: StompConfig) {
        this.config = config;
        FakeClient.instance = this;
    }

    activate(): void {
        this.active = true;
    }

    async deactivate(): Promise<void> {
        this.active = false;
        this.connected = false;
    }

    /** Simulate a successful connection (initial or reconnection) */
    open(): void {
        this.config.beforeConnect?.(this as never);
        this.connected = true;
        this.config.onConnect?.({} as never);
    }

    /** Simulate an unexpected loss of connection */
    drop(): void {
        this.connected = false;
        this.config.onWebSocketClose?.({} as never);
    }
}

vi.mock('@stomp/stompjs', () => ({
    default: undefined,
    Client: FakeClient,
    ReconnectionTimeMode: { EXPONENTIAL: 1 }
}));
vi.mock('sockjs-client/dist/sockjs', () => ({ default: vi.fn() }));

describe('wss', () => {
    let onStatusChange: ReturnType<typeof vi.fn>;
    let connection: WssConnection;

    beforeEach(async () => {
        onStatusChange = vi.fn();
        connection = new WssConnection('example.com', 'websocket', onStatusChange);
        await connection.connect();
    });

    const subscribedTopics = () => FakeClient.instance.subscribe.mock.calls.map(([topic]) => topic);

    it('applies subscriptions made before connection once connected', () => {
        connection.subscribe('/topic/a', vi.fn());
        expect(subscribedTopics()).toEqual([]);

        FakeClient.instance.open();
        expect(subscribedTopics()).toEqual(['/topic/a']);
    });

    it('restores each subscription exactly once after a reconnection', () => {
        FakeClient.instance.open();
        connection.subscribe('/topic/a', vi.fn());
        connection.subscribe('/topic/b', vi.fn());

        FakeClient.instance.drop();
        FakeClient.instance.subscribe.mockClear();
        FakeClient.instance.open();

        expect(subscribedTopics()).toEqual(['/topic/a', '/topic/b']);
    });

    it('does not restore unsubscribed topics', () => {
        FakeClient.instance.open();
        connection.subscribe('/topic/a', vi.fn());
        connection.unsubscribe('/topic/a');

        FakeClient.instance.drop();
        FakeClient.instance.subscribe.mockClear();
        FakeClient.instance.open();

        expect(subscribedTopics()).toEqual([]);
    });

    it('forwards received messages to the callback', async () => {
        const callback = vi.fn();
        FakeClient.instance.open();
        connection.subscribe('/topic/a', callback);

        const message = { body: '{}' } as IMessage;
        FakeClient.instance.subscribe.mock.calls[0][1](message);

        expect(callback).toHaveBeenCalledWith(message);
    });

    it('reports status changes', async () => {
        FakeClient.instance.open();
        FakeClient.instance.drop();
        FakeClient.instance.open();
        await connection.disconnect();

        expect(onStatusChange.mock.calls.map(([status]) => status)).toEqual([
            WssStatus.CONNECTING,
            WssStatus.CONNECTED,
            WssStatus.DISCONNECTED,
            WssStatus.CONNECTING,
            WssStatus.CONNECTED,
            WssStatus.INACTIVE
        ]);
    });

    it('supports stompjs being exposed only as a default export', async () => {
        vi.resetModules();
        vi.doMock('@stomp/stompjs', () => ({
            default: { Client: FakeClient, ReconnectionTimeMode: { EXPONENTIAL: 1 } }
        }));
        const { default: DefaultWssConnection } = await import('@/websocket/wss');
        await new DefaultWssConnection('example.com', 'websocket').connect();
        expect(FakeClient.instance.active).toBe(true);
        vi.doUnmock('@stomp/stompjs');
    });
});
