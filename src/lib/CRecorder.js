import { Animation, Quaternion, Vector3 } from "@babylonjs/core";
import { Bus, EVT_SETPLAYER } from "./Bus";

export class CRecorder {
    starttime = 0;
    timer;
    recordingData = [];
    currentAnimation;
    constructor(scene) {
        this.scene = scene;
        //this.vehicle = vehicle;
        //this.proxy = proxy;
        //this.proxy.rotationQuaternion = new Quaternion(0, 0, 0, 1);
        this.recording = false;
        this.recordingData = [];
        //this.recordingData.push({ time: 0, data: this.vehicle.getSnapshot() });

        Bus.subscribe(EVT_SETPLAYER, (data) => {
            this.vehicle = data.player;
        });
        Bus.subscribe("RecordStart", () => {
            this.start();
        });

        Bus.subscribe("RecordStop", () => {
            this.stop();

        });

        Bus.subscribe("RecordGet", () => {
            Bus.publish("RecordData", this.getRecording());
        });

        Bus.subscribe("RecordClear", () => {
            this.recordingData = [];
            this.recordingData.push({ time: 0, data: this.vehicle.getSnapshot() });
        });

        Bus.subscribe("RecordPlay", (data) => {
            if (!data) {
                this.play(null, this.currentAnimation.target);
            } else {
                this.play(data.recording, data.mesh);
            }

        });

        Bus.subscribe("RecordReplay", () => {
            this.play(null, this.currentAnimation.target);
        });
    }

    async loadRecording(name) {
        return new Promise((resolve, reject) => {
            fetch("/assets/recordings/" + name)
                .then((response) => {
                    resolve(response.json());
                }).catch((err) => {
                    reject(err);
                })
        });
    }

    start() {
        this.recordingData = [];
        console.log("Start Recording");
        this.starttime = window.performance.now();
        this.recording = true;
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            this.update();
        }, 100);
    }

    stop() {
        console.log("Stop Recording");
        clearInterval(this.timer);
        this.timer = null;
        this.recording = false;
        console.log(this.recordingData);

        // send data to server /recordings
        fetch("http://localhost:4200/recording", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.recordingData)
        }).then((response) => {
            console.log(response);
        }).catch((err) => {
            console.log(err);
        });
    }

    getRecording() {
        return this.recordingData;
    }

    update() {
        if (!this.vehicle) return;
        let delta = Math.round((window.performance.now() - this.starttime) * 100) / 100;
        if (this.recording) {
            this.recordingData.push({ time: (delta), data: this.vehicle.getSnapshot() });
        }
    }

    async play(recording, npc) {

        console.log("Play Recording");
        this.recordingData = await this.loadRecording(recording);

        const pos = new Animation("sweep", "position", 65, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE, true);
        const keys = [];
        let highest = 0;
        this.recordingData.forEach((data) => {
            highest = data.time * 0.1;
            keys.push({ frame: Math.round(data.time * 0.1), value: new Vector3(data.data.position[0], data.data.position[1], data.data.position[2]) });
        });

        pos.setKeys(keys);


        const rot = new Animation("sweep", "rotationQuaternion", 65, Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CYCLE, true);
        const rkeys = [];
        let rhighest = 0;
        this.recordingData.forEach((data) => {
            rhighest = data.time * 0.1;
            let quat = new Quaternion(data.data.rotationQuaternion[0], data.data.rotationQuaternion[1], data.data.rotationQuaternion[2], data.data.rotationQuaternion[3]);
            rkeys.push({ frame: Math.round(data.time * 0.1), value:  quat});
        });
        rot.setKeys(rkeys);

        npc.position = keys[0].value.clone();
        npc.rotationQuaternion = rkeys[0].value.clone();

        this.currentAnimation = this.scene.beginDirectAnimation(npc, [pos, rot], 0, highest, true);
        //this.scene.beginDirectAnimation(this.proxy, [rot], 0, rhighest, false);



        //this.vehicle.ignition = false;
        //this.vehicle.aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
        //this.vehicle.aggregate.body.disablePrestep = true;
        /* console.log("Play Recording");
         this.recordingData.forEach((data) => {
             setTimeout(() => {
                 //this.vehicle.setSnapshot(data.data);
                 console.log(data.time);
                 this.applySnapshot(data.data);
             }, data.time);
         });
         */
    }

    applySnapshot(snapshot) {
        this.proxy.position.set(snapshot.position[0], snapshot.position[1], snapshot.position[2]);
        this.proxy.rotationQuaternion.set(snapshot.rotationQuaternion[0], snapshot.rotationQuaternion[1], snapshot.rotationQuaternion[2], snapshot.rotationQuaternion[3]); 2
    }
}