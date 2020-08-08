let canvas = document.querySelector('#canvas')
let ctx = canvas.getContext('2d');

let colors = {
  bird: 'rgba(80,80,80,1)',
  canvas: 'rgba(155,215,213,1)',
  tubes: 'rgba(255,114,96,1)',
  gameOverBackground: 'rgba(0, 0, 0, 0.5)'
}

let size_x = 400;
let size_y = 500;
canvas.style.width = size_x + "px";
canvas.style.height = size_y + "px";

// Set actual size in memory (scaled to account for extra pixel density).
let scale = 3; // Change to 1 on retina screens to see blurry canvas.
canvas.width = Math.floor(size_x * scale);
canvas.height = Math.floor(size_y * scale);
ctx.scale(scale, scale);

// initial setup
ctx.fillStyle = colors.canvas;
ctx.fillRect(0, 0, canvas.width, canvas.width)

// setting
let upPressed = false;
let collided = false;
let isActive = false;
let frame = 0;
let velocity = 3;
let counter = 0;
let tubesCont = []
let clouds = [];
let grass_arr = [];

// setting listeners
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    upPressed = true;
  }
});

document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    upPressed = false;
  }
});

document.addEventListener('keydown', e => {
  if (e.code === 'Enter') {
    if (!isActive){
      isActive = true;
      refresh()
      rerender()
    }
  }
});

function refresh(){
  frame = 0;
  bird = new Bird()
  counter = 0;
  tubesCont.length = 0;
  clouds.length = 0;
  collided = false;
}

class Tube {
  constructor(){
    this.space = 200; // space between top and bottom tubes;
    this.top = Math.floor(Math.random() * (size_y - 200) + 200) - this.space
    this.bottom = size_y - this.top - this.space
    this.x_coord = size_x;
    this.width = 40;
    this.color = colors.tubes;
    this.ground_level = 30;
  }
  draw(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x_coord, 0, this.width, this.top)
    ctx.fillRect(this.x_coord, size_y - this.bottom - this.ground_level, this.width, this.bottom)
  }
  update(){
    this.x_coord -= velocity
    this.draw()
  }
  countScore(){
    if (this.x_coord + this.width === 29 ) {
      counter++
    }
  }
}

function tubeDrawer(){
  if (frame % 80 == 1){
    tubesCont.push(new Tube)
  }
  tubesCont.forEach((item, i) => {
    item.update()
  });
  if (tubesCont.length > 2) {
    tubesCont.shift();
  }
}

class Cloud {
  constructor(){
    this.x_coord = 450;
    this.y_coord = Math.floor(Math.random() * (20 - 120) + 120);
    this.height = 20;
    this.width = 50;
  }
  draw(){

    let cloud_image = document.querySelector('#source_cloud');
    ctx.drawImage(cloud_image, this.x_coord, this.y_coord);

  }
  update(){
    this.x_coord -= velocity;
    this.draw();
  }
}

function cloudDrawer(){
  if (frame % 110 == 1){
    clouds.push(new Cloud)
  }
  clouds.forEach((item, i) => {
    item.update()
  });
  if (clouds.length > 3) {
    clouds.shift();
  }
}

class Grass{
  constructor(){
    this.x_coord = 0;
    this.y_coord = 450;
  }
  update(){
    this.x_coord -= velocity
    if (this.x_coord == -399) {
      this.x_coord = 0;
      this.x_coord -= velocity
    }
    this.draw()
  }

  draw(){
    let grass_image = document.querySelector('#source_grass');
    ctx.drawImage(grass_image, this.x_coord, this.y_coord);
  }
}

class Bird {
  constructor(){
    this.x_coord = 50;
    this.y_coord = 50;
    this.vertical_speed = 0;
    this.height = 20;
    this.radius = 20;
    this.gravity = 1;
  }
  update(){
    if (this.y_coord >= size_y - this.radius - 30) { // the bird has fallen
      this.y_coord = size_y - this.radius - 30;
      collided = true

    } else {
      this.vertical_speed += this.gravity;
      this.y_coord *= 0.9;
      this.y_coord += this.vertical_speed;
    }
    if (this.y_coord < this.radius ){
      this.y_coord = this.radius;
    }

    if (upPressed) {
      this.flap()
    }
  }
  draw(){

    ctx.beginPath();
    ctx.fillStyle = colors.bird;
    ctx.arc(this.x_coord, this.y_coord, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

  }
  flap(){
    this.vertical_speed -= 3;
  }
}

let bird = new Bird();
let grass = new Grass();

function rerender(){
  ctx.clearRect(0, 0, canvas.width, canvas.width) // clearing canvas
  ctx.fillStyle = colors.canvas;
  ctx.fillRect(0, 0, canvas.width, canvas.width) // setting background
  cloudDrawer()
  grass.update()
  bird.update();
  bird.draw();
  tubeDrawer();
  frame++;

  if (tubesCont[0]){
    // checks if the collision is possible on x-axis
    tubesCont[0].countScore()
    if (tubesCont[0].x_coord < bird.x_coord + bird.radius && tubesCont[0].x_coord + tubesCont[0].width  > bird.x_coord - bird.radius) {

      let upperEdge = bird.y_coord - bird.radius;
      let bottomEdge = bird.y_coord + bird.radius;

      // checks if it is possible on y-axis
      if (upperEdge <= tubesCont[0].top) {
        collided = true
      }
      if (bottomEdge >= size_y - tubesCont[0].bottom - tubesCont[0].ground_level) {
        collided = true
      }
    }
  }

  drawCounter()

  if (!collided) {
    requestAnimationFrame(rerender);
  } else {
    printGameOver()
  }
}

function drawCounter(){
  ctx.font = "28px pixel";
  ctx.fillStyle = 'black';
  ctx.fillText(counter, size_x / 2, 60);
  ctx.textAlign = "center";
  ctx.font = "24px pixel";
  ctx.fillStyle = 'white';
  ctx.fillText(counter, size_x / 2, 60);
}

function startScreen(){ //setting the default start screen
  ctx.fillStyle = colors.canvas;
  ctx.fillRect(0, 0, canvas.width, canvas.width);
  ctx.fillStyle = 'white';
  ctx.font = "20px pixel";
  ctx.textAlign = "center";
  let greeting = 'Press Enter';
  ctx.fillText(greeting, size_x / 2, size_y / 2);
}

function printGameOver(){ //setting the Game Over screen
  isActive = false;
  let score = `score: ${counter}`;
  ctx.fillStyle = colors.gameOverBackground;
  ctx.fillRect(0, 0, canvas.width, canvas.width);
  ctx.fillStyle = 'white';
  ctx.font = "20px pixel";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", size_x / 2, size_y / 2 - 20);
  ctx.font = "16px pixel";
  ctx.fillText(score, size_x / 2, size_y / 2 + 20);
}

setTimeout(startScreen, 100) // just to make sure that the font is loaded
