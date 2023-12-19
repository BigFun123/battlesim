class CKeyboard {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};

        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            console.log(event.code);
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
            if (event.code == "Digit1") {
                Bus.send("camera", 0);
            }
            if (event.code == "Digit2") {
                Bus.send("camera", 1);
            }
            if (event.code == "Digit3") {
                Bus.send("camera", 2);
            }
            if (event.code == "Numpad4") {
                Bus.send("tweak1", 0.1);
            }
            if (event.code == "Numpad6") {
                Bus.send("tweak1", -0.1);
            }
            if (event.code == "Numpad8") {
                Bus.send("tweak2", 0.1);
            }
            if (event.code == "Numpad2") {
                Bus.send("tweak2", -0.1);
            }
            if (event.code == "KeyY") {
                Bus.send("RecordStart", 0.1);
            }
            if (event.code == "KeyU") {
                Bus.send("RecordStop", 0.1);
            }
            if (event.code == "KeyO") {
                Bus.send("RecordPlay", 0.1);
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