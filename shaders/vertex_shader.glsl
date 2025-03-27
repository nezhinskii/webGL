#version 300 es
precision mediump float;
precision highp int;

in vec3 aPosition;
in vec2 aTexCoord;
in vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vPosition;

void main() {
    vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
    vTexCoord = aTexCoord;
    vNormal = uNormalMatrix * aNormal;
    vPosition = worldPos.xyz;
}