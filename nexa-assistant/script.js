const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const historyBox = document.getElementById("history");
let chatStarted = false;

function addMessage(text, type) {
  const item = document.createElement("div");
  item.className = "message " + type;
  item.textContent = text;
  messages.appendChild(item);
  return item;
}

function demoReply(text) {
  const lower = text.toLowerCase();

  if (lower.includes("business") || lower.includes("idea")) {
    return "Let's explore your idea!\\n\\n1. Identify a real customer problem.\\n2. Define who needs the solution.\\n3. Build a small prototype.\\n4. Test it with potential users.\\n\\nThis is a simulated Nexa response. Connect an AI API to enable real AI conversations.";
  }
  if (lower.includes("email") || lower.includes("write")) {
    return "I'd be happy to help you write. Start by sharing the purpose, audience and tone you want.\\n\\nDemo note: Nexa is currently running simulated responses, not a live AI model.";
  }
  if (lower.includes("website") || lower.includes("project")) {
    return "A good project starts with a clear plan:\\n\\n• Define the goal\\n• List the core features\\n• Sketch the user interface\\n• Build and test each section\\n\\nThis is a sample response from Nexa's demo mode.";
  }
  return "Thanks for your message! I'm Nexa, a portfolio demonstration of an AI assistant interface. My replies are simulated right now. A real AI model/API can be connected in a future version.";
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  welcome.style.display = "none";
  addMessage(text, "user");
  input.value = "";
  input.style.height = "auto";

  if (!chatStarted) {
    chatStarted = true;
    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = text.length > 24 ? text.slice(0, 24) + "..." : text;
    historyBox.prepend(item);
  }

  setTimeout(() => {
    addMessage(demoReply(text), "bot");
    document.getElementById("chatArea").scrollTop = document.getElementById("chatArea").scrollHeight;
  }, 500);
}

function handleKey(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function usePrompt(text) {
  input.value = text;
  sendMessage();
}

function newChat() {
  messages.innerHTML = "";
  welcome.style.display = "block";
  chatStarted = false;
  input.value = "";
  input.focus();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function showNotice() {
  const toast = document.getElementById("toast");
  toast.textContent = "Sharing will be available in a future version.";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
