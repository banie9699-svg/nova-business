const rows = document.getElementById("leadRows");
const search = document.getElementById("leadSearch");
const filter = document.getElementById("leadFilter");
const modal = document.getElementById("leadModal");
const form = document.getElementById("leadForm");

const stages = ["New", "Contacted", "Qualified", "Converted"];

let leads = [
  { id: 1, name: "Arjun Mehta", company: "Mehta Retail", email: "arjun@example.com", phone: "9876543210", followup: "", stage: "New" },
  { id: 2, name: "Sneha Patel", company: "Patel Studio", email: "sneha@example.com", phone: "9876543211", followup: "", stage: "Contacted" },
  { id: 3, name: "Vikram Singh", company: "Singh Traders", email: "vikram@example.com", phone: "9876543212", followup: "", stage: "Qualified" },
  { id: 4, name: "Neha Gupta", company: "Gupta Foods", email: "neha@example.com", phone: "9876543213", followup: "", stage: "Converted" }
];

let nextId = 5;

function updateStats() {
  document.getElementById("totalLeads").textContent = leads.length;
  document.getElementById("qualifiedLeads").textContent =
    leads.filter(lead => lead.stage === "Qualified").length;
  document.getElementById("convertedLeads").textContent =
    leads.filter(lead => lead.stage === "Converted").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  document.getElementById("followupLeads").textContent =
    leads.filter(lead => {
      if (!lead.followup || lead.stage === "Converted") return false;
      const date = new Date(lead.followup + "T00:00:00");
      return date <= today;
    }).length;
}

function renderPipeline() {
  const pipeline = document.getElementById("pipeline");
  pipeline.replaceChildren();

  stages.forEach(stage => {
    const group = leads.filter(lead => lead.stage === stage);
    const column = document.createElement("div");
    column.className = "pipeline-column";

    const heading = document.createElement("div");
    heading.className = "pipeline-title";

    const title = document.createElement("strong");
    title.textContent = stage;

    const count = document.createElement("span");
    count.className = "pipeline-count";
    count.textContent = group.length;

    heading.append(title, count);
    column.append(heading);

    group.forEach(lead => {
      const card = document.createElement("div");
      card.className = "pipeline-card";

      const name = document.createElement("strong");
      name.textContent = lead.name;

      const company = document.createElement("small");
      company.textContent = lead.company || "No company added";

      card.append(name, company);
      column.append(card);
    });

    if (!group.length) {
      const empty = document.createElement("div");
      empty.className = "pipeline-card";
      const note = document.createElement("small");
      note.textContent = "No leads in this stage";
      empty.append(note);
      column.append(empty);
    }

    pipeline.append(column);
  });
}

function renderLeads() {
  const query = search.value.trim().toLowerCase();
  const selected = filter.value;

  const visible = leads.filter(lead => {
    const text = [lead.name, lead.company, lead.email, lead.phone]
      .join(" ").toLowerCase();

    return text.includes(query) && (selected === "all" || lead.stage === selected);
  });

  rows.replaceChildren();

  visible.forEach(lead => {
    const tr = document.createElement("tr");

    const personCell = document.createElement("td");
    const person = document.createElement("div");
    person.className = "lead-person";

    const avatar = document.createElement("span");
    avatar.className = "lead-avatar";
    avatar.textContent = lead.name.charAt(0).toUpperCase();

    const name = document.createElement("strong");
    name.textContent = lead.name;

    person.append(avatar, name);
    personCell.append(person);

    const company = document.createElement("td");
    company.textContent = lead.company || "—";

    const email = document.createElement("td");
    email.textContent = lead.email;

    const followup = document.createElement("td");
    followup.textContent = lead.followup || "Not set";

    const stageCell = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = "stage-pill stage-" + lead.stage;
    pill.textContent = lead.stage;
    stageCell.append(pill);

    const actions = document.createElement("td");
    const actionWrap = document.createElement("div");
    actionWrap.className = "row-actions";

    const change = document.createElement("button");
    change.type = "button";
    change.className = "action-btn";
    change.textContent = "Next stage";
    change.addEventListener("click", () => {
      const index = stages.indexOf(lead.stage);
      if (index < stages.length - 1) {
        lead.stage = stages[index + 1];
        renderAll();
      }
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "action-btn delete-btn";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      leads = leads.filter(item => item.id !== lead.id);
      renderAll();
    });

    actionWrap.append(change, remove);
    actions.append(actionWrap);

    tr.append(personCell, company, email, followup, stageCell, actions);
    rows.append(tr);
  });

  document.getElementById("emptyState").hidden = visible.length > 0;
  document.getElementById("resultCount").textContent =
    `Showing ${visible.length} of ${leads.length} leads`;

  updateStats();
}

function renderAll() {
  renderLeads();
  renderPipeline();
}

function openModal() {
  form.reset();
  document.getElementById("modalMessage").textContent = "";
  modal.hidden = false;
  document.getElementById("leadName").focus();
}

function closeModal() {
  modal.hidden = true;
}

document.getElementById("addLeadBtn").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

search.addEventListener("input", renderLeads);
filter.addEventListener("change", renderLeads);

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("leadName").value.trim();
  const company = document.getElementById("leadCompany").value.trim();
  const email = document.getElementById("leadEmail").value.trim();
  const phone = document.getElementById("leadPhone").value.trim();
  const followup = document.getElementById("leadFollowup").value;
  const stage = document.getElementById("leadStage").value;

  if (!name || !email) return;

  if (leads.some(lead => lead.email.toLowerCase() === email.toLowerCase())) {
    document.getElementById("modalMessage").textContent =
      "A lead with this email already exists in the demo list.";
    return;
  }

  leads.push({ id: nextId++, name, company, email, phone, followup, stage });
  closeModal();
  renderAll();
});

document.getElementById("year").textContent = new Date().getFullYear();

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

document.getElementById("menuBtn").addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

renderAll();
