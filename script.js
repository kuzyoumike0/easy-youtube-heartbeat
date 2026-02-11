const heart = document.getElementById("heartImg");
const bpmText = document.getElementById("bpm");
const canvas = document.getElementById("ecg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 150;
canvas.style.width = "100%";
canvas.style.height = "150px";

let baseBPM = 72;
let boost = 0;
let superBoost = 0;
let lastBeat = 0;

function calculateBPM() {
    let bpm = baseBPM + boost + superBoost;
    bpm = Math.max(50, Math.min(140, bpm));
    return Math.floor(bpm);
}

/* ------------------ ハート脈動 ------------------ */

function animateHeart(timestamp) {
    const bpm = calculateBPM();
    const beatInterval = 60000 / bpm;

    if (timestamp - lastBeat > beatInterval) {
        lastBeat = timestamp;
    }

    const progress = (timestamp - lastBeat) / beatInterval;

    // 心臓っぽい二段階収縮
    let scale = 1;

    if (progress < 0.15) {
        scale = 1 + progress * 0.6;
    } else if (progress < 0.3) {
        scale = 1.09 - (progress - 0.15) * 0.6;
    } else {
        scale = 1;
    }

    // 微振動
    const vibration = Math.sin(timestamp / 30) * 0.01;

    heart.style.transform = `scale(${scale}) translateY(${vibration * 10}px)`;

    // BPM数字も連動拡縮
    bpmText.style.transform = `scale(${1 + (scale - 1) * 0.6})`;

    bpmText.innerText = bpm;

    requestAnimationFrame(animateHeart);
}

requestAnimationFrame(animateHeart);

/* ------------------ 心電図 ------------------ */

let x = 0;
let waveIntensity = 1;

function drawECG() {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = `rgba(255,0,0,0.9)`;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let mid = canvas.height / 2;

    // よりリアルな波形
    let spike = Math.sin(x * 0.05) * 10;

    if (x % 120 < 10) spike = -40 * waveIntensity;
    if (x % 120 >= 10 && x % 120 < 20) spike = 50 * waveIntensity;

    ctx.moveTo(x, mid);
    ctx.lineTo(x + 1, mid + spike);
    ctx.stroke();

    x += 2;

    if (x > canvas.width) {
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(drawECG);
}

drawECG();

/* ------------------ コメント連動用テストブースト ------------------ */

// 本番ではここをYouTube API連動に差し替え

setInterval(() => {
    boost *= 0.9;
    superBoost *= 0.8;
}, 500);

// デモ：5秒ごとに軽ブースト
setInterval(() => {
    boost += 5;
    waveIntensity = 1.5;
    setTimeout(() => waveIntensity = 1, 500);
}, 5000);

// デモ：15秒ごとにスパチャ風
setInterval(() => {
    superBoost = 30;
    waveIntensity = 2;
    setTimeout(() => superBoost = 0, 1500);
}, 15000);
