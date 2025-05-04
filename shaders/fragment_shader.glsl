#version 300 es
precision mediump float;
precision highp int;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vPosition;

uniform sampler2D uTexture;
uniform sampler2D uBumpTexture;
uniform vec2 uBumpTextureSize;
uniform int uHasBumpTexture;
uniform vec3 uCameraPosition;

uniform float uAmbientStrength;
uniform float uSpecularStrength;
uniform float uShininess;
uniform float uTime;
uniform int uTextureMode;

#define MAX_LIGHTS 10
uniform int uNumLights;
uniform int uLightTypes[MAX_LIGHTS]; // 0 - point, 1 - spot
uniform vec3 uLightPositions[MAX_LIGHTS];
uniform vec3 uLightDirections[MAX_LIGHTS];
uniform vec3 uLightColors[MAX_LIGHTS];
uniform float uLightIntensities[MAX_LIGHTS];
uniform float uLightCutoffAngles[MAX_LIGHTS];
uniform float uLightAttenuations[MAX_LIGHTS];

out vec4 fragColor;


float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(random(i + vec2(0.0,0.0)), random(i + vec2(1.0,0.0)), u.x),
               mix(random(i + vec2(0.0,1.0)), random(i + vec2(1.0,1.0)), u.x), u.y);
}

mat2 rotate2d(float angle) {
    return mat2(cos(angle),-sin(angle), sin(angle),cos(angle));
}

float lines(vec2 pos, float b) {
    float scale = 10.0;
    pos *= scale;
    return smoothstep(0.0, .5+b*.5, abs((sin(pos.x*3.1415)+b*2.0))*.5);
}


void main() {
    vec4 textureColor;
    if (uTextureMode == 1) {
        vec2 centeredUV = vTexCoord - vec2(0.5);
        float r = length(centeredUV);
        float phi = atan(centeredUV.y, centeredUV.x);
        phi += 15.0 * r * sin(uTime * 0.0005);
        vec2 newUV = vec2(cos(phi), sin(phi)) * r + vec2(0.5);
        textureColor = texture(uTexture, newUV);
    } else if (uTextureMode == 2) {
        vec2 pos = vTexCoord.yx * vec2(6., 1.7);
        pos = rotate2d(noise(pos)) * pos;
        float pattern = lines(pos, 0.5);
        textureColor = vec4(mix(vec3(0.47, 0.33, 0.2), vec3(0.22, 0.15, 0), pattern), 1.0);
    } else {
        textureColor = texture(uTexture, vTexCoord);
    }

    vec3 normal = normalize(vNormal);
    vec3 newNormal = normal;

    if (uHasBumpTexture == 1) {
        vec2 texelSize = vec2(1.0 / uBumpTextureSize.x, 1.0 / uBumpTextureSize.y);

        vec4 rightPixel = texture(uBumpTexture, vec2(vTexCoord.x + texelSize.x, vTexCoord.y));
        vec4 leftPixel = texture(uBumpTexture, vec2(vTexCoord.x - texelSize.x, vTexCoord.y));
        vec4 topPixel = texture(uBumpTexture, vec2(vTexCoord.x, vTexCoord.y - texelSize.y));
        vec4 bottomPixel = texture(uBumpTexture, vec2(vTexCoord.x, vTexCoord.y + texelSize.y));

        float xGradient = rightPixel.r - leftPixel.r;
        float yGradient = bottomPixel.r - topPixel.r;

        newNormal = vec3(normal.x + xGradient, normal.y + yGradient, normal.z);
        newNormal = normalize(newNormal);
    }

    vec3 ambient = uAmbientStrength * vec3(1.0, 1.0, 1.0);
    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);

    vec3 viewDir = normalize(uCameraPosition - vPosition);
    for (int i = 0; i < uNumLights; i++) {
        vec3 lightDir = normalize(uLightPositions[i] - vPosition);
        float distance = length(uLightPositions[i] - vPosition);
        float attenuation = 1.0 / (1.0 + uLightAttenuations[i] * distance);

        float lightFactor = 1.0;
        if (uLightTypes[i] == 1) {
            float theta = dot(lightDir, normalize(-uLightDirections[i]));
            float cutoff = cos(uLightCutoffAngles[i]);
            float innerCutoff = cutoff * 0.99;
            float outerCutoff = cutoff * 1.01;
            lightFactor = smoothstep(innerCutoff, outerCutoff, theta);
        }

        float diff = max(dot(newNormal, lightDir), 0.0);
        vec3 diffuseContrib = diff * uLightColors[i] * uLightIntensities[i] * attenuation * lightFactor;

        vec3 reflectDir = normalize(reflect(-lightDir, newNormal));
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
        vec3 specularContrib = uSpecularStrength * spec * uLightColors[i] * uLightIntensities[i] * attenuation * lightFactor;

        diffuse += diffuseContrib;
        specular += specularContrib;
    }

    vec3 result = (ambient + diffuse) * textureColor.rgb + specular;
    fragColor = vec4(result, textureColor.a);
}