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

void main() {
    vec4 textureColor = texture(uTexture, vTexCoord);

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
            if (theta > cutoff) {
                lightFactor = 1.0;
            } else {
                lightFactor = 0.0;
            }
        }

        // vec3 uLightPosition = vec3(100.0, 100.0, 200.0);
        // vec3 uLightColor = vec3(1.0, 1.0, 1.0);
        // vec3 uCameraPosition = vec3(0.0, 0.0, 200.0);
        // float uAmbientStrength = 0.3;
        // float uSpecularStrength = 0.5;
        // float uShininess = 32.0;

        // vec3 viewDir = normalize(uCameraPosition - vPosition);

        // // vec3 ambient = uAmbientStrength * uLightColor;
        // // float diff = max(dot(newNormal, lightDir), 0.0);
        // // vec3 diffuse = diff * uLightColor;
        // float diff = max(dot(newNormal, lightDir), 0.0);
        // vec3 diffuseContrib = diff * uLightColor;
        // // vec3 reflectDir = normalize(reflect(-lightDir, newNormal));
        // // float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
        // // vec3 specular = uSpecularStrength * spec * uLightColor;
        // vec3 reflectDir = normalize(reflect(-lightDir, newNormal));
        // float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
        // vec3 specularContrib = uSpecularStrength * spec * uLightColor;




        float diff = max(dot(newNormal, lightDir), 0.0);
        vec3 diffuseContrib = diff * uLightColors[i] * uLightIntensities[i] * attenuation * lightFactor;

        vec3 reflectDir = normalize(reflect(-lightDir, newNormal));
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
        vec3 specularContrib = uSpecularStrength * spec * uLightColors[i] * uLightIntensities[i] * attenuation * lightFactor;

        diffuse += diffuseContrib;
        specular += specularContrib;

        // vec3 result = (ambient + diffuse) * textureColor.rgb + specular;
        // result = vec3(attenuation, lightFactor, lightFactor);
        // fragColor = vec4(result, textureColor.a);
    }

    vec3 result = (ambient + diffuse) * textureColor.rgb + specular;
    fragColor = vec4(result, textureColor.a);
}