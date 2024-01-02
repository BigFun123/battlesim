export const EVT_SETPLAYER = "setplayer";
export const EVT_SHOWPOS = "showpos";
export const EVT_LOADMISSION = "loadmission";
export const EVT_SETSTATE = "setstate";
export const EVT_PROGRESS = "progress";  // {text: "Loading", progress: 0-100}
export const EVT_PLAYERUPDATE = "playerupdate";
export const EVT_SETVOLUME = "setvolume";
export const EVT_FOG = "fog";

export class Bus {
    static subscribers = {};

    static startime = 0;
    constructor() {
    }

    static subscribe(event, callback) {        
        if (!this.subscribers[event]) {            
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
        Bus.startime = Date.now();
    }

    static send(event, data) {
        if (!this.subscribers[event]) {
            return;
        }
        // output current ms
        //console.log(event, Date.now() - Bus.startime);
        this.subscribers[event].forEach(callback => callback(data));
    }
}