class CSky {
    // Skybox
    constructor(scene) {
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
        skybox.isPickable = false;
        skybox.enableCollisions = false;
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox", scene);
        //skyboxMaterial.reflectionTexture = new BABYLON.HDRCubeTexture("/assets/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }
}