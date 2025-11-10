function debounce(fn, delay = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), delay);
  };
}

function initGcHeatmap() {
  const cells = document.querySelectorAll('.gc-heatmap .cell');
  cells.forEach(cell => {
    const color = cell.getAttribute('data-color');
    if (color) cell.style.background = color;
  });
}

function initOrfCanvas() {
  const canvas = document.getElementById('orfCanvas');
  const dataEl = document.getElementById('orfData');
  if (!canvas || !dataEl) return;
  let orfs = [];
  try { orfs = JSON.parse(dataEl.getAttribute('data-orfs') || '[]'); } catch (e) {}
  const seqLen = parseInt(dataEl.getAttribute('data-length') || '0', 10);
  const ctx = canvas.getContext('2d');
  function render() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, H / 2);
    ctx.lineTo(W - 20, H / 2);
    ctx.stroke();

    const frameColors = { 1: '#2ecc71', 2: '#3db2ff', 3: '#ff9f43' };
    orfs.forEach((orf, idx) => {
      const xStart = 20 + (orf.start / seqLen) * (W - 40);
      const xEnd   = 20 + (orf.end   / seqLen) * (W - 40);
      const yBase  = H / 2 + (orf.frame - 2) * 18;
      const color = frameColors[orf.frame] || '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(xStart, yBase);
      ctx.lineTo(xEnd, yBase);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '12px Inter, system-ui';
      ctx.fillText(`ORF${idx + 1} • ${orf.length} nt • F${orf.frame}`, xStart, yBase - 10);
    });
  }
  const onResize = debounce(() => {
    const wrap = canvas.parentElement;
    const width = wrap ? Math.min(wrap.clientWidth - 24, 1000) : 800;
    canvas.width = Math.max(600, width);
    canvas.height = 140;
    render();
  }, 100);

  window.addEventListener('resize', onResize);
  onResize();
}
function initTables() {
  document.querySelectorAll('table').forEach(table => {
    table.setAttribute('role', 'table');
    table.querySelectorAll('tbody tr').forEach(row => {
      row.setAttribute('tabindex', '0');
      row.addEventListener('focus', () => { row.style.outline = 'none'; row.style.background = 'rgba(255,255,255,0.08)'; });
      row.addEventListener('blur', () => { row.style.background = ''; });
    });
  });
}

function initMetricCounters() {
  document.querySelectorAll('.badge .value').forEach(el => {
    const target = parseFloat(el.textContent);
    if (isNaN(target)) return;
    let current = 0;
    const steps = 24;
    const inc = target / steps;
    let i = 0;
    const tick = () => {
      i++;
      current = Math.min(target, Math.round((i * inc) * 100) / 100);
      el.textContent = current;
      if (i < steps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function initComparison() {
  const pre = document.querySelector('.comparison pre');
  if (!pre) return;
  pre.style.textShadow = '0 0 8px rgba(255,36,67,0.15)';
}

function initBackground() {
  let bg = document.getElementById('resultBgCanvas');
  if (!bg) {
    bg = document.createElement('canvas');
    bg.id = 'resultBgCanvas';
    Object.assign(bg.style, {
      position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none'
    });
    document.body.prepend(bg);
  }
  const ctx = bg.getContext('2d');

  function resize() {
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', debounce(resize, 100));

  let t = 0;
  function draw() {
    const W = bg.width, H = bg.height;
    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0b0f14');
    grad.addColorStop(1, '#1a0d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) * 0.45 + Math.sin(t / 140) * 10;
    const rg = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    rg.addColorStop(0, 'rgba(255,36,67,0.12)');
    rg.addColorStop(0.6, 'rgba(255,36,67,0.08)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      const amp = 120 + i * 15;
      for (let x = 0; x <= W; x += 24) {
        const y = cy + Math.sin(x / 180 + t / 90 + i) * (amp / 10);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,36,67,${0.20 + i * 0.05})`;
      ctx.shadowColor = '#ff2443';
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    t++;
    requestAnimationFrame(draw);
  }
  draw();
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transform = 'translateY(0)';
        e.target.style.opacity = '1';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.card').forEach(card => {
    card.style.transform = 'translateY(18px)';
    card.style.opacity = '0';
    card.style.transition = 'transform .6s ease, opacity .6s ease';
    observer.observe(card);
  });
}

function initSidebarToggle() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');
  if (!hamburger || !sidebar) return;
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('closed');
    hamburger.classList.toggle('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initGcHeatmap();
  initOrfCanvas();
  initTables();
  initMetricCounters();
  initComparison();
  initBackground();
  initScrollReveal();
  initSidebarToggle();
});
