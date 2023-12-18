class CKeyboard {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};

        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            //console.log(event);
            if (event.code == "KeyP") {
                this.scene.debugLayer.show();
            }
            if (event.code == "KeyI") {
                Bus.send("control", { input: "ignition" });
            }
            if (event.code == "KeyG") {
                Bus.send("control", { input: "landinggear" });
            }
            if (event.code == "Backquote") {
                Bus.send("control", { input: "reset" });
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
    }

    isDown(key) {
        //return this.keys[this.keyCodes[key]] === true;
        return this.keys[key] === true;
    }

    getInputs() {
        return {
            left: this.isDown("KeyA"),
            right: this.isDown("KeyD"),
            up: this.isDown("KeyW"),
            down: this.isDown("KeyS"),
            fire: this.isDown("Space"),
            throttleUp: this.isDown("Equal"),
            throttleDown: this.isDown("Minus"),
            yawLeft: this.isDown("KeyQ"),
            yawRight: this.isDown("KeyE"),            
            landingGear: this.isDown("KeyG"),
            verticalThrustUp: this.isDown("KeyR"),
            verticalThrustDown: this.isDown("KeyF"),
            ignition: this.isDown("KeyI"),
        };
    }
}