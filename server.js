const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json"));

const app = express();
app.use(cors());
app.use(express.static("public"));

let liveChatId = null;
let pageToken = "";
let lastTime = Date.now();

async function getLiveChatId() {
    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${config.videoId}&key=${config.apiKey}`
        );
        const data = await res.json();
        liveChatId = data.items[0]?.liveStreamingDetails?.activeLiveChatId;
    } catch (e) {
        console.log("LiveChat取得失敗");
    }
}

async function getChat() {
    if (!liveChatId) return null;

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&pageToken=${pageToken}&key=${config.apiKey}`
        );
        const data = await res.json();

        pageToken = data.nextPageToken;

        const now = Date.now();
        const diff = (now - lastTime) / 1000;
        lastTime = now;

        let count = 0;
        let superChat = false;
        let memberBoost = 0;

        (data.items || []).forEach(msg => {
            count++;
            if (msg.snippet.superChatDetails) superChat = true;
            if (msg.authorDetails.isChatSponsor) memberBoost++;
        });

        let speed = count / diff;

        return {
            count,
            speed,
            superChat,
            memberBoost
        };

    } catch (e) {
        console.log("チャット取得失敗");
        return null;
    }
}

app.get("/data", async (req, res) => {
    const chat = await getChat();
    res.json(chat || {});
});

app.listen(config.port, async () => {
    await getLiveChatId();
    console.log(`起動：http://localhost:${config.port}`);
});
