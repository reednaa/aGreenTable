
import { get, writable, type Writable } from 'svelte/store';
import { CardGroup, Card } from './deck';

export let username = writable("");



export function PickupCard() {

}


export default class Connection {
    socket: WebSocket
    identifier: string
    channel: string
    surfaceStore: Writable<CardGroup[]>

    constructor(channel: string, identifier: string) {
        const Conn = this;
        this.channel = channel;
        this.identifier = identifier;

        const url = new URL(window.location);
        url.href = url.href.replace("https://", "https://_socket.")
        url.protocol = "ws";
        url.pathname = "/";
        url.port = "3001";
        this.socket = new WebSocket(url);

        this.socket.onopen = function (event) {
            console.log("Socket connection opened.");
            Conn.subscribe("game/" + channel);
            Conn.subscribe("game/" + channel + "/" + identifier);
        };

        this.socket.onclose = function () {
            console.log("Socket connection closed.");
        };

        this.socket.onmessage = function(event) {
            console.log("Message received")
            try {
                const message = JSON.parse(event.data);
                console.log(message);

                switch (message.action) {
                    case "move":
                        Conn.surfaceStore.update(cc => {
                            cc[message.i].x = message.x;
                            cc[message.i].y = message.y;
                            return cc;
                        })
                        
                        break;

                    case "postSurface":
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
                        Conn.surfaceStore.update(cc => {
                            return create;
                        });

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
            data: get(this.surfaceStore)
        });
    }

    destroy() {
        this.socket.close();
    }

    publish(data: any) {
        this.socket.send(JSON.stringify({
            action: "publish", 
            topic: "game/" + this.channel,
            data: data
        }));
    }

    subscribe(topic: string) {
        this.socket.send(JSON.stringify({
            action: "subscribe", 
            topic: topic
        }));
    }



}
