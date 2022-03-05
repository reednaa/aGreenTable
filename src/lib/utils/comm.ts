
import { writable, type Writable } from 'svelte/store';

export let username = writable("");



export function PickupCard() {

}


export default class Connection {
    socket: WebSocket
    identifier: string

    constructor(channel: string, identifier: string) {
        this.identifier = identifier;

        this.socket = new WebSocket("wss://demo.piesocket.com/v3/channel_1?api_key=oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQj4AwARJuAgtjhzKxVEjQU6IdCjwm&notify_self");

        this.socket.addEventListener('open', function (event) {
            console.log("Socket connection opened.");
            this.send(identifier + " joined!");
        });

        this.socket.addEventListener('message', function (event) {
            console.log('Message from server ', event.data);
        });

    }


}
