let lastCount = 0;

function startChat() {
  const url = document.getElementById("chatUrl").value;
  if (!url) return alert("URLを入力");

  document.getElementById("setup").style.display = "none";

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  setInterval(() => {
    try {
      const chatDoc = iframe.contentDocument;
      const messages =
        chatDoc.querySelectorAll("#message");

      const current = messages.length;
      const speed = current - lastCount;
      lastCount = current;

      window.updateHeartBySpeed(speed);

      // スパチャ検知（簡易）
      const superChat =
        chatDoc.querySelector("yt-live-chat-paid-message-renderer");

      if (superChat) {
        window.triggerSuperChat();
      }

    } catch(e){}
  }, 1000);
}
