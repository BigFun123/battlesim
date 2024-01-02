import { PointerEventTypes } from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Bus, EVT_PROGRESS, EVT_SETSTATE, EVT_SHOWPOS } from "./Bus";
import { STATE_GAME } from "./Constants";
import { CSettings } from "./CSettings";

export class CKeyboard {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};

        Bus.subscribe(EVT_SETSTATE, (state) => {
            if (state == STATE_GAME) {
                const canvas = document.getElementById("renderCanvas"); // Get the canvas element
                scene.onPointerObservable.addOnce(function (e) {

                    if (e.type === PointerEventTypes.POINTERTAP) {
                        // Pointerlock on any click.
                        canvas.requestPointerLock()
                    }

                })
            } else {
                const canvas = document.getElementById("renderCanvas"); // Get the canvas element
                //canvas.cancelPointerLock();
            }
        });

        // get mouse button press
        document.addEventListener('mousedown', (event) => {
            //event.preventDefault();
            if (event.button == 1) {
                Bus.send("control", { input: "fire1" });
            }
            if (event.button == 2) {
                Bus.send("control", { input: "fire2" });
            }
        });

        document.addEventListener('keydown', (event) => {
            //event.preventDefault();
            this.keys[event.code] = true;
            if (CSettings.settings.debug) {
                console.log(event.code);
            }
            
            // if shift is down set the multiplier to 10
            let multiplier = 1;
            if (event.shiftKey) {
                multiplier = 10;
            }

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
            if (event.code == "KeyX") {
                Bus.send("control", { input: "fire2" });
            }

            if (event.code == "NumpadMultiple") {
                Bus.send("radar", { scale: 1 });
            }
            if (event.code == "NumpadDivide") {
                Bus.send("radar", { scale: -1 });
            }


            if (event.code == "KeyC") {
                Bus.send("camera", { mode: 0 });
            }
            if (event.shiftKey) {

                if (event.code == "Digit1") {
                    Bus.send("camera", { mode: 0 });
                }
                if (event.code == "Digit2") {
                    Bus.send("camera", { mode: 1 });
                }
                if (event.code == "Digit3") {
                    Bus.send("camera", { mode: 2 });
                }

                if (event.code == "Digit4") {
                    Bus.send("camera", { mode: 3 });
                }
            }



            if (event.code == "NumpadAdd") {
                Bus.send("tweak", { amty: multiplier });
            }
            if (event.code == "Numpad0") {
                Bus.send(EVT_PROGRESS, { text: "test", progress: Math.random() });
            }
            if (event.code == "NumpadSubtract") {
                Bus.send("tweak", { amty: -multiplier });
            }
            if (event.code == "Numpad4") {
                Bus.send("tweak", { amtx: multiplier });
            }
            if (event.code == "Numpad6") {
                Bus.send("tweak", { amtx: -multiplier });
            }
            if (event.code == "Numpad8") {
                Bus.send("tweak", { amtz: multiplier });
            }
            if (event.code == "Numpad2") {
                Bus.send("tweak", { amtz: -multiplier });
            }
            //rotation y
            if (event.code == "Numpad7") {
                Bus.send("tweak", { amtrot: 15 * Math.PI / 180 * multiplier });
            }
            if (event.code == "Numpad9") {
                Bus.send("tweak", { amtrot: -15 * Math.PI / 180 * multiplier });
            }
            if (event.code == "Numpad5") {
                Bus.send(EVT_SHOWPOS, {});
            }




            if (event.code == "KeyY") {
                Bus.send("RecordStart", null);
            }
            if (event.code == "KeyU") {
                Bus.send("RecordStop", null);
            }
            if (event.code == "KeyO") {
                Bus.send("RecordPlay", null);
            }

        });

        document.addEventListener('keyup', (event) => {
            //event.preventDefault();
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
            //fire2: this.isDown("Space"),
            fire1: this.isDown("Space"),
            throttleUp: this.isDown("Equal") || this.isDown("KeyR"),
            throttleDown: this.isDown("Minus") || this.isDown("KeyF"),
            yawLeft: this.isDown("KeyQ"),
            yawRight: this.isDown("KeyE"),
            landingGear: this.isDown("KeyG"),
            verticalThrustUp: this.isDown("KeyY"),
            verticalThrustDown: this.isDown("KeyH"),
            ignition: this.isDown("KeyI"),
        };
    }
}