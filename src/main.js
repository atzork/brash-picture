
console.log('asssssssssssss')
const canvas = document.getElementById('canvas')

const ctx = canvas.getContext('2d')
ctx.fillStyle = '#000';
const ctxClearImageData = ctx.createImageData(1,1);
const imageData = ctx.getImageData(0,0, canvas.width, canvas.height)

const img = new Image();

function clicked(event, canvas) {
    console.log(event.clientX + ' : ' + event.clientY)
    const pixel = ctx.getImageData(event.clientX, event.clientY, 1, 1);
    console.log(pixel)
    drawPixel(event.clientX, event.clientY)

}

function drawPixel(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1);
    if (!isEmptySpace(pixel))
    {
        return
    }
    // const imageData = ctx.createImageData(1,1);
    ctxClearImageData.data[0] = 0;
    ctxClearImageData.data[1] = 0;
    ctxClearImageData.data[2] = 0;
    ctxClearImageData.data[3] = 255;
    ctx.putImageData(ctxClearImageData, x, y);


    // ctx.fillRect(x, y, 1, 1);
    window.requestAnimationFrame(() => {
        drawPixel(x + 1, y)
        drawPixel(x - 1, y)
        drawPixel(x, y - 1)
        drawPixel(x, y + 1)
    } )

}

function isEmptySpace(pixelData) {
    return 600 <= pixelData.data[0] + pixelData.data[1] + pixelData.data[2]
}

img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
}

img.src = './assets/cat.jpg';

