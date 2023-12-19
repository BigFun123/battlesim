class CTerrain {
    load(asset) {
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.ImportMeshAsync("", "/assets/", asset.file).then((result) => {
                this.fileContents = result;
                this.mesh = result.meshes[0];
            })
        });
    }
}