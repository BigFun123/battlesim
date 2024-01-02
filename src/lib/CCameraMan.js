import { ArcFollowCamera, ArcRotateCamera, Camera, DefaultRenderingPipeline, FlyCamera, FollowCamera, ImageProcessingConfiguration, LensRenderingPipeline, Quaternion, Tools, UniversalCamera, Vector3 } from "@babylonjs/core";
import { Bus, EVT_SETPLAYER } from "./Bus";
import { CSettings } from "./CSettings";
import { COCKPITCAM, FOLLOWCAM, CHASECAM } from "./Constants";
import { CFollowCam } from "./cameras/CFollowCam";
import { CCockpitCam } from "./cameras/CCockpitCam";

export class CCameraMan {

    targetMesh = null;
    playerMesh = null;

    // mode 0, 1, 2
    offsets = [new Vector3(1, 14, -5), new Vector3(0, 3.02, 5.5), new Vector3(10, 14, -65), new Vector3(10, 14, -65)];
    lerps = [0.06, 1, 0.1, 1];

    lens;

    currentVelocity = new Vector3(0, 0, 0);
    constructor(scene, pos) {
        this.scene = scene;
        this.canvas = document.getElementById("renderCanvas"); // Get the canvas element
        this.camera = scene.activeCamera;
        this.targetMesh = null;
        this.mode = 0;
        this.position = pos;
        this.rotation = new Vector3(0, 3.0, 0);
        this.lerptime = 0.8;
        this.delta = 0.31;

        //this.setupFreeCam();
        this.setupGUICamera();
        this.cockpitCam = new CCockpitCam(this.scene).setup();
        this.followCam = new CFollowCam(this.scene).setup();

        if (CSettings.settings.depthOfField) {
            this.setupDOF([this.followCam, this.cockpitCam]);
        }

        //this.setupFollowCam();
        //this.setupLockCam();

        this.setCameraMode(0);


        Bus.subscribe("camera", (data) => {
            this.setCameraMode(data.mode);
        });

        Bus.subscribe("tweak1", val => {
            //this.offsets[this.mode].y += val;
            //Bus.send("r2", this.offsets[this.mode].x + "," + this.offsets[this.mode].y + "," + this.offsets[this.mode].z);
        });
        Bus.subscribe("tweak2", val => {
            //this.offsets[this.mode].z += val;
            //Bus.send("r2", this.offsets[this.mode].x + "," + this.offsets[this.mode].y + "," + this.offsets[this.mode].z);
        });
        Bus.subscribe(EVT_SETPLAYER, (data) => {
            //this.setTargetMesh(data.player.mesh);
            this.setPlayerMesh(data.player);
        });
    }

    setupGUICamera() {
        let alpha = - Math.PI / 4;
        let beta = Math.PI / 3;
        let distance = 10;
        this.guiCam = new ArcRotateCamera(
            "GUICam",
            alpha,
            beta,
            distance,
            new Vector3(0, 0, 0),
            this.scene
        );
        this.guiCam.fov = 0.6;
        this.guiCam.mode = Camera.PERSPECTIVE_CAMERA;
        this.guiCam.layerMask = 0x20000000;
    }

    setCameraMode(mode) {
        this.mode = mode;
        this.offset = this.offsets[mode];
        this.detachAllCameras();
        //if (this.activeCamera) { this.activeCamera.dispose(); }
        if (mode == FOLLOWCAM) {
            //this.setupfollowCam();
            this.scene.activeCameras = [this.followCam, this.guiCam];
            this.followCam.attachControl(this.canvas, true);

            this.guiCam.fov = this.followCam.fov;
            this.guiCam.parent = this.followCam.parent;

            if (this.playerMesh) {
                //this.setLockedTarget(this.targetMesh);
                this.followCam.setTarget(this.playerMesh);
            }
        }
        if (mode == COCKPITCAM) {
            this.scene.activeCameras = [this.cockpitCam, this.guiCam];
            this.cockpitCam.attachControl(this.canvas, true);
            this.guiCam.fov = this.cockpitCam.fov;
            this.guiCam.parent = this.cockpitCam.parent;
        }

        if (mode == CHASECAM) {
            //this.setupFollowCam();
            this.scene.activeCamera = this.followCam;
            this.scene.activeCameras = [this.followCam, this.guiCam];
            this.followCam.attachControl(this.canvas, true);
        }

        if (mode == 3) {
            this.setupLockCam();
        }
    }

    setLockedTarget(target) {
        this.targetMesh = target;
    }

    setTargetMesh(targetMesh) {
        this.targetMesh = targetMesh;
    }

    setPlayerMesh(player) {
        this.playerMesh = player.mesh;

        //this.cockpitCam.parent = playermesh;
        //this.cockpitCam.lockedTarget = player.getCameraTarget();
        this.cockpitCam.cockpitCam = player.getCockpitCam();
        this.cockpitCam.rotationQuaternion = Quaternion.Identity().multiply(new Quaternion(0, 180 * Math.PI / 180, 0, 0.1));

        this.followCam.position = this.playerMesh.position.add(this.playerMesh.up.scale(5)).add(this.playerMesh.forward.scale(20));
        this.followCam.setTarget(this.playerMesh);
        this.followCam.lockedTarget = this.playerMesh;
    }

    setFollowPosition(CameraOffsetVector) {
        this.activeCamera.position = CameraOffsetVector;
    }

    setParent(target) {
        this.activeCamera.parent = target;
    }

    detachAllCameras() {

        this.followCam.detachControl(this.canvas);
        this.cockpitCam.detachControl(this.canvas);
        this.followCam.detachControl(this.canvas);

        if (this.lockCam) {
            this.lockCam.detachControl(this.canvas);
        }

    }



    update() {

        if (this.mode == FOLLOWCAM) {
            this.guiCam.position = this.followCam.position.clone();
            //this.guiCam.rotation = this.followCam.rotation.clone();
            this.guiCam.alpha = this.followCam.alpha;
            this.guiCam.beta = this.followCam.beta;
            this.guiCam.radius = this.followCam.radius;
            this.guiCam.target = this.followCam.target;
        }

        if (this.mode == COCKPITCAM) {
            //this.cockpitCam.position = this.playerMesh.position.add(this.offsets[COCKPITCAM]);
            this.guiCam.position = this.cockpitCam.position.clone();
            this.guiCam.target = this.cockpitCam.target;
            if (this.cockpitCam.parent) {
                this.guiCam.rotationQuaternion = this.cockpitCam.parent.rotationQuaternion;
            }

            if (this.playerMesh) {
                this.cockpitCam.position = this.cockpitCam.cockpitCam.getAbsolutePosition();
                this.cockpitCam.rotationQuaternion = this.playerMesh.rotationQuaternion.multiply((Quaternion.FromEulerAngles(0, 180 * Math.PI / 180, 180 * Math.PI / 180)));
                //this.cockpitCam.alpha = this.playerMesh.rotationQuaternion.toEul;
            
            };
            

            //this.activeCamera.position.copyFrom(offset.clone());

            // for freelook, disable this
            //this.activeCamera.rotationQuaternion = Quaternion.Identity().multiply(new Quaternion(0, 180 * Math.PI / 180, 0, 0.1));


            if (CSettings.settings.debug) {
                Bus.send("debug", " camtgt:" + this.cockpitCam.target.x.toFixed(2) + "," + this.cockpitCam.target.y.toFixed(2) + "," + this.cockpitCam.target.z.toFixed(2));
                Bus.send("debug", " dir:" + this.cockpitCam.cameraDirection.x.toFixed(2) + "," + this.cockpitCam.cameraDirection.y.toFixed(2) + "," + this.cockpitCam.cameraDirection.z.toFixed(2));                
            }            
            return;
        }


        // camera banked turn

        if (this.targetMesh) {

            //const offset = this.offsets[this.mode];
           // let targetPos = this.targetMesh.aggregate.transformNode.position.clone().add(this.targetMesh.aggregate.transformNode.forward.scale(offset.z)).add(this.targetMesh.aggregate.transformNode.up.scale(offset.y));

            if (this.mode == CHASECAM) {
                //const cdelta = this.scene.getAnimationRatio();

                // calc distance from target
                //let dist = Vector3.Distance(this.activeCamera.position, targetPos);
                /*  this.cockpitCam.position = this.SmoothDamp(this.cockpitCam.position,
                      targetPos,
                      this.currentVelocity,
                      this.lerps[this.mode], dist, cdelta);*/
            }

            // 0.05

            //Quaternion.SlerpToRef(this.activeCamera.absoluteRotation, this.target.aggregate.transformNode.rotationQuaternion, cdelta * 10.1, this.activeCamera.absoluteRotation)

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
        let camera = new UniversalCamera("FreeCam", new Vector3(0, 10, 30), this.scene);
        camera.applyGravity = false;
        camera.ellipsoid = new Vector3(1, 1, 1);
        camera.rotation = this.rotation;
        camera.collisionsEnabled = true;
        camera.checkCollisions = true;
        camera.attachControl(this.canvas, true);
        this.activeCamera = camera;
        this.cameras.push(camera);
    }


    setupFollowCam() {
        let camera = new FlyCamera("FlyCam", new Vector3(1, 1, 1), this.scene);
        //camera.applyGravity = true;
        camera.ellipsoid = new Vector3(1, 1, 1);
        camera.collisionsEnabled = false;
        camera.checkCollisions = false;
        //camera = new FollowCamera("FollowCam", new Vector3(0, 10, 20), scene);
        camera.radius = 40; // how far from the object to follow
        camera.heightOffset = 4; // how high above the object to place the camera
        camera.rotationOffset = 0; // the viewing angle
        camera.cameraAcceleration = 0.015 // how fast to move
        camera.maxCameraSpeed = 30 // speed limit                
        camera.bankedTurn = true;
        camera.angularSensibility = 2000;
        this.followCam = camera;
    }



    setupDOF(cameras) {
        if (!this.lens) {
            this.lens = new LensRenderingPipeline('lens', {
                edge_blur: 2.1,
                chromatic_aberration: 1.1,
                distortion: 0.0,
                dof_focus_distance: 70,
                dof_aperture: 0.1,			// set this very high for tilt-shift effect
                grain_amount: 1.5,
                dof_pentagon: true,
                dof_gain: 1.0,
                dof_threshold: 0.5,
                dof_distortion: 0,
                dof_darken: 0
            }, this.scene, 1.0, cameras);
            this.lens.dofDistortion = 0;

            this.scene.onBeforeRenderObservable.add(() => {
                if (this.targetMesh) {
                    this.lens.dofFocusDistance = Vector3.Distance(this.activeCamera.position, this.targetMesh.position);
                    this.lens.setAperture(this.lens.dofFocusDistance / 100);

                } else {
                    this.lens.setFocusDistance(2000);
                }

            });
        }
    }

    setupLockCam() {
        var camera = new ArcRotateCamera("LockCam", Tools.ToRadians(90), Tools.ToRadians(65), 10, Vector3.Zero(), this.scene);

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

        return new Vector3(output_x, output_y, output_z);
    }
}