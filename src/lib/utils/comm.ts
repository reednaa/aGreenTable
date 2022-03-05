
import { writable, type Writable } from 'svelte/store';

export let username = writable("");



export function PickupCard() {

}


export default class Connection {
    socket: WebSocket
    identifier: string
    channel: string

    constructor(channel: string, identifier: string) {
        this.channel = channel;
        this.identifier = identifier;

        // const url = new URL(window.location);
        // url.protocol = "ws";
        // url.pathname = "/";
        // url.port = "3001";
        this.socket = new WebSocket("ws://localhost:3001");


        this.socket.onopen = function (event) {
            console.log("Socket connection opened.");
            this.send(["subscribe", "game/" + channel].toString())
        };

        this.socket.onclose = function () {
            console.log("Socket connection closed.");
        };

        this.socket.onmessage = function(event) {
            console.log(event);
        }
    }

    publish(message) {
        this.socket.send([
            "publish",
            "game/" + this.channel,
            message
        ].toString());
    }



}
