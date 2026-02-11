// ===============================
// Heartbeat Overlay - Ultimate Version
// ===============================

const canvas = document.getElementById("ecg");
const ctx = canvas.getContext("2d");
const bpmDisplay = document.getElementById("bpmDisplay");

let currentBPM = CONFIG.baseBPM;
let targetBPM = CONFIG.baseBPM;
let superChatActive = false;

let chatId = null;
let nextPageToken = null;

let commentTimestamps = [];

let memberGlow = 0;
let vibrationOffset = 0;
let beatPulse = 0;


// ===============================
// Resize
// ===============================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);


// ===============================
// ECG Wave (PQRST)
// ===============================
function ecgWave(phase, amplitude) {

  let y = 0;

  // P波
  if (phase > 0.1 && phase < 0.2) {
    y += Math.sin((phase - 0.1) * Math.PI * 10) * amplitude * 0.2;
  }

  // Q波
  if (phase > 0.25 && phase < 0.28) {
    y -= amplitude * 0.4;
  }

  // R波
  if (phase > 0.28 && phase < 0.32) {
    y += amplitude * 1.8;
  }

  // S波
  if (phase > 0.32 && phase < 0.36) {
    y -= amplitude * 0.6;
  }

  // T波
  if (phase > 0.45 && phase < 0.6) {
    y += Math.sin((phase - 0.45) * Math.PI * 5) * amplitude * 0.4;
  }

  return y;
}


// ===============================
// Draw ECG
// ===============================
function drawECG(time) {

  // 残像フェード
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "lighter";

  const centerY = canvas.height / 2 + vibrationOffset;
  const amplitude = (currentBPM - 60) * 1.5;

  const intensity = Math.min((currentBPM - CONFIG.baseBPM) / 40, 1);

  ctx.beginPath();
  ctx.lineWidth = 2;

  const glowBoost = memberGlow * 40;

  ctx.strokeStyle = memberGlow > 0.2
    ? `rgba(255,220,120,${0.8})`
    : `rgba(255,${120 - intensity*40},${160 + intensity*40},${0.7 + intensity*0.3})`;

  ctx.shadowBlur = 15 + intensity * 20 + glowBoost;
  ctx.shadowColor = memberGlow > 0.2
    ? "rgba(255,220,120,0.9)"
    : "rgba(255,120,160,0.8)";

  for (let x = 0; x < canvas.width; x++) {

    const speed = currentBPM / 60;
    let t = (time / 1000) * speed + x * 0.002;
    let phase = (t % 1);

    let y = ecgWave(phase, amplitude);
    y += centerY;

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();

  ctx.globalCompositeOperation = "source-over";
}


// ===============================
// BPM Update
// ===============================
function updateBPM() {

  currentBPM += (targetBPM - currentBPM) * 0.05;

  // 微振動
  vibrationOffset = Math.sin(Date.now() * 0.02) *
    (currentBPM - CONFIG.baseBPM) * 0.03;

  // メンバー発光減衰
  memberGlow *= 0.92;

  // 鼓動拡縮
  if (currentBPM > CONFIG.baseBPM + 5) {
    beatPulse = 1;
  }

  beatPulse *= 0.85;

  const scale = 1 + beatPulse * 0.2;
  bpmDisplay.style.transform = `scale(${scale})`;

  bpmDisplay.innerHTML = `${Math.round(currentBPM)} BPM ♥`;
}


// ===============================
// Animation
// ===============================
function animate(time) {
  updateBPM();
  drawECG(time);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);


// ===============================
// YouTube API
// ===============================
async function getLiveChatId() {

  const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${CONFIG.videoId}&key=${CONFIG.apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    console.error("ライブ情報取得失敗");
    return null;
  }

  return data.items[0].liveStreamingDetails.activeLiveChatId;
}


// ===============================
// Fetch Comments
// ===============================
async function fetchComments() {

  if (!chatId) return;

  let url =
    `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${chatId}&part=snippet,authorDetails&key=${CONFIG.apiKey}`;

  if (nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) return;

  nextPageToken = data.nextPageToken;

  const now = Date.now();
  let newComments = 0;
  let memberDetected = false;

  data.items.forEach(item => {

    const published =
      new Date(item.snippet.publishedAt).getTime();

    commentTimestamps.push(published);
    newComments++;

    if (item.authorDetails?.isChatSponsor) {
      memberDetected = true;
    }

    if (item.snippet.superChatDetails) {
      triggerSuperChat();
    }
  });

  // 30秒以内のみ保持
  commentTimestamps =
    commentTimestamps.filter(t => now - t < 30000);

  if (memberDetected) {
    memberGlow = 1;
  }

  calculateBPM(newComments);
}


// ===============================
// BPM Calculation
// ===============================
function calculateBPM(newComments) {

  if (superChatActive) return;

  const commentCount = commentTimestamps.length;

  const baseBoost =
    Math.log(commentCount + 1) * 6;

  const speedBoost =
    newComments * 1.5;

  let rawBPM =
    CONFIG.baseBPM + baseBoost + speedBoost;

  // ソフトリミッター
  const compressionStart = 110;

  if (rawBPM > compressionStart) {
    const excess = rawBPM - compressionStart;
    rawBPM =
      compressionStart + excess * 0.4;
  }

  targetBPM =
    Math.min(rawBPM, CONFIG.maxBPM);
}


// ===============================
// SuperChat
// ===============================
function triggerSuperChat() {

  superChatActive = true;
  targetBPM = 130;

  setTimeout(() => {
    superChatActive = false;
  }, 2000);
}


// ===============================
// Start
// ===============================
async function start() {

  chatId = await getLiveChatId();

  if (!chatId) return;

  console.log("LiveChat ID:", chatId);

  setInterval(fetchComments, 3000);
}

start();
