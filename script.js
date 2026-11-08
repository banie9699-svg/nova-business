const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("open");
  menuBtn.textContent = nav.classList.contains("open") ? "✕" : "☰";
});

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuBtn.textContent = "☰";
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const status = document.getElementById("formStatus");

  if (!name || !email || !message) {
    status.textContent = "Please complete all fields.";
    return;
  }

  const recipient = "rrhacker0897@gmail.com";

  const subject = encodeURIComponent(
    "New Project Enquiry - Nova Business"
  );

  const body = encodeURIComponent(
    `Hello Nova Business,

New client enquiry received.

Client Name: ${name}
Client Email: ${email}

Project Details:
${message}

Regards,
${name}`
  );

  status.textContent = "Opening your email application...";

  window.location.href =
    `mailto:${recipient}?subject=${subject}&body=${body}`;
});
