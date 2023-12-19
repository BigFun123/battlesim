class CRecorder {
    starttime = 0;
    timer;
    constructor(scene, vehicle, proxy) {
        this.scene = scene;
        this.vehicle = vehicle;
        this.proxy = proxy;
        this.proxy.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
        this.recording = false;
        this.recordingData = [];
        this.recordingData.push({ time: 0, data: this.vehicle.getSnapshot() });

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

        Bus.subscribe("RecordPlay", () => {
            this.play();
        });
    }

    async loadRecording() {
        return new Promise((resolve, reject) => {
            fetch("/assets/recordings/recording2.json")
                .then((response) => {
                    resolve(response.json());
                }).catch((err) => {
                    reject(err);
                })
        });
    }

    start() {
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
    }

    getRecording() {
        return this.recordingData;
    }

    update() {
        let delta = window.performance.now() - this.starttime;
        if (this.recording) {
            console.log("snap");
            this.recordingData.push({ time: delta * 0.1, data: this.vehicle.getSnapshot() });
        }
    }

    async play() {
        console.log("Play Recording");
        this.recordingData = await this.loadRecording();

        const pos = new BABYLON.Animation("sweep", "position", 65, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE, true);
        const keys = [];
        let highest = 0;
        this.recordingData.forEach((data) => {
            highest = data.time * 0.05;
            keys.push({ frame: data.time * 0.05, value: new BABYLON.Vector3(data.data.position[0], data.data.position[1], data.data.position[2]) });
        });

        pos.setKeys(keys);
        

        const rot = new BABYLON.Animation("sweep", "rotationQuaternion", 65, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE, true);
        const rkeys = [];
        let rhighest = 0;
        this.recordingData.forEach((data) => {
            rhighest = data.time * 0.05;
            rkeys.push({ frame: data.time * 0.05, value: new BABYLON.Quaternion(data.data.rotationQuaternion[0], data.data.rotationQuaternion[1], data.data.rotationQuaternion[2], data.data.rotationQuaternion[3]) });
        });
        rot.setKeys(rkeys);

        this.scene.beginDirectAnimation(this.proxy, [pos, rot], 0, highest, true);
        //this.scene.beginDirectAnimation(this.proxy, [rot], 0, rhighest, false);

        

        //this.vehicle.ignition = false;
        //this.vehicle.aggregate.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
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
        this.scene.startAnimation
        this.proxy.position.set(snapshot.position[0], snapshot.position[1], snapshot.position[2]);
        this.proxy.rotationQuaternion.set(snapshot.rotationQuaternion[0], snapshot.rotationQuaternion[1], snapshot.rotationQuaternion[2], snapshot.rotationQuaternion[3]); 2
    }
}