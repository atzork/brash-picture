const canvas = document.getElementById('canvas')

let imageData;
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#000';
const ctxClearImageData = ctx.createImageData(1,1);

const img = new Image();

const pixelsArray = [[]];

function clicked(event, canvas) {
    console.log(event.clientX + ' : ' + event.clientY)
    const coords = getMousePosition(canvas, event)
    brash(imageData.data, coords[0], coords[1], {r: 0, g: 0, b: 0})
    drawPixel(imageData)
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top]
}

function isEmptySpace(pixelData) {
    return 600 <= pixelData.data[0] + pixelData.data[1] + pixelData.data[2]
}

function isPixelBrushed(data, pixelPos, color) {
    return 250 < data[pixelPos] + data[pixelPos + 1] + data[pixelPos + 2] + data[pixelPos + 3]

    // return color.r === data[pixelPos] &&
    //     color.g === data[pixelPos + 1] &&
    //     color.b === data[pixelPos + 2]
}

function brashPixel(data, pixelPos, color) {
    data[pixelPos] = color.r;
    data[pixelPos + 1] = color.g;
    data[pixelPos + 2] = color.b;
    data[pixelPos + 3] = 255;
    console.log('brashPixel', pixelPos, color)
}

function brushAll(data, queue, color) {
    let pixelPos = queue.shift();
    while (pixelPos) {
        brashPixel(data, pixelPos, color);
        pixelPos = queue.shift()
    }
}

function getPixelPos(x, y) {
    return (y * canvas.width + x) * 4
}

function getRowNumber(pixelPos) {
    return Math.floor((pixelPos / 4) / canvas.width)
}

function getTopPixelPos(pixelPos, data) {
    const pos = pixelPos - (canvas.width * 4)
    return null == data[pos] ? undefined : pos
}

function getBottomPixelPos(pixelPos, data) {
    const pos = pixelPos + (canvas.width * 4)
    return null == data[pos] ? undefined : pos
}

function getLeftPixelPos(pixelPos) {
    const pos = pixelPos - 4;
    return getRowNumber(pixelPos) === getRowNumber(pos) ? pos : undefined
}

function getRightPixelPos(pixelPos) {
    const pos = pixelPos + 4
    return getRowNumber(pixelPos) === getRowNumber(pos) ? pos : undefined
}

function addToQueueTopPixel(pixelPos, queue, brashColor, data) {
    const topPixelPos = getTopPixelPos(pixelPos, data);
    if (null != topPixelPos && !queue.has(topPixelPos) && !isPixelBrushed(data, topPixelPos, brashColor)) {
        queue.push(topPixelPos)
    }
}
function addToQueueBottomPixel(pixelPos, queue, brashColor, data) {
    const bottomPixelPos = getBottomPixelPos(pixelPos, data);
    if (null != bottomPixelPos && !queue.has(bottomPixelPos) && !isPixelBrushed(data, bottomPixelPos, brashColor)) {
        queue.push(bottomPixelPos)
    }
}
function addToQueueLeftPixel(pixelPos, queue, brashColor, imageData) {
    const leftPixelPos = getLeftPixelPos(pixelPos);
    if (null != leftPixelPos && !isPixelBrushed(imageData, leftPixelPos, brashColor)) {
        queue.push(leftPixelPos)
    }
}
function addToQueueRightPixel(pixelPos, queue, brashColor, imageData) {
    const rightPixelPos = getRightPixelPos(pixelPos);
    if (null != rightPixelPos && !isPixelBrushed(imageData, rightPixelPos, brashColor)) {
        queue.push(rightPixelPos)
    }
}
//
function beginTop(pixelPos, queue, brashColor, data) {
    while (pixelPos && !isPixelBrushed(data, pixelPos, brashColor)) {
        queue.push(pixelPos)
        beginLeft(pixelPos,queue, brashColor, data);
        beginRight(pixelPos, queue, brashColor, data);
        pixelPos = getTopPixelPos(pixelPos, data);
    }
}

function beginBottom(pixelPos, queue, brashColor, data) {
    while (pixelPos && !isPixelBrushed(data, pixelPos, brashColor)) {
        queue.push(pixelPos)
        beginLeft(pixelPos,queue, brashColor, data);
        beginRight(pixelPos, queue, brashColor, data);
        pixelPos = getBottomPixelPos(pixelPos, data);
    }
}

function beginLeft(pixelPos, queue, brashColor, data) {
    while (pixelPos && !queue.has(pixelPos) && !isPixelBrushed(data, pixelPos, brashColor)) {
        queue.push(pixelPos)
        addToQueueTopPixel(pixelPos, queue, brashColor, data);
        addToQueueBottomPixel(pixelPos, queue, brashColor, data);
        beginTop(pixelPos, queue, brashColor, data);
        beginBottom(pixelPos, queue, brashColor, data);
        pixelPos = getLeftPixelPos(pixelPos);
    }
}

function beginRight(pixelPos, queue, brashColor, data) {
    while (pixelPos && !queue.has(pixelPos) && !isPixelBrushed(data, pixelPos, brashColor)) {
        console.log(queue)
        queue.push(pixelPos)
        console.log(queue)
        addToQueueTopPixel(pixelPos, queue, brashColor, data);
        addToQueueBottomPixel(pixelPos, queue, brashColor, data);
        beginTop(pixelPos, queue, brashColor, data);
        beginBottom(pixelPos, queue, brashColor, data);
        pixelPos = getRightPixelPos(pixelPos);
    }
}



function brash(data, x, y, brashColor) {
    const pixelPos = getPixelPos(x, y);
    if (isPixelBrushed(data, pixelPos, brashColor)) {
        return;
    }

    const queue = new Set([pixelPos]);
    queue.push = (value) => {
        queue.add(value)
    }
    queue.shift = () => {
        const values = queue.values();
        const value = values.next().value;
        queue.delete(value);
        return value;
    }
    queue.pop = () => {
        const last = [...queue].pop();
        queue.delete(last);
        return last
    }


    while (queue.size) {
        const lastInQueue = queue.pop();

        if (!isPixelBrushed(data, lastInQueue, brashColor)) {
            brashPixel(data, lastInQueue, brashColor)
            addToQueueTopPixel(lastInQueue, queue, brashColor, data)
            addToQueueRightPixel(lastInQueue, queue, brashColor, data)
            addToQueueBottomPixel(lastInQueue, queue, brashColor, data)
            addToQueueLeftPixel(lastInQueue, queue, brashColor, data)
        }
    }
}


function drawPixel(imageData) {
    window.requestAnimationFrame(() => {
        ctx.putImageData(imageData, 0, 0)
    });
}


img.onload = () => {
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    // ctx.fillStyle = 'white';
    // ctx.clear();
    imageData = ctx.getImageData(0,0, canvas.width, canvas.height)
    console.log('img.onload', imageData)
}

img.src = './assets/cat.jpg';

