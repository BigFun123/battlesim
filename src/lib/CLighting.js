import { BlurPostProcess, Color3, GlowLayer, HemisphericLight, PointLight, PostProcessRenderEffect, PostProcessRenderPipeline, SSAORenderingPipeline, ShadowGenerator, SpotLight, Vector2, Vector3 } from "@babylonjs/core";
import { Bus, EVT_PLAYERUPDATE } from "./Bus";

export class CLighting {
    light;
    static shadowGenerator;

    settings = {
        shadows: true
    }
    constructor(scene) {
        this.scene = scene;
        this.scene.clearColor = new Vector3(0.1, 0.1, 0.1);
        this.setupGlow();

        //this.setupFX();

        //let ambient = new DirectionalLight("dir01", new Vector3(0, -1, -1.0), scene);
        //ambient.intensity = 2;;
        // Creates a light, aiming 0,1,0 - to the sky
        const ambient = new HemisphericLight("ambientlight",
           new Vector3(-0.5, 0.8, 0).normalize(), scene);
        ambient.intensity = 0.73;
        ambient.groundColor = new Color3(0.9, 0.9, 1);
        ambient.diffuse = new Color3(1.0, 1.0, 1.0);
        window.ambient = ambient;
        

        /*var light = new SpotLight("spotLight", new Vector3(-8, 14, -8), new Vector3(0.25, -1, 0), Math.PI / 3, 30, scene);
        light.intensity = 2310.9;
        light.position = new Vector3(-3, 28, -3);
        light.shadowMinZ = 1;
        light.angle = 212 * Math.PI / 180;
        light.innerAngle = 0.1;
        light.shadowMaxZ = 500;
        this.light = light;*/

        this.light = new PointLight("pointlight", new Vector3(0, 10, 0), scene);
        this.light.shadowMinZ = 1;
        this.light.shadowMaxZ = 500;
        this.light.diffuse = new Color3(0.95, 0.92, 0.72);
        this.light.intensity = 4444;
        
        if (this.settings.shadows) {
            this.enableShadows();
        }

        Bus.subscribe(EVT_PLAYERUPDATE, (data) => {
        //    this.light.position = data.position.add(new Vector3(-3, 27, -3));
            this.light.position = data.position.add(new Vector3(5, 20, 3));
        })
    }

    setupFX() {
        const engine = this.scene.getEngine();
        const camera = this.scene.activeCamera;
        var standardPipeline = new PostProcessRenderPipeline(engine, "standardPipeline");
        var horizontalBlur = new BlurPostProcess("hb", new Vector2(1.0, 0), 20, 1.0, null, null, engine, false)
        // Create effect with multiple post processes and add to pipeline
        var blackAndWhiteThenBlur = new PostProcessRenderEffect(engine, "blackAndWhiteThenBlur", function() { return [ horizontalBlur] });
        standardPipeline.addEffect(blackAndWhiteThenBlur);

        this.scene.postProcessRenderPipelineManager.addPipeline(standardPipeline);
        this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("standardPipeline", camera);
    }

    enableShadows() {
        CLighting.shadowGenerator = new ShadowGenerator(1024, this.light, true);
        let sg = CLighting.shadowGenerator;
        sg.bias = 0.002;
        sg.normalBias = 0.02;
        sg.nearPlane = 1;
        sg.usePercentageCloserFiltering = true;
        sg.farPlane = 1000;
        sg.darkness = 0.11;

        sg.useBlurExponentialShadowMap = true;
        sg.blurKernel = 3;
        sg.blurScale = 2;
        sg.useKernelBlur = true;
    }

    setupGlow() {
        var gl = new GlowLayer("glow", this.scene);
        /*
        // Set up new rendering pipeline
        var pipeline = new DefaultRenderingPipeline("default", true, this.scene, [camera]);
        scene.imageProcessingConfiguration.toneMappingEnabled = true;
        scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
        scene.imageProcessingConfiguration.exposure = 3;
        pipeline.glowLayerEnabled = true
        pipeline.glowLayer.intensity = 0.5*/
    }

    setupPipeline() {
        var standardPipeline = new PostProcessRenderPipeline(engine, "standardPipeline");

         //blur
        const engine = this.scene.getEngine();        
        
        var horizontalBlur = new BlurPostProcess("hb", new Vector2(1.0, 0), 20, 1.0, null, null, engine, false)
        // Create effect with multiple post processes and add to pipeline
        var blackAndWhiteThenBlur = new PostProcessRenderEffect(engine, "blackAndWhiteThenBlur", function() { return [ horizontalBlur] });
        standardPipeline.addEffect(blackAndWhiteThenBlur);

        this.scene.postProcessRenderPipelineManager.addPipeline(standardPipeline);
        this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("standardPipeline", camera);
        
        /*
                var pipeline = new DefaultRenderingPipeline(
                    "defaultPipeline", // The name of the pipeline
                    false, // Do you want the pipeline to use HDR texture?
                    this.scene, // The scene instance
                    [camera] // The list of cameras to be attached to
                );
        
                var postprocess = this.scene.imageProcessingConfiguration
                postprocess.toneMappingEnabled = true;
                postprocess.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
                postprocess.exposure = 0.8;
                postprocess.contrast = 0.6;
                postprocess.vignetteEnabled = true;
            
                // initialize pipeline features
                pipeline.imageProcessing.contrast = 1.2;
                pipeline.sharpenEnabled = true;
                pipeline.sharpen.edgeAmount = 0.1;
                pipeline.samples = 2;
                pipeline.fxaaEnabled = true;
                pipeline.fxaa.samples = 4;
                */

         var ssaoRatio = {
             ssaoRatio: 1.0,
             combineRatio: 1.0
         };
         var ssao = new SSAORenderingPipeline("ssao", this.scene, ssaoRatio, camera);
         ssao.fallOff = 0.000001;
         ssao.area = 1;
         ssao.radius = 0.00004;
         ssao.totalStrength = 0.8;
         ssao.base = 0.5;
         let ssaoActive = true;
         this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);
         this.scene.postProcessRenderPipelineManager.enableEffectInPipeline("ssao", ssao.SSAOCombineRenderEffect, camera);


    }
}