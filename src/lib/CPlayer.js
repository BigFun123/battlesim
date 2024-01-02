import { Quaternion, Vector3 } from '@babylonjs/core';
import { Bus } from './Bus.js';
import { progression } from './CPlayerProgression.js';

export class CPlayer {

    id = 123;

    progression;

    constructor(scene, craft, asset) {
        this.scene = scene;
        this.craft = craft;
        this.asset = asset;
        this.progression = progression;


        Bus.subscribe("tweak", (data) => {
            // nudge player mesh in direction of camera
            //const direction = this.scene.activeCamera.getDirection(new Vector3(0, 0, 1));
            // -x is forward
            const direction = new Vector3(1 * data.amtz || 0, 1 * data.amty || 0, 1 * data.amtx || 0);
            const rotation = Quaternion.FromEulerAngles(0, data.amtrot || 0, 0);
            //direction.y = 0;
            //direction.normalize();
            //direction.scaleInPlace(data);
            this.craft.aggregate.body.setGravityFactor(0);
            this.craft.moveBy(direction.x, direction.y, direction.z);            
            this.craft.rotateBy(rotation.x, rotation.y, rotation.z, rotation.w);
        });
    }

    async setup() {
        //return this.loadProgression();
    }

    /** load progression from server */
    async loadProgression() {
        const target = {
            id: this.id
        }
        fetch('/api/progression/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(target)
        })
            .then(response => response.json())
            .then(data => {
                this.progression = data;
            });
    }

    registerKill(target) {
        fetch('/api/kill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(target)
        })
            .then(response => response.json())
            .then(data => {
                this.progression = data;
            });
    }

}