

class CCameraMan {
    cameras = [];
    activeCamera = null;
    target = null;
    constructor(scene) {
        this.scene = scene;
        this.canvas = document.getElementById("renderCanvas"); // Get the canvas element
        this.camera = scene.activeCamera;
        this.target = null;
        this.offset = new BABYLON.Vector3(10, 4, 15);
        this.rotation = new BABYLON.Vector3(0, 3.0, 0);
        this.lerptime = 0.8;
        this.delta = 0.31;

        //this.setupFreeCam();
        this.setupTailCam();
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
        if (this.activeCamera.lockedTarget) {
            //BABYLON.Vector3.SmoothToRef(this.activeCamera.position, this.target.getAbsolutePosition().add(this.offset), this.delta, this.lerptime, this.activeCamera.position);
            const delta = this.scene.getPhysicsEngine().getTimeStep();
            //console.log(delta);
            const lt = Math.min(delta * this.lerptime, 0.99);
            BABYLON.Vector3.SlerpToRef(this.activeCamera.position, this.target.getAbsolutePosition().add(this.offset), delta * 10, this.activeCamera.position);
            //BABYLON.Vector3.SmoothToRef(this.activeCamera.rotation, this.target.rotation, this.delta, this.lerptime, this.activeCamera.rotation);
            //this.activeCamera.position = this.target.getAbsolutePosition().add(this.activeCamera.lockedTarget.forward.scale(-15).add(this.activeCamera.lockedTarget.up.scale(4)));
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
        let camera = new BABYLON.UniversalCamera("TailCam", new BABYLON.Vector3(0, 10, -30), this.scene);
        camera.applyGravity = false;
        camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        camera.rotation = this.rotation;
        //camera.collisionsEnabled = true;
        //camera.checkCollisions = true;
        camera.attachControl(this.canvas, true);
        this.activeCamera = camera;
        this.cameras.push(camera);
    }

    setupFollowCam() {
        this.detachAllCameras();
        let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 0, 120), this.scene);
        camera.applyGravity = true;
        camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        camera.collisionsEnabled = true;
        camera.checkCollisions = true;
        //camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, 20), scene);
        camera.radius = 40; // how far from the object to follow
        camera.heightOffset = 4; // how high above the object to place the camera
        camera.rotationOffset = 0; // the viewing angle
        camera.cameraAcceleration = 0.09 // how fast to move
        camera.maxCameraSpeed = 100 // speed limit        
        camera.speed = 100;
        camera.angularSensibility = 1000;
        camera.attachControl(this.canvas, true);
        this.activeCamera = camera;
        this.cameras.push(camera);
    }
}