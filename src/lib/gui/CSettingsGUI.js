import * as GUI from '@babylonjs/gui';

export class CSettingsGUI {
    constructor(scene) {
        this.setupGUI();
    }

    setupGUI() {
        this.dialog = CGUIHelper.createDialog("Settings", 0.5, "200px", "100px", "100px");
        this.dialog.isVisible = true;

    }


}