export type Color3Value = [number, number, number];

type OperationLike = (x: number, y: number) => number;

class Operations {
    static sum(x: number, y: number) {
        return x + y;
    }

    static sub(x: number, y: number) {
        return x - y;
    }

    static mult(x: number, y: number) {
        return x * y;
    }

    static div(x: number, y: number) {
        return x / y;
    }

    static mod(x: number, y: number) {
        return x % y;
    }
}

export class Color3 {
    private value: Color3Value;

    constructor() {
        this.value = [0, 0, 0];
    };

    get RGB() {
        const color: Color3Value = [0, 0, 0];

        for (let [i, v] of this.iterateRGB())
            color[i] = v;

        return color;
    }

    get BGR() {
        const color: Color3Value = [0, 0, 0];

        for (let [i, v] of this.iterateBGR())
            color[i] = v;

        return color;
    }

    * iterateRGB(): Generator<[number, number]> {
        for (let i = 0; i < this.value.length; i++)
            yield [i, this.value[i]];
    }

    * iterateBGR(): Generator<[number, number]> {
        for (let i = 0; i < this.value.length; i++)
            yield [i, this.value[2 - i]];
    }

    reverse() {
        const color = Color3.fromRGB(255, 255, 255);

        return color.sub(this);
    }

    clone() {
        return Color3.fromRGB(...this.RGB);
    }

    private operate(operation: OperationLike, ...values: Color3[] | number[]) {
        for (let i = 0; i < values.length; i++) {
            const x = values[i];

            if (x instanceof Color3) {
                const colorValue = x.value;

                for (let i = 0; i < 3; i++) {
                    this.value[i] = operation(this.value[i], colorValue[i]);
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    this.value[i] = operation(this.value[i], x);
                }
            }
        }
        return this;
    }

    sum(...arg0: Color3[] | number[]) {
        return this.operate(Operations.sum, ...arg0);
    }

    sub(...arg0: Color3[] | number[]) {
        return this.operate(Operations.sub, ...arg0);
    }

    mult(...arg0: Color3[] | number[]) {
        return this.operate(Operations.mult, ...arg0);
    }

    div(...arg0: Color3[] | number[]) {
        return this.operate(Operations.div, ...arg0);
    }

    static fromRGB(r: number, g: number, b: number) {
        const color = new Color3();

        color.value = [r, g, b];

        return color;
    }

    static fromBGR(b: number, g: number, r: number) {
        const color = new Color3();

        color.value = [r, g, b];

        return color;
    }

    static parseUInt8(x: number) {
        return x < 0?
            Math.trunc(Math.ceil(-x / 256) * 256 + x):
            x % 256;
    }
}
