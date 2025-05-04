function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Ошибка компиляции шейдера: " + type + "\n" + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(shaderProgram));
        alert("Не удалось инициализировать шейдерную программу: " + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function initWebGL(canvas) {
    let gl = null;
    const names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for (let i = 0; i < names.length; ++i) {
        try {
            gl = canvas.getContext(names[i]);
        } catch(e) {}
        if (gl) {
            break;
        }
    }
    return gl;
}

async function createProgram(gl){
    const vSource = await (await fetch('/shaders/vertex_shader.glsl')).text();
    const fSource = await (await fetch('/shaders/fragment_shader.glsl')).text();
    const shaderProgram = initShaderProgram(gl, vSource, fSource);
    return {
        program: shaderProgram,
        attribLocations: {
            positionLocation: gl.getAttribLocation(shaderProgram, 'aPosition'),
            normalLocation: gl.getAttribLocation(shaderProgram, 'aNormal'),
            texCoordLocation: gl.getAttribLocation(shaderProgram, 'aTexCoord'),
        },
        uniformLocations: {
            time: gl.getUniformLocation(shaderProgram, 'uTime'),
            textureMode: gl.getUniformLocation(shaderProgram, 'uTextureMode'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            texture: gl.getUniformLocation(shaderProgram, 'uTexture'),
            bumpTexture: gl.getUniformLocation(shaderProgram, 'uBumpTexture'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            bumpTextureSize: gl.getUniformLocation(shaderProgram, 'uBumpTextureSize'),
            hasBumpTexture: gl.getUniformLocation(shaderProgram, 'uHasBumpTexture'),
            cameraPosition: gl.getUniformLocation(shaderProgram, 'uCameraPosition'),
            numLights: gl.getUniformLocation(shaderProgram, 'uNumLights'),
            lightTypes: gl.getUniformLocation(shaderProgram, 'uLightTypes'),
            lightPositions: gl.getUniformLocation(shaderProgram, 'uLightPositions'),
            lightDirections: gl.getUniformLocation(shaderProgram, 'uLightDirections'),
            lightColors: gl.getUniformLocation(shaderProgram, 'uLightColors'),
            lightIntensities: gl.getUniformLocation(shaderProgram, 'uLightIntensities'),
            lightCutoffAngles: gl.getUniformLocation(shaderProgram, 'uLightCutoffAngles'),
            lightAttenuations: gl.getUniformLocation(shaderProgram, 'uLightAttenuations'),
            ambientStrength: gl.getUniformLocation(shaderProgram, 'uAmbientStrength'),
            specularStrength: gl.getUniformLocation(shaderProgram, 'uSpecularStrength'),
            shininess: gl.getUniformLocation(shaderProgram, 'uShininess'),
        }
    }
}

export { createProgram, initWebGL }