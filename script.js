const canvas = document.getElementById("ecg");
const ctx = canvas.getContext("2d");

let currentBPM = CONFIG.baseBPM;
let targetBPM = CONFIG.baseBPM;
let superChatBoost = false;

let comments = [];
let lastCommentCount = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

function drawECG(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerY = canvas.height / 2;
  const amplitude = (currentBPM - 60) * 1.2;

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(255,100,150,${0.6 + amplitude/100})`;
  ctx.shadowBlur = amplitude / 2;
  ctx.shadowColor = "rgba(255,100,150,0.8)";

  for (let x = 0; x < canvas.width; x++) {
    let t = (time/1000) * (currentBPM/60) + x * 0.01;
    let y = centerY + Math.sin(t) * amplitude;

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}

function animate(time) {
  // 徐々にtargetへ近づく
  currentBPM += (targetBPM - currentBPM) * 0.05;
  drawECG(time);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
