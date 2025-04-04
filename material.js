import { vec2 } from 'gl-matrix';

class Material {
    constructor(gl, texturePath, bumpPath = null, ambientStrength = 0.3, specularStrength = 0.5, shininess = 32.0) {
        this.gl = gl;
        this.texture = this.loadTexture(texturePath);
        this.bumpTexture = bumpPath ? this.loadTexture(bumpPath, true) : null;
        this.bumpTextureSize = null;

        this.ambientStrength = ambientStrength;
        this.specularStrength = specularStrength;
        this.shininess = shininess;
    }

    loadTexture(path, bump = false) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        const image = new Image();
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            if (bump){
                this.bumpTextureSize = vec2.fromValues(image.width, image.height);
            }
        };
        image.src = path;
        return texture;
    }

    bindTextures(shaderProgram, ambientStrengthOverride) {
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
        gl.uniform1f(
            shaderProgram.uniformLocations.ambientStrength,
            ambientStrengthOverride !== undefined ? ambientStrengthOverride : this.ambientStrength
        );
        gl.uniform1f(shaderProgram.uniformLocations.specularStrength, this.specularStrength);
        gl.uniform1f(shaderProgram.uniformLocations.shininess, this.shininess);
    }
}

export { Material }