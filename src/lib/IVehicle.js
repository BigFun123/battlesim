import { PhysicsAggregate, PhysicsBody, PhysicsShapeType, Quaternion, SceneLoader, Texture, Vector3 } from "@babylonjs/core";
import { CLighting } from "./CLighting";
import { Bus, EVT_PROGRESS } from "./Bus";
import { IMesh } from "./IMesh";

export class IVehicle extends IMesh {
    position;
    rotation;
    euler = Vector3.Zero();
    scale;
    model;
    fileContents;
    ready = false;

    ignition = 0;

    throttle = 0;
    throttleRate = 1;
    power = 0;
    maxpower = 10;
    yaw = 0;
    pitch = 0;
    roll = 0;
    landingGear = 0;
    verticalThrust = 0;

    //rates
    pitchrate = 0.01;
    rollrate = 0.5;
    yawrate = 0.02;
    finalPitch = 0;
    finalYaw = 0;
    finalRoll = 0;
    finalTorque = { x: 0, y: 0, z: 0 };
    finalVelocity = { x: 0, y: 0, z: 0 };

    fileContents = {};





    constructor(scene) {
        super(scene);
        //this.position = new Vector3(0, 0, 0);
        //this.rotation = new Vector3(0, -45 * Math.PI / 180, 0);
        this.scale = new Vector3(1, 1, 1);
        this.mesh = null;
    }

    getDebugText() {

        let rotation = Quaternion.Identity();
        // rotationQuationion to 2 decimal places
        if (this.aggregate.transformNode.rotationQuaternion) {
            rotation = this.aggregate.transformNode.rotationQuaternion.clone();
            rotation.x = Math.round(rotation.x * 100) / 100;
            rotation.y = Math.round(rotation.y * 100) / 100;
            rotation.z = Math.round(rotation.z * 100) / 100;
            rotation.w = Math.round(rotation.w * 100) / 100;
        }


        return [`ign: ${this.ignition} throttle: ${this.throttle.toFixed(2)} power: ${this.power.toFixed(2)}/${this.finalPower.toFixed(2)} pitch: ${this.pitch.toFixed(2)}/${this.finalPitch.toFixed(2)} roll: ${this.roll.toFixed(2)}/${this.finalRoll.toFixed(2)} yaw: ${this.yaw.toFixed(2)} / ${this.finalYaw.toFixed(2)} vert: ${this.verticalThrust.toFixed(2)}`
            //, `torque: ${this.finalTorque.x.toFixed(2)}, ${this.finalTorque.y.toFixed(2)}, ${this.finalTorque.z.toFixed(2)}`
            // up
            , `pos: ${this.mesh.position.x.toFixed(2)},${this.mesh.position.y.toFixed(2)},${this.mesh.position.z.toFixed(2)} up: ${this.mesh.up.x.toFixed(2)}, ${this.mesh.up.y.toFixed(2)}, ${this.mesh.up.z.toFixed(2)}, fwd: ${this.mesh.forward.x.toFixed(2)}, ${this.mesh.forward.y.toFixed(2)}, ${this.mesh.forward.z.toFixed(2)}`,
        //`rotq: ${this.mesh.rotationQuaternion.x.toFixed(2)}, ${this.mesh.rotationQuaternion.y.toFixed(2)}, ${this.mesh.rotationQuaternion.z.toFixed(2)}, ${this.mesh.rotationQuaternion.w.toFixed(2)}`,
        //`tup: ${this.aggregate.transformNode.up.x.toFixed(2)}, ${this.aggregate.transformNode.up.y.toFixed(2)}, ${this.aggregate.transformNode.up.z.toFixed(2)}`,
        `rotq: ${rotation.x}, ${rotation.y}, ${rotation.z}, ${rotation.w}`,
        ];
    }

    reset() {
        this.power = 0;
        this.throttle = 0;
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
        this.verticalThrust = 0;
        this.ignition = 0;
        super.goHome();
    }


    async load(asset, assetManager) {
        return super.load(asset, assetManager)
            .then(result => {                                
                // add shadows to each mesh
                result.meshes.forEach((mesh) => {
                    if (mesh) {
                        if (mesh.name === "Collision") {
                            
                            mesh.metadata = `{ vehicle: this , file: ${asset.file}, asset: asset}`;
                            mesh.namefile = asset.file;                            
                            this.mesh.applyGravity = true;                                                        
                            this.aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: this.static ? 0 : 100, friction: 0.1, restitution: 0.1 }, this.scene);
                            mesh.aggregate = this.aggregate;
                            this.aggregate.transformNode.nameFile = asset.file;                       
                            mesh.setParent(null);

                        }

                        if (mesh.name == "CameraTarget") {
                            //mesh.setEnabled(false);
                            mesh.isVisible = false;
                        }

                        if (mesh.name.toLowerCase() == "missile1") {
                            this.missile1 = mesh;
                            mesh.mountPoint = this.missile1.position.clone();
                            mesh.readyToFire = true;
                            //this.missile1.aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.CAPSULE, { mass: 1, friction: 0.5, restitution: 0.5 }, this.scene);
                            //this.missile1.aggregate.body.startAsleep = true;
                            //this.missile1.aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
                            //window.test = this.missile1;

                        }


                        if (mesh.name !== "Collision" && mesh.name !== "CameraTarget") {
                            CLighting.shadowGenerator.addShadowCaster(mesh, true);
                            mesh.receiveShadows = true;
                        }
                        //mesh.checkCollisions = true;
                    }
                });                
                Bus.send("add-radar-item", { mesh: this.mesh, isPlayer: true });                
                return result;
            }).catch((err) => {
                console.log(err);                
            });

    }

    addTrail(mesh) {

    }

    getCameraTarget() {
        //return the mesh named "CameraTarget"
        const mesh = this.fileContents.meshes.find((mesh) => {
            return mesh.name === "CameraTarget";
        });
    }

    getCockpitCam() {
        //return the mesh named "CameraTarget"
        const mesh = this.fileContents.meshes.find((mesh) => {
            return mesh.name === "CockpitCam";
        });
        return mesh || this.mesh;
    }

    enableReflections(meshArray) {
        for (var i = 0; i < meshArray.length; i++) {
            var mesh = meshArray[i];
            if (mesh.material) {
                mesh.material.reflectivityTexture = new Texture("/assets/reflectivity.png", this._scene);
                mesh.material.useRoughnessFromMetallicTextureAlpha = false;
                mesh.material.roughness = 0.35;
            }
        }
    }

    getPosition() {
        return this.aggregate.transformNode.position.clone();
    }

    getRotation() {
        return this.aggregate.transformNode.rotationQuaternion.clone();
    }

    setRotation(quat) {
        this.aggregate.body.disablePreStep = false;
        this.aggregate.transformNode.rotationQuaternion = quat;
        this.aggregate.body.setCollisionCallbackEnabled(true);
        this.scene.onReadyObservable.addOnce(() => {
            this.aggregate.body.disablePreStep = true;
        });
    }

    getSnapshot() {
        return {
            //x: this.mesh.position.x,
            //y: this.mesh.position.y,
            //z: this.mesh.position.z,
            position: [this.r2(this.aggregate.transformNode.position.x),
            this.r2(this.aggregate.transformNode.position.y),
            this.r2(this.aggregate.transformNode.position.z)],
            rotationQuaternion: [this.r2(this.aggregate.transformNode.rotationQuaternion.x),
            this.r2(this.aggregate.transformNode.rotationQuaternion.y),
            this.r2(this.aggregate.transformNode.rotationQuaternion.z),
            this.r2(this.aggregate.transformNode.rotationQuaternion.w)],
            //velocity: this.aggregate.body.getLinearVelocity(),
            //angularVelocity: this.aggregate.body.getAngularVelocity(),
        }
    }

    r2(n) {
        return Math.round(n * 100) / 100;
    }

    setSnapshot(snapshot) {

        this.aggregate.body.disablePreStep = false;
        //this.mesh.position = new Vector3(snapshot.x, snapshot.y, snapshot.z);        
        //this.aggregate.transformNode.rotationQuaternion = snapshot.rotation;
        //this.aggregate.body.setTargetTransform(this.mesh.position, this.mesh.rotationQuaternion, 1);
        //this.aggregate.body.setAbsolutePosition(this.mesh.position);
        this.aggregate.transformNode.rotationQuaternion.set(snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z, snapshot.rotation.w);
        this.aggregate.transformNode.position.set(snapshot.x, snapshot.y, snapshot.z);
        //this.aggregate.body.setLinearVelocity(snapshot.velocity);
        //this.aggregate.body.setAngularVelocity(snapshot.angularVelocity);
    }

    moveTo(x, y, z) {
        /*this.position.x = x;
        this.position.y = y;
        this.position.z = z;*/
        //if (this.mesh) {
        //  this.mesh.position = new Vector3(x, y, z);
        //}
        //this.aggregate.body.setAbsolutePosition(new Vector3(x, y, z));
        //this.aggregate.body.setTargetTransform(new Vector3(x, y, z), new Quaternion(0, 0, 0, 1));
        const plugin = this.scene.getPhysicsEngine().getPhysicsPlugin();
        //plugin.setBodyPosition(this.aggregate.body, new Vector3(x, y, z));
        //plugin.setTargetTransform(this.aggregate.body, new Vector3(x, y, z), new Quaternion(0, 0, 0, 1), 1);
        this.aggregate.transformNode.setAbsolutePosition(new Vector3(x, y, z));

        //const plugin = scene.getPhysicsEngine().getPhysicsPlugin()
        //plugin.HP_Body_SetPosition(mesh.physicsBody._pluginData.hpBodyId, [x, y, z])
    }

    getPosition() {
        return this.aggregate.transformNode.position;
    }

    getCameraTarget() {
        // find mesh named "cameraTarget"
        const mesh = this.fileContents.meshes.find((mesh) => {

            return mesh.name === "CameraTarget";

        });
        mesh && mesh.setEnabled(false);
        //mesh.scaling = new Vector3(0.0001, 0.0001, 0.0001);
        return mesh;
    }

    yawLeft() {
        this.yaw -= 0.1;
    }

    yawRight() {
        this.yaw += 0.1;
    }

    rollLeft() {
        this.roll -= 0.1;
    }

    rollRight() {
        this.roll += 0.1;
    }

    pitchUp() {
        this.pitch -= 0.1;
    }

    pitchDown() {
        this.pitch += 0.1;
    }

    throttleUp(delta) {
        this.throttle += this.throttleRate * this.delta;
        this.throttle = Math.min(2, this.throttle);
    }

    throttleDown(delta) {
        this.throttle -= this.throttleRate * this.delta;
        this.throttle = Math.max(0, this.throttle);
    }

    verticalThrustUp() {
        this.verticalThrust += 0.1;
    }

    verticalThrustDown() {
        this.verticalThrust -= 0.1;
    }

    near(a, b, tolerance = 0.02) {
        return Math.abs(a - b) <= tolerance;
    }



    // thrust, yaw, pitch, roll
    setInputs(input, delta) {
        if (!this.ready) return;

        this.delta = delta * 0.01;
        //console.log(this.delta);
        //console.log(input);

        if (input["fire1"]) {
            this.fire1();
        }

        if (input["up"]) {
            this.pitchUp();
        }
        if (input["down"]) {
            this.pitchDown();
        }
        if (input["left"]) {
            this.rollLeft();
        }
        if (input["right"]) {
            this.rollRight();
        }
        if (input["yawLeft"]) {

            this.yawLeft();
        }
        if (input["yawRight"]) {
            this.yawRight();
        }
        if (input["throttleUp"]) {
            //this.move(0, 1, 0);
            this.throttleUp(delta);
        }
        if (input["throttleDown"]) {
            //this.move(0, -1, 0);
            this.throttleDown(delta);
        }

        if (input["verticalThrustUp"]) {
            this.verticalThrustUp();
        }

        if (input["verticalThrustDown"]) {
            this.verticalThrustDown();
        }

        this.integrate(delta);
    }
}