/* eslint-disable */
let SockJS: any = null;
let Stomp: any = null;
/* eslint-enable */

interface Subscription {
  id: string;
  topic: string;
  callback: (message: { body: string }) => void;
  subscription?: () => void;
}

export default class WssConnection {
  url: string;
  endpoint: string;
  subscriptions: Array<Subscription>;
  /* eslint-disable */
  socket: {
    (url: string, _reserved?: any, options?: SockJS.Options | undefined): WebSocket;
    new (url: string, _reserved?: any, options?: SockJS.Options | undefined): WebSocket;
    prototype: WebSocket;
    CONNECTING: SockJS.CONNECTING;
    OPEN: SockJS.OPEN;
    CLOSING: SockJS.CLOSING;
    CLOSED: SockJS.CLOSED;
  }|undefined ;
  client: any;
  queuedMessages: Array<any>;
  processingMsg: boolean;
  wssBroken: boolean;
  /* eslint-enable */
  /**
   *
   * @param {String} url url of the wss
   * @param {String} endpoint of the wss
   * @param {Map<String, Function>} topics list of topics and associated callback
   */
  constructor(url: string, endpoint: string) {
    this.url = url;
    this.endpoint = endpoint;
    this.subscriptions = [];
    this.processingMsg = false;
    this.queuedMessages = [];
    this.wssBroken = false;
  }
  async processQueuedMessages() {
    if (this.processingMsg) {
      return;
    }
    if (this.queuedMessages.length === 0) {
      return;
    }
    this.processingMsg = true;
    try {
      const message = this.queuedMessages.shift();
      await message.callback(message.message);
    } catch (error) {
      console.log(error);
    }
    this.processingMsg = false;
    this.processQueuedMessages();
  }

  async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      (async () => {
        if (null === SockJS) {
          await import("sockjs-client/dist/sockjs").then((sockLibrary) => {
            SockJS = sockLibrary.default;
          });
        }
        if (null === Stomp) {
          await import("@stomp/stompjs").then((stompLibrary) => {
            Stomp = stompLibrary.Stomp;
          });
        }
        this.socket = new SockJS("https://" + this.url + "/" + this.endpoint);
        this.client = Stomp.over(this.socket);
        this.client.heartbeat.outgoing = 2000;
        this.client.heartbeat.incoming = 2000;
        this.client.debug = (sockMessage: string) => {
          if (
            sockMessage.includes("did not receive server activity for the last")
          ) {
            this.wssBroken = true;
          }
        };
        this.client.onConnect = () => {
          this.connectionSuccess();
          resolve();
        };
        this.client.onStompError = () => {
          this.wssBroken = true;
          this.connectionErrorReconnect();
          reject(new Error());
        };
        this.client.onWebSocketError = () => {
          this.wssBroken = true;
          this.connectionErrorReconnect();
          reject(new Error());
        };
        this.client.onDisconnect = () => {
          this.connectionErrorReconnect();
          reject(new Error());
        };
        this.client.onWebSocketClose = () => {
          this.connectionErrorReconnect();
          reject(new Error());
        };

        this.client.activate();
      })();
    });
  }

  async connectionErrorReconnect() {
    if (!this.wssBroken) {
      return;
    }
    console.log("Error in ws try to reconnect");
    setTimeout(() => {
      this.connect();
    }, 10);
    this.wssBroken = false;
  }

  connectionSuccess(): void {
    this.subscriptions.forEach((element: Subscription) => {
      // On récupère tous les évènements freeswitch
      try {
        this.subscribe(element.topic, element.callback);
      } catch {
        setTimeout(() => {
          this.connect();
        }, 10000);
        return;
      }
    });
  }

  subscribe(topic: string, callback: (message: { body: string }) => any): void {
    const subscription = this.client.subscribe(topic, (message: any) => {
      this.queuedMessages.push({ message: message, callback: callback });
      this.processQueuedMessages();
    });
    this.subscriptions.push({
      id: subscription.id,
      topic: topic,
      callback: callback,
    });
  }

  unsubscribe(topic: string): void {
    if (!topic) {
      throw new Error(
        "Cannot remove subscription if no search pattern is founded",
      );
    }
    const removedSubscriptions: Array<Subscription> = [];
    this.subscriptions.forEach((item: Subscription) => {
      let valid = true;
      if (item.topic !== topic) {
        valid = false;
      }
      if (valid) {
        removedSubscriptions.push(item);
        try {
          this.client.unsubscribe(item.id);
        } catch {
          console.log("Error while deconnecting client with item " + item.id);
        }
      }
    });
    this.subscriptions = this.subscriptions.filter(
      (item: Subscription) => !removedSubscriptions.includes(item),
    );
  }

  disconnect(): void {
    this.client.deactivate();
  }
}
