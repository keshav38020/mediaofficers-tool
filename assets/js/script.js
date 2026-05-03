const menuToggle = document.querySelector("#menuToggle");
const siteMenu = document.querySelector("#siteMenu");
const auditForm = document.querySelector("#auditForm");
const auditUrl = document.querySelector("#auditUrl");
const auditError = document.querySelector("#auditError");
const auditResults = document.querySelector("#auditResults");
const loadingState = document.querySelector("#loadingState");
const resultsContent = document.querySelector("#resultsContent");
const leadForm = document.querySelector("#leadForm");
const formMessage = document.querySelector("#formMessage");

const recommendations = {
  performance: [
    "Compress oversized images and serve next-gen formats above the fold.",
    "Reduce unused scripts on landing pages to improve interaction speed.",
    "Enable caching for static assets and review third-party tracking load.",
  ],
  content: [
    "Expand thin service pages with proof, FAQs, pricing context, and internal links.",
    "Add intent-matched headings around core buyer questions.",
    "Refresh meta titles so each page has a clearer commercial promise.",
  ],
  technical: [
    "Add organization, local business, and service schema where relevant.",
    "Fix redirect chains and keep canonical tags consistent.",
    "Submit a clean XML sitemap and remove low-value indexed URLs.",
  ],
  conversion: [
    "Move primary calls-to-action higher on high-intent pages.",
    "Add trust signals near lead forms, including reviews and result snapshots.",
    "Create dedicated landing pages for paid traffic and priority locations.",
  ],
};

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function scoreFromDomain(domain, offset = 0) {
  const seed = [...domain].reduce((total, char) => total + char.charCodeAt(0), 0) + offset;
  return 58 + (seed % 39);
}

function getScoreLabel(score) {
  if (score >= 88) return "Excellent";
  if (score >= 74) return "Strong";
  if (score >= 62) return "Needs Focus";
  return "Needs Work";
}

function buildRecommendations(scores) {
  const groups = [
    ["performance", scores.performance],
    ["content", scores.content],
    ["technical", scores.technical],
    ["conversion", scores.conversion],
  ].sort((a, b) => a[1] - b[1]);

  return groups.flatMap(([key]) => recommendations[key].slice(0, 2)).slice(0, 5);
}

function setText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function renderAudit(url) {
  const domain = url.hostname.replace(/^www\./, "");
  const scores = {
    performance: scoreFromDomain(domain, 7),
    content: scoreFromDomain(domain, 19),
    technical: scoreFromDomain(domain, 31),
    conversion: scoreFromDomain(domain, 43),
  };
  const overall = Math.round(
    scores.performance * 0.28 + scores.content * 0.28 + scores.technical * 0.26 + scores.conversion * 0.18
  );

  setText("#resultDomain", domain);
  setText("#scoreValue", overall);
  setText("#performanceScore", `${scores.performance}/100`);
  setText("#contentScore", `${scores.content}/100`);
  setText("#technicalScore", `${scores.technical}/100`);
  setText("#conversionScore", `${scores.conversion}/100`);

  const list = document.querySelector("#recommendations");
  list.innerHTML = "";

  const summary = document.createElement("li");
  summary.className = "flex gap-3";
  summary.innerHTML = `<span class="fix-dot"></span><span><strong>${getScoreLabel(
    overall
  )} audit:</strong> prioritize the items below before scaling traffic.</span>`;
  list.appendChild(summary);

  buildRecommendations(scores).forEach((item) => {
    const li = document.createElement("li");
    li.className = "flex gap-3";
    li.innerHTML = `<span class="fix-dot"></span><span>${item}</span>`;
    list.appendChild(li);
  });

  auditResults.classList.add("is-complete");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = siteMenu.classList.toggle("is-open");
  siteMenu.classList.toggle("hidden", !isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a") && siteMenu.classList.contains("is-open")) {
    siteMenu.classList.remove("is-open");
    siteMenu.classList.add("hidden");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

auditForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const url = normalizeUrl(auditUrl.value);

  if (!url) {
    auditError.textContent = "Enter a valid website URL to run the audit.";
    auditError.classList.remove("hidden");
    return;
  }

  auditError.classList.add("hidden");
  loadingState.classList.remove("hidden");
  resultsContent.classList.add("opacity-30", "pointer-events-none");

  window.setTimeout(() => {
    renderAudit(url);
    loadingState.classList.add("hidden");
    resultsContent.classList.remove("opacity-30", "pointer-events-none");
  }, 850);
});

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const name = formData.get("name") || "there";
  formMessage.textContent = `Thanks, ${name}. Your request is ready for the MediaOfficers team to review.`;
  formMessage.classList.remove("hidden");
  leadForm.reset();
});

document.querySelector("#year").textContent = new Date().getFullYear();
initIcons();
