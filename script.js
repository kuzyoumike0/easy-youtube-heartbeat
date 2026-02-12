const heart = document.getElementById("heart");
const bpmText = document.getElementById("bpm");

let currentBPM = CONFIG.baseBPM;
let beatInterval = 60000 / currentBPM;

function updateBPM(newBPM) {
  currentBPM = Math.max(CONFIG.minBPM,
    Math.min(CONFIG.maxBPM, newBPM));

  bpmText.innerText = Math.round(currentBPM) + " BPM";
  beatInterval = 60000 / currentBPM;
}

window.updateHeartBySpeed = function(commentSpeed) {
  const targetBPM =
    CONFIG.baseBPM +
    commentSpeed * CONFIG.bpmPerComment;

  updateBPM(targetBPM);
};

function heartbeat() {
  heart.style.transform = "scale(1.2)";

  setTimeout(() => {
    heart.style.transform = "scale(1)";
  }, 120);

  setTimeout(heartbeat, beatInterval);
}

heartbeat();
