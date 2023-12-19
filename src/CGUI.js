class CGUI {
    help;
    text1 = "";
    text2 = "";
    text3 = "";
    text4 = "";
    text5 = "";
    constructor(scene) {
        this.scene = scene;
        this.canvas = document.getElementById("renderCanvas"); // Get the canvas element
        this.setupDebugGUI();

        Bus.subscribe("r2", (text) => {
            this.text4 = text;
        });

        Bus.subscribe("debug", (text) => {
            this.text5 += text;
        });
    }

    setupDebugGUI() {
        // babylonjs debug gui
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.advancedTexture.idealHeight = 720;
        this.advancedTexture.idealWidth = 1280;
        this.advancedTexture.renderAtIdealSize = true;
        this.advancedTexture.useInvalidateRectOptimization = true;
        //this.advancedTexture.useSmallestIdeal = true;        

        // create label
        this.label = new BABYLON.GUI.TextBlock();

        this.label.text = "Hello world";
        this.label.color = "white";
        this.label.fontSize = 16;
        this.label.fontFamily = "Arial";
        this.label.top = 0;
        this.label.left = 0;
        this.label.width = 1;
        this.label.height = "40px"
        this.advancedTexture.addControl(this.label);
        this.label.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        // position label on top

        // create label
        this.label2 = new BABYLON.GUI.TextBlock();

        this.label2.text = "Torque: 0,0,0";
        this.label2.color = "white";
        this.label2.fontSize = 16;
        this.label2.fontFamily = "Arial";
        this.label2.top = "20px";
        this.label2.left = 0;
        this.label2.width = 1;
        this.label2.height = "40px"
        this.advancedTexture.addControl(this.label2);
        this.label2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.label2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        // create label
        this.label3 = new BABYLON.GUI.TextBlock();

        this.label3.text = "Torque: 0,0,0";
        this.label3.color = "white";
        this.label3.fontSize = 16;
        this.label3.fontFamily = "Arial";
        this.label3.top = "40px";
        this.label3.left = 0;
        this.label3.width = 1;
        this.label3.height = "40px"
        this.advancedTexture.addControl(this.label3);
        this.label3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.label3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.helpText = new BABYLON.GUI.TextBlock();
        this.helpText.text = "I - Ignition.\nWASD - Direction\nQ/E - Yaw\nW/S - Pitch\nA/D - Roll\nG - Landing Gear\nR/F - Vertical Thrust\n\n? - Toggle Help";        
        this.helpText.color = "white";
        this.helpText.fontSize = 14;
        this.helpText.fontFamily = "Arial";
        this.helpText.top = "40px";
        this.helpText.left = "10px";
        this.helpText.width = 0.2;
        this.helpText.height = "140px"
        this.advancedTexture.addControl(this.helpText);
        this.helpText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.helpText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.helpText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        


    }

    setDebugText(textArray) {        
        this.label.text = textArray[0];
        this.label2.text = textArray[1];
        this.label3.text = textArray[2] + " _ " + this.text4 + "_ " + this.text5;
        this.text5 = "";
    }
}