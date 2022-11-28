import fs from 'fs/promises';
import path from 'path';

type Color3 = [number, number, number];

export class BitMap24 {
    static FIRST_PIXEL_INDEX = 54;
    buffer: Buffer;
    paintColor: Color3;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.paintColor = [0, 0, 0];
    }

    setPixelColor(x: number, y: number) {
        const pos = this.getIndexFromXY(x, y);

        for (let idx = 0; idx < this.paintColor.length; idx++) {
            // this.buffer[pos + this.paintColor.length - 1 - idx] = val;
            this.buffer[pos + idx] = this.paintColor[idx];
        }
    }

    setPaintColor(r: number, g: number, b: number) {
        this.paintColor[0] = r < 0? 0: r > 255? 255: r;
        this.paintColor[1] = g < 0? 0: g > 255? 255: g;
        this.paintColor[2] = b < 0? 0: b > 255? 255: b;
    }

    getPaintColor() {
        return this.paintColor.slice(0);
    } 

    getPixelColor(x: number, y: number) {
        if (x + y * this.width > this.width * this.length) {
            throw new Error('fora da caixa!');
        }

        const pos = this.getIndexFromXY(x, y);
        const color = [];

        for (let idx = 0; idx < 3; idx++) {
            color.push(this.buffer[pos + 3 - 1 - idx]);
        }

        return color;
    }

    createImg(name: string, dir = './') {
        fs.writeFile(path.join(dir, `${name}.bmp`), this.buffer);
    }

    get width() {
        return this.buffer.readUint32LE(18);
    }

    get height() {
        return this.buffer.readUint32LE(22);
    }

    get length() {
        return this.buffer.readUint32LE(34);
    }

    getIndexFromXY(x: number, y: number) {
        const width = this.width;

        const pos = 
            BitMap24.FIRST_PIXEL_INDEX +
            x * 3 +
            y * width * 3 +
            y * (width % 4);

        return pos;
    }

    static async fromImg(path: string) {
        const buffer = await fs.readFile(path);

        const instance = new BitMap24(buffer);

        return instance;
    }
}