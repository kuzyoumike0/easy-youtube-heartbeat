const heart = document.getElementById("heart");
const bpmText = document.getElementById("bpm");
const canvas = document.getElementById("ecgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentBPM = CONFIG.baseBPM;
let beatInterval = 60000 / currentBPM;
let amplitude = 20;
let overdrive = false;

function updateBPM(newBPM) {
  currentBPM = Math.max(CONFIG.minBPM,
    Math.min(CONFIG.maxBPM, newBPM));

  bpmText.innerText = Math.round(currentBPM) + " BPM";
  beatInterval = 60000 / currentBPM;
}

window.updateHeartBySpeed = function(speed) {
  const target =
    CONFIG.baseBPM +
    speed * CONFIG.bpmPerComment;

  amplitude = 20 + speed * 5;

  if (speed >= CONFIG.overdriveThreshold) {
    activateOverdrive();
  }

  updateBPM(target);
};

function heartbeat() {
  heart.style.transform = "scale(1.25)";
  setTimeout(() => {
    heart.style.transform = "scale(1)";
  }, 120);

  setTimeout(heartbeat, beatInterval);
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
  triggerSuperChatlet offset = 0;

function drawECG() {
  requestAnimationFrame(drawECG);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = overdrive ? "#ff0000" : "#ff4fa3";
  ctx.lineWidth = 3;
  ctx.beginPath();

  const centerY = canvas.height / 2;

  for (let x = 0; x < canvas.width; x++) {
    const y = centerY +
      Math.sin((x + offset) * 0.02) * amplitude;

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
  offset += currentBPM * 0.1;
}

}

function triggerSuperChat() {
  updateBPM(CONFIG.superChatBPM);
  activateOverdrive();

  setTimeout(() => {
    updateBPM(CONFIG.baseBPM);
  }, CONFIG.superChatDuration);
}

window.triggerSuperChat = triggerSuperChat;

heartbeat();
drawECG();



