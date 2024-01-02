import * as GUI from '@babylonjs/gui';
import { Bus, EVT_PROGRESS, EVT_SETSTATE } from '../Bus.js';
import { CSettings } from '../CSettings.js';
import { STATE_GAME, STATE_MAINMENU } from '../Constants.js';
import { GUIHelper } from './GUIHelper.js';
import { EngineInstrumentation } from '@babylonjs/core';

export class CGUI {
    static adt;
    help;

    progressTimeout;
    progressArray = [];

    constructor(scene) {
        this.scene = scene;
        this.scene.engine = scene.getEngine();
        this.canvas = document.getElementById("renderCanvas"); // Get the canvas element
        // babylonjs debug gui
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.advancedTexture.layer.layerMask = 0x20000000;
        CGUI.adt = this.advancedTexture;
        this.advancedTexture.idealHeight = 720;
        this.advancedTexture.idealWidth = 1280;
        this.advancedTexture.renderAtIdealSize = true;
        this.advancedTexture.useInvalidateRectOptimization = true;
        //this.advancedTexture.useSmallestIdeal = true;    

        this.setupBG();
        this.setupProgress();
        this.setupHelpText();
        

        if (CSettings.settings.debug == true) {
            this.setupDebugGUI();
            this.setupPerfCounter();
            Bus.subscribe("debug", (text) => {
                this.setDebugText(text);
            });
        }

        this.setupRecordingIndicator();
        this.setupEscapeMenu();

        if (CSettings.settings.showSplash) {
            this.setupSplashScreen();
        };

        Bus.subscribe(EVT_SETSTATE, (state) => {
            if (state === STATE_GAME) {
                this.showHelpText();
                this.bg.isVisible = false;
            } else {
                this.bg.isVisible = true;
            }
        });

        Bus.subscribe("showsplash", () => {
            this.setupSplashScreen();
        });

        Bus.subscribe(EVT_PROGRESS, (data) => {
            this.showProgress(data);
        });

        Bus.subscribe("show-dialog", (data) => {
            this.showDialog(data);
        });

        Bus.subscribe("RecordStart", () => {
            this.recordingIndicator.isVisible = true;
        });

        Bus.subscribe("RecordStop", () => {
            this.recordingIndicator.isVisible = false;
        });


    }

    setupBG() {
        let bg = new GUI.Image("bg", "/assets/art/bg_loading.jpg");
        bg.width = 1;
        bg.height = 1;
        bg.stretch = GUI.Image.STRETCH_FILL;
        bg.alpha = 1;
        bg.zIndex = -99;
        bg.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        bg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        CGUI.adt.addControl(bg);
        this.bg = bg;
    }

    setupHelpText() {
        this.helpText = new GUI.TextBlock();
        this.helpText.text = "1/2/3/4 - Camera\nI - Ignition.\nCTRL/SHIFT - throttle\nWASD - Direction\nQ/E - Yaw\nW/S - Pitch\nA/D - Roll\nG - Landing Gear\nR/F - Vertical Thrust\n\n? - Toggle Help";
        this.helpText.color = "white";
        this.helpText.fontSize = 14;
        this.helpText.fontFamily = "Arial";
        this.helpText.top = "60px";
        this.helpText.left = "10px";
        this.helpText.width = 0.2;
        this.helpText.background = "black";
        this.helpText.height = "180px";
        this.advancedTexture.addControl(this.helpText);
        this.helpText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.helpText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.helpText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.helpText.isVisible = false;
    }

    showHelpText() {
        this.helpText.isVisible = true;
        setTimeout(() => {
            this.helpText.isVisible = false;
        }, 20000);
    }

    showProgress(data) {
        if (!data) return;        
        this.progress.isVisible = true;

        let found = false;
        this.progressArray.forEach((item) => {
            if (data.text == item.text) {
                item.progress = data.progress;
                found = true;
            }
        }
        );
        if (!found) {
            this.progressArray.push(data);
        }

        this.progress.text = "";
        for (let i = 0; i < this.progressArray.length; i++) {
            this.progress.text += this.progressArray[i].text+ " " + this.progressArray[i].progress.toFixed(2) + "%\n";
        }

        while(this.progressArray.length > 20) {
            this.progressArray.shift();
        }


        clearTimeout(this.progressTimeout);
        this.progressTimeout = setTimeout(() => {
            this.progress.text = "";
            this.progress.isVisible = false;
            this.progressArray = [];
        }, 4000);
    }

    setupPerfCounter() {
        // Instrumentation
        this.instrumentation = new EngineInstrumentation(this.scene.engine);
        this.instrumentation.captureGPUFrameTime = true;
        this.instrumentation.captureShaderCompilationTime = true;

        // Create a container for instrumentation
        var perfContainer = new GUI.Rectangle();
        perfContainer.width = "250px";
        perfContainer.height = "80px";
        perfContainer.cornerRadius = 5;
        perfContainer.color = "black";
        perfContainer.thickness = 1;
        perfContainer.background = "black";
        perfContainer.alpha = 0.9;
        CGUI.adt.addControl(perfContainer);
        perfContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        perfContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        perfContainer.top = "0px";
        perfContainer.left = "-10px";
        perfContainer.zIndex = 1000;
        

        // Create a text label for FPS
        var fpsLabel = new GUI.TextBlock();
        fpsLabel.text = "FPS: ";
        fpsLabel.color = "white";
        fpsLabel.fontSize = 12;
        fpsLabel.fontFamily = "Arial";
        fpsLabel.top = "1px";
        fpsLabel.left = "10px";
        fpsLabel.width = 1;
        fpsLabel.height = "40px"
        perfContainer.addControl(fpsLabel);
        fpsLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        fpsLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        // Create a text label for GPU frame time
        var gpuFrameTimeLabel = new GUI.TextBlock();
        gpuFrameTimeLabel.text = "GPU Frame Time: ";
        gpuFrameTimeLabel.color = "white";
        gpuFrameTimeLabel.fontSize = 12;
        gpuFrameTimeLabel.fontFamily = "Arial";
        gpuFrameTimeLabel.top = "18px";
        gpuFrameTimeLabel.left = "10px";
        gpuFrameTimeLabel.width = 1;
        gpuFrameTimeLabel.height = "40px"
        perfContainer.addControl(gpuFrameTimeLabel);
        gpuFrameTimeLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        gpuFrameTimeLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        // Create a text label for shader compilation time
        var shaderCompilationTimeLabel = new GUI.TextBlock();
        shaderCompilationTimeLabel.text = "Shader Compilation Time: ";
        shaderCompilationTimeLabel.color = "white";

        shaderCompilationTimeLabel.fontSize = 12;
        shaderCompilationTimeLabel.fontFamily = "Arial";
        shaderCompilationTimeLabel.top = "36px";
        shaderCompilationTimeLabel.left = "10px";
        shaderCompilationTimeLabel.width = 1;
        shaderCompilationTimeLabel.height = "40px"
        perfContainer.addControl(shaderCompilationTimeLabel);
        shaderCompilationTimeLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        shaderCompilationTimeLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        // update the fps and gpu time labels
        this.scene.registerBeforeRender(() => {
            fpsLabel.text = "FPS: " + this.scene.engine.getFps().toFixed();
            gpuFrameTimeLabel.text = "GPU Frame Time: " + this.instrumentation.gpuFrameTimeCounter.current.toFixed(2) + " ms";
            shaderCompilationTimeLabel.text = "Shader Compilation Time: " + this.instrumentation.shaderCompilationTimeCounter.current.toFixed(2) + " ms";
        });
    }

    setupEscapeMenu() {
        // create a button in the top left corner to open the main menu
        const button = GUIHelper.createImageButton("/assets/icons/menu.png", "", "30px", "30px", () => {
            //this.missionDialog.isVisible = true;
            Bus.send(EVT_SETSTATE, STATE_MAINMENU);
        });
        button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        button.top = "10px";
        button.left = "10px";
        button.zIndex = 1000;
        CGUI.adt.addControl(button);
    }


    setupRecordingIndicator() {
        // an R in a red box in the top right corner
        this.recordingIndicator = new GUI.Rectangle();
        this.recordingIndicator.width = "50px";
        this.recordingIndicator.height = "50px";

        this.recordingIndicator.top = "15px";
        this.recordingIndicator.cornerRadius = 5;
        this.recordingIndicator.color = "red";
        this.recordingIndicator.thickness = 4;
        this.recordingIndicator.background = "red";
        this.recordingIndicator.alpha = 0.9;
        this.recordingIndicator.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.recordingIndicator.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.recordingIndicator.left = "-15px";
        this.advancedTexture.addControl(this.recordingIndicator);
        this.recordingIndicator.isVisible = false;

        this.recordingIndicatorText = new GUI.TextBlock();
        this.recordingIndicatorText.text = "R";
        this.recordingIndicatorText.color = "white";
        this.recordingIndicatorText.fontSize = 24;
        this.recordingIndicatorText.fontFamily = "Arial";
        this.recordingIndicatorText.top = "2px";
        this.recordingIndicatorText.left = "2px";
        this.recordingIndicatorText.width = 1;
        this.recordingIndicatorText.height = "40px"
        this.recordingIndicator.addControl(this.recordingIndicatorText);
        this.recordingIndicatorText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.recordingIndicatorText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;


    }



    showDialog(data) {
        this.dialogText.text = data.text;
        this.dialog.isVisible = true;
    }

    setupProgress() {
        this.progress = new GUI.TextBlock();
        this.progress.text = "Loading...";
        this.progress.color = "white";
        this.progress.fontSize = 12;
        this.progress.fontFamily = "Arial";
        this.progress.fontWeight = "bold";
        this.progress.top = "33px";
        this.progress.left = "80px";
        this.progress.width = 1;
        this.progress.height = 0.75
        this.progress.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.progress.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.progress.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.advancedTexture.addControl(this.progress);
        this.progress.isVisible = false;
    }

    setupDebugGUI() {


        //this.advancedTexture.rootContainer.scaleX = window.devicePixelRatio;
        //this.advancedTexture.rootContainer.scaleY = window.devicePixelRatio;


        // create label
        this.debugLabel = new GUI.TextBlock();

        this.debugLabel.text = "0,0,0";
        this.debugLabel.color = "white";
        this.debugLabel.fontSize = 16;
        this.debugLabel.fontFamily = "Arial";
        this.debugLabel.top = 0;
        this.debugLabel.left = 0;
        this.debugLabel.width = 1;
        this.debugLabel.height = "40px"
        this.advancedTexture.addControl(this.debugLabel);
        this.debugLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.debugLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.debugLabel.isVisible = true;
        // position label on top        
    }

    setDebugText(textArray) {
        this.debugLabel.text = textArray[0];        
    }

    setupSplashScreen() {

        // image behind
        this.splash = new GUI.Rectangle();
        this.splash.zIndex = 1100;
        this.splash.width = 1;
        this.splash.height = 1;
        this.splash.cornerRadius = 0;
        this.splash.color = "black";
        this.splash.thickness = 0;
        this.splash.background = "black";
        this.splash.alpha = 0.9;
        this.splash.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.splash.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTexture.addControl(this.splash);

        this.splashImage = new GUI.Image("splash", "assets/art/splashw.jpg");
        this.splashImage.width = 1;
        this.splashImage.height = 1;
        this.splashImage.stretch = GUI.Image.STRETCH_FILL;
        this.splash.addControl(this.splashImage);

        // create label
        this.splashText = new GUI.TextBlock();
        this.splashText.text = "WARTORN\nv0.01";
        this.splashText.color = "white";
        this.splashText.fontSize = 64;
        this.splashText.fontFamily = "Arial";
        this.splashText.fontWeight = "bold";
        this.splashText.top = 0;
        this.splashText.left = 0;
        this.splashText.width = 1;
        this.splashText.height = 1;
        this.splash.addControl(this.splashText);
        this.splashText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.splashText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        this.splash.isVisible = true;

        // hide after 2 seconds
        setTimeout(() => {
            this.splash.isVisible = false;
            this.splashText.isVisible = false;
        }, 4000);


    }
}