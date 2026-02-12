const heart = document.getElementById("heart");
const bpmText = document.getElementById("bpm");
const canvas = document.getElementById("ecgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentBPM = CONFIG.baseBPM;
let beatInterval = 60000 / currentBPM;
let amplitude = 25;

function updateBPM(newBPM){
  currentBPM = Math.max(CONFIG.minBPM,
    Math.min(CONFIG.maxBPM,newBPM));

  bpmText.innerText = Math.round(currentBPM) + " BPM";
  beatInterval = 60000 / currentBPM;
  updateBPMStyle();
}

function updateBPMStyle(){
  if(currentBPM < 90){
    bpmText.style.filter = "brightness(1)";
  }else if(currentBPM < 120){
    bpmText.style.filter = "brightness(1.3)";
  }else{
    bpmText.style.filter = "brightness(1.6)";
  }
}

function heartbeat(){
  const interval = 60000/currentBPM;

  heart.style.transform = "scale(1.32)";
  bpmText.style.transform = "scale(1.1)";

  setTimeout(()=>{
    heart.style.transform = "scale(1.05)";
    bpmText.style.transform = "scale(1)";
  },120);

  setTimeout(()=>{
    heart.style.transform = "scale(1.18)";
    setTimeout(()=>{
      heart.style.transform="scale(1)";
    },100);
  },220);

  setTimeout(heartbeat,interval);
}

heartbeat();
drawECG();
drawMiniECG();
let offset = 0;

function drawECG(){
  requestAnimationFrame(drawECG);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#ff6ec7";
  ctx.lineWidth=3;
  ctx.beginPath();

  const centerY = canvas.height/2;

  for(let x=0;x<canvas.width;x++){
    let phase=(x+offset)%200;
    let y=centerY;

    if(phase>20 && phase<40)
      y-=Math.sin((phase-20)/20*Math.PI)*15;

    if(phase>=60 && phase<=65) y+=30;
    if(phase>65 && phase<70) y-=amplitude;
    if(phase>=70 && phase<=75) y+=40;

    if(phase>110 && phase<150)
      y-=Math.sin((phase-110)/40*Math.PI)*20;

    if(x===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  }

  ctx.stroke();
  offset+=currentBPM*0.3;
}
const miniCanvas = document.getElementById("miniECG");
const miniCtx = miniCanvas.getContext("2d");

miniCanvas.width = 280;
miniCanvas.height = 120;

let miniOffset=0;

function drawMiniECG(){
  requestAnimationFrame(drawMiniECG);

  miniCtx.clearRect(0,0,miniCanvas.width,miniCanvas.height);

  miniCtx.strokeStyle="#fff0fa";
  miniCtx.lineWidth=2;
  miniCtx.shadowBlur=12;
  miniCtx.shadowColor="#ff2f92";
  miniCtx.beginPath();

  const centerY = miniCanvas.height/2;

  for(let x=0;x<miniCanvas.width;x++){
    let phase=(x+miniOffset)%120;
    let y=centerY;

    if(phase>10 && phase<20)
      y-=Math.sin((phase-10)/10*Math.PI)*8;

    if(phase>=40 && phase<=42) y+=10;
    if(phase>42 && phase<45) y-=15;
    if(phase>=45 && phase<=48) y+=15;

    if(phase>70 && phase<90)
      y-=Math.sin((phase-70)/20*Math.PI)*6;

    if(x===0) miniCtx.moveTo(x,y);
    else miniCtx.lineTo(x,y);
  }

  miniCtx.stroke();
  miniOffset+=currentBPM*0.2;
}
