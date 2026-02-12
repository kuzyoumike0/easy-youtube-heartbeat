const text = document.getElementById("text");
const ecg = document.getElementById("ecg");
const wave = document.getElementById("wave");

let commentCount = 0;
let lastCommentCount = 0;
let overDriveActive = false;

let pulseScale = 1;
let pulseTime = 0;

function animate() {
  requestAnimationFrame(animate);

  const speed = calculatePulseSpeed();
  pulseTime += 0.05 * speed;

  const scale = 1 + Math.sin(pulseTime) * 0.08;
  text.style.transform = `scale(${scale})`;
}

function calculatePulseSpeed() {
  const delta = commentCount - lastCommentCount;
  lastCommentCount = commentCount;

  let speed =
    CONFIG.basePulse +
    commentCount * CONFIG.commentInfluence +
    delta * CONFIG.speedBoostInfluence;

  if (overDriveActive) {
    speed *= CONFIG.overdriveMultiplier;
  }

  return Math.min(speed, 4); // 上限制御
}

function updateCommentCount(count) {
  commentCount = count;
}

window.updateCommentCount = updateCommentCount;

function animateWave(speedMultiplier = 1) {
  wave.style.transition = `stroke-dashoffset ${1/speedMultiplier}s linear`;
  wave.style.strokeDashoffset = 0;
}

function resetWave() {
  wave.style.transition = "none";
  wave.style.strokeDashoffset = 2000;
}

function playNormalOverDrive() {
  overDriveActive = true;

  resetWave();
  ecg.style.opacity = 1;
  animateWave(1.2);

  setTimeout(() => {
    ecg.style.opacity = 0;
    resetWave();
    overDriveActive = false;
  }, CONFIG.normalDuration);
}

function playStrongOverDrive() {
  overDriveActive = true;

  resetWave();
  ecg.style.opacity = 1;

  text.classList.add("glitch");
  animateWave(2);

  setTimeout(() => {
    text.classList.remove("glitch");
  }, 600);

  setTimeout(() => {
    ecg.style.opacity = 0;
    resetWave();
    overDriveActive = false;
  }, CONFIG.rareDuration);
}

function triggerOverDrive(amount = 0) {
  let rareChance = CONFIG.baseRareChance;

  if (amount >= CONFIG.highAmountThreshold)
    rareChance = CONFIG.highRareChance;

  if (amount >= CONFIG.ultraAmountThreshold)
    rareChance = CONFIG.ultraRareChance;

  const isRare = Math.random() < rareChance;

  if (isRare) {
    playStrongOverDrive();
  } else {
    playNormalOverDrive();
  }
}

window.triggerOverDrive = triggerOverDrive;

animate();
