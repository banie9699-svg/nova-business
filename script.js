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

emailjs.init({
  publicKey: "jBURB2O5ct9eytQ5c"
});

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const service = document.getElementById("service").value;
  const budget = document.getElementById("budget").value;
  const message = document.getElementById("message").value.trim();
  const status = document.getElementById("formStatus");
  const submitButton = contactForm.querySelector('button[type="submit"]');

  if (!name || !email || !service || !budget || !message) {
    status.textContent = "Please complete all fields.";
    return;
  }

  status.textContent = "Sending your message...";
  submitButton.disabled = true;

  try {
    await emailjs.send(
      "nova_business_gmail",
      "template_lktl821",
      {
        name,
        email,
        title: "New Project Enquiry - Nova Business",
        service,
        budget,
        message
      }
    );

    status.textContent = "Thank you! Your message has been sent successfully.";
    contactForm.reset();

  } catch (error) {
    console.error("EmailJS Error:", error);
    status.textContent = "Message could not be sent. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});
