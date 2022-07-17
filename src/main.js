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
    drawImageData(imageData)
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top]
}

function isEmptySpace(pixelData) {
    return 600 <= pixelData.data[0] + pixelData.data[1] + pixelData.data[2]
}

function isPixelBrushed(data, pixelPos, color) {
    return (color.r === data[pixelPos] &&
        color.g === data[pixelPos + 1] &&
        color.b === data[pixelPos + 2]) || 600 > data[pixelPos] + data[pixelPos + 1] + data[pixelPos + 2] + data[pixelPos + 3]
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

function isPositionVacant(pixelPosition, queue, data, brashColor) {
    return null != pixelPosition && !queue.has(pixelPosition) && !isPixelBrushed(data, pixelPosition, brashColor)
}

function addToQueueTopPixel(pixelPos, queue, brashColor, data) {
    const topPixelPos = getTopPixelPos(pixelPos, data);
    if (isPositionVacant(topPixelPos, queue, data,  brashColor)) {
        queue.push(topPixelPos)
    }
}
function addToQueueBottomPixel(pixelPos, queue, brashColor, data) {
    const bottomPixelPos = getBottomPixelPos(pixelPos, data);
    if (isPositionVacant(bottomPixelPos, queue, data,  brashColor)) {
        queue.push(bottomPixelPos)
    }
}
function addToQueueLeftPixel(pixelPos, queue, brashColor, data) {
    const leftPixelPos = getLeftPixelPos(pixelPos);
    if (isPositionVacant(leftPixelPos, queue, data, brashColor)) {
        queue.push(leftPixelPos)
    }
}
function addToQueueRightPixel(pixelPos, queue, brashColor, data) {
    const rightPixelPos = getRightPixelPos(pixelPos);
    if (isPositionVacant(rightPixelPos, queue, data, brashColor)) {
        queue.push(rightPixelPos)
    }
}
//
function beginTop(pixelPos, queue, brashColor, data) {
    while (isPositionVacant(pixelPos, queue, data, brashColor)) {
        queue.push(pixelPos)
        beginLeft(pixelPos,queue, brashColor, data);
        beginRight(pixelPos, queue, brashColor, data);
        pixelPos = getTopPixelPos(pixelPos, data);
    }
}

function beginBottom(pixelPos, queue, brashColor, data) {
    while (isPositionVacant(pixelPos, queue, data, brashColor)) {
        queue.push(pixelPos)
        beginLeft(pixelPos,queue, brashColor, data);
        beginRight(pixelPos, queue, brashColor, data);
        pixelPos = getBottomPixelPos(pixelPos, data);
    }
}

function beginLeft(pixelPos, queue, brashColor, data) {
    while (isPositionVacant(pixelPos, queue, data, brashColor)) {
        queue.push(pixelPos)
        beginTop(pixelPos, queue, brashColor, data);
        beginBottom(pixelPos, queue, brashColor, data);
        pixelPos = getLeftPixelPos(pixelPos);
    }
}

function beginRight(pixelPos, queue, brashColor, data) {
    while (isPositionVacant(pixelPos, queue, data, brashColor)) {
        queue.push(pixelPos)
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
        let position = queue.pop();

        if (!isPixelBrushed(data, position, brashColor)) {

            position = getTopPixelPos(position, data)
            let prevPosition;
            while (position && !isPixelBrushed(data, position, brashColor))
            {
                queue.delete(position)
                prevPosition = position;
                position = getTopPixelPos(position, data)
            }
            position = prevPosition;

            let leftStepApproved = true;
            let rightStepApproved = true;

            while (position && !isPixelBrushed(data, position, brashColor)) {
                brashPixel(data, position, brashColor)
                queue.delete(position)

                const leftPos = getLeftPixelPos(position)
                const rightPos = getRightPixelPos(position)
                if (leftPos) {
                    if (leftStepApproved && !isPixelBrushed(data, leftPos, brashColor)) {
                        leftStepApproved = false;
                        queue.push(leftPos);
                    }
                    else {
                        leftStepApproved = true;
                    }
                }

                if (rightPos) {
                    if (rightStepApproved && !isPixelBrushed(data, rightPos, brashColor)) {
                        rightStepApproved = false;
                        queue.push(rightPos)
                    }
                    else {
                        rightStepApproved = true
                    }
                }

                position = getBottomPixelPos(position, data)
            }

            // beginTop(getTopPixelPos(position, data), queue, brashColor,data)
            // beginBottom(getBottomPixelPos(position, data), queue, brashColor,data)
            // beginLeft(getLeftPixelPos(position), queue, brashColor,data)
            // beginRight(getRightPixelPos(position), queue, brashColor,data)
        }
    }
}

function normalizeImageData(data) {
    for (let i = 0; i < data.length; i += 4) {
        if(data[i] < 250) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 100;
        }
    }
}

function drawImageData(imageData) {
    window.requestAnimationFrame(() => {
        ctx.putImageData(imageData, 0, 0)
    });
}


img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    // ctx.fillStyle = 'white';
    // ctx.clear();
    imageData = ctx.getImageData(0,0, canvas.width, canvas.height)
    // normalizeImageData(imageData.data)

    console.log('img.onload', imageData)
}

img.src = './assets/cat.jpg';

