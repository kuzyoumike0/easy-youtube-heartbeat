const heart = document.getElementById("heart");
const bpmText = document.getElementById("bpm");
const canvas = document.getElementById("ecgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentBPM = CONFIG.baseBPM;
let beatInterval = 60000 / currentBPM;
let amplitude = 25;
let overdrive = false;

function updateBPM(newBPM) {
  currentBPM = Math.max(CONFIG.minBPM,
    Math.min(CONFIG.maxBPM, newBPM));

  bpmText.innerText = Math.round(currentBPM) + " BPM";
  beatInterval = 60000 / currentBPM;

  updateBPMColor();
}

function updateBPMColor() {
  if (currentBPM <= 85) {
    bpmText.style.color = "#ff4fa3";
  } else if (currentBPM <= 110) {
    bpmText.style.color = "#ff1f88";
  } else if (currentBPM <= 140) {
    bpmText.style.color = "#ff0000";
  } else {
    bpmText.style.color = "#990000";
  }
}

window.updateHeartBySpeed = function(speed) {
  const target =
    CONFIG.baseBPM +
    speed * CONFIG.bpmPerComment;

  amplitude = 25 + speed * 6;

  if (speed >= CONFIG.overdriveThreshold) {
    activateOverdrive();
  }

  updateBPM(target);
};

function heartbeat() {
  const interval = 60000 / currentBPM;

  // 強拍
  heart.style.transform = "scale(1.3)";
  bpmText.style.transform = "scale(1.1)";

  setTimeout(() => {
    heart.style.transform = "scale(1.05)";
    bpmText.style.transform = "scale(1)";
  }, 120);

  // 弱拍
  setTimeout(() => {
    heart.style.transform = "scale(1.18)";
    setTimeout(() => {
      heart.style.transform = "scale(1)";
    }, 100);
  }, 220);

  setTimeout(heartbeat, interval);
}

function activateOverdrive() {
  if (overdrive) return;

  overdrive = true;
  document.body.classList.add("overdrive");

  setTimeout(() => {
    document.body.classList.remove("overdrive");
    overdrive = false;
  }, 2000);
}

function simulateSuperChat() {
  updateBPM(CONFIG.superChatBPM);
  activateOverdrive();

  setTimeout(() => {
    updateBPM(CONFIG.baseBPM);
  }, CONFIG.superChatDuration);
}

heartbeat();
drawECG();
let offset = 0;

function drawECG() {
  requestAnimationFrame(drawECG);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = overdrive ? "#ff0000" : "#ff4fa3";
  ctx.lineWidth = 3;
  ctx.beginPath();

  const centerY = canvas.height / 2;
  const width = canvas.width;

  for (let x = 0; x < width; x++) {

    let phase = (x + offset) % 200;

    let y = centerY;

    // P波
    if (phase > 20 && phase < 40) {
      y -= Math.sin((phase - 20) / 20 * Math.PI) * 15;
    }

    // QRS
    if (phase >= 60 && phase <= 65) y += 30;
    if (phase > 65 && phase < 70) y -= amplitude;
    if (phase >= 70 && phase <= 75) y += 40;

    // T波
    if (phase > 110 && phase < 150) {
      y -= Math.sin((phase - 110) / 40 * Math.PI) * 20;
    }

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();

  const miniCanvas = document.getElementById("miniECG");
const miniCtx = miniCanvas.getContext("2d");

miniCanvas.width = 260;
miniCanvas.height = 100;

let miniOffset = 0;

function drawMiniECG() {
  requestAnimationFrame(drawMiniECG);

  miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);

  miniCtx.strokeStyle = overdrive ? "#ff0000" : "#ffffff";
  miniCtx.lineWidth = 2;
  miniCtx.shadowBlur = overdrive ? 15 : 8;
  miniCtx.shadowColor = overdrive ? "#ff0000" : "#ff8ad6";

  miniCtx.beginPath();

  const centerY = miniCanvas.height / 2;
  const width = miniCanvas.width;

  for (let x = 0; x < width; x++) {

    let phase = (x + miniOffset) % 120;
    let y = centerY;

    // 小さめP波
    if (phase > 10 && phase < 20) {
      y -= Math.sin((phase - 10)/10 * Math.PI) * 8;
    }

    // 小型QRS
    if (phase >= 40 && phase <= 42) y += 10;
    if (phase > 42 && phase < 45) y -= (10 + amplitude/4);
    if (phase >= 45 && phase <= 48) y += 15;

    // T波
    if (phase > 70 && phase < 90) {
      y -= Math.sin((phase - 70)/20 * Math.PI) * 6;
    }

    if (x === 0) miniCtx.moveTo(x, y);
    else miniCtx.lineTo(x, y);
  }

  miniCtx.stroke();

  miniOffset += currentBPM * 0.2;
}

drawMiniECG();


  offset += currentBPM * 0.3;
}
