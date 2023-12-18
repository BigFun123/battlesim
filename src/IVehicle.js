class IVehicle {
    position;
    rotation;
    scale;
    mesh;
    model;
    fileContents;

    ignition = 0;

    throttle = 0;
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

    imposter;

    constructor(model, scene) {
        this.scene = scene;
        this.model = model;
        this.position = new BABYLON.Vector3(0, 0, 0);
        this.rotation = new BABYLON.Vector3(0, -45 * Math.PI / 180, 0);
        this.scale = new BABYLON.Vector3(1, 1, 1);
        this.mesh = null;
    }

    getDebugText() {        
        return [`throttle: ${this.throttle.toFixed(2)} power: ${this.power.toFixed(2)} pitch: ${this.pitch.toFixed(2)}/${this.finalPitch.toFixed(2)} roll: ${this.roll.toFixed(2)}/${this.finalRoll.toFixed(2)} yaw: ${this.yaw.toFixed(2)} / ${this.finalYaw.toFixed(2)} vert: ${this.verticalThrust.toFixed(2)}`
            //, `torque: ${this.finalTorque.x.toFixed(2)}, ${this.finalTorque.y.toFixed(2)}, ${this.finalTorque.z.toFixed(2)}`
            // up
            , `up: ${this.mesh.up.x.toFixed(2)}, ${this.mesh.up.y.toFixed(2)}, ${this.mesh.up.z.toFixed(2)}`
        ];
    }

    reset() {
        this.power = 0;
        this.throttle = 0;
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
        this.verticalThrust = 0;
    }

    setup() {

    }
    load(position, isStatic) {
        this.static = isStatic;
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.ImportMeshAsync("", "/assets/", this.model).then((result) => {
                this.fileContents = result;
                this.mesh = result.meshes[0];
                //this.mesh.applyGravity = true;
                //this.mesh.checkCollisions = true;
                //result.meshes[1].checkCollisions = true;
                
                result.animationGroups.forEach((animationGroup) => {
                    //animationGroup.play(false);
                    animationGroup.enableBlending = true;
                    if (animationGroup.name.toLowerCase() !== "landinggear") {
                        animationGroup.play(false);
                        animationGroup.speedRatio = 0;
                    }
                    
                    
                    //animationGroup.syncAllAnimationsWith(null);                    
                    console.log(animationGroup.name);
                    //animationGroup.play(true);
                });

                /*this.mainAnimationGroup = BABYLON.AnimationGroup.MergeAnimationGroups(result.animationGroups, false, true, 0.1);
                this.mainAnimationGroup.enableBlending = true;
                this.mainAnimationGroup.play(true);*/
                this.skeleton = result.skeletons[0];
                //this.mesh.setDirection(BABYLON.Axis.X);
                //this.mesh.position = this.position;
                //this.mesh.rotation = this.rotation;
                //this.mesh.scaling = this.scale;

                // add shadows to each mesh
                this.fileContents.meshes.forEach((mesh) => {
                    if (mesh) {
                        if (mesh.name === "Collision") {
                            mesh.position = position;
                            this.mesh = mesh;
                            this.mesh.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                            //mesh.checkCollisions = true;
                            this.mesh.applyGravity = true;
                            //mesh.setEnabled(false);
                            mesh.isVisible = false;
                            this.imposter = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: this.static ? 0 : 1000, friction: 0.5, restitution: 0.5 }, this.scene);
                            this.imposter.body.setMassProperties({centerOfMass: mesh.position});

                            //mesh.receiveShadows = true;
                            console.log("collision mesh found", this.model, mesh.name, "static", this.static);
                        }

                        if (mesh.name == "CameraTarget") {
                            //mesh.setEnabled(false);
                            mesh.isVisible = false;
                        }

                        //shadowGenerator.addShadowCaster(mesh);
                        // mesh.receiveShadows = true;
                        //mesh.checkCollisions = true;
                    }
                });
                this.setup();
                resolve(this.mesh);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    setHome(x, y, z) {
        this.homePosition = new BABYLON.Vector3(x, y, z);
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    moveTo(x, y, z) {
        /*this.position.x = x;
        this.position.y = y;
        this.position.z = z;*/
        //if (this.mesh) {
        //  this.mesh.position = new BABYLON.Vector3(x, y, z);
        //}
        //this.imposter.body.setAbsolutePosition(new BABYLON.Vector3(x, y, z));
        //this.imposter.body.setTargetTransform(new BABYLON.Vector3(x, y, z), new BABYLON.Quaternion(0, 0, 0, 1));
        const plugin = this.scene.getPhysicsEngine().getPhysicsPlugin();
        plugin.setBodyPosition(this.imposter.body, new BABYLON.Vector3(x, y, z));
    }

    getCameraTarget() {
        // find mesh named "cameraTarget"
        const mesh = this.fileContents.meshes.find((mesh) => {

            return mesh.name === "CameraTarget";

        });
        mesh && mesh.setEnabled(false);
        //mesh.scaling = new BABYLON.Vector3(0.0001, 0.0001, 0.0001);
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

    throttleUp() {
        this.throttle += 0.1;
        //this.throttle = Math.min(this.maxpower + 2, this.throttle);
    }

    throttleDown() {
        this.throttle -= 0.1;
        //this.throttle = Math.max(0, this.throttle);
    }

    verticalThrustUp() {
        this.verticalThrust += 0.1;
    }

    verticalThrustDown() {
        this.verticalThrust -= 0.1;
    }



    // thrust, yaw, pitch, roll
    setInputs(input, delta) {
        this.delta = delta * 0.0001;
        //console.log(this.delta);
        //console.log(input);
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
            this.throttleUp();
        }
        if (input["throttleDown"]) {
            //this.move(0, -1, 0);
            this.throttleDown();
        }

        if (input["verticalThrustUp"]) {
            this.verticalThrustUp();
        }

        if (input["verticalThrustDown"]) {
            this.verticalThrustDown();
        }

        if (input["reset"]) {
            this.moveTo(this.homePosition.x, this.homePosition.y, this.homePosition.z);
            this.reset();
        }

        this.integrate();
    }
}