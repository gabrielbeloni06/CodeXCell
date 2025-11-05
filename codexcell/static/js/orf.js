document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("orfData");
  const orfs = JSON.parse(el.dataset.orfs);
  const seqLength = parseInt(el.dataset.length, 10);
  const canvas = document.getElementById("orfCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 20, canvas.width, 40);
  const scale = canvas.width / seqLength;
  const colors = {1: "#4CAF50", 2: "#2196F3", 3: "#FF9800"};
  orfs.forEach(orf => {
    const x = orf.start * scale;
    const w = (orf.end - orf.start) * scale;
    ctx.fillStyle = colors[orf.frame] || "#000";
    ctx.fillRect(x, 20, w, 40);
  });
});
