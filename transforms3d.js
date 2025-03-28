import { mat4, vec3 } from './lib/gl-matrix-min.js';

class Transforms3D {
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.scale = vec3.fromValues(1, 1, 1);
        this.rotationMatrix = mat4.create();

        this.matrix = mat4.create();
        this.updateMatrix();
    }

    move(vector) {
        this.position = vector;
        this.updateMatrix();
    }

    rotate(axis, angle) {
        const tempMatrix = mat4.create();
        mat4.fromRotation(tempMatrix, angle, axis);
        mat4.multiply(this.rotationMatrix, this.rotationMatrix, tempMatrix);
        this.updateMatrix();
    }

    setScale(scale) {
        this.scale = scale;
        this.updateMatrix();
    }

    updateMatrix() {
        mat4.identity(this.matrix);
        mat4.scale(this.matrix, this.matrix, this.scale);
        mat4.multiply(this.matrix, this.matrix, this.rotationMatrix);
        mat4.translate(this.matrix, this.matrix, this.position);
    }

    getMatrix() {
        return this.matrix;
    }
}

export { Transforms3D }
