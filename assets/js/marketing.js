const $ = id => document.getElementById(id);
let currentTool = "post";
let lastContent = "";
let toastTimer;

const toolInfo = {
  post: ["Social Media Post Generator","Create content for your next social media post."],
  caption: ["Caption Generator","Write an engaging caption for your product or service."],
  hashtags: ["Hashtag Generator","Create relevant hashtags for your topic."],
  ideas: ["Content Ideas Generator","Explore content ideas for your business."],
  email: ["Marketing Email Generator","Draft a promotional email for your audience."],
  campaign: ["Campaign Content Assistant","Create a campaign introduction and plan."]
};

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"),2500);
}

function selectTool(tool) {
  currentTool = tool;
  document.querySelectorAll(".tool-card").forEach(card => {
    card.classList.toggle("selected",card.dataset.tool === tool);
  });
  $("creatorTitle").textContent = toolInfo[tool][0];
  $("creatorDescription").textContent = toolInfo[tool][1];
  $("placeholder").hidden = false;
  $("result").hidden = true;
}

document.querySelectorAll(".tool-card").forEach(card => {
  card.addEventListener("click",() => selectTool(card.dataset.tool));
});

$("startCreating").addEventListener("click",() => {
  $("creator").scrollIntoView({behavior:"smooth"});
});

function makeSample(data) {
  const brand = data.brand;
  const topic = data.topic;
  const platform = data.platform;
  const tone = data.tone;
  const audience = data.audience || "our customers";

  if (currentTool === "hashtags") {
    const words = topic.toLowerCase().match(/[a-z0-9]+/g) || [];
    const tags = [...new Set(["NovaBusiness",brand.replace(/\s+/g,""),...words.slice(0,5),"SmallBusiness","BusinessGrowth","ExploreMore"])];
    return `Suggested hashtags for ${topic}:\n\n${tags.map(tag => "#"+tag).join("  ")}`;
  }

  if (currentTool === "ideas") {
    return `Content ideas for ${brand}\n\n1. Introduce ${topic} and explain what makes it useful.\n\n2. Share a behind-the-scenes look at how your business works.\n\n3. Answer three common customer questions about ${topic}.\n\n4. Share a customer success story (with permission).\n\n5. Create a helpful tips post for ${audience}.\n\n6. Introduce a special offer with clear terms.\n\n7. Share a product or service feature spotlight.`;
  }

  if (currentTool === "email") {
    return `Subject: Discover something new from ${brand}\n\nHello!\n\nWe are excited to share ${topic} with you.\n\nAt ${brand}, we aim to bring useful solutions and a better experience to our customers. Explore what we have to offer and see how it can help you.\n\nThank you for being part of our journey.\n\nBest regards,\n${brand}`;
  }

  if (currentTool === "campaign") {
    return `Campaign: ${topic}\nBrand: ${brand}\nPlatform: ${platform}\nTone: ${tone}\n\nCampaign outline:\n\n1. Awareness: Introduce the product or service.\n2. Engagement: Share useful information and invite questions.\n3. Promotion: Communicate the offer and its terms clearly.\n4. Follow-up: Respond to customer enquiries.\n\nTarget audience: ${audience}\n\nNote: This is a sample plan. Set dates and review all campaign details before publishing.`;
  }

  if (currentTool === "caption") {
    return `${topic} deserves your attention!\n\nDiscover what ${brand} has to offer. Made with our customers in mind, we're here to make your experience better.\n\nExplore more and tell us what you think!\n\n#${brand.replace(/\s+/g,"")} #DiscoverMore #SmallBusiness`;
  }

  return `${brand} presents: ${topic}!\n\nLooking for something useful for your everyday needs? Discover what we have to offer.\n\n✨ Thoughtfully presented\n✨ Made with our customers in mind\n✨ Here to make your experience better\n\nLearn more and get in touch with us today!\n\n#${brand.replace(/\s+/g,"")} #Business #ExploreMore`;
}

function generateContent() {
  const data = {
    brand: $("businessName").value.trim(),
    topic: $("topic").value.trim(),
    platform: $("platform").value,
    tone: $("tone").value,
    audience: $("audience").value.trim()
  };
  if (!data.brand || !data.topic) {
    toast("Please enter your brand name and topic.");
    return;
  }

  lastContent = makeSample(data);
  $("resultText").textContent = lastContent;
  $("placeholder").hidden = true;
  $("result").hidden = false;
}

$("marketingForm").addEventListener("submit",event => {
  event.preventDefault();
  generateContent();
});

$("regenerateBtn").addEventListener("click",generateContent);

$("copyBtn").addEventListener("click",async() => {
  if (!lastContent) return;
  try {
    await navigator.clipboard.writeText(lastContent);
    toast("Content copied to clipboard.");
  } catch {
    const area = document.createElement("textarea");
    area.value = lastContent;
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    toast(copied ? "Content copied." : "Copy was not available in this browser.");
  }
});

function openCampaignModal() {
  $("campaignModal").classList.add("show");
  $("campaignDate").value = new Date().toISOString().slice(0,10);
}
function closeCampaignModal() {
  $("campaignModal").classList.remove("show");
}
$("addCampaign").addEventListener("click",openCampaignModal);
$("closeCampaign").addEventListener("click",closeCampaignModal);
$("cancelCampaign").addEventListener("click",closeCampaignModal);
$("campaignModal").addEventListener("click",event => {
  if(event.target === $("campaignModal")) closeCampaignModal();
});

$("campaignForm").addEventListener("submit",event => {
  event.preventDefault();
  const name = $("campaignName").value.trim();
  const platform = $("campaignPlatform").value;
  const date = $("campaignDate").value;
  const goal = $("campaignGoal").value.trim();
  if (!name || !date || !goal) return;

  const item = document.createElement("div");
  item.className = "campaign-item";

  const info = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = name;
  const description = document.createElement("p");
  description.textContent = `${platform} · ${goal}`;
  info.append(title,description);

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.alignItems = "center";
  right.style.gap = "10px";

  const dateText = document.createElement("span");
  dateText.className = "campaign-date";
  dateText.textContent = new Date(date+"T00:00:00").toLocaleDateString("en-IN");

  const remove = document.createElement("button");
  remove.className = "delete-campaign";
  remove.textContent = "Delete";
  remove.addEventListener("click",() => {
    item.remove();
    $("campaignEmpty").hidden = $("campaignList").children.length > 0;
    toast("Campaign removed.");
  });

  right.append(dateText,remove);
  item.append(info,right);
  $("campaignList").appendChild(item);
  $("campaignEmpty").hidden = true;
  closeCampaignModal();
  $("campaignForm").reset();
  toast("Campaign created successfully.");
});

$("menuBtn").addEventListener("click",() => {
  $("sidebar").classList.toggle("open");
  $("overlay").classList.toggle("show");
});
$("overlay").addEventListener("click",() => {
  $("sidebar").classList.remove("open");
  $("overlay").classList.remove("show");
});
