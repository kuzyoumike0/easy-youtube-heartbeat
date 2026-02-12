const text = document.getElementById("text");
const ecg = document.getElementById("ecg");
const wave = document.getElementById("wave");

function animateWave(speedMultiplier = 1) {
  wave.style.transition = `stroke-dashoffset ${1/speedMultiplier}s linear`;
  wave.style.strokeDashoffset = 0;
}

function resetWave() {
  wave.style.transition = "none";
  wave.style.strokeDashoffset = 2000;
}

function playNormalOverDrive() {
  resetWave();
  ecg.style.opacity = 1;

  text.style.opacity = 1;
  text.style.transform = "scale(1.1)";
  animateWave(1);

  setTimeout(() => {
    text.style.transform = "scale(1)";
  }, 200);

  setTimeout(() => {
    ecg.style.opacity = 0;
    text.style.opacity = 0;
    resetWave();
  }, CONFIG.normalDuration);
}

function playStrongOverDrive() {
  resetWave();
  ecg.style.opacity = 1;

  document.body.classList.add("flash");

  text.style.opacity = 1;
  text.style.transform = "scale(1.5)";
  text.classList.add("glitch");

  animateWave(2);

  setTimeout(() => {
    document.body.classList.remove("flash");
    text.classList.remove("glitch");
  }, 500);

  setTimeout(() => {
    ecg.style.opacity = 0;
    text.style.opacity = 0;
    text.style.transform = "scale(0.6)";
    resetWave();
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

function testNormal() {
  playNormalOverDrive();
}

function testRare() {
  playStrongOverDrive();
}

function triggerFromInput() {
  const amount = parseInt(document.getElementById("amount").value || 0);
  triggerOverDrive(amount);
}

window.triggerOverDrive = triggerOverDrive;
