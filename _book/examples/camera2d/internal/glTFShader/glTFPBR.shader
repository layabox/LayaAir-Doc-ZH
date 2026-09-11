/**
 * version 3.1.0
 **/
Shader3D Start
{
    type: Shader3D,
    name: glTFPBR,
    enableInstancing: true,
    supportReflectionProbe: true,
    uniformMap:{
        u_AlphaTestValue: { type: Float, default: 0.5 },
        u_BaseColorFactor: { type: Vector4, default: [1, 1, 1, 1] },
        u_BaseColorTexture: { type: Texture2D, options: { define: "BASECOLORMAP" } },
        u_BaseColorMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.BASECOLORMAP_TRANSFORM" },
        u_Specular: { type: Float, default: 0.5 },
        u_MetallicFactor: { type: Float, default: 1.0 },
        u_RoughnessFactor: { type: Float, default: 1.0 },
        u_MetallicRoughnessTexture: { type: Texture2D,  options: { define: "METALLICROUGHNESSMAP" } },
        u_MetallicRoughnessMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.METALLICROUGHNESSMAP_TRANSFORM" },
        u_NormalTexture: { type: Texture2D,  options: { define: "NORMALMAP" } },
        u_NormalMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.NORMALMAP_TRANSFORM" },
        u_NormalScale: { type: Float, default: 1.0, hidden: "!data.u_NormalTexture" },
        u_OcclusionTexture: { type: Texture2D,  options: { define: "OCCLUSIONMAP" } },
        u_OcclusionMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.OCCLUSIONMAP_TRANSFORM" },
        u_OcclusionStrength: { type: Float, default: 1.0 },

        // Emission
        u_EmissionFactor: { type: Vector3, default: [0, 0, 0], hidden: "!data.EMISSION" },
        u_EmissionTexture: { type: Texture2D,  options: { define: "EMISSIONMAP" }, hidden: "!data.EMISSION" },
        u_EmissionMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.EMISSIONMAP_TRANSFORM" },
        u_EmissionStrength: { type: Float, default: 1.0, hidden: "!data.EMISSION" },

        // ClearCoat
        u_ClearCoatFactor: { type: Float, default: 0.0, hidden: "!data.CLEARCOAT" },
        u_ClearCoatTexture: { type: Texture2D, options: { define: "CLEARCOATMAP" }, hidden: "!data.CLEARCOAT" },
        u_ClearCoatMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.u_ClearCoatTexture" },
        u_ClearCoatRoughness: { type: Float, default: 0.0, hidden: "!data.CLEARCOAT" },
        u_ClearCoatRoughnessTexture: { type: Texture2D, options: { define: "CLEARCOAT_ROUGHNESSMAP" }, hidden: "!data.CLEARCOAT" },
        u_ClearCoatRoughnessMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.u_ClearCoatRoughnessTexture" },
        u_ClearCoatNormalTexture: { type: Texture2D, options: { define: "CLEARCOAT_NORMAL" }, hidden: "!data.CLEARCOAT" },
        u_ClearCoatNormalMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.u_ClearCoatNormalTexture" },
        u_ClearCoatNormalScale: { type: Float, default: 1.0, hidden: "!data.CLEARCOAT" },

        // Anisotropy
        u_AnisotropyStrength: { type: Float, default: 0.0, hidden: "!data.ANISOTROPIC" },
        u_AnisotropyRotation: { type: Float, default: 0.0, hidden: "!data.ANISOTROPIC" },
        u_AnisotropyTexture: { type: Texture2D, options: { define: "ANISOTROPYMAP" }, hidden: "!data.ANISOTROPIC" },
        u_AnisotropyMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.u_ClearCoatNormalTexture" },

        // ior
        u_Ior: { type: Float, default: 1.5, hidden: "!data.IOR"},

        // iridescence
        u_IridescenceFactor: { type: Float, default: 0.0, hidden: "!data.IRIDESCENCE" },
        u_IridescenceTexture: { type: Texture2D,  options: { define: "IRIDESCENCEMAP" }, hidden: "!data.IRIDESCENCE" },
        u_IridescenceMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.IRIDESCENCEMAP_TRANSFORM" },
        u_IridescenceIor: { type: Float, default: 1.33, hidden: "!data.IRIDESCENCE" },
        u_IridescenceThicknessMinimum: { type: Float, default: 100, hidden: "!data.IRIDESCENCE" },
        u_IridescenceThicknessMaximum: { type: Float, default: 400, hidden: "!data.IRIDESCENCE" },
        u_IridescenceThicknessTexture: { type: Texture2D,  options: { define: "IRIDESCENCE_THICKNESSMAP" },  hidden: "!data.IRIDESCENCE" },
        u_IridescenceThicknessMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.IRIDESCENCE_THICKNESSMAP_TRANSFORM" },

        // sheen
        u_SheenColorFactor: { type: Vector3, default: [0, 0, 0], hidden: "!data.SHEEN" },
        u_SheenColorTexture: { type: Texture2D,  options: { define: "SHEENCOLORMAP" }, hidden: "!data.SHEEN" },
        u_SheenColorMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.SHEENCOLORMAP_TRANSFORM" },
        u_SheenRoughness: { type: Float, default: 0, hidden: "!data.SHEEN"},
        u_SheenRoughnessTexture: { type: Texture2D,  options: { define: "SHEEN_ROUGHNESSMAP" }, hidden: "!data.SHEEN" },
        u_SheenRoughnessMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.SHEEN_ROUGHNESSMAP_TRANSFORM" },

        // specular
        u_SpecularFactor: { type: Float, default: 1.0, hidden: "!data.SPECULAR" },
        u_SpecularFactorTexture: { type: Texture2D,  options: { define: "SPECULARFACTORMAP" }, hidden: "!data.SPECULAR" },
        u_SpecularFactorMapTransfrom: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.SPECULARFACTORMAP_TRANSFORM" },
        u_SpecularColorFactor: { type: Vector3, default: [1, 1, 1], hidden: "!data.SPECULAR" },
        u_SpecularColorTexture: { type: Texture2D,  options: { define: "SPECULARCOLORMAP" }, hidden: "!data.SPECULAR" },
        u_SpecularColorMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.SPECULARCOLORMAP_TRANSFORM" },

        // Transmission
        u_TransmissionFactor: { type: Float, default: 0.0, hidden: "!data.TRANSMISSION" },
        u_TransmissionTexture: { type: Texture2D,  options: { define: "TRANSMISSIONMAP" }, hidden: "!data.TRANSMISSION" },
        u_TransmissionMapTransform: { type: Matrix3x3, default: [1, 0, 0, 0, 1, 0, 0, 0, 1], hidden: "!data.TRANSMISSIONMAP_TRANSFORM" },
        
    },
    defines: {
        BASECOLORMAP_TRANSFORM: {type: bool, default: false, hidden: "!data.u_BaseColorTexture", position: "after u_BaseColorTexture" },
        METALLICROUGHNESSMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_MetallicRoughnessTexture", position: "after u_MetallicRoughnessTexture" },
        NORMALMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_NormalTexture", position: "after u_NormalTexture" },
        OCCLUSIONMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_OcclusionTexture", position: "after u_OcclusionTexture" },

        // Emission
        EMISSION: { type: bool, default: false, position: "before u_EmissionFactor" },
        EMISSIONMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_EmissionTexture", position: "after u_EmissionTexture", hidden: "!data.EMISSION" },

        // ClearCoat
        CLEARCOAT: { type: bool, default: false, position: "before u_ClearCoatFactor" },
        CLEARCOATMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_ClearCoatTexture", position: "after u_ClearCoatTexture" },
        CLEARCOAT_ROUGHNESSMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_ClearCoatRoughnessTexture", position: "after u_ClearCoatRoughnessTexture" },
        CLEARCOAT_NORMALMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_ClearCoatNormalTexture", position: "after u_ClearCoatNormalTexture" },

        // Anisotropic
        ANISOTROPIC: { type: bool, default: false, position: "before u_AnisotropyStrength" },
        ANISOTROPYMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_AnisotropyTexture", position: "after u_AnisotropyTexture" },

        // ior
        IOR: { type: bool, default: false, position: "before u_Ior" },

        // iridescence
        IRIDESCENCE: { type: bool, default: false, position: "before u_IridescenceFactor" },
        IRIDESCENCEMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_IridescenceTexture", position: "after u_IridescenceTexture" },
        IRIDESCENCE_THICKNESSMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_IridescenceThicknessTexture", position: "after u_IridescenceThicknessTexture" },

        // Sheen
        SHEEN: { type: bool, default: false, position: "before u_SheenColorFactor" },
        SHEENCOLORMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_SheenColorTexture", position: "after u_SheenColorTexture" },
        SHEEN_ROUGHNESSMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_SheenRoughnessTexture", position: "after u_SheenRoughnessTexture" },

        // Specular
        SPECULAR: { type: bool, default: false, position: "before u_SpecularFactor" },
        SPECULARFACTORMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_SpecularFactorTexture", position: "after u_SpecularFactorTexture" },
        SPECULARCOLORMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_SpecularColorTexture", position: "after u_SpecularColorTexture" },

        // Transmission
        TRANSMISSION: { type: bool, default: false, position: "before u_TransmissionFactor" },
        TRANSMISSIONMAP_TRANSFORM: { type: bool, default: false, hidden: "!data.u_TransmissionTexture", position: "after u_TransmissionTexture" },

        ENABLEVERTEXCOLOR: { type: bool, default: false },
    }
    shaderPass:[
        {
            pipeline: Forward,
            VS: forwardVS,
            FS: forwardFS
        },
        {
            pipeline: ShadowCaster,
            VS: dephtVS,
            FS: depthFS
        },
        {
            pipeline: DepthNormal,
            VS: dephtNormalVS,
            FS: dephtNormalFS
        },
        {
            pipeline: META,
            VS: forwardVS,
            FS: METAFS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL forwardVS

    #define SHADER_NAME glTFPBRVS

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    #include "PBRVertex.glsl";

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

        PixelParams pixel;
        initPixelParams(pixel, vertex);

        sharePixelParams(pixel);

        gl_Position = getPositionCS(pixel.positionWS);

        gl_Position = remapPositionZ(gl_Position);

    #ifdef FOG
        FogHandle(gl_Position.z);
    #endif
    }
#endGLSL

#defineGLSL forwardFS

    #define SHADER_NAME glTFPBRFS

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    #include "./glTFMetallicRoughness.glsl";

    #include "./glTFPBRInitSurfaceInput.glsl";

    void main()
    {
        PixelParams pixel;
        getPixelParams(pixel);

        SurfaceInputs inputs;
        initSurfaceInputs(inputs, pixel);

        vec4 surfaceColor = glTFMetallicRoughness(inputs, pixel);

    #ifdef FOG
        surfaceColor.rgb = sceneLitFog(surfaceColor.rgb);
    #endif // FOG

        gl_FragColor = surfaceColor;

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL

#defineGLSL dephtVS

    #define SHADER_NAME glTFPBRDepthVS

    #include "DepthVertex.glsl";

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

        mat4 worldMat = getWorldMatrix();
        vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
        vec3 positionWS = pos.xyz / pos.w;

        mat4 normalMat = transpose(inverse(worldMat));
        vec3 normalWS = normalize((normalMat * vec4(vertex.normalOS, 0.0)).xyz);

        vec4 positionCS = DepthPositionCS(positionWS, normalWS);
        gl_Position = remapPositionZ(positionCS);
    }

#endGLSL

#defineGLSL depthFS

    #define SHADER_NAME glTFPBRDepthFS

    #include "DepthFrag.glsl";

    void main()
    {
        gl_FragColor = getDepthColor();
    }

#endGLSL

#defineGLSL dephtNormalVS

    #define SHADER_NAME glTFPBRDepthNormalVS

    #include "Math.glsl";

    #include "Camera.glsl";

    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    #include "PBRVertex.glsl";

    varying vec4 v_PositionCS;

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

        PixelParams pixel;
        initPixelParams(pixel, vertex);

        sharePixelParams(pixel);

        vec4 positionCS = getPositionCS(pixel.positionWS);
        v_PositionCS = positionCS;
        gl_Position = positionCS;
        gl_Position = remapPositionZ(gl_Position);
    }

#endGLSL

#defineGLSL dephtNormalFS

    #define SHADER_NAME glTFPBRDepthNormalFS

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    #include "ShadingFrag.glsl";

    #include "DepthNormalFrag.glsl";

    varying vec4 v_PositionCS;

    void main()
    {
        PixelParams pixel;
        getPixelParams(pixel);

        vec3 normalWS = pixel.normalWS;

    #ifdef NORMALMAP
        #ifdef UV

        vec2 uv = pixel.uv0;

        vec3 normalSampler = texture2D(u_NormalTexture, uv).xyz;
        normalSampler = normalize(normalSampler * 2.0 - 1.0);
        normalSampler.y *= -1.0;
        vec3 normalTS = normalScale(normalSampler, u_NormalScale);
        normalWS = normalize(pixel.TBN * normalTS);

        #endif UV
    #endif // NORMALMAP

        vec4 positionCS = v_PositionCS;

        vec4 dephtNormal = encodeDepthNormal(positionCS, normalWS);

        gl_FragColor = dephtNormal;
    }

#endGLSL

#defineGLSL METAFS

    #define SHADER_NAME glTFMetaFS

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    #include "./glTFMetallicRoughness.glsl";

    #include "./glTFPBRInitSurfaceInput.glsl";
    
    void main()
    {
        PixelParams pixel;
        getPixelParams(pixel);

        SurfaceInputs inputs;
        initSurfaceInputs(inputs, pixel);

        vec4 surfaceColor = vec4(1.0, 0.0, 1.0, 1.0);

        Surface surface;
        initSurface(surface, inputs, pixel);

    #ifdef METAALBEDO
    #ifdef TRANSPANENT
        surfaceColor = vec4(inputs.diffuseColor, surface.alpha);
    #else // 
        surfaceColor = vec4(inputs.diffuseColor, 1.0);
    #endif // TRANSPANENT
    #endif // METAALBEDO

    #ifdef METANORMAIL
        vec3 normal = inputs.normalTS;
        normal.y *=-1.0;
        normal =normalize(normal);
        surfaceColor = vec4((normal + 1.0) * 0.5, 1.0);
    #endif // METANORMAIL

    #ifdef METAEMISSION
    #ifdef EMISSION
        surfaceColor = vec4(surface.emissionColor.rgb, 1.0);
    #else // EMISSION
        surfaceColor = vec4(vec3(0.0), 1.0);
    #endif // EMISSION
    #endif // METAEMISSION

    #ifdef METAEMETALLIC
        surfaceColor = vec4(vec3(inputs.metallic), 1.0);
    #endif // METAEMETALLIC

    #ifdef METAEROUNGNESS
        surfaceColor = vec4(vec3(surface.perceptualRoughness), 1.0);
    #endif // METAEROUNGNESS

        gl_FragColor = surfaceColor;
    }


#endGLSL

GLSL End


