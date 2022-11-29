import fs from 'fs/promises';
import path from 'path';
import { Color3, Color3Value } from './Color3';

type Vector2 = [number, number];

function * biDimRange(start: Vector2, end: Vector2): Generator<Vector2> {
    const [sx, sy] = start;
    const [ex, ey] = end;

    for (let y = sy; y < ey; y++)
        for (let x = sx; x < ex; x++)
            yield [x, y];
}

export class BitMap24 {
    private static FIRST_PIXEL_INDEX = 54;

    private buffer: Buffer;
    private width: number;
    private height: number;
    private length: number;

    public paintColor: Color3;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.paintColor = new Color3();

        this.width = buffer.readUint32LE(18);
        this.height = buffer.readUint32LE(22);
        this.length = buffer.readUint32LE(34);
    }

    getPixelColor(x: number, y: number) {
        const color: Color3Value = [0, 0, 0];
        const pos = this.getIndexFromXY(x, y);

        for (let idx = 0; idx < 3; idx++)
            color[idx] = this.buffer.at(pos + idx) ?? 0;

        return Color3.fromBGR(...color);
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

    drawPixel(x: number, y: number) {
        const pos = this.getIndexFromXY(x, y);

        this.buffer.set(this.paintColor.BGR, pos);
    }

    getInterpolatedColor(x: number, y: number, range: number) {
        const xi = x - range >= 0? x - range: 0;
        const yi = y - range >= 0? y - range: 0;

        const xe = x + range + 1 < this.width? x + range + 1: this.width;
        const ye = y + range + 1 < this.height? y + range + 1: this.height;

        const avrColor = new Color3();
        let sums = 0;

        for (let [x, y] of biDimRange([xi, yi], [xe, ye])) {
            const color = this.getPixelColor(x, y);
            
            avrColor.sum(color);

            sums++;
        }

        avrColor.div(sums);

        return avrColor;
    }

    clone() {
        return new BitMap24(Buffer.from(this.buffer));
    }

    blur(range: number) {
        const newBitMap = this.clone();

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newBitMap.paintColor = this.getInterpolatedColor(x, y, range);
                newBitMap.drawPixel(x, y);
            }
        }

        this.buffer = newBitMap.buffer;
    }

    reverseColor() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.paintColor = this.getPixelColor(x, y).reverse();
                this.drawPixel(x, y);
            }
        }
    }

    writeBMP(name: string, dir = './') {
        fs.writeFile(path.join(dir, `${name}.bmp`), this.buffer);
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

    static async fromImg(path: string) {
        const buffer = await fs.readFile(path);

        const instance = new BitMap24(buffer);

        return instance;
    }
}