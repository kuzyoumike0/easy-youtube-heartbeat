let lastCount = 0;

function startChat() {
  const url = document.getElementById("chatUrl").value;

  if (!url) return alert("URLを入力してください");

  document.getElementById("setup").style.display = "none";

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  setInterval(() => {
    try {
      const chatDoc = iframe.contentDocument;
      const messages = chatDoc.querySelectorAll("#message");

      const currentCount = messages.length;
      const speed = currentCount - lastCount;

      lastCount = currentCount;

      window.updatePulseBySpeed(speed);

    } catch (e) {
      console.log("チャット取得待機中...");
    }
  }, 1000);
}
