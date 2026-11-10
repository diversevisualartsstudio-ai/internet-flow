const form = document.querySelector("#check-form");
const button = document.querySelector("#check-button");
const result = document.querySelector("#result");
document.querySelector("#year").textContent = new Date().getFullYear();

form.addEventListener("submit", async event => {
  event.preventDefault();
  const host = document.querySelector("#host").value.trim();
  const port = Number(document.querySelector("#port").value);
  const timeoutMs = Number(document.querySelector("#timeout").value);
  button.disabled = true;
  button.textContent = "Checking connection…";
  result.className = "result pending";
  result.innerHTML = '<span class="result-dot"></span><span>Resolving host and testing TCP connection…</span>';
  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, port, timeoutMs })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Check failed");
    result.className = "result " + (data.reachable ? "online" : "offline");
    result.innerHTML = "";
    const dot = document.createElement("span");
    dot.className = "result-dot";
    const message = document.createElement("span");
    message.textContent = data.reachable
      ? `${data.host}:${data.port} is ONLINE · ${data.latencyMs} ms connection time`
      : `${data.host}:${data.port} is OFFLINE · ${data.error || "Connection unavailable"}`;
    result.append(dot, message);
  } catch (error) {
    result.className = "result offline";
    result.textContent = error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = 'Run connectivity check <span>→</span>';
  }
});
