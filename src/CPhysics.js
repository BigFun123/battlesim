class CPhysics {
    havokInstance = null;
    constructor(scene) {
        this.scene = scene;
        //this.setupPhysics();
    }

    async setupPhysics() {
        //HavokPhysics().then((havok) => {
          //  this.havokInstance = havok;
            //this.havokInstance.initPhysics(this.scene);
        //});
        this.havokInstance = await HavokPhysics();
        this.havokPlugin = new BABYLON.HavokPlugin(true, this.havokInstance);
        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), this.havokPlugin);
    }
    
}