// ===============================
// Heartbeat Overlay - Full Version
// ===============================

const canvas = document.getElementById("ecg");
const ctx = canvas.getContext("2d");
const bpmDisplay = document.getElementById("bpmDisplay");

let currentBPM = CONFIG.baseBPM;
let targetBPM = CONFIG.baseBPM;
let superChatActive = false;

let chatId = null;
let nextPageToken = null;

let commentTimestamps = []; // 直近コメント時間保存
let lastFetchTime = Date.now();


// ===============================
// Canvas Resize
// ===============================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);


// ===============================
// ECG DRAW
// ===============================
function drawECG(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerY = canvas.height / 2;
  const amplitude = (currentBPM - 60) * 1.5;

  ctx.beginPath();
  ctx.lineWidth = 2;

  const intensity = Math.min((currentBPM - CONFIG.baseBPM) / 40, 1);
  ctx.strokeStyle = `rgba(${255}, ${120 - intensity*40}, ${160 + intensity*40}, ${0.7 + intensity*0.3})`;
  ctx.shadowBlur = 10 + intensity * 20;
  ctx.shadowColor = "rgba(255,120,160,0.8)";

  for (let x = 0; x < canvas.width; x++) {
    const speed = currentBPM / 60;
    let t = time / 500 * speed + x * 0.02;

    // 基本波
    let y = Math.sin(t) * amplitude * 0.3;

    // ピーク生成
    let beatPhase = (t % (Math.PI * 2));
    if (beatPhase < 0.2) {
      y -= amplitude * 1.8 * (1 - beatPhase * 5);
    }

    y += centerY;

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}


// ===============================
// BPM Smooth Update
// ===============================
function updateBPM() {
  currentBPM += (targetBPM - currentBPM) * 0.05;
  bpmDisplay.innerHTML = `${Math.round(currentBPM)} BPM ♥`;
}


// ===============================
// Animation Loop
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
    console.error("ライブ情報が取得できません");
    return null;
  }

  return data.items[0].liveStreamingDetails.activeLiveChatId;
}


// ===============================
// Fetch Comments
// ===============================
async function fetchComments() {
  if (!chatId) return;

  let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${chatId}&part=snippet&key=${CONFIG.apiKey}`;
  if (nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) return;

  nextPageToken = data.nextPageToken;

  const now = Date.now();
  let newComments = 0;

  data.items.forEach(item => {
    const published = new Date(item.snippet.publishedAt).getTime();
    commentTimestamps.push(published);
    newComments++;

    // スパチャ検知
    if (item.snippet.superChatDetails) {
      triggerSuperChat();
    }
  });

  // 30秒以内のコメントのみ残す
  commentTimestamps = commentTimestamps.filter(t => now - t < 30000);

  calculateBPM(newComments);
}


// ===============================
// BPM計算ロジック
// ===============================
function calculateBPM(newComments) {

  if (superChatActive) return;

  const commentCount = commentTimestamps.length;

  const baseBoost = Math.log(commentCount + 1) * 6;
  const speedBoost = newComments * 2;

  targetBPM = CONFIG.baseBPM + baseBoost + speedBoost;

  if (targetBPM > CONFIG.maxBPM) {
    targetBPM = CONFIG.maxBPM;
  }
}


// ===============================
// SuperChat処理
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
