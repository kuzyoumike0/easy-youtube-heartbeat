const heart = document.getElementById("heartImg")
const bpmText = document.getElementById("bpm")
const flash = document.getElementById("flash")
const canvas = document.getElementById("ecg")
const ctx = canvas.getContext("2d")

let bpm = 72
let commentSpeed = 0
let superMode = false

canvas.width = window.innerWidth
canvas.height = 200

// 心電図描画
let x = 0
function drawECG(){
  ctx.clearRect(0,0,canvas.width,canvas.height)
  ctx.strokeStyle = "#ff66cc"
  ctx.lineWidth = 2
  ctx.beginPath()

  for(let i=0;i<canvas.width;i++){
    let y = 100 + Math.sin((i+x)/20)*10
    if(Math.random()<0.01){
      y -= 40
    }
    ctx.lineTo(i,y)
  }
  ctx.stroke()
  x += 5
  requestAnimationFrame(drawECG)
}
drawECG()

// 鼓動アニメ
function beat(){
  heart.style.transform = "scale(1.2)"
  setTimeout(()=> heart.style.transform="scale(1)",100)
}
setInterval(beat, () => 60000/bpm)

function updateBPM(newBPM){
  bpm = Math.min(140, Math.max(60,newBPM))
  bpmText.innerText = bpm
}

// フラッシュ
function triggerFlash(){
  flash.style.opacity = 0.4
  setTimeout(()=>flash.style.opacity=0,200)
}

// ===== YouTube API =====

let pageToken = ""

async function fetchComments(){
  const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${LIVE_CHAT_ID}&part=snippet,authorDetails&key=${API_KEY}&pageToken=${pageToken}`

  const res = await fetch(url)
  const data = await res.json()

  pageToken = data.nextPageToken

  if(data.items){
    data.items.forEach(item=>{
      const isSuper = item.snippet.superChatDetails
      commentSpeed++

      if(isSuper){
        updateBPM(130)
        triggerFlash()
      } else {
        updateBPM(72 + commentSpeed*2)
      }
    })
  }

  commentSpeed = 0
}

setInterval(fetchComments, 3000)
