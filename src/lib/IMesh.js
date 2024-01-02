import { PhysicsAggregate, PhysicsShapeType, SceneLoader } from "@babylonjs/core";
import { Quaternion, Vector3 } from "@babylonjs/core";
import { Bus, EVT_PROGRESS } from "./Bus";

export class IMesh {
    homePosition = Vector3.Zero();
    homeRotation = Vector3.Zero(); // note: Quaternions don't work when resetting physics bodies
    homeScaling = new Vector3(1, 1, 1);
    mesh = null;

    previousPosition = Vector3.Zero();
    aggregate = null;

    constructor(scene) {
        this.scene = scene;
    }

    setupTextures(RES) {

    }

    setupPhysics() {
    }

    async load(asset, assetManager) {
        this.assetDefinition = asset;
        let position = new Vector3(asset.position[0], asset.position[1], asset.position[2]);
        let rotation = new Vector3(asset.rotation[0], asset.rotation[1], asset.rotation[2]);
        //let rotationQuaternion = asset.rotationQuaternion? rotationQuaternion = new Quaternion(asset.rotationQuaternion[0], asset.rotationQuaternion[1], asset.rotationQuaternion[2], asset.rotationQuaternion[3]) : new Quaternion(0, 0, 0, 1);        
        this.setHome(position, rotation);
        this.static = asset.static || false;

        return new Promise((resolve, reject) => {
            const meshtask = assetManager.addMeshTask(asset.file, "", "/assets/", asset.file);
            meshtask.onSuccess = (task) => {
                // make result the same form as Mesh loader
                let result = {meshes:task.loadedMeshes, animationGroups: task.loadedAnimationGroups, transformNodes: task.loadedTransformNodes, skeletons: task.loadedSkeletons, particleSystems: task.loadedParticleSystems};
                this.fileContents = result;
                this.mesh = result.meshes[0];
                this.mesh.assetDefinition = asset;

                for (let i = 0; i < result.meshes.length; i++) {
                    let mesh = result.meshes[i];
                    if (mesh) {
                        if (mesh.name === "Collision") {
                            this.mesh = mesh;
                            this.mesh.isVisible = false;
                            this.mesh.rotationQuaternion = Quaternion.FromEulerVector(this.homeRotation);
                            this.mesh.position = this.homePosition.clone();                            
                        }
                        else {
                            mesh.isVisible = true;
                            mesh.isPickable = false;
                            mesh.checkCollisions = false;
                            mesh.receiveShadows = true;
                        }
                    }
                }
                resolve(result);
            }
            meshtask.onError = (task, message, exception) => {
                console.log(message, exception);
                reject(exception);
            }
        });
    };

    setHome(pos, rot) {
        this.homePosition.copyFrom(pos);
        if (rot) {
            this.homeRotation.copyFrom(rot);
        }
    }

    goHome() {
        if (this.aggregate) {

            this.aggregate.body.disablePreStep = false;
            this.aggregate.transformNode.position = this.homePosition.clone().add(new Vector3(0, 0.2, 0));
            //this.aggregate.transformNode.rotationQuaternion = Quaternion.FromEulerVector(this.homeRotation);
            this.aggregate.transformNode.rotationQuaternion = Quaternion.Identity().add(Quaternion.FromEulerAngles(Math.PI, 0, 0));;
            this.aggregate.body.setLinearVelocity(Vector3.Zero());
            this.aggregate.body.setAngularVelocity(Vector3.Zero());

            this.scene.onAfterPhysicsObservable.addOnce(() => {
                this.aggregate.body.disablePreStep = true;
                //this.aggregate.transformNode.rotationQuaternion =
                  //  Quaternion.FromEulerAngles(this.aggregate.transformNode.rotation.x, this.aggregate.transformNode.rotation.y, this.aggregate.transformNode.rotation.z)
                    //    .add(new Quaternion(Math.PI, 0, 0, 1));
            });
        }
    }

    moveBy(x, y, z) {
        this.aggregate.body.disablePreStep = false;
        this.mesh.position.addInPlace(new Vector3(x, y, z));
        this.scene.onAfterPhysicsObservable.addOnce(() => {
            this.aggregate.body.disablePreStep = true;
        });
    }

    rotateBy(x, y, z, w) {
        this.aggregate.body.disablePreStep = false;
        this.mesh.rotationQuaternion.multiplyInPlace(new Quaternion(x, y, z, w));
        this.scene.onAfterPhysicsObservable.addOnce(() => {
            this.aggregate.body.disablePreStep = true;
        });
    }


}