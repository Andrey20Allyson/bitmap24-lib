import fs from 'fs/promises';
import path from 'path';

type Color3 = [number, number, number];

export class BitMap24 {
    private static FIRST_PIXEL_INDEX = 54;

    private buffer: Buffer;
    private paintColor: Color3;

    private width: number;
    private height: number;
    private length: number;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.paintColor = [0, 0, 0];

        this.width = buffer.readUint32LE(18);
        this.height = buffer.readUint32LE(22);
        this.length = buffer.readUint32LE(34);
    }

    drawPixel(x: number, y: number) {
        const pos = this.getIndexFromXY(x, y);

        this.buffer.set(this.paintColor, pos);
    }

    setPaintColor(r: number, g: number, b: number) {
        this.paintColor[2] = BitMap24.parseUInt8(r);
        this.paintColor[1] = BitMap24.parseUInt8(g);
        this.paintColor[0] = BitMap24.parseUInt8(b);
    }

    getInterpolatedColor(x: number, y: number, range: number) {
        let xi = x - range >= 0? x - range: 0;
        let yi = y - range >= 0? y - range: 0;

        const xe = x + range + 1 < this.width? x + range + 1: this.width;
        const ye = y + range + 1 < this.height? y + range + 1: this.height;

        const avrColor: Color3 = [0, 0, 0];
        let sums = 0;

        for (yi; yi < ye; yi++) {
            for (xi; xi < xe; xi++) {
                const color = this.getPixelColor(xi, yi);
                
                for (let i = 0; i < avrColor.length; i++) {
                    avrColor[i] += color[i];
                }

                sums++;
            }
        }

        for (let i = 0; i < avrColor.length; i++) {
            avrColor[i] = Math.trunc(avrColor[i] / sums);
        }

        return avrColor;
    }

    getReversePixelColor(x: number, y: number) {
        const color: Color3 = [255, 255, 255];
        const lpos = this.getIndexFromXY(x, y) + color.length - 1;

        for (let idx = 0; idx < color.length; idx++)
            color[idx] -= this.buffer.at(lpos - idx) ?? 0;

        return color;
    }

    clone() {
        return new BitMap24(Buffer.from(this.buffer));
    }

    blur(range: number) {
        const newBitMap = this.clone();

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newBitMap.setPaintColor(...this.getInterpolatedColor(x, y, range));
                newBitMap.drawPixel(x, y);
            }
        }

        this.buffer = newBitMap.buffer;
    }

    reverseColor() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.setPaintColor(...this.getReversePixelColor(x, y));
                this.drawPixel(x, y);
            }
        }
    }

    getPaintColor() {
        const color: Color3 = [0, 0, 0];
        const lpos = color.length - 1
        
        for (let i = 0; i < color.length; i++)
            color[i] = this.paintColor[lpos - i];

        return color;
    } 

    getPixelColor(x: number, y: number) {
        const color: Color3 = [0, 0, 0];
        const lpos = this.getIndexFromXY(x, y) + color.length - 1;

        for (let idx = 0; idx < color.length; idx++)
            color[idx] = this.buffer.at(lpos - idx) ?? 0;

        return color;
    }

    createImg(name: string, dir = './') {
        fs.writeFile(path.join(dir, `${name}.bmp`), this.buffer);
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

    getWidth() {
        return this.width;    
    }

    getHeiht() {
        return this.height;
    }

    getLength() {
        return this.length;
    }

    static parseUInt8(x: number) {
        return x < 0?
            Math.trunc(Math.ceil(-x / 256) * 256 + x):
            x % 256; 
    }

    static async fromImg(path: string) {
        const buffer = await fs.readFile(path);

        const instance = new BitMap24(buffer);

        return instance;
    }
}