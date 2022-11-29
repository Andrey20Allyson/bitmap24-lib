import { BitMap24 } from './BitMap24';

function getDelay(f: () => void) {
    const iTime = new Date().getTime();
    f();
    return new Date().getTime() - iTime
}

async function main() {
    let image = await BitMap24.fromImg('./data/input.bmp');

    console.log('demorou: %s ms', 
        getDelay(() => {
            image.blur(4);
        })
    )

    image.writeBMP('output', './data');
}

main();
