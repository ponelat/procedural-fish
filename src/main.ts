import './style.css'

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const SPINE_ANGLE = 120
// Dot properties
let leader = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  color: 'blue',
  speed: 5,
  distance: 45,
  dx: 0,
  dy: 0
};

let spine = [leader]
for(let i = 1; i < 5; i++) {
  spine.push({
    x: spine[i-1].x - 50,
    y: spine[i-1].y,
    distance: 30,
    color: 'red',
    speed: 5,
    dx: 0,
    dy: 0,
  })
}

let topLeftText = '0'
let startX, startY, touchVec

// Update leader position based on arrow keys
function update() {
  leader.x += leader.dx;
  leader.y += leader.dy;

  if(touchVec) {
    leader.x += touchVec[0] / 10
    leader.y += touchVec[1] / 10
    
  }

  // Keep the leader within the canvas bounds
  if (leader.x - leader.distance < 0) leader.x = leader.distance;
  if (leader.x + leader.distance > canvas.width) leader.x = canvas.width - leader.distance;
  if (leader.y - leader.distance < 0) leader.y = leader.distance;
  if (leader.y + leader.distance > canvas.height) leader.y = canvas.height - leader.distance;

  // Update the spine segments. Follow the leader
  for(let i = 1; i < spine.length; i++) {
    const pprevious = spine[i-2]
    const previous = spine[i-1]
    const current = spine[i]
    const nextXY = followXY(current, previous)
    current.x = nextXY[0]
    current.y = nextXY[1]

    // If we have at least three, then ensure spine doesn't bend more than
    // ... SPINE_ANGLE
    if(pprevious) {
      const angle = calculateAngle([current.x, current.y], [previous.x, previous.y], [pprevious.x, pprevious.y])
      if(angle < SPINE_ANGLE) {
	let oldVec = [previous.x - current.x, previous.y - current.y]
	let newVec = rotateVector2D(oldVec, angle - SPINE_ANGLE)
	current.x = previous.x - newVec[0]
	current.y = previous.y - newVec[1]
      }
      
    }
  }

  // Angle between leader and first segment.
  const angle = calculateAngle([spine[0].x, spine[0].y], [spine[1].x, spine[1].y], [spine[2].x, spine[2].y])
  topLeftText = `${angle.toFixed(0)} deg`
}

function attach2D([x, y], distance, angle) {
    let radians = angle * Math.PI / 180; // Convert angle to radians
    return [
        x + distance * Math.cos(radians),
        y + distance * Math.sin(radians)
  ]
}

function rotateVector2D([x, y], angle) {
    let radians = angle * Math.PI / 180; // Convert angle to radians
    let cosA = Math.cos(radians);
    let sinA = Math.sin(radians);
    
  return [
    x * cosA - y * sinA,
    x * sinA + y * cosA
  ]
}

function followXY(current, previous) {
  const oldVec = [previous.x - current.x, previous.y - current.y]
  const newVec = scaleVectorToLength(oldVec, previous.distance)
  return [previous.x - newVec[0], previous.y - newVec[1]]
}

function calculateAngle(A, B, C) {
    // Destructure points into coordinates
    const [x1, y1] = A;
    const [x2, y2] = B;
    const [x3, y3] = C;

    // Calculate vectors BA and BC
    const BAx = x1 - x2;
    const BAy = y1 - y2;
    const BCx = x3 - x2;
    const BCy = y3 - y2;

    // Calculate the dot product of vectors BA and BC
    const dotProduct = (BAx * BCx) + (BAy * BCy);

    // Calculate the magnitudes of vectors BA and BC
    const magnitudeBA = Math.sqrt(BAx * BAx + BAy * BAy);
    const magnitudeBC = Math.sqrt(BCx * BCx + BCy * BCy);

    // Calculate the cosine of the angle
    const cosTheta = dotProduct / (magnitudeBA * magnitudeBC);

    // Calculate the angle in radians
    const angleInRadians = Math.acos(cosTheta);

    // Convert the angle to degrees
    const angleInDegrees = angleInRadians * (180 / Math.PI);

    return angleInDegrees;
}


// Draw the leader
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawText(topLeftText, 10,10)

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

  // Draw some eyes
  const baseAngle = angleFromVector([leader.x - spine[1].x, leader.y - spine[1].y])
  const eyeXYLeft = attach2D([leader.x, leader.y], 30, baseAngle - 90)
  const leftEye = parametizedAttach(leader, spine[1], 30, 90)
  ctx.beginPath();
  ctx.arc(eyeXYLeft[0], eyeXYLeft[1], 6, 0, Math.PI * 2);
  ctx.fillStyle = 'orange';
  ctx.fill();
  ctx.closePath();
  const eyeXYRight = attach2D([leader.x, leader.y], 30, baseAngle + 90)
  ctx.beginPath();
  ctx.arc(eyeXYRight[0], eyeXYRight[1], 6, 0, Math.PI * 2);
  ctx.fillStyle = 'orange';
  ctx.fill();
  ctx.closePath();

}

function parametizedAttach(current, previous, distance, angle) {
  const baseAngle = angleFromVector([previous.x - current.x, previous.y - current.y])
  return attach2D([current.x, current.y], distance, baseAngle + angle)
}

function drawDot(x,y, color='red', radius=6) {
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

function drawText(text, x=10,y=10) {
  ctx.font = '2244 Arial';  // Font size and family
  ctx.fillStyle = 'white';  // Text color
  ctx.textAlign = 'left';   // Horizontal alignment
  ctx.textBaseline = 'top'; // Vertical alignment
  ctx.fillText(text, x,y)
}

function angleFromVector([x, y]) {
    return Math.atan2(y, x) * 180 / Math.PI; // Convert radians to degrees
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

document.addEventListener('touchstart', function(event) {
    let touch = event.touches[0]; // Get the first touch point
    startX = touch.clientX;
    startY = touch.clientY;
});

document.addEventListener('touchmove', function(event) {
  let touch = event.touches[0]; // Get the first touch point

  if (startX !== undefined && startY !== undefined) {
    let currentX = touch.clientX;
    let currentY = touch.clientY;
    let vector = {
      x: currentX - startX,
      y: currentY - startY
    };
    touchVec = [vector.x, vector.y]
    console.log(`Vector: (${vector.x}, ${vector.y})`);
  }
}, { passive: true });

document.addEventListener('touchend', function(event) {
  startX = undefined;
  startY = undefined;
  touchVec = undefined
});

// Start the game loop
gameLoop();
