import * as GUI from '@babylonjs/gui';
import { Bus, EVT_SETPLAYER, EVT_SETSTATE, EVT_SHOWPOS } from '../Bus.js';
import { CSettings } from '../CSettings.js';
import { GUIHelper } from './GUIHelper.js';
import { Quaternion } from '@babylonjs/core';
import { CGUI } from './CGUI.js';
import { STATE_CREDITS, STATE_GAME } from '../Constants.js';

const altimeter = {
    needle1: "ALT.Needle1",
    needle2: "ALT.Needle2",
    needle3: "ALT.Needle3",
    originalRotation: Quaternion.FromEulerAngles(0, 0, 0),
}

export class CVehicleStatus {
    player = null;
    altitude;
    speed;
    heading;
    ignition;

    statusText = "";

    constructor(scene) {
        this.scene = scene;

        Bus.subscribe(EVT_SETPLAYER, (data) => {
            //this.update(data);
            this.player = data.player;

            if (this.player) {
                this.scene.onBeforePhysicsObservable.add(() => {
                    this.update();
                });
            } else {
                this.scene.onBeforePhysicsObservable.remove(() => {
                    this.update();
                });
            }

            this.setupAltimeter();
        });

        Bus.subscribe(EVT_SHOWPOS, (data) => {
            this.showPos();
        });

        Bus.subscribe(EVT_SETSTATE, (state) => {
            this.gameUI.isVisible = state === STATE_GAME;
        });

        this.setup();
    }

    setupAltimeter() {
        // find mesh named ALT.Needle1
        // find mesh named ALT.Needle2
        // find mesh named ALT.Needle3

        this.player.mesh.getChildMeshes().forEach((m) => {
            if (m.name == altimeter.needle1) {
                this.altNeedle1 = m;
                this.altNeedle1.originalRotation = m.rotationQuaternion.clone();
            }
            if (m.name == altimeter.needle2) {
                this.altNeedle2 = m;
                this.altNeedle2.originalRotation = m.rotationQuaternion.clone();
            }
            if (m.name == altimeter.needle3) {
                this.altNeedle3 = m;
                this.altNeedle3.originalRotation = m.rotationQuaternion.clone();
            }
        });
    }

    showPos() {
        // show a dialog with the player's position and rotation
        let pos = this.player.aggregate.transformNode.position;
        let rot = this.player.aggregate.transformNode.rotationQuaternion;

        const data = {
            "time": 100,
            "data": {
                "position": [
                    -1491.02,
                    333.41,
                    0.01
                ],
                "rotationQuaternion": [
                    0,
                    0.71,
                    0,
                    0.71
                ]
            }
        };

        data.data.position = [pos.x, pos.y, pos.z];
        data.data.rotationQuaternion = [rot.x, rot.y, rot.z, rot.w];

        GUIHelper.createPopup(this.advancedTexture, JSON.stringify(data, null, 2));

    }

    update() {

        if (this.player && this.player.aggregate) {

            this.speed = this.player.aggregate.body.getLinearVelocity().length() * 0.01;
            this.altitude = this.player.aggregate.transformNode.position.y;

            if (this.player.aggregate.transformNode.rotationQuaternion) {
                const anglesInDegrees = this.player.aggregate.transformNode.rotationQuaternion.toEulerAngles().scale(180 / Math.PI);
                this.heading = anglesInDegrees.y;
                this.pitch = anglesInDegrees.x;
                this.roll = anglesInDegrees.z;
            }

            this.fuel = 100;
            this.gear = this.player.landingGear;
            this.flaps = 0;
            this.ammo = "~";
            this.missiles = "~";

            //gameText.text = "IGN\nTHR\nSPD\nALT\nHDG\nPIT\nROL\nFUEL\nGEAR\nFLAPS\n:AMM\nMIS:\n\n\n\n";
            this.statusText.text = `${this.player.ignition}\n${this.player.throttle.toFixed(1)}\n${this.speed.toFixed(1)}\n${this.altitude.toFixed(1)}\n${this.heading.toFixed(1)}\n${this.pitch.toFixed(1)}\n${this.roll.toFixed(1)}\n${this.fuel.toFixed(1)}\n${this.gear}\n${this.flaps}\n${this.ammo}\n${this.missiles}`
        }

        if (CSettings.state == STATE_GAME) {
            if (this.altNeedle1) {
                this.altNeedle1.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, -1 * this.altitude);
            }
            if (this.altNeedle2) {
                this.altNeedle2.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, -0.1 * this.altitude)
            }
            if (this.altNeedle3) {
                this.altNeedle3.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, -0.01 * this.altitude)
            }
        }

    }

    setup() {
        this.gameUI = new GUI.Rectangle();
        this.gameUI.width = "100px";
        this.gameUI.height = "230px";
        this.gameUI.top = "50px";
        this.gameUI.cornerRadius = 0;
        this.gameUI.color = "black";
        this.gameUI.thickness = 0;
        this.gameUI.background = "rgb(0,0,0,0)";
        this.gameUI.alpha = 0.9;
        this.gameUI.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.gameUI.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        CGUI.adt.addControl(this.gameUI);
        this.gameUI.isVisible = false;


        let gameText = new GUI.TextBlock("statuslabel");
        gameText.text = "IGN\nTHR\nSPD\nALT\nHDG\nPIT\nROL\nFUEL\nGEAR\nFLAPS\n:AMM\nMIS:\n\n\n\n";
        gameText.color = "white";
        gameText.fontSize = 14;
        gameText.fontFamily = "Arial";
        gameText.top = "1px";
        gameText.left = "5px";
        gameText.width = "100px";
        gameText.height = "320px";
        this.gameUI.addControl(gameText);
        gameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        gameText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        gameText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        gameText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        let gameText2 = new GUI.TextBlock("craftstatus");
        gameText2.text = "0\n0\n0\n0\n0\n0\n0\n0\n0\n0\n:~\n~\n\n\n\n";
        gameText2.color = "white";
        gameText2.fontSize = 14;
        gameText2.fontFamily = "Arial";
        gameText2.top = "1px";
        gameText2.left = "-30px";
        gameText2.width = "70px";
        gameText2.height = "320px";
        this.gameUI.addControl(gameText2);
        gameText2.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gameText2.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        gameText2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gameText2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.statusText = gameText2;

    }
}