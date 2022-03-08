
import { get, writable, type Writable } from 'svelte/store';
import { dev } from '$app/env';
import { CardGroup, Card } from './deck';
import { goto } from '$app/navigation';

export let username = writable("");



export function PickupCard() {

}

const INIT_TIME = 1250;

export default class Connection {
    socket: WebSocket
    identifier: Writable<string>;
    channel: string
    cardStore: Writable<CardGroup[]>
    handStore: Writable<{ [username: string]: CardGroup }>
    chat: Writable<string[]>
    master: string
    connectedUsers: Writable<string[]>;
    oldUsername = "";
    onchat: () => void

    constructor(channel: string) {
        this.channel = channel;
        this.identifier = username;
        this.chat = writable([]);
        this.onchat = () => { };
        this.connectedUsers = writable([]);
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
                { action: "join", username: identifier }
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
                    if (!+get(Conn.connectedUsers)[0]) {
                        Conn.connectedUsers.set([identifier]);
                        Conn.publish({
                            action: "denyMaster",
                            master: Conn.master,
                            users: get(Conn.connectedUsers)
                        });
                    }
                    console.log(get(Conn.connectedUsers))
                }
            }, INIT_TIME);
        };

        this.socket.onclose = function () {
            console.log("Socket connection closed.");
        };

        this.socket.onmessage = function (event) {
            try {
                const message = JSON.parse(event.data);
                console.log("Message received for " + message.action);
                const connUsers = get(Conn.connectedUsers);
                const ID = get(Conn.identifier)
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
                        // Conn.log(`${message.sign} split cards ${message.i}`)
                        break;
                    case "flipCard":
                        Conn.cardStore.update(cc => {
                            cc[message.i].flipped = message.flipped;
                            return cc;
                        });
                        // Conn.log(`${message.sign} flipped card ${message.i} to ${message.flipped}`)

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
                            // console.log(from + " to " + to + " via websockets");
                            cc[to].add(cc.splice(from, 1)[0]);
                            return cc;
                        });
                        break;
                    case "pickupCard":
                        let puC: CardGroup[];
                        Conn.cardStore.update(cc => {
                            puC = cc.splice(message.i, 1);
                            return cc
                        });
                        Conn.handStore.update(cc => {
                            const selected = cc[message.user];
                            if (selected) {
                                cc[message.user].add(puC[0]);
                            } else {
                                cc[message.user] = puC[0];
                            }
                            return cc;
                        })
                        break;
                    case "dropCard":
                        let dC: CardGroup;
                        Conn.handStore.update(cc => {
                            dC = new CardGroup(cc[message.user].cards.splice(message.i, 1),
                                cc[message.user]?.x,
                                cc[message.user]?.y
                            );
                            return cc;
                        });
                        Conn.cardStore.update((cc) => {
                            cc.push(
                                dC
                            );
                            return cc;
                        });
                    case "postSurface":
                        Conn.log(`Got state from ${message.sign}`)

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
                        Conn.connectedUsers.set(message.users);

                        break;
                    case "requestSurface":
                        Conn.log(`${message.sign} requested playing surface. `)
                        if (Conn.master == ID) {
                            Conn.log("Providing...")

                            Conn.postSurface();
                        }

                        break;
                    case "join":
                        Conn.connectedUsers.update(cc => { cc.push(message.sign); return cc });
                        Conn.log(`${message.sign} joined as number ${get(Conn.connectedUsers).length}.`)

                        if (message.username == Conn.identifier) {
                            Conn.publish({
                                action: "denyUsername",
                                taken: true,
                            }, "game/" + Conn.channel + "/" + Conn.identifier + "/init")
                        }

                        break;
                    case "leave":
                        if (connUsers.includes(message.sign)) {
                            Conn.connectedUsers.update(cc => {
                                cc.splice(cc.indexOf(message.sign), 1);
                                return cc;
                            });
                        }
                        Conn.log(`${message.sign} left.`);

                        break;
                    case "denyUsername":
                        window.location = "/"
                        break;
                    case "requestMaster":
                        if (Conn.master == get(Conn.identifier)) {
                            Conn.publish({
                                action: "denyMaster",
                                master: Conn.master,
                                users: connUsers
                            });
                        }
                        break;
                    case "denyMaster":
                        Conn.master = message.master;
                        Conn.log(`${message.master} is the master`)
                        console.log(message.users);
                        for (let user of message.users) {
                            console.log(user != get(Conn.identifier));
                            if (!connUsers.includes(user)) {
                                Conn.connectedUsers.update(cc => { cc.push(user); return cc; })
                            }
                        }
                        console.log(get(Conn.connectedUsers));
                        if (!get(Conn.connectedUsers).includes(get(Conn.identifier))) {
                            Conn.publish(
                                { action: "join", username: identifier }
                            )
                        }
                        Conn.log(`${message.users} are in this room`);

                        break;
                    case "setMaster":
                        // if (message.sign == Conn.master) {
                        Conn.master = message.newMaster;
                        Conn.log(`${message.newMaster} is the new master`);
                        if ((!+connUsers[0]) && Conn.master == ID) {
                            Conn.connectedUsers.set([ID]);
                            Conn.publish({
                                action: "denyMaster",
                                master: Conn.master,
                                users: get(Conn.connectedUsers)
                            });
                        }
                        // }
                        break;
                    default:
                        console.log("Not implemented")
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
            data: get(this.cardStore),
            users: get(this.connectedUsers)
        });
    }

    destroy() {
        if (this.socket) {
            this.publish(
                {
                    action: "leave"
                }
            )
            if (this.master == get(this.identifier)) {
                this.connectedUsers.update(cc => {
                    cc.splice(cc.indexOf(get(this.identifier)), 1);
                    return cc;
                });
                this.publish({
                    action: "setMaster",
                    newMaster: get(this.connectedUsers)[0]
                });
            }
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

    // pickupCard(who: string, i: number) {
    //     this.publish({
    //         action: "pickupCards",
    //         i: i,
    //         who: who
    //     });

    // }

    // dropCard(who: number, i: number) {
    //     this.publish({
    //         action: "dropCards",
    //         who: who,
    //         i: i
    //     });
    // }


}
