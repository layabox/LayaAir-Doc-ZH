(function () {
    let config = JSON.parse(`{"resolution":{"scaleMode":"fixedwidth","alignV":"middle","alignH":"center","screenMode":"horizontal","backgroundColor":"#efeed7","designWidth":1334,"designHeight":750},"2D":{"useRetinalCanvas":true,"defaultFont":"MicrosoftYaHei","FPS":60,"isAntialias":true,"isAlpha":false,"enableUniformBufferObject":true,"matUseUBO":true,"webGL2D_MeshAllocMaxMem":true,"defaultFontSize":20},"physics2D":{"defaultConfig":{"debugDraw":true,"allowSleeping":false,"gravity":{"x":0,"y":9.8},"velocityIterations":8,"positionIterations":3,"pixelRatio":50,"drawShape":true,"drawJoint":true,"drawAABB":false,"drawCenterOfMass":false},"layers":["Default"]},"spineVersion":"4.0","splash":{"fit":"center","enabled":true,"duration":1},"light2D":{"ambientColor":{"r":0.2,"g":0.2,"b":0.2,"a":0},"ambientLayerMask":-1,"multiSamples":4},"3D":{"enableDynamicBatch":true,"defaultPhysicsMemory":16,"pixelRatio":1,"enableMultiLight":true,"maxLightCount":32,"lightClusterCount":{"x":12,"y":12,"z":12},"maxMorphTargetCount":32},"physics3D":{"fixedTimeStep":0.016666666666666666,"maxSubSteps":1,"enableCCD":false,"ccdThreshold":0.0001,"ccdSphereRadius":0.0001,"layers":["Default"]},"UI":{"alwaysIncludeDefaultSkin":true,"horizontalScrollBar":"res://d8f056de-a72c-49e3-b4e5-fe746c94aa04","verticalScrollBar":"res://d072e8ba-6ae4-4f23-9aaf-d376f765a7ab","popupMenu":"res://42f45010-7562-4115-872f-365829244e64","tooltipsWidget":"res://940534fa-684b-4821-84db-23243c93a4de","defaultTooltipsShowDelay":100,"defaultComboBoxVisibleItemCount":20},"addons":{},"physics3dModule":"laya.bullet","physics2dModule":"laya.box2D","stat":false,"statEnum":{"CT_FPS":true,"T_Frame_Time":true,"T_CullMain":true,"CT_OpaqueDrawCall":true,"CT_TransDrawCall":true,"CT_DepthCastDrawCall":true,"CT_ShadowDrawCall":true,"CT_DrawCall":true,"CT_Instancing_DrawCall":true,"M_GPUBuffer":true,"M_AllTexture":true,"M_RenderTexture":true,"M_GPUMemory":true,"CT_Triangle":true,"C_Sprite2DCount":true,"C_Sprite3DCount":true,"C_BaseRenderCount":true,"C_SkinnedMeshRenderCount":true,"C_ShurikenParticleRenderCount":true},"vConsole":false,"alertGlobalError":false,"dcc":{"enable":false,"generate":false,"version":"1.0.0","desc":"update resources","reserveOld":true},"startupScene":"Loading.ls","pkgs":[{"path":"","autoLoad":true},{"path":"atlas","autoLoad":true},{"path":"prefab","autoLoad":true},{"path":"resources","autoLoad":true},{"path":"scenes","autoLoad":true}]}`);
    Object.assign(Laya.PlayerConfig, config);
    Object.assign(Laya.Config, config["2D"]);
    Object.assign(Laya.Config3D, config["3D"]);
    if (Laya.UIConfig2)
        Object.assign(Laya.UIConfig2, config["UI"]);

    let v3 = Laya.Config3D.lightClusterCount;
    Laya.Config3D.lightClusterCount = new Laya.Vector3(v3.x, v3.y, v3.z);

    if (typeof (window) === "undefined")
        window = {};

    if (config.useSafeFileExtensions)
        Laya.URL.initMiniGameExtensionOverrides();

    let pkgs = [];
    for (let pkg of config.pkgs) {
        let path = pkg.path.length > 0 ? (pkg.path + "/") : pkg.path;
        if (pkg.hash != null)
            Laya.URL.version[path + "fileconfig.json"] = pkg.hash;
        if (pkg.remoteUrl) {
            let remoteUrl = pkg.remoteUrl.endsWith("/") ? pkg.remoteUrl : (pkg.remoteUrl + "/");
            if (path.length > 0)
                Laya.URL.basePaths[path] = remoteUrl;
            else
                Laya.URL.basePath = remoteUrl;
        }

        if (pkg.autoLoad)
            pkgs.push(pkg);
    }

    Laya.addBeforeInitCallback(() => {
        if (config.vConsole && Laya.Browser.onMobile && Laya.Browser.isDomSupported) {
            let script = document.createElement("script");
            script.src = "js/vConsole.min.js";
            script.onload = () => {
                window.vConsole = new VConsole();
            };
            document.body.appendChild(script);
        }

        if (config.alertGlobalError)
            Laya.alertGlobalError(true);

        return Promise.all(pkgs.map(pkg => Laya.loader.loadPackage(pkg.path, pkg.remoteUrl)));
    });

    Laya.init(config.resolution).then(() => {
        if (config.stat)
            Laya.Stat.show();
        if (window.$_main_)
            return window.$_main_();
        else if (config.startupScene) {
            return Laya.Scene.open(config.startupScene, true, null, (progress) => {
                if (window.onSplashProgress)
                    window.onSplashProgress(progress);
            });
        }
    }).catch(err => {
        console.error("Initialization failed:\n", err);
    }).then(() => {
        if (window.hideSplashScreen)
            window.hideSplashScreen();
    });
})();
