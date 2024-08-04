import './style.css'

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Dot properties
let leader = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  color: 'blue',
  speed: 5,
  distance: 50,
  dx: 0,
  dy: 0
};

let spine = [leader]
for(let i = 1; i < 5; i++) {
  spine.push({
    x: spine[i-1].x - 50,
    y: spine[i-1].y,
    radius: 10,
    distance: 50,
    color: 'red',
    speed: 5,
    dx: 0,
    dy: 0,
  })
}

// Update leader position based on arrow keys
function update() {
  leader.x += leader.dx;
  leader.y += leader.dy;

  // Keep the leader within the canvas bounds
  if (leader.x - leader.distance < 0) leader.x = leader.distance;
  if (leader.x + leader.distance > canvas.width) leader.x = canvas.width - leader.distance;
  if (leader.y - leader.distance < 0) leader.y = leader.distance;
  if (leader.y + leader.distance > canvas.height) leader.y = canvas.height - leader.distance;

  // Update the spine segments
  for(let i = 1; i < spine.length; i++) {
    const previous = spine[i-1]
    const current = spine[i]
    const oldVec = [previous.x - current.x, previous.y - current.y]
    const newVec = scaleVectorToLength(oldVec, previous.distance)
    console.log("oldVec,newVec", i, oldVec,newVec)
    current.x = previous.x - newVec[0]
    current.y = previous.y - newVec[1]
    // spine[i].x += leader.dx
    // spine[i].y += leader.dy
  }
}


// Draw the leader
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Line connecting spine
  ctx.beginPath()
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 5
  for(let i = 0; i < spine.length; i++) {
    ctx.lineTo(spine[i].x, spine[i].y);
  }
  ctx.stroke()

  // Dots at points on spine
  for(let i = 0; i < spine.length; i++) {
    drawDot(spine[i].x, spine[i].y, spine[i].color)
  }

  // Distance around dots
  for(let i = 0; i < spine.length; i++) {
    ctx.beginPath()
    ctx.arc(spine[i].x, spine[i].y, spine[i].distance,0, Math.PI*2)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'red'
    ctx.stroke()
  }

}

function drawDot(x,y, color='red', radius=10) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
  
}

function scaleVectorToLength([x, y], desiredLength) {
  // Calculate the current length of the vector
  const currentLength = Math.sqrt(x * x + y * y);

  // If the current length is zero, return a zero vector
  if (currentLength === 0) {
    return [0,0]
  }

  // Calculate the scaling factor
  const scaleFactor = desiredLength / currentLength;

  // Scale the vector components
  const newX = x * scaleFactor;
  const newY = y * scaleFactor;

  return [newX, newY]
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
      leader.dy = -leader.speed;
      break;
    case 'ArrowDown':
      leader.dy = leader.speed;
      break;
    case 'ArrowLeft':
      leader.dx = -leader.speed;
      break;
    case 'ArrowRight':
      leader.dx = leader.speed;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowDown':
      leader.dy = 0;
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      leader.dx = 0;
      break;
  }
});

// Start the game loop
gameLoop();
