import { Transforms3D } from './transforms3d.js';
import { vec3, mat4 } from './lib/gl-matrix-min.js';

class Light extends Transforms3D {
    constructor(type, position, direction = [0.0, 0.0, -1.0], color = [1.0, 1.0, 1.0], intensity = 1.0, cutoffAngle = 0.0, attenuationLinear = 0.0) {
        super();
        this.type = type;
        this.color = color;
        this.intensity = intensity;
        this.cutoffAngle = cutoffAngle;
        this.attenuationLinear = attenuationLinear;

        this.move(position);
        this.initialDirection = direction;
    }

    getDirection() {
        if (this.type == "point"){
            return vec3.fromValues(0.0, 0.0, -1.0);
        }
        const dir = vec3.fromValues(this.initialDirection[0], this.initialDirection[1], this.initialDirection[2]);
        vec3.transformMat4(dir, dir, this.rotationMatrix);
        vec3.normalize(dir, dir);
        return dir;
    }
}

export { Light };