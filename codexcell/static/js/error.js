const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let t = 0;
const nucleotides = ["A", "T", "C", "G"];
const colors = {
  "A": "rgba(46, 204, 113, 0.8)", 
  "T": "rgba(231, 76, 60, 0.8)",    
  "C": "rgba(52, 152, 219, 0.8)",  
  "G": "rgba(243, 156, 18, 0.8)"   
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  ctx.lineWidth = 1.5;
  for (let i = -H/2; i <= H/2; i += 20) {
    const offset = Math.sin((i + t) / 40) * 100;
    const x1 = cx + offset;
    const x2 = cx - offset;
    const y = cy + i;
    ctx.strokeStyle = "rgba(207,225,255,0.15)";
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    const nt1 = nucleotides[Math.floor((i/20 + t/20) % 4 + 4) % 4];
    const nt2 = nucleotides[Math.floor((i/20 + t/20 + 2) % 4 + 4) % 4];
    ctx.beginPath();
    ctx.arc(x1, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors[nt1];
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors[nt2];
    ctx.fill();
  }
  t += 2;
  requestAnimationFrame(draw);
}
draw();
