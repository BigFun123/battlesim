import { PhysicsAggregate, PhysicsShapeType, Quaternion, SceneLoader, Vector3 } from "@babylonjs/core";
import { Bus } from "./Bus";

export class CStaticMesh {
    constructor(scene, assetManager) {
        this.scene = scene;
        this.assetManager = assetManager;
    }
    load(asset) {
        this.position = new Vector3(asset.position[0], asset.position[1], asset.position[2]);
        if (asset.rotationQuaternion) {
            this.rotationQuaternion = new Quaternion(asset.rotationQuaternion[0], asset.rotationQuaternion[1], asset.rotationQuaternion[2], asset.rotationQuaternion[3]); //
        } else {
            this.rotationQuaternion = new Quaternion(0, 0, 0, 1);
        }
        

        const meshTask = this.assetManager.addMeshTask(asset.file, "", "/assets/", asset.file);
        meshTask.onSuccess = (task) => {
            this.mesh = task.loadedMeshes[0];
            this.mesh.position = this.position;
            this.mesh.receiveShadows = true;
            this.mesh.checkCollisions = true;
            this.mesh.isVisible = true;
            this.mesh.isPickable = false;
            this.mesh.assetDefinition = asset;
            this.mesh.nameFile = asset.file;
            this.mesh.name = asset.name || asset.file;

            task.loadedMeshes.forEach((mesh) => {
                if (mesh) {
                    if (mesh.name === "__root__") {
                        mesh.position = this.position;
                        mesh.rotationQuaternion = this.rotationQuaternion;
                    }
                    if (mesh.name === "Collision") {                        
                        mesh.namefile = asset.file;
                        this.mesh = mesh;
                        this.mesh.isVisible = false;
                        const ground = new PhysicsAggregate(this.mesh, PhysicsShapeType.MESH, { mass: 0, restitution: 0.4, friction: 0.1 }, this.scene);
                        this.aggregate = ground;
                        mesh.enableCollisions = true;
                        this.aggregate.body.setCollisionCallbackEnabled(true);
                        //this.aggregate.body.setEventMask(PhysicsEventType.COLLISION_STARTED);
                        //this.aggregate.shape.filterCollideMask = GROUP_PLAYER;
                        //this.aggregate.shape.filterMembershipMask = GROUP_PLAYER;   
                        this.aggregate.transformNode.nameFile = asset.file;
                    } else {
                        mesh.receiveShadows = true;
                    }
                }
            })            
        };
        return meshTask;
    }
}