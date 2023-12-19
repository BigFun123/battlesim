class CSky {
    // Skybox
    constructor(scene) {
        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
        skybox.isPickable = false;
        skybox.enableCollisions = false;
        skybox.enablePhysics = false;
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox", scene);
        //skyboxMaterial.reflectionTexture = new BABYLON.HDRCubeTexture("/assets/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        this.skybox = skybox;

        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        scene.fogDensity = 0.0001;
        scene.fogStart = 120.0;
        scene.fogEnd = 200.0;
        scene.fogColor = new BABYLON.Color3(0.6, 0.7, 0.85);
    }

    update(playerPosition) {
        this.skybox.position = playerPosition.clone();
    }
}