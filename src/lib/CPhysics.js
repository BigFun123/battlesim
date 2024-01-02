import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin } from "@babylonjs/core/Physics";
import { Quaternion, Vector3 } from "@babylonjs/core";
import { Bus, EVT_PROGRESS } from "./Bus";


export class CPhysics {
    havokInstance = null;
    timestep = 1 / 60;
    constructor(scene) {
        this.scene = scene;
        Bus.subscribe("physics:pause", this.pause);        
        Bus.subscribe("physics:resume", this.resume);
        Bus.subscribe("physics:moveBody", (data)=>this.moveBody(data));
        //this.setupPhysics();
    }

    pause(data) {
        this.havokPlugin.setTimeStep(0);
    }

    resume() {
        this.havokPlugin.setTimeStep(this.timestep);
    }

    moveBody(data) {
        const body = data.body;
        const transform = data.transform;
        const mesh = data.mesh;
        const position = new Vector3(transform.position.x, transform.position.y, transform.position.z);
        const rotation = new Vector3(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        //const quaternion = new Quaternion.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);
        body.position = position.clone();
        mesh.position = position.clone();
        
        //body.rotationQuaternion = quaternion;        
        this.havokPlugin.syncTransform(body, transform);
    }

    async setupPhysics() {
        //HavokPhysics().then((havok) => {
        //  this.havokInstance = havok;
        //this.havokInstance.initPhysics(this.scene);
        //});
        this.havokInstance = await HavokPhysics();
        this.havokPlugin = new HavokPlugin(true, this.havokInstance);
        this.setMaxLinVel(this.havokPlugin, 1000, 1000);
        
        this.havokPlugin.onCollisionObservable.add((eventData) => {
            Bus.send(EVT_PROGRESS, {text: "COLLISION " + eventData.collidedAgainst.transformNode.name, progress: 90 });

            if (eventData.collidedAgainst.transformNode.nameFile === "missile") {
                ///console.log(eventData.collidedAgainst.transformNode.nameFile, "->", eventData.collider.transformNode.nameFile, eventData);
                
            }

            // highlight collided mesh
            //eventData.collidedAgainst.transformNode.isVisible = true;
        });

        this.havokPlugin.onTriggerCollisionObservable.add((eventData) => {
            // highlight collided mesh
            //eventData.collider.transformNode.isVisible = true;
            // console.log("trigger", eventData.collider.transformNode.nameFile, "->", eventData.collidedAgainst.transformNode.nameFile, eventData);
        });

        this.havokPlugin.onCollisionEndedObservable.add((eventData) => {
            // unhighlight collided mesh
            //console.log("ended", eventData.collider.transformNode.nameFile, "->", eventData.collidedAgainst.transformNode.nameFile, eventData);
            //eventData.collidedAgainst.transformNode.isVisible = false;
        });


        this.scene.enablePhysics(new Vector3(0, -9.8, 0), this.havokPlugin);        

        console.log("Physics Engine create: Havok", this.havokPlugin.getTimeStep());
    }

    setMaxLinVel(havokPlugin, maxLinVel, maxAngVel) {
        const heap = havokPlugin._hknp.HEAP8.buffer;
        const world1 = new Int32Array(heap, Number(havokPlugin.world), 100);
        const world2 = new Int32Array(heap, world1[8], 500);
        const mplib = new Int32Array(heap, world2[428], 100);
        const tsbuf = new Float32Array(heap, mplib[8], 300);

        tsbuf[32] = maxLinVel;
        tsbuf[33] = maxAngVel;
        tsbuf[60] = maxLinVel;
        tsbuf[61] = maxAngVel;
        tsbuf[88] = maxLinVel;
        tsbuf[89] = maxAngVel;
        tsbuf[144] = maxLinVel;
        tsbuf[145] = maxAngVel;
        tsbuf[172] = maxLinVel;
        tsbuf[173] = maxAngVel;
        tsbuf[200] = maxLinVel;
        tsbuf[201] = maxAngVel;
        tsbuf[228] = maxLinVel;
        tsbuf[229] = maxAngVel;
    }

}