
import { writable, type Writable } from 'svelte/store';

export let username = writable("");



export function PickupCard() {

}


export default class Connection {
    socket: WebSocket
    identifier: string

    constructor(channel: string, identifier: string) {
        this.identifier = identifier;

        const url = new URL(window.location);
        url.protocol = "wss"
        url.pathname = "/ws"

        this.socket = new WebSocket(url);

        this.socket.addEventListener('open', function (event) {
            console.log("Socket connection opened.");
            this.send(identifier + " joined!");
        });

        this.socket.addEventListener('message', function (event) {
            console.log('Message from server ', event.data);
        });

    }


}
