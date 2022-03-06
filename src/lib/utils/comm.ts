
import { get, writable, type Writable } from 'svelte/store';
import { dev } from '$app/env';
import { CardGroup, Card } from './deck';
import { goto } from '$app/navigation';

export let username = writable("");



export function PickupCard() {

}

const INIT_TIME = 3000;

export default class Connection {
    socket: WebSocket
    identifier: Writable<string>;
    channel: string
    cardStore: Writable<CardGroup[]>
    chat: Writable<string[]>
    master: string
    onchat: () => void

    constructor(channel: string) {
        this.channel = channel;
        this.identifier = username;
        this.chat = writable([]);
        this.onchat = () => { };
    }

    connect() {
        // @ts-ignore
        const url = new URL(window.location);
        if (!dev) {
            url.href = url.href.replace("https://", "https://socket.")
        }
        url.protocol = dev ? "ws" : "wss";
        url.pathname = "/";
        url.port = "3001";
        const Conn = this;
        const channel = this.channel;
        const identifier = get(this.identifier);
        this.socket = new WebSocket(url);

        this.socket.onopen = function (event) {
            console.log("Socket connection opened.");
            Conn.subscribe("game/" + channel);
            Conn.subscribe("game/" + channel + "/" + identifier);
            Conn.subscribe("game/" + channel + "/" + identifier + "/init");
            Conn.publish(
                { action: "join", username: identifier },
                "game/" + channel
            )
            Conn.publish(
                { action: "requestMaster", username: identifier }
            )
            Conn.publish(
                { action: "requestSurface", username: identifier }
            )

            setTimeout(() => {
                Conn.unsubscribe("game/" + channel + "/" + identifier + "/init")
            }, INIT_TIME);

            setTimeout(() => {
                if (!Conn.master) {
                    Conn.master = identifier;
                    Conn.publish({ action: "setMaster", newMaster: identifier });
                }
            }, INIT_TIME);
        };

        this.socket.onclose = function () {
            console.log("Socket connection closed.");
        };

        this.socket.onmessage = function (event) {
            console.log("Message received")
            try {
                const message = JSON.parse(event.data);
                console.log(message);

                switch (message.action) {
                    case "chat":
                        Conn.log(`${message.sign}: ${message.msg}`)

                        break;
                    case "whisper":
                        Conn.log(`${message.sign} whispered: ${message.msg}`)

                        break;
                    case "moveCard":
                        Conn.cardStore.update(cc => {
                            cc[message.i].x = message.x;
                            cc[message.i].y = message.y;
                            // cc[message.i].lifted = message.lifted;  TODO: Better way to comm this over.
                            return cc;
                        });
                        // Conn.log(`${message.sign} moved card ${message.i} to [${message.x}, ${message.y}]`)

                        break;
                    case "splitCards":
                        Conn.cardStore.update((cc) => {
                            const clickedCardGroup = cc[message.i];
                            const popCard = clickedCardGroup.cards.pop();
                            cc[message.i] = clickedCardGroup;
                            const nextLiftedCard = cc.push(
                                new CardGroup(
                                    popCard,
                                    clickedCardGroup.x,
                                    clickedCardGroup.y,
                                    message.z,
                                    clickedCardGroup.flipped
                                )
                            );
                            return cc;
                        });
                        Conn.log(`${message.sign} split cards ${message.i}]`)
                        break;
                    case "flipCard":
                        Conn.cardStore.update(cc => {
                            cc[message.i].flipped = message.flipped;
                            console.log(cc)
                            return cc;
                        });
                        Conn.log(`${message.sign} flipped card ${message.i} to ${message.flipped}`)

                        break;
                    case "lockCard":
                        Conn.cardStore.update((cc) => {
                            cc[message.i].locked = message.locked;
                            return cc;
                        });
                        break;
                    case "combineCards":
                        Conn.cardStore.update((cc) => {
							let to = message.to;
							let from = message.from;
							console.log(from + " to " + to + " via websockets");
							cc[to].add(cc.splice(from, 1)[0]);
							return cc;
						});
                        break;
                    case "postSurface":
                        Conn.log(`Playing surface was updated from ${message.sign}`)

                        const create: CardGroup[] = []
                        for (let grp of message.data) {
                            const cards: Card[] = []
                            for (let crd of grp.cards) {
                                cards.push(
                                    new Card(crd)
                                )
                            }
                            const a = new CardGroup(cards, grp.x, grp.y, grp.z, grp.flipped)
                            a.locked = grp.locked;
                            create.push(
                                a
                            );
                        }
                        Conn.cardStore.update(cc => {
                            return create;
                        });

                        break;

                    case "requestSurface":
                        if (Conn.master) {
                            Conn.log(`${message.sign} requested playing surface. Providing...`)

                            Conn.postSurface();
                        }

                        break;

                    case "join":
                        Conn.log(`${message.sign} joined.`)

                        if (message.username == Conn.identifier) {
                            Conn.publish({
                                action: "denyUsername",
                                taken: true,
                            }, "game/" + Conn.channel + "/" + Conn.identifier + "/init")
                        }

                        break;

                    case "denyUsername":
                        goto("/")
                        break;

                    case "requestMaster":
                        if (Conn.master == get(Conn.identifier)) {
                            Conn.publish({
                                action: "denyMaster",
                                master: Conn.master
                            });
                        }
                        break;

                    case "denyMaster":
                        Conn.master = message.master;
                        Conn.log(`${message.master} is the master`)
                        break;

                    case "setMaster":
                        // if (message.sign == Conn.master) {
                        Conn.master = message.newMaster;
                        Conn.log(`${message.newMaster} is the new master`)
                        // }
                        break;

                    default:
                        break;
                }
            } catch (err) {
                console.log(err);
                console.log(event.data);
            }
        }
    }

    postSurface() {
        this.publish({
            action: "postSurface",
            data: get(this.cardStore)
        });
    }

    destroy() {
        if (this.socket) {
            this.socket.close();
        }
    }

    publish(data: any, topic = null) {
        if (this.socket && (this.socket?.readyState == this.socket?.OPEN)) {
            console.log("message sent");
            if (dev) {
                console.log(data)
                console.log(topic ? topic : "game/" + this.channel)
            }
            data.sign = get(this.identifier);
            this.socket?.send(JSON.stringify({
                action: "publish",
                topic: topic ? topic : "game/" + this.channel,
                data: data,
            }));
        }
    }

    say(msg: string) {
        this.publish({ action: "chat", msg: msg });
        this.log(`${get(this.identifier)}: ${msg}`)
    }

    whisper(msg: string, to: string) {
        this.publish({ action: "whisper", msg: msg }, "game/" + this.channel + "/" + to);
        this.log(`${get(this.identifier)} whispered: ${msg}`)
    }

    subscribe(topic: string) {
        this.socket?.send(JSON.stringify({
            action: "subscribe",
            topic: topic
        }));
    }

    unsubscribe(topic: string) {
        this.socket?.send(JSON.stringify({
            action: "unsubscribe",
            topic: topic
        }));
    }

    log(str: string) {
        this.chat.update(cc => { cc.push(str); return cc });
        setTimeout(() => {
            this.onchat();
        }, 1)
    }

    // Card stuff

    flipCard(i: number, flipped: boolean) {
        this.publish({
            action: "flipCard",
            i: i,
            flipped: flipped
        })
    }

    lockCard(i: number, locked: boolean) {
        this.publish({
            action: "lockCard",
            i: i,
            locked: locked
        })
    }

    moveCard(i: number, x: number, y: number, lifted = false) {
        this.publish({
            action: "moveCard",
            i: i,
            x: x,
            y: y,
            lifted: lifted
        });
    }

    splitCards(i: number, z: number) {
        this.publish({
            action: "splitCards",
            i: i,
            z: z
        });
    };

    combineCards(to: number, from: number) {
        this.publish({
            action: "combineCards",
            to: to,
            from: from
        });
    }


}
