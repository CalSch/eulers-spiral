/**
 * @typedef {{x: number, y: number}} Point
 * @typedef {{
 *  centerX: number,
 *  centerY: number,
 *  width: number,
 *  height: number,
 *  maxSize: number,
 *  scaleFactor: number
 * }} WindowData
 */

let screenWidth  = 600;
let screenHeight = 600;

/** @type {HTMLCanvasElement} */
let canvasEl = document.getElementById('screen');
canvasEl.width = screenWidth;
canvasEl.height = screenHeight;

let ctx = canvasEl.getContext('2d');

ctx.lineCap = "round";
ctx.lineWidth = 1;

let drawsPerFrame = 1;
let frameRate = 60;

let stepSize = 20;
let angleStepSize = 10;

/**
 * List of points on the curve
 * @type {Point[]}
 */
let points = [];

let running = false;

let pointX = 0;
let pointY = 0;
let direction = 0;
let angleAddend = 0;

// Minimum and maximum positions for the screen
let minX = -screenWidth/2;
let maxX =  screenWidth/2;
let minY = -screenHeight/2;
let maxY =  screenHeight/2;

/**
 * Get some information about the drawing window (used for automatic scaling)
 * @returns {WindowData}
 */
function getWindowData() {
    let centerX = (minX + maxX) / 2;
    let centerY = (minY + maxY) / 2;
    let width = (maxX - minX);
    let height = (maxY - minY);
    let maxSize = Math.max(width,height);
    let scaleFactor = maxSize / Math.max(screenWidth,screenHeight);
    return {
        centerX,
        centerY,
        width,
        height,
        maxSize,
        scaleFactor
    }
}

/**
 * Transform a point to move with the window
 * @param {number} x 
 * @param {number} y 
 * @param {WindowData} win 
 * @returns {Point}
 */
function transformPoint(x,y,win) {
    // Do win.maxSize + 10 so there's a 5px border
    x = (x-win.centerX) / (win.maxSize + 10) * Math.max(screenWidth,screenHeight);
    y = (y-win.centerY) / (win.maxSize + 10) * Math.max(screenWidth,screenHeight);
    return {x,y};
}

function reset() {
    clear();
    pointX = 0;
    pointY = 0;
    direction = 0;
    angleAddend = 0;

    minX = 0;
    maxX = 0;
    minY = 0;
    maxY = 0;

    points = [];
    update();
    draw();
}

function clear() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,screenWidth,screenHeight);
}

function update() {
    pointX += Math.cos(direction * Math.PI/180) * stepSize;
    pointY += Math.sin(direction * Math.PI/180) * stepSize;
    direction += angleAddend;
    angleAddend += angleStepSize;

    points.push({x:pointX,y:pointY});

    minX = Math.min(minX,pointX);
    maxX = Math.max(maxX,pointX);
    minY = Math.min(minY,pointY);
    maxY = Math.max(maxY,pointY);
}

function draw() {
    clear();
    ctx.save();
    ctx.translate(screenWidth/2,screenHeight/2);
    let windowData = getWindowData();

    ctx.strokeStyle = "white";

    ctx.beginPath();

    // Move to the first point
    // Use a block to keep `p` in its own scope
    {
        let p = transformPoint(points[0].x,points[0].y,windowData);
        ctx.moveTo(p.x,p.y);
    }

    // Make a line through all of the points
    for (let point of points) {
        let p = transformPoint(point.x,point.y,windowData);
        ctx.lineTo(p.x,p.y);
    }

    ctx.stroke();

    ctx.restore();
}

clear();

function drawHandler() {
    if (running) {
        // Draw 20 times per frame
        for (let i=drawsPerFrame;i--;)
            update();
        draw();
    }
    setTimeout(drawHandler, 1000/frameRate);
}

drawHandler();

//#region config

let stepAmount = 1;

let resetAfterChange = false;

function tryClear() {
    if (resetAfterChange) reset();
}

addButton("Start",(ev)=>{
    running = true;
});
addButton("Stop",(ev)=>{
    running = false;
});
addButton("Step",(ev)=>{
    for (let i=stepAmount;i--;)
        update();
    draw();
});

addLineBreak();

addNumber("Steps",(ev)=>{
    let value = parseInt(ev.target.value);
    if (value != NaN)
        stepAmount = value;
},stepAmount,1);


addButton("Clear",clear);
addButton("Reset",(ev)=>{
    reset();
});

addSeparator();

addNumber("Framerate",(ev)=>{
    let value = parseInt(ev.target.value);
    if (value != NaN)
        frameRate = value;
},frameRate,1);

addNumber("draw()'s per frame",(ev)=>{
    let value = parseInt(ev.target.value);
    if (value != NaN)
        drawsPerFrame = value;
},drawsPerFrame,1);

addNumber("Step size",(ev)=>{
    let value = parseFloat(ev.target.value);
    if (value != NaN)
        stepSize = value;
},stepSize,0.01);

addNumber("Direction step size",(ev)=>{
    let value = parseFloat(ev.target.value);
    if (value != NaN)
        angleStepSize = value;
},angleStepSize,0.01);

addSeparator();

addBool("Reset on change",(ev)=>{
    resetAfterChange = ev.target.value;
},resetAfterChange);

//#endregion
