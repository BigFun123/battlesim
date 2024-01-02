import { Quaternion, SceneLoader, Vector3 } from "@babylonjs/core";
import { CLighting } from "./CLighting";
import { Bus } from "./Bus";

export class CNPC {
    constructor(scene) {
        this.scene = scene;
    }
    load(asset) {
        return new Promise((resolve, reject) => {
            SceneLoader.ImportMeshAsync("", "/assets/", asset.file).then((result) => {
                this.fileContents = result;
                this.mesh = result.meshes[0];

                this.mesh.targetname = asset.id;
                this.mesh.namefile = asset.file;
                // recordings have absolute coords, so don't set a root position
                this.mesh.position = new Vector3(asset.position[0], asset.position[1], asset.position[2]);
                //this.mesh.rotationQuaternion = new Quaternion(asset.rotation[0], asset.rotation[1], asset.rotation[2], asset.rotation[3]);
                this.mesh.rotationQuaternion = Quaternion.Identity();

                this.fileContents.meshes.forEach((mesh) => {
                    if (mesh) {
                        if (mesh.name === "CameraTarget") {
                            mesh.isVisible = false;
                        } else
                            if (mesh.name === "Collision") {
                                this.mesh = mesh;
                                this.mesh.name = asset.id;  
                                this.mesh.targetname = asset.id;                              
                                this.mesh.isVisible = false;
                                //const ground = new PhysicsAggregate(this.mesh, PhysicsShapeType.MESH, { mass: 0, restitution: 0.4, friction: 0.5 }, this.scene);
                                //this.aggregate = ground;
                            } else {
                                CLighting.shadowGenerator.addShadowCaster(mesh, true);
                                mesh.receiveShadows = true;
                            }
                    }
                })

                if (asset.recording) {
                    Bus.send("RecordPlay", { recording: asset.recording, mesh: this.mesh });
                }
                if (asset.audio) {                    
                    Bus.send("play-3daudio", { name: asset.audio, mesh: this.mesh, volume: 0.2, loop: true })
                }
                Bus.send("add-radar-item", {mesh: this.mesh, isNPC:true});
                resolve();

            });
        })
    }
}