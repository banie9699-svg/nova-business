document.querySelectorAll(".year").forEach(element => {
  element.textContent = new Date().getFullYear();
});

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (password && togglePassword) {
  togglePassword.addEventListener("click", () => {
    const visible = password.type === "password";
    password.type = visible ? "text" : "password";
    togglePassword.textContent = visible ? "Hide" : "Show";
    togglePassword.setAttribute(
      "aria-label",
      visible ? "Hide password" : "Show password"
    );
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const message = document.getElementById("formMessage");
    message.textContent =
      "Login is a frontend preview. Secure authentication will be connected later.";
  });
}
