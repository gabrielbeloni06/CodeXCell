const canvas = document.getElementById('dnaCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

let t = 0;

function drawBackground() {
  const W = canvas.width, H = canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#0b0f14");
  gradient.addColorStop(1, "#1a0d12");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    for (let y = 0; y <= H; y += 20) {
      const x = W/2 + Math.sin(y/80 + t/50 + i) * 140;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255,30,60,${0.25 + i*0.05})`;
    ctx.shadowColor = "#ff1e3c";
    ctx.shadowBlur = 12;
    ctx.stroke();
  }
}

function animate() {
  drawBackground();
  t++;
  requestAnimationFrame(animate);
}
animate();
