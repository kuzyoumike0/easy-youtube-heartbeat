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

      const currentCount = messages.length;
      const speed = currentCount - lastCount;

      lastCount = currentCount;

      window.updateHeartBySpeed(speed);

    } catch (e) {}
  }, 1000);
}
