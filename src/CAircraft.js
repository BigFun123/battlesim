class CAircraft extends IVehicle {
    landingGear = 1;
    landingGearLocked = false;


    constructor(modelFile, scene) {
        super(modelFile, scene);
        this.maxpower = 60;
        this.minpower = 0;
        //rates
        this.pitchRate = 0.014;
        this.yawRate = 0.012;
        this.rollRate = 0.035;
        this.verticalRate = 0.01;

        this.finalPitch = 0;
        this.powerRate = 10;
        this.throttleRate = 0.5;

        Bus.subscribe("control", (data) => {
            console.log(data);
            if (data.input === "ignition") {
                this.reset();
                this.ignition = !this.ignition;
            }
            if (data.input === "landinggear") {
                this.toggleLandingGear();
            }
            if (data.input === "reset") {
                this.reset();
            }
        });
    }

    reset() {
        super.reset();
    }

    toggleLandingGear() {
        console.log("toggle landing gear");
        if (this.landingGearLocked) {
            return;
        }
        this.stopAllAnims();
        this.landingGearLocked = true;
        this.landingGear = this.landingGear ? 0 : 1;
        if (this.landingGear === 0) {
            this.playFullAnim("landingGear", 1);
        } else {
            this.playFullAnim("landingGear", -1);
        }
        setTimeout(() => {
            this.landingGearLocked = false;
            console.log("langing gear unlocked");
        }, 5000);


    }

    setup() {
        // set all the animationGroups weight to 0
        this.mesh.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
        this.fileContents.animationGroups.forEach((anim) => {
            anim.weight = 0;
        });
        //if (this.skeleton) {
        //var idleAnim = scene.beginWeightedAnimation(this.skeleton, 0, 89, 1.0, true);

        //       }
    }

    playFullAnim(name, speed) {
        this.fileContents.animationGroups.forEach((anim) => {
            if (anim.name.toLowerCase() === name.toLowerCase()) {
                // anim.stop();
                //anim.enableBlending = true;
                anim.loopAnimation = false;
                if (speed == -1) {
                    anim.goToFrame(anim.to);
                } else {
                    anim.goToFrame(anim.from);
                }
                anim.weight = 1;
                anim.speedRatio = speed;
                anim.play(false);
                anim.enableBlending = true;
            }
        });
    }

    playAnim(name, speed, framePercent, weight) {
        this.fileContents.animationGroups.forEach((anim) => {
            if (anim.name.toLowerCase() === name.toLowerCase()) {
                //anim.pause();
                //console.log(name, speed, framePercent, weight);
                anim.goToFrame(Math.round(framePercent * 100));
                //anim.play(false);
                //anim.start(false, 1, anim.from, anim.to, false)
                //anim.pause();
                //anim.start(false, 1, anim.from, anim.to, false)
                //anim.enableBlending = true;
                //anim.isAdditive = true;
                //anim.blendingSpeed = 1;
                //anim.loopAnimation = false;
                anim.weight = weight;
                anim.speedRatio = 0;
                anim.enableBlending = true;

            } else {
                //anim.goToFrame(0);
                //anim.weight = 1;
                //anim.play(false);
            }
        });
    }

    stopAnim(name) {
        this.fileContents.animationGroups.forEach((anim) => {
            if (anim.name.toLowerCase() === name.toLowerCase()) {
                //              anim.weight = 0;
                //anim.stop();
                //                anim.pause();
            }
        });
    }

    stopAllAnims() {
        this.fileContents.animationGroups.forEach((anim) => {
            if (anim.name.toLowerCase() !== "landinggear") {
                anim.weight = 0;
            }

            //anim.stop();
            //anim.pause();
        });
    }



    integrate() {
        if (this.power) {
            this.lift = (this.power > 0.1) ? this.power *0.5 : 0;
        }

        this.yaw = Math.min(Math.max(this.yaw, -1), 1);
        this.roll = Math.min(Math.max(this.roll, -1), 1);
        this.pitch = Math.min(Math.max(this.pitch, -1), 1);

        this.power = this.throttle * this.throttleRate;
        this.power = Math.max(Math.min(this.maxpower, this.power), this.minpower)   ;

        this.finalPitch = this.pitch * this.pitchRate;
        this.finalYaw = -this.yaw * this.yawRate;
        this.finalRoll = -this.roll * this.rollRate;
        this.finalPower = this.power * this.powerRate;
        this.finalVertical = this.verticalThrust * this.verticalRate + this.lift;


        //this.position.x += x;
        //this.position.y += y;
        //this.position.z += z;
        if (this.mesh) {
            let tran = this.imposter.transformNode;
            //let finalVelocity = tran.forward.scale(this.finalPower);
            //const centerOfMass = this.mesh.getAbsolutePosition().add(tran.up.scale(28.1));
            //this.imposter.body.applyForce(tran.forward.scale(this.finalPower), this.mesh.getAbsolutePosition());



            if (this.ignition) {
                const currRot = this.mesh.rotationQuaternion;
                const amountToRotateQuat = BABYLON.Quaternion.FromEulerAngles(this.finalPitch, this.finalYaw, this.finalRoll);
                currRot.multiplyInPlace(amountToRotateQuat);
                this.imposter.body.setTargetTransform(this.mesh.getAbsolutePosition().add(tran.forward.scale(this.finalPower).add(tran.up.scale(this.finalVertical))), tran.rotationQuaternion, 1);
            }


            //var yawAxis = new BABYLON.Vector3(0, -1, 0).scale(this.finalYaw);
            //var pitchAxis = new BABYLON.Vector3(0, 0, 1).scale(this.finalPitch);
            //var rollAxis = new BABYLON.Vector3(-1, 0, 0).scale(this.finalRoll);
            //const amountToPitch = BABYLON.Quaternion.FromEulerAngles(this.finalPitch, 0, 0);          

            //this.imposter.body.applyForce(tran.right.scale(this.finalYaw), centerOfMass.add(tran.forward.scale(-20)));            
            //this.imposter.body.applyForce(tran.up.scale(this.finalPitch), centerOfMass.add(tran.forward.scale(12)));
            //this.imposter.body.applyForce(tran.up.scale(this.finalRoll), centerOfMass.add(tran.right.scale(17)));

        }

        this.yaw *= 0.99;
        this.pitch *= 0.99;
        this.roll *= 0.99;
        this.verticalThrust *= 0.99;
        //this.power *= 0.99;

        //this.rotation.z *= 0.999
        //this.rotation.x *= 0.99;


        if (this.yaw > 0) {
            //this.stopAnim("yawleft");
            this.playAnim("yawright", 1, this.yaw, this.yaw);

        } else {
            //this.stopAnim("yawRight");
            this.playAnim("yawleft", 1, -this.yaw, -this.yaw);
        }

        if (this.pitch > 0) {
            //this.stopAnim("pitchdown");
            //this.playAnim("pitchup", 1, this.pitch, this.pitch);
            this.playAnim("tailup", 1, this.pitch, this.pitch);
        } else {
            //this.stopAnim("pitchup");
            //this.playAnim("pitchdown", 1, -this.pitch, -this.pitch);
            this.playAnim("tailup", 1, this.pitch, this.pitch);
        }

        if (this.roll > 0) {
            //this.stopAnim("rollleft");
            this.playAnim("rollright", 1, this.roll, this.roll);
        } else {
            //this.stopAnim("rollright");
            this.playAnim("rollleft", 1, -this.roll, -this.roll);
        }


        //this.playAnim("rollleft", 1, -this.roll, -this.roll);
        //this.playAnim("rollright", 1, this.roll, this.roll);
        //this.playAnim("pitchup", 1, this.pitch, this.pitch);
        //this.playAnim("pitchdown", 1, -this.pitch, -this.pitch);
        //this.playAnim("landingGear", 1, this.landingGear, this.landingGear);
    }

    addTorque() {
        var body = this.imposter.body;
        //var torqueWorld = this.mesh.forward.scale(this.finalRoll).add(this.mesh.up.scale(this.finalYaw)).add(this.mesh.right.scale(this.finalPitchq));
        var torqueWorld = this.finalTorque;
        //var torqueWorld = new BABYLON.Vector3(0,this.finalYaw,this.finalPitch);

        var massProps = body.getMassProperties();
        var worldFromInertia = massProps.inertiaOrientation.multiply(body.transformNode.absoluteRotationQuaternion);
        var inertiaFromWorld = worldFromInertia.conjugate();
        var impLocal = torqueWorld.applyRotationQuaternion(inertiaFromWorld);
        var impWorld = impLocal.multiply(massProps.inertia).applyRotationQuaternion(worldFromInertia);
        var newAV = body.getAngularVelocity().add(impWorld.scale(this.scene.getPhysicsEngine().getTimeStep()));
        body.setAngularVelocity(newAV);
    }

}