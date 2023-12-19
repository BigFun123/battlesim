class CCameraMan {
    cameras = [];
    activeCamera = null;
    target = null;

    // mode 0, 1, 2
    offsets = [new BABYLON.Vector3(10, 14, -15), new BABYLON.Vector3(0, 3.02, -5.5), new BABYLON.Vector3(10, 14, -65)];
    lerps = [0.06, 1, 0.1];

    currentVelocity = new BABYLON.Vector3(0, 0, 0);
    constructor(scene, pos) {
        this.scene = scene;
        this.canvas = document.getElementById("renderCanvas"); // Get the canvas element
        this.camera = scene.activeCamera;
        this.target = null;
        this.mode = 0;
        this.position = pos;
        this.rotation = new BABYLON.Vector3(0, 3.0, 0);
        this.lerptime = 0.8;
        this.delta = 0.31;

        //this.setupFreeCam();
        this.setupTailCam();
        //this.setupFollowCam();
        //this.setupLockCam();

        Bus.subscribe("camera", (mode) => {
            this.setCameraMode(mode);
        });

        Bus.subscribe("tweak1", val => {
            this.offsets[this.mode]. y += val;
            Bus.send("r2", this.offsets[this.mode].x + "," + this.offsets[this.mode].y + "," + this.offsets[this.mode].z);
        });
        Bus.subscribe("tweak2", val => {
            this.offsets[this.mode]. z += val;
            Bus.send("r2", this.offsets[this.mode].x + "," + this.offsets[this.mode].y + "," + this.offsets[this.mode].z);
        });
    }

    setCameraMode(mode) {
        this.mode = mode;
        this.offset = this.offsets[mode];
        if (mode == 0) {
            this.setLockedTarget(this.target);
            this.activeCamera.parent = null;
        }
        if (mode == 1) {
            this.activeCamera.lockedTarget = null;
            
            
            setTimeout(() => {
                this.activeCamera.parent = this.target;
            //this.activeCamera.cameraDirection= (this.target.aggregate.transformNode.forward.clone());
            //let targetPos = this.target.aggregate.transformNode.position.clone().add(this.target.aggregate.transformNode.forward.scale(offset.z)).add(this.target.aggregate.transformNode.up.scale(offset.y));

            this.activeCamera.target = this.target.position.clone(); //.add(this.target.aggregate.transformNode.up.scale(this.target.vehicle.pitch * 100));
            }, 100);
            
            // set clipping planes
            this.activeCamera.minZ = 0.1;

        }
    }

    setLockedTarget(target) {
        this.activeCamera.lockedTarget = target;
        this.target = target;
    }

    setFollowPosition(CameraOffsetVector) {
        this.activeCamera.position = CameraOffsetVector;
    }

    setParent(target) {
        this.activeCamera.parent = target;
    }

    detachAllCameras() {
        this.cameras.forEach((camera) => {
            camera.detachControl(this.canvas);
        });
    }



    update() {


        // camera banked turn

        if (this.target) {

            const offset = this.offsets[this.mode];
            let targetPos = this.target.aggregate.transformNode.position.clone().add(this.target.aggregate.transformNode.forward.scale(offset.z)).add(this.target.aggregate.transformNode.up.scale(offset.y));

            if (this.mode == 1) {
                this.activeCamera.position.copyFrom(offset.clone());
                //this.activeCamera.cameraDirection = this.target.aggregate.transformNode.forward.clone();
                //this.activeCamera.cameraDirection.x = this.target.vehicle.pitch * 10;
                //this.activeCamera.target = targetPos.clone(); //.add(this.target.aggregate.transformNode.up.scale(this.target.vehicle.pitch * 100));
                Bus.send("debug", " tgt:" + this.activeCamera.target.x.toFixed(2) + "," + this.activeCamera.target.y.toFixed(2) + "," + this.activeCamera.target.z.toFixed(2));
                Bus.send("debug", " dir:" + this.activeCamera.cameraDirection.x.toFixed(2) + "," + this.activeCamera.cameraDirection.y.toFixed(2) + "," + this.activeCamera.cameraDirection.z.toFixed(2));
                return;
            }

            const cdelta = this.scene.getAnimationRatio();




            // calc distance from target
            let dist = BABYLON.Vector3.Distance(this.activeCamera.position, targetPos);


            this.activeCamera.position = this.SmoothDamp(this.activeCamera.position,
                targetPos,
                this.currentVelocity,
                this.lerps[this.mode], dist, cdelta);
            // 0.05

            //BABYLON.Quaternion.SlerpToRef(this.activeCamera.absoluteRotation, this.target.aggregate.transformNode.rotationQuaternion, cdelta * 10.1, this.activeCamera.absoluteRotation)

            //this.activeCamera.bankedTurn = true;
            //this.activeCamera.bankedTurnMultiplier = 0.5;


            // sacred, don't delete
            //this.activeCamera.position = this.target.aggregate.transformNode.position
            //  .add(this.target.aggregate.transformNode.forward.scale(-18))
            //.add(this.target.aggregate.transformNode.up.scale(4));
        }
    }


    setupFreeCam() {
        this.detachAllCameras();
        let camera = new BABYLON.UniversalCamera("FreeCam", new BABYLON.Vector3(0, 10, 30), this.scene);
        camera.applyGravity = false;
        camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        camera.rotation = this.rotation;
        camera.collisionsEnabled = true;
        camera.checkCollisions = true;
        camera.attachControl(this.canvas, true);
        this.activeCamera = camera;
        this.cameras.push(camera);
    }

    setupTailCam() {
        this.detachAllCameras();
        //this.offset = new BABYLON.Vector3(0, 234, 15);
        let camera = new BABYLON.UniversalCamera("TailCam", this.position, this.scene);
        //let camera = new BABYLON.FlyCamera("TailCam", this.position, this.scene);
        // disable inputs
        camera.inputs.clear();
        //camera.applyGravity = true;
        camera.speed = 1;
        camera.inertia = .0;
        camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        camera.rotation = this.rotation;
        camera.collisionsEnabled = false;
        camera.rollCorrect = 0;
        camera.bankedTurn = false;
        camera.checkCollisions = false;
        //camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        //camera.rotation = this.rotation;
        //camera.collisionsEnabled = true;
        //camera.checkCollisions = true;
        camera.attachControl(this.canvas, true);
        this.activeCamera = camera;
        this.cameras.push(camera);

    }

    setupLockCam() {

    }

    setupFollowCam() {
        this.detachAllCameras();
        let camera = new BABYLON.FollowCamera("FollowCam",  new BABYLON.Vector3(1, 1, 1), this.scene);
        //camera.applyGravity = true;
        camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        camera.collisionsEnabled = true;
        camera.checkCollisions = true;
        //camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, 20), scene);
        camera.radius = 40; // how far from the object to follow
        camera.heightOffset = 4; // how high above the object to place the camera
        camera.rotationOffset = 0; // the viewing angle
        camera.cameraAcceleration = 0.015 // how fast to move
        camera.maxCameraSpeed = 30 // speed limit                
        camera.angularSensibility = 2000;
        camera.attachControl(this.canvas, true);
        this.activeCamera = camera;
        this.cameras.push(camera);
    }


    // Gradually changes a vector towards a desired goal over time.
    SmoothDamp(current, target, currentVelocity, smoothTime, maxSpeed, deltaTime) {
        let output_x = 0;
        let output_y = 0;
        let output_z = 0;

        // Based on Game Programming Gems 4 Chapter 1.10
        smoothTime = Math.max(0.0001, smoothTime);
        let omega = 2.0 / smoothTime;

        let x = omega * deltaTime;
        let exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);

        let change_x = current.x - target.x;
        let change_y = current.y - target.y;
        let change_z = current.z - target.z;
        let originalTo = target;

        // Clamp maximum speed
        let maxChange = maxSpeed * smoothTime;

        let maxChangeSq = maxChange * maxChange;
        let sqrmag = change_x * change_x + change_y * change_y + change_z * change_z;
        if (sqrmag > maxChangeSq) {
            var mag = Math.sqrt(sqrmag);
            change_x = change_x / mag * maxChange;
            change_y = change_y / mag * maxChange;
            change_z = change_z / mag * maxChange;
        }

        target.x = current.x - change_x;
        target.y = current.y - change_y;
        target.z = current.z - change_z;

        let temp_x = (currentVelocity.x + omega * change_x) * deltaTime;
        let temp_y = (currentVelocity.y + omega * change_y) * deltaTime;
        let temp_z = (currentVelocity.z + omega * change_z) * deltaTime;

        currentVelocity.x = (currentVelocity.x - omega * temp_x) * exp;
        currentVelocity.y = (currentVelocity.y - omega * temp_y) * exp;
        currentVelocity.z = (currentVelocity.z - omega * temp_z) * exp;

        output_x = target.x + (change_x + temp_x) * exp;
        output_y = target.y + (change_y + temp_y) * exp;
        output_z = target.z + (change_z + temp_z) * exp;

        // Prevent overshooting
        let origMinusCurrent_x = originalTo.x - current.x;
        let origMinusCurrent_y = originalTo.y - current.y;
        let origMinusCurrent_z = originalTo.z - current.z;
        let outMinusOrig_x = output_x - originalTo.x;
        let outMinusOrig_y = output_y - originalTo.y;
        let outMinusOrig_z = output_z - originalTo.z;

        if (origMinusCurrent_x * outMinusOrig_x + origMinusCurrent_y * outMinusOrig_y + origMinusCurrent_z * outMinusOrig_z > 0) {
            output_x = originalTo.x;
            output_y = originalTo.y;
            output_z = originalTo.z;

            currentVelocity.x = (output_x - originalTo.x) / deltaTime;
            currentVelocity.y = (output_y - originalTo.y) / deltaTime;
            currentVelocity.z = (output_z - originalTo.z) / deltaTime;
        }

        return new BABYLON.Vector3(output_x, output_y, output_z);
    }
}