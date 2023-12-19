class CTerrain {
    load(asset) {
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.ImportMeshAsync("", "/assets/", asset.file).then((result) => {
                this.fileContents = result;
                this.mesh = result.meshes[0];

                this.fileContents.meshes.forEach((mesh) => {
                    if (mesh) {
                        if (mesh.name === "Collision") {
                            this.mesh = mesh;
                            this.mesh.isVisible = false;
                        }
                    }
                })
                resolve();

            });
        })
    }
}