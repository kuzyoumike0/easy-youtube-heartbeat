const text = document.getElementById("text");

let pulseTime = 0;
let pulseSpeed = 1;

function animate() {
  requestAnimationFrame(animate);

  pulseTime += 0.05 * pulseSpeed;
  const scale = 1 + Math.sin(pulseTime) * 0.1;

  text.style.transform = `scale(${scale})`;
}

function updatePulseBySpeed(commentSpeed) {
  pulseSpeed =
    CONFIG.basePulse +
    commentSpeed * CONFIG.speedInfluence;

  pulseSpeed = Math.min(pulseSpeed, CONFIG.maxPulse);
}

window.updatePulseBySpeed = updatePulseBySpeed;

animate();
