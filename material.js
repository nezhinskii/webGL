import { vec2 } from 'gl-matrix';

class Material {
    constructor(gl, textureSource, bumpPath = null, ambientStrength = 0.3, specularStrength = 0.5, shininess = 32.0) {
        this.gl = gl;
        this.texture = this.loadTexture(textureSource, false);
        this.bumpTexture = bumpPath ? this.loadTexture(bumpPath, true) : null;
        this.bumpTextureSize = null;

        this.ambientStrength = ambientStrength;
        this.specularStrength = specularStrength;
        this.shininess = shininess;
    }

    loadTexture(source, bump = false) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        if (source instanceof HTMLVideoElement) {
            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = this.gl.RGBA;
            const srcType = this.gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([255, 0, 255, 255]);
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        } else {
            const image = new Image();
            image.onload = () => {
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                if (bump) {
                    this.bumpTextureSize = vec2.fromValues(image.width, image.height);
                }
            };
            image.src = source;
        }
        return texture;
    }

    bindTextures(shaderProgram) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(shaderProgram.uniformLocations.texture, 0);

        gl.uniform1i(shaderProgram.uniformLocations.hasBumpTexture, this.bumpTexture ? 1 : 0);

        if (this.bumpTexture) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(this.gl.TEXTURE_2D, this.bumpTexture);
            gl.uniform1i(shaderProgram.uniformLocations.bumpTexture, 1);

            if (this.bumpTextureSize) {
                gl.uniform2fv(shaderProgram.uniformLocations.bumpTextureSize, this.bumpTextureSize);
            }
        }

        gl.uniform1f(shaderProgram.uniformLocations.ambientStrength, this.ambientStrength);
        gl.uniform1f(shaderProgram.uniformLocations.specularStrength, this.specularStrength);
        gl.uniform1f(shaderProgram.uniformLocations.shininess, this.shininess);
    }
}

export { Material }