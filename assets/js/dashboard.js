const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuBtn = document.getElementById("menuBtn");
const toast = document.getElementById("toast");

document.getElementById("year").textContent = new Date().getFullYear();

function closeMenu() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", closeMenu);

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    closeMenu();
  });
});

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.getElementById("quickAction").addEventListener("click", () => {
  showToast("Business tools will be connected in the next development step.");
});

document.querySelectorAll(".tool-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    showToast("This tool's dedicated page is coming next.");
  });
});
