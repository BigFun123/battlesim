import * as GUI from '@babylonjs/gui';
import { Bus, EVT_SETSTATE } from './Bus.js';
import { Tools, Vector2, Vector3 } from '@babylonjs/core';
import { STATE_GAME } from './Constants.js';

// a radar that shows the position of all the elements in the game
export class CRadar {
    trackedItems = [];
    playermesh = null;
    range = 100;
    scale = 0.006;
    scaleAdjust = 0.001;

    constructor(scene, adt) {
        this.scene = scene;
        this.adt = adt;
        this.setup();

        Bus.subscribe("radar", (data) => {
            data.scale ? this.scale += this.scaleAdjust * data.scale : 0;
            console.log("radarscale", this.scale);
        });
        Bus.subscribe("add-radar-item", (data) => {

            if (data.isPlayer) {
                this.playermesh = data.mesh;
            } else {
                this.addRadarItem(data);
            }
        });

        Bus.subscribe(EVT_SETSTATE, (state) => {
            if (state === STATE_GAME) {
                this.dialog.isVisible = true;
            } else {
                this.dialog.isVisible = false;
            }
        });

        scene.onBeforeRenderObservable.add(() => {
            this.update();
        });

        //setInterval(() => {
        //  this.update();
        //}, 500);
    }

    addRadarItem(data) {

        // radar dot
        var dot = new GUI.Ellipse();
        dot.width = "3px";
        dot.height = "3px";
        dot.thickness = 1;
        dot.color = "rgba(0,255, 0,1)";
        dot.background = data.isNPC ? "green" : "lightgreen";
        //dot.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        //dot.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.dialog.addControl(dot);



        var trect = new GUI.Rectangle();
        trect.width = "3px";
        trect.height = "3px";
        trect.color = "rgba(200,200, 0,0)";
        trect.background = "rgba(0,255, 0,0)";
        trect.thickness = 0;

        this.adt.addControl(trect);
        trect.linkWithMesh(data.mesh);

        var rect1 = new GUI.Rectangle();
        rect1.width = "12px";
        rect1.height = "12px";
        rect1.color = "rgba(0,255, 0,1)";
        rect1.background = "rgba(0,255, 0,0)";
        rect1.thickness = 2;

        this.adt.addControl(rect1);

        var label = new GUI.TextBlock();
        this.adt.addControl(label);
        label.color = "rgba(0,200, 0,1)"
        label.text = data.mesh.targetname || data.mesh.name || data.mesh.namefile || data.mesh.id;
        label.width = "120px";
        label.height = "42px";
        //rect1.addControl(label);
        //label.linkWithMesh(data.mesh);
        label.linkOffsetY = "-30px";

        this.trackedItems.push({ mesh: data.mesh, dot: dot, tracker: trect, rect: rect1, label: label });
        //rect1.linkOffsetY = -50;

    }

    // create radar gui
    setup() {
        this.dialog = new GUI.Ellipse();
        this.dialog.width = "110px";
        this.dialog.height = "110px";
        this.dialog.left = "-20px";
        this.dialog.top = "20px";
        //this.dialog.cornerRadius = 1;
        this.dialog.color = "rgba(0,0,0)";
        this.dialog.thickness = 1;
        this.dialog.background = "rgba(0,200, 0,0.2)";
        this.dialog.alpha = 0.7;
        this.dialog.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.dialog.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.adt.addControl(this.dialog);
        this.dialog.isVisible = false;

        var dot = new GUI.Ellipse();
        dot.width = "80px";
        dot.height = "80px";
        dot.left = 0;
        dot.top = 0;
        dot.background = "rgba(0,255,0,0)";
        dot.color = "#004400";
        dot.thickness = 1;
        dot.alpha = 0.25;
        this.dialog.addControl(dot);

        dot = new GUI.Ellipse();
        dot.width = "50px";
        dot.height = "50px";
        dot.left = 0;
        dot.top = 0;
        dot.background = "rgba(0,255,0,0)";
        dot.color = "#004400";
        dot.thickness = 1;
        dot.alpha = 0.25;
        this.dialog.addControl(dot);

        // north

        let gameText = new GUI.TextBlock();
        gameText.text = "N";
        gameText.color = "white";
        gameText.fontSize = 10;
        gameText.fontFamily = "Arial";
        gameText.top = "-20px";
        gameText.left = "0px";
        gameText.width = "53px";
        gameText.height = "53px";
        this.dialog.addControl(gameText);
        gameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        gameText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        gameText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        let line = new GUI.Rectangle();
        line.height = 0.75;
        line.width = "1px"
        line.left = 0;
        line.top = -0.75;
        line.color = "green";
        this.dialog.addControl(line);

        let line2 = new GUI.Rectangle();
        line2.height = "1px";
        line2.width = 0.5
        line2.left = 0;
        line2.top = 0;
        line2.color = "green";
        this.dialog.addControl(line2);

    }

    update() {
        const adtsize = this.adt.getSize();
        const w2 = adtsize.width / 2;
        const h2 = adtsize.height / 2;

        if (this.playermesh) {

            if (this.playermesh.rotationQuaternion) {
                this.dialog.rotation = this.playermesh.rotationQuaternion.toEulerAngles().y;
            } else {
                this.dialog.rotation = this.playermesh.rotation.y;
            }
        }
        for (var i = 0; i < this.trackedItems.length; i++) {
            var mesh = this.trackedItems[i].mesh;
            var dot = this.trackedItems[i].dot;
            var tracker = this.trackedItems[i].tracker;
            var rect = this.trackedItems[i].rect;
            var label = this.trackedItems[i].label;

            if (this.playermesh) {
                let delta = mesh.position.subtract(this.playermesh.position);

                delta = delta.scale(this.scale);
                // if it's too far
                //delta = delta.normalize().scale(50);
                //const x = Math.min( Math.max(-50, (mesh.position.x - this.offset.x )/ 30), 50);

                //const y = Math.min( Math.max(-50, (mesh.position.z - this.offset.y )/ 30), 50);
                dot.left = delta.x;
                dot.top = delta.z;
            }


            // limit tracker to -50,50 50,50
            rect.leftInPixels = Math.min(Math.max(-w2 + 10, tracker.leftInPixels - w2), w2 - 10);
            rect.topInPixels = Math.min(Math.max(-h2 + 10, tracker.topInPixels - h2), h2 - 10);
            label.leftInPixels = rect.leftInPixels;
            label.topInPixels = rect.topInPixels - 24;
        }


    }
}