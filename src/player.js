/**
 * класс player (Pawn)
 */
export class player {
    /**
     * Конструктор
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {Number} rx
     * @param {Number} ry
     */
    constructor(x, y, z, rx, ry) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rx = rx;
        this.ry = ry;
    }
}

export default player;
