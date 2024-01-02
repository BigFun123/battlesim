import { ArcRotateCamera, UniversalCamera, Vector3 } from "@babylonjs/core";

/**
 * mesh mask
 */
export class CCockpitCam {
    consstructor(scene) {
        this.scene = scene;
    }

    setup() {
        //var camera = new ArcRotateCamera("CockpitCam", 3.31, 1.6, 0.01, new Vector3(0, 1, 0), this.scene);        
        var camera = new UniversalCamera("CockpitCam", new Vector3(0, 1, 0), this.scene);
        camera.applyGravity = true;
        camera.checkCollisions = true;
        camera.fov = 1.0;
        camera.panningSensibility = 0;
        camera.allowUpsideDown = true;
        camera.lowerRadiusLimit = 0;
        camera.upperRadiusLimit = 0;
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
        camera.useAutoRotationBehavior = false;
        camera.useFramingBehavior = false;
        camera.inertia = 0.95;
        camera.minZ = 0.1;        
        this.camera = camera;


        return camera;
    
    }
}