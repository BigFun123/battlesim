class Bus {
    static subscribers = {};
    constructor() {
        
    }

    static subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }

    static send(event, data) {
        if (!this.subscribers[event]) {
            return;
        }
        this.subscribers[event].forEach(callback => callback(data));
    }
}