import { Animation, Color3, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Quaternion, StandardMaterial, TrailMesh, Vector3 } from "@babylonjs/core";
import '@babylonjs/core/Materials/standardMaterial';

import { Bus, EVT_PLAYERUPDATE, EVT_SETVOLUME } from "./Bus";
import { IVehicle } from "./IVehicle";
import { CSettings } from "./CSettings";
import { STATE_GAME } from "./Constants";
import { CBullet } from "./vehicles/CBullet";
import { CExplosionManager } from "./vehicles/CExplosionManager";

export class CAircraft extends IVehicle {

    mode;
    INCOCKPIT = 1;
    EXTERIOR = 0;

    landingGear = 1;
    landingGearLocked = false;
    landingGearDrag = 0.2;
    lift = 0;


    gravity = new Vector3(0, -0.98, 0);
    sideslip = new Vector3(0, 0, 0);
    fire1Sound = "minigun-shooting-awesome-sound-90007.mp3";
    fire2Sound = "missile-blast-2-95177.mp3";
    landingGearSound = "mechanicalclamp-6217.mp3";

    exteriorSound = "jet-loop-01-32474.mp3";
    interiorSound = "airplane-atmos-22955.mp3";
    ambientOff = "wind-outside-sound-ambient-141989.mp3";
    currentSound = this.exteriorSound;
    missileTimer = null;

    missile1;
    bulletman;

    settings = {
        vtol: true,
        missileFireTime: 300
    }

    constructor(scene) {
        super(scene);
        this.maxpower = 60;
        this.minpower = 0;
        //rates
        this.pitchRate = 0.032;
        this.yawRate = 0.015;
        this.rollRate = 0.039;
        this.verticalRate = 0.09;
        this.throttleRate = 0.3;

        this.finalPitch = 0;
        this.powerRate = 1;

        this.autoLevelRate = 0.01;

        


        //Bus.send("play-ambient", { name: this.exteriorSound });
        //Bus.send("play-ambient", { name: this.interiorSound });
        //Bus.send("play-ambient", { name: this.ambientOff });


        Bus.subscribe("control", (data) => {
            console.log(data);
            if (data.input === "ignition") {
                this.ignition = this.ignition ? 0 : 1;
                if (this.ignition) {
                    Bus.send("play-ambient", { name: this.currentSound, fadein: true });
                    Bus.send("play-music", { name: this.ambientOff, fadein: true });

                } else {
                    //Bus.send("stop-ambient", { name: "jet-loop-01-32474.mp3" });
                    Bus.send("play-ambient", { name: this.ambientOff, fadein: true })
                }
            }
            if (data.input === "landinggear") {
                this.toggleLandingGear();
            }
            if (data.input === "reset") {
                this.reset();
            }
            if (data.input === "fire1") {
                this.fire1();
            }
            if (data.input === "fire2") {
                this.fire2();
            }
        });

        Bus.subscribe("camera", (data) => {
            this.mode = data.mode;
            if (data.mode == this.EXTERIOR) {
                this.currentSound = this.exteriorSound;
                if (this.ignition) {
                    Bus.send("play-ambient", { name: this.exteriorSound });
                    Bus.send("player", { position: this.mesh.position });
                }

            }
            if (data.mode == this.INCOCKPIT) {
                this.currentSound = this.interiorSound;
                if (this.ignition) {
                    Bus.send("play-ambient", { name: this.interiorSound });
                } else {
                    Bus.send("play-ambient", { name: this.ambientOff });
                    Bus.send("player", { position: this.mesh.position }); 1
                }
            }
        })
    }

    async load(asset, assetManager) {
        return super.load(asset, assetManager)
        .then(result=>{

            this.bulletman = new CBullet(this.mesh, this.scene);
            // set each mesn renderingGroupId to 2
            result.meshes.forEach((mesh) => {
                mesh.renderingGroupId = 2;
            });

            result.animationGroups.forEach((animationGroup) => {                
                animationGroup.enableBlending = true;
                if (animationGroup.name.toLowerCase() !== "landinggear") {
                    animationGroup.play(false);
                    animationGroup.speedRatio = 1;
                }
                //console.log(animationGroup.name);                
            });
        })
    }

    integrate(delta) {
        /*if (this.power) {
            this.lift = (this.power > 0.4) ? this.power *0.5 : 0;
        }*/

        this.yaw = Math.min(Math.max(this.yaw, -1), 1);
        this.roll = Math.min(Math.max(this.roll, -1), 1);
        this.pitch = Math.min(Math.max(this.pitch, -1), 1);

        this.power += this.throttle * this.throttleRate;
        this.power = Math.max(Math.min(this.maxpower, this.power), this.minpower);

        if (this.power > 0.3) {
            this.power -= (this.landingGear * this.landingGearDrag);
        }


        this.finalPower = this.power * this.powerRate;
        if (this.finalPower > 0.1) {
            this.finalPitch = -(this.pitch * Math.abs(this.pitch)) * this.pitchRate;
        }

        this.finalRoll = (this.roll * Math.abs(this.roll)) * this.rollRate;
        this.finalYaw = -this.yaw * this.yawRate;
        this.finalYaw += this.finalRoll * 0.1;

        this.finalVertical = this.settings.vtol ? this.verticalThrust * this.verticalRate : 0;
        this.finalVertical += this.lift;
        //this.finalVertical += this.gravity.y * 1 * (3 - this.finalPower);


        // auto leveling
        //if (this.mesh.forward.z > 0.8 ) {
        //  this.pitch -= (1 - Math.abs(this.mesh.forward.z)) * 0.1;
        //}

        if ((this.near(this.roll, 0, 0.1))
            && (this.near(this.pitch, 0, 0.1))
            && (this.near(this.yaw, 0, 0.1))
            && this.finalPower > 0.4) {
            this.finalRoll -= this.euler.z * this.autoLevelRate;
            this.finalPitch -= this.euler.x * this.autoLevelRate;
        }


        if (this.mesh) {
            let tran = this.aggregate.transformNode;
            if (this.ignition) {
                const currRot = this.mesh.rotationQuaternion;
                const amountToRotateQuat = Quaternion.FromEulerAngles(this.finalPitch, this.finalYaw, this.finalRoll);
                currRot.multiplyInPlace(amountToRotateQuat);
                this.aggregate.body.setTargetTransform(this.mesh.getAbsolutePosition()
                    .add(tran.forward.scale(-this.finalPower)
                        .add(tran.up.scale(this.finalVertical)))                        
                    //.add(this.gravity.scale(this.finalPower))
                    ,
                    tran.rotationQuaternion, 1);
            }

        }

        this.yaw *= 0.99;
        this.pitch *= 0.99;
        this.roll *= 0.99;
        this.power *= 0.99;
        
        this.applyAnimations();
        if (CSettings.state == STATE_GAME) {
            Bus.send(EVT_PLAYERUPDATE, { mesh: this.mesh, position: this.mesh.position, power: this.finalPower });
        }

        if (this.currentSound ) {
            //Bus.send(EVT_SETVOLUME, { name: this.currentSound, volume: this.finalPower / 100 })            
        }

        if (CSettings.settings.debug) {
            // get quantized x,y,z coordinates
            var x = Math.round(this.mesh.position.x / 10) * 10;
            var y = Math.round(this.mesh.position.y / 10) * 10;
            var z = Math.round(this.mesh.position.z / 10) * 10;
            Bus.send("debug", `x:${x} y:${y} z:${z}`);
        }
        

    }

    applyAnimations() {

        if (this.yaw > 0) {
            //this.stopAnim("yawleft");
            this.playAnim("yawright", 1, this.yaw, this.yaw);

        } else {
            //this.stopAnim("yawRight");
            this.playAnim("yawleft", 1, -this.yaw, -this.yaw);
        }

        if (this.pitch > 0) {
            //this.stopAnim("pitchdown");
            this.playAnim("pitchup", 1, this.pitch, this.pitch);
            this.playAnim("tailup", 1, this.pitch, this.pitch);
        } else {
            //this.stopAnim("pitchup");
            this.playAnim("pitchdown", 1, -this.pitch, -this.pitch);
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

    fire1() {
        Bus.send("play-audio", { name: this.fire1Sound });
        this.bulletman.fireBullet();
    }

    fire2() {
        if (this.missile1.readyToFire) {
            this.fireMissile(this.missile1);
        }
    }

    fireMissile(missile) {
        Bus.send("play-3daudio", { name: this.fire2Sound, mesh: missile, volume: this.mode == this.INCOCKPIT ? 0.05 : 0.10 });
        //missile.readyToFire = false;

        if (!missile.aggregate) {
            missile.aggregate = new PhysicsAggregate(missile, PhysicsShapeType.BOX, { mass: 5.1, friction: 0.5, restitution: 0.5 }, this.scene);
            missile.aggregate.body.setGravityFactor(0.1);
            missile.aggregate.body.setCollisionCallbackEnabled(true); 
            missile.aggregate.transformNode.nameFile = "missile";
        }

        if (missile.trail) {
            missile.trail.stop();
            missile.trail.dispose();
            missile.trail = null;
        }
        missile.setParent(undefined);
        missile.aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);


        missile.aggregate.body.disablePreStep = false;
        missile.aggregate.transformNode.position = this.getPosition().add(missile.mountPoint).add(this.aggregate.transformNode.forward.scale(-20));
        missile.aggregate.transformNode.rotationQuaternion = this.getRotation();
        //missile.enableCollisions = true;
        this.scene.onAfterPhysicsObservable.addOnce(() => {
            if (missile.aggregate.body) {
                missile.aggregate.body.disablePreStep = true;
            }
        });

        var trail = new TrailMesh('orb trail', missile, this.scene, 0.2, 30, true);
        const sourceMat = new StandardMaterial("sourceMat", this.scene);
        sourceMat.emissiveColor = sourceMat.diffuseColor = new Color3(0.8, 0.75, 0.7);
        sourceMat.specularColor = new Color3(1, 1, 0);
        trail.material = sourceMat;
        missile.trail = trail;       


        // move the missile forward for 5 seconds        
        missile.aggregate.body.setLinearVelocity(this.aggregate.transformNode.forward.scale(-5000000));
        missile.aggregate.body.setAngularVelocity(new Vector3(0, 0, 0));
        missile.aggregate.body.setLinearDamping(0.001);
        missile.aggregate.body.setAngularDamping(0.001);
        //missile.aggregate.body.setMassProps(10, new Vector3(1, 1, 1));
        missile.aggregate.body.setCollisionCallbackEnabled(true);

         missile.aggregate.body.getCollisionObservable().add((collider) => {
            //console.log("missile collision", collider);            
            if (missile.aggregate) {
                CExplosionManager.explode(missile.aggregate.transformNode.position.clone());
                missile.aggregate.body.getCollisionObservable().remove(collider);
                missile.aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
                //missile.aggregate.dispose();
                
                //missile.aggregate = null;                
                Bus.send("play-3daudio", { name: "massive-thump-116359.mp3", mesh: missile, volume: this.mode == this.INCOCKPIT ? 0.55 : 0.70 });
                
            }

            if (missile.trail) {
                missile.trail.stop();
                missile.trail.dispose();
                missile.trail = null;
            }


            //if (collider.body.getOwner() && collider.body.getOwner().nameFile) {
            //console.log("missile collision", collider.body.nameFile);
            //}
        });
        //missile.aggregate.body.setCollisionFilterGroupMask(0);
        //missile.aggregate.body.setCollisionFilterMask(0);        
    }
       

    reset() {
        super.reset();
    }



    toggleLandingGear() {
        console.log("toggle landing gear");
        if (this.landingGearLocked) {
            return;
        }
        Bus.send("play-audio", { name: this.landingGearSound, volume: this.mode == this.INCOCKPIT ? 0.05 : 0.01 });
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
        this.mesh.rotationQuaternion = new Quaternion(0, 0, 0, 1);
        this.fileContents.animationGroups.forEach((anim) => {
            anim.weight = 0;
        });       
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
                anim.goToFrame(Math.round(framePercent * 200));
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





    addTorque() {
        var body = this.aggregate.body;
        //var torqueWorld = this.mesh.forward.scale(this.finalRoll).add(this.mesh.up.scale(this.finalYaw)).add(this.mesh.right.scale(this.finalPitchq));
        var torqueWorld = this.finalTorque;
        //var torqueWorld = new Vector3(0,this.finalYaw,this.finalPitch);

        var massProps = body.getMassProperties();
        var worldFromInertia = massProps.inertiaOrientation.multiply(body.transformNode.absoluteRotationQuaternion);
        var inertiaFromWorld = worldFromInertia.conjugate();
        var impLocal = torqueWorld.applyRotationQuaternion(inertiaFromWorld);
        var impWorld = impLocal.multiply(massProps.inertia).applyRotationQuaternion(worldFromInertia);
        var newAV = body.getAngularVelocity().add(impWorld.scale(this.scene.getPhysicsEngine().getTimeStep()));
        body.setAngularVelocity(newAV);
    }

}