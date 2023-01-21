import {WebSocket} from "ws";

export class User {

    public name: string;
    public userId: string;
    private _ws: WebSocket | undefined;
    public lastActivity: Date;


    constructor(name: string, token: string) {
        this.name = name;
        this.lastActivity = new Date();
        this.userId = token;
    }

    get ws(): WebSocket | undefined {
        return this._ws;
    }

    set ws(value: WebSocket | undefined) {
        this._ws = value;
    }

    toJSON() {
        return {
            name: this.name,
            lastActivity: this.lastActivity
        }
    }

}