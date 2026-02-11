const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "ここにAPIキー";
const VIDEO_ID = "ここに配信動画ID";

let liveChatId = null;
let lastPageToken = "";
let lastCount = 0;
let lastTime = Date.now();

async function getLiveChatId() {
    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${VIDEO_ID}&key=${API_KEY}`
    );
    const data = await res.json();
    liveChatId = data.items[0].liveStreamingDetails.activeLiveChatId;
}

async function getChat() {
    if (!liveChatId) return null;

    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&pageToken=${lastPageToken}&key=${API_KEY}`
    );

    const data = await res.json();
    lastPageToken = data.nextPageToken;

    let now = Date.now();
    let comments = data.items || [];
    let count = comments.length;

    let superChat = false;
    let memberBoost = 0;

    comments.forEach(msg => {
        if (msg.snippet.superChatDetails) superChat = true;
        if (msg.authorDetails.isChatSponsor) memberBoost += 2;
    });

    let timeDiff = (now - lastTime) / 1000;
    let speed = count / timeDiff;

    lastTime = now;
    lastCount = count;

    return {
        count,
        speed,
        superChat,
        memberBoost
    };
}

app.get("/data", async (req, res) => {
    try {
        const chat = await getChat();
        res.json(chat || {});
    } catch {
        res.json({});
    }
});

app.listen(3000, async () => {
    await getLiveChatId();
    console.log("Server running http://localhost:3000");
});
