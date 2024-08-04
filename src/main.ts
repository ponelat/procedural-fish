import './style.css'

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Dot properties
let dot = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 5,
  dx: 0,
  dy: 0
};

let spine = [50,50,50,50,50]

// Update dot position based on arrow keys
function update() {
  dot.x += dot.dx;
  dot.y += dot.dy;

  // Keep the dot within the canvas bounds
  if (dot.x - dot.radius < 0) dot.x = dot.radius;
  if (dot.x + dot.radius > canvas.width) dot.x = canvas.width - dot.radius;
  if (dot.y - dot.radius < 0) dot.y = dot.radius;
  if (dot.y + dot.radius > canvas.height) dot.y = canvas.height - dot.radius;
}


// Draw the dot
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let startX = dot.x
  let startY = dot.y

  ctx.beginPath()
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5
  for(let i = 0; i < spine.length; i++) {
    ctx.lineTo(startX, startY);
    startX -= spine[i]
  }
  ctx.stroke()

  startX = dot.x
  for(let i = 0; i < spine.length; i++) {
    let fill = (i === 0 ? 'blue' : 'red')
    drawDot(startX, startY, fill)
    startX -= spine[i]
  }

}

function drawDot(x,y, color='red') {
  ctx.beginPath();
  ctx.arc(x, y, dot.radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
  
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Handle arrow key inputs
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      dot.dy = -dot.speed;
      break;
    case 'ArrowDown':
      dot.dy = dot.speed;
      break;
    case 'ArrowLeft':
      dot.dx = -dot.speed;
      break;
    case 'ArrowRight':
      dot.dx = dot.speed;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowDown':
      dot.dy = 0;
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      dot.dx = 0;
      break;
  }
});

// Start the game loop
gameLoop();
