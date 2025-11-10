const canvas = document.getElementById('dnaCanvas');
const ctx = canvas.getContext('2d');

let W, H, DPR;
function resize() {
  DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  W = canvas.width = Math.floor(window.innerWidth * DPR);
  H = canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}
resize();
window.addEventListener('resize', resize);
let offset = 0;          
let speed = 0.8;          
let diagX = 0, diagY = 0; 
let vx = 1.4, vy = 0.8;  
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

// Colors
const strandA = '#ff1e3c';
const strandB = '#ff1e3c'; 
const rungColors = ['#ff6b81', '#ff4757', '#ff1e3c']; 

window.addEventListener('mousemove', (e) => {
  targetMouseX = e.clientX / window.innerWidth - 0.5;
  targetMouseY = e.clientY / window.innerHeight - 0.5;
});

function easeMouse() {
  const easing = 0.07;
  mouseX += (targetMouseX - mouseX) * easing;
  mouseY += (targetMouseY - mouseY) * easing;
}

const amplitude = 90;         
const wavelength = 180;         
const separation = 40;       
const rungSpacing = 24;      
const thickness = 2.6;          
const alphaBase = 0.85;       

function line(x1, y1, x2, y2, color, width, alpha=1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function dot(x, y, r, color, alpha=1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function render() {
  easeMouse();
  diagX += vx;
  diagY += vy;
  const margin = 120 * DPR;
  if (diagX < -margin || diagX > W + margin) vx *= -1;
  if (diagY < -margin || diagY > H + margin) vy *= -1;
  ctx.clearRect(0, 0, W, H);
  const tiltX = mouseX * 80 * DPR;
  const tiltY = mouseY * 80 * DPR;
  const layers = [
    { amp: amplitude * 0.75, sep: separation * 0.9, width: thickness * 0.9, alpha: alphaBase * 0.7, speedMul: 0.7 },
    { amp: amplitude,        sep: separation,       width: thickness,        alpha: alphaBase,       speedMul: 1.0 },
    { amp: amplitude * 1.2,  sep: separation * 1.1, width: thickness * 1.2,  alpha: alphaBase * 0.6, speedMul: 0.5 }
  ];

  layers.forEach((layer, idx) => {
    drawHelix(layer, idx);
  });

  offset += speed;
  requestAnimationFrame(render);

  function drawHelix(layer, layerIndex) {
    const amp = layer.amp * DPR;
    const wave = wavelength * DPR;
    const sep = layer.sep * DPR;
    const width = layer.width * DPR;
    const alpha = layer.alpha;
    const baseX = (diagX + tiltX * 0.4 + layerIndex * 80 * DPR) % (W + wave);
    const baseY = (diagY + tiltY * 0.3 + layerIndex * 60 * DPR) % (H + wave);
    const steps = Math.ceil((W + H) / (rungSpacing * DPR)) + 20;
    const phase = offset * layer.speedMul;

    for (let i = -steps; i < steps; i++) {
      const t = i * rungSpacing * DPR;
      const x = (baseX + t) - (t * 0.65);
      const y = (baseY + t) - (t * 0.35);
      if (x < -200 || x > W + 200 || y < -200 || y > H + 200) continue;
      const sin = Math.sin((t + phase) / wave * Math.PI * 2);
      const cos = Math.cos((t + phase) / wave * Math.PI * 2);
      const xA = x + sin * amp;
      const yA = y + cos * amp;
      const xB = x - sin * amp;
      const yB = y - cos * amp;
      const rungColor = rungColors[(i + layerIndex) % rungColors.length];
      line(xA, yA, xB, yB, rungColor, width * 0.75, alpha * 0.9);
      dot(xA, yA, width * 0.55, strandA, alpha * 0.85);
      dot(xB, yB, width * 0.55, strandB, alpha * 0.85);
      line(xA, yA, xA + sin * sep, yA + cos * sep, strandA, width * 0.35, alpha * 0.5);
      line(xB, yB, xB - sin * sep, yB - cos * sep, strandB, width * 0.35, alpha * 0.5);
    }
  }
}
render();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    speed = 0.35; vx = 0.6; vy = 0.4;
  } else {
    speed = 0.8; vx = 1.4; vy = 0.8;
  }
});
