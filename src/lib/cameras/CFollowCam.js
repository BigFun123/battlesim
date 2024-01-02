import { ArcRotateCamera, Vector3 } from "@babylonjs/core";

export class CFollowCam {
    consstructor(scene) {
        this.scene = scene;
    }

    setup() {
        var camera = new ArcRotateCamera("TailCam", 0.71, 1.1, 24, Vector3.Zero(), this.scene);        
        camera.applyGravity = true;
        camera.checkCollisions = true;
        camera.fov = 0.5;
        camera.panningSensibility = 0;
        camera.allowUpsideDown = false;
        camera.lowerRadiusLimit = 7;
        camera.upperRadiusLimit = 40;
        camera.upperBetaLimit = Math.PI / 0.2;
        camera.panningSensibility = 0;
        camera.cameraAcceleration = .1; // how fast to move
        camera.maxCameraSpeed = 2; // speed limit
        camera.pinchDeltaPercentage = 0.00060;
        camera.wheelPrecision = 20;
        camera.bankedTurn = true;
        
        
        //disable keyboard input for the camera
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");

        camera.useBouncingBehavior = false;
        camera.useAutoRotationBehavior = true;
        const behaviour = camera.autoRotationBehavior
        behaviour.idleRotationWaitTime = 30000;
        camera.inertia = 0.85;
        camera.minZ = 2.1;
        camera.maxZ = 100000;
        camera.allowUpsideDown = false;
        this.camera = camera;


        return camera;
    
    }
}