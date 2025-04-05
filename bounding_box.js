class BoundingBox {
    constructor(min, max) {
        this.min = min;
        this.max = max;
        this.size = [
            max[0] - min[0],
            max[1] - min[1],
            max[2] - min[2]
        ];
        this.pos = [0.0, 0.0, 0.0]
    }
    
    intersects(other) {
        return (
            this.min[0] <= other.max[0] && this.max[0] >= other.min[0] &&
            this.min[1] <= other.max[1] && this.max[1] >= other.min[1] &&
            this.min[2] <= other.max[2] && this.max[2] >= other.min[2]
        );
    }
    
    move(vector) {
        this.pos = vector
        this.updatePos()
    }

    setScale(scale) {
        this.size = this.size.map((value, index) => value*scale[index]);
        this.updatePos()
    }

    updatePos() {
        this.min = [
            this.pos[0] - this.size[0]/2,
            this.pos[1] - this.size[1]/2,
            this.pos[2] - this.size[2]/2
        ];
        this.max = [
            this.pos[0] + this.size[0]/2,
            this.pos[1] + this.size[1]/2,
            this.pos[2] + this.size[2]/2
        ];
    }
}

export { BoundingBox }