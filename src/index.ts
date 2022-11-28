import { BitMap24 } from './BitMap24';

async function main() {
    let image = await BitMap24.fromImg('./data/input.bmp');

    image.blur(1);

    image.createImg('output', './data');
}

main();