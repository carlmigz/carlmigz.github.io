import { projects } from "./data/projects.js?v=6";
import { contacts, siteConfig } from "./data/contacts.js?v=6";
import { services } from "./data/services.js?v=6";
import { skills } from "./data/skills.js?v=6";
import { timeline } from "./data/timeline.js?v=6";
import { testimonials } from "./data/testimonials.js?v=6";

import { projectCard } from "./components/project-card.js?v=6";
import { storeButton } from "./components/store-button.js?v=6";
import { contactLink } from "./components/contact-link.js?v=6";
import { serviceCard } from "./components/service-card.js?v=6";
import { skillCard } from "./components/skill-card.js?v=6";
import { timelineItem } from "./components/timeline-item.js?v=6";
import { testimonialCard } from "./components/testimonial-card.js?v=6";
import { repoCard } from "./components/repo-card.js?v=6";
import { phonePreview } from "./components/phone-preview.js?v=6";
import { qrSvg } from "./components/qr.js?v=6";

const emailContact = contacts.find(contact => contact.url?.startsWith("mailto:"));
const emailAddress =
  siteConfig?.email ||
  emailContact?.url.replace(/^mailto:/i, "") ||
  document.getElementById("copy-email-address")?.textContent?.trim() ||
  "";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ---------- Render data-driven sections ---------- */

const servicesGrid = document.getElementById("services-grid");
if (servicesGrid) {
  servicesGrid.innerHTML = services.map(serviceCard).join("");
}

const skillsGrid = document.getElementById("skills-grid");
if (skillsGrid) {
  skillsGrid.innerHTML = skills.map(skillCard).join("");
}

const timelineList = document.getElementById("timeline-list");
if (timelineList) {
  timelineList.innerHTML = timeline.map(timelineItem).join("");
}

const projectCount = document.getElementById("project-count");
if (projectCount) {
  projectCount.textContent = String(projects.length);
}

const contactLinks = document.getElementById("contact-links");
if (contactLinks) {
  contactLinks.innerHTML = contacts.map(contactLink).join("");
}

const testimonialsSection = document.getElementById("testimonials");
const testimonialsGrid = document.getElementById("testimonials-grid");
if (testimonialsSection && testimonialsGrid && testimonials.length > 0) {
  testimonialsGrid.innerHTML = testimonials.map(testimonialCard).join("");
  testimonialsSection.hidden = false;
}

const footerYear = document.getElementById("footer-year");
if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

/* ---------- Projects + Category Filters ---------- */

const projectsGrid = document.getElementById("projects-grid");
const projectFilters = document.getElementById("project-filters");
let activeCategory = "All";

const categories = ["All", ...new Set(projects.map(p => p.category).filter(Boolean))];

function renderProjectFilters() {
  if (!projectFilters) return;

  projectFilters.innerHTML = categories
    .map(cat => {
      const count =
        cat === "All"
          ? projects.length
          : projects.filter(p => p.category === cat).length;
      const pressed = cat === activeCategory;
      return `
        <button
          type="button"
          class="filter-pill"
          data-category="${cat}"
          aria-pressed="${pressed}"
        >
          ${cat} (${count})
        </button>
      `;
    })
    .join("");
}

function renderProjects() {
  if (!projectsGrid) return;

  const list =
    activeCategory === "All"
      ? projects
      : projects.filter(p => p.category === activeCategory);

  projectsGrid.innerHTML = list.map(projectCard).join("");
}

renderProjectFilters();
renderProjects();

projectFilters?.addEventListener("click", event => {
  const btn = event.target.closest("[data-category]");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  renderProjectFilters();
  renderProjects();
});

/* ---------- Hero Interactive Phone Showcase ---------- */

const phoneScreen = document.getElementById("hero-phone-screen");
const phoneDots = document.getElementById("phone-dots");
const heroPhone = document.getElementById("hero-phone");
let activePhoneIndex = 0;
let phoneTimer = null;

function renderPhoneShowcase(index) {
  if (!phoneScreen || projects.length === 0) return;

  activePhoneIndex = (index + projects.length) % projects.length;
  phoneScreen.innerHTML = phonePreview(projects[activePhoneIndex]);

  if (phoneDots) {
    phoneDots.innerHTML = projects
      .map(
        (proj, i) => `
          <button
            type="button"
            class="phone-dot"
            role="tab"
            aria-label="Preview ${proj.title}"
            aria-selected="${i === activePhoneIndex}"
            data-phone-index="${i}"
          ></button>
        `
      )
      .join("");
  }
}

function startPhoneAutoplay() {
  if (prefersReducedMotion || projects.length <= 1) return;
  clearInterval(phoneTimer);
  phoneTimer = setInterval(() => renderPhoneShowcase(activePhoneIndex + 1), 4500);
}

function stopPhoneAutoplay() {
  clearInterval(phoneTimer);
  phoneTimer = null;
}

renderPhoneShowcase(0);
startPhoneAutoplay();

document.getElementById("phone-prev")?.addEventListener("click", () => {
  renderPhoneShowcase(activePhoneIndex - 1);
  startPhoneAutoplay();
});

document.getElementById("phone-next")?.addEventListener("click", () => {
  renderPhoneShowcase(activePhoneIndex + 1);
  startPhoneAutoplay();
});

phoneDots?.addEventListener("click", event => {
  const dot = event.target.closest("[data-phone-index]");
  if (!dot) return;
  renderPhoneShowcase(Number(dot.dataset.phoneIndex));
  startPhoneAutoplay();
});

heroPhone?.addEventListener("mouseenter", stopPhoneAutoplay);
heroPhone?.addEventListener("mouseleave", startPhoneAutoplay);
heroPhone?.addEventListener("focusin", stopPhoneAutoplay);
heroPhone?.addEventListener("focusout", startPhoneAutoplay);

/* ---------- Live GitHub Open-Source Strip ---------- */

const reposGrid = document.getElementById("repos-grid");
const REPO_CACHE_KEY = "gh_repos_cache_v1";
const REPO_CACHE_TTL_MS = 15 * 60 * 1000;

function renderFallbackRepos() {
  if (!reposGrid) return;
  const username = siteConfig?.githubUsername || "carlmigz";
  reposGrid.innerHTML = repoCard({
    name: `${username}.github.io`,
    description:
      "This portfolio site — built with zero-build vanilla HTML, CSS, and ES modules.",
    language: "JavaScript",
    stargazers_count: 0,
    html_url: `https://github.com/${username}/${username}.github.io`
  });
}

async function loadGithubRepos() {
  if (!reposGrid) return;
  const username = siteConfig?.githubUsername || "carlmigz";

  try {
    const cachedRaw = sessionStorage.getItem(REPO_CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.ts < REPO_CACHE_TTL_MS && Array.isArray(cached.repos) && cached.repos.length > 0) {
        reposGrid.innerHTML = cached.repos.map(repoCard).join("");
        return;
      }
    }
  } catch (e) {}

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const allRepos = await response.json();
    const ownRepos = allRepos.filter(r => !r.fork);
    const preferred = ownRepos.filter(
      r => r.name.toLowerCase() !== `${username.toLowerCase()}.github.io`
    );
    const selected = (preferred.length >= 3 ? preferred : ownRepos).slice(0, 6);

    if (selected.length === 0) {
      renderFallbackRepos();
      return;
    }

    reposGrid.innerHTML = selected.map(repoCard).join("");
    try {
      sessionStorage.setItem(
        REPO_CACHE_KEY,
        JSON.stringify({ ts: Date.now(), repos: selected })
      );
    } catch (e) {}
  } catch (e) {
    renderFallbackRepos();
  }
}

loadGithubRepos();

/* ---------- Project Case-Study & QR Modal ---------- */

const projectModal = document.getElementById("project-modal");
const projectModalTitle = document.getElementById("project-modal-title");
const projectModalBadge = document.getElementById("project-modal-badge");
const projectModalBody = document.getElementById("project-modal-body");

function openProjectModal(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project || !projectModal || !projectModalBody) return;

  if (projectModalTitle) projectModalTitle.textContent = project.title;
  if (projectModalBadge) projectModalBadge.textContent = project.category || "Flutter";

  const highlightsHtml = (project.highlights || [])
    .map(item => `<li>${item}</li>`)
    .join("");

  const storeButtons = [
    storeButton("android", project.android, project.title),
    storeButton("ios", project.ios, project.title)
  ]
    .filter(Boolean)
    .join("");

  const qrCards = [
    project.android
      ? `
        <a href="${project.android}" target="_blank" rel="noopener noreferrer" class="qr-card">
          ${qrSvg(project.android, `Google Play QR code for ${project.title}`)}
          <span>Google Play</span>
        </a>
      `
      : "",
    project.ios
      ? `
        <a href="${project.ios}" target="_blank" rel="noopener noreferrer" class="qr-card">
          ${qrSvg(project.ios, `App Store QR code for ${project.title}`)}
          <span>App Store</span>
        </a>
      `
      : ""
  ]
    .filter(Boolean)
    .join("");

  projectModalBody.innerHTML = `
    <div class="project-detail-grid">
      <div>
        <div class="project-detail-meta">
          <span class="meta-chip">${project.role || "Flutter Developer"}</span>
          <span class="meta-chip">${project.platforms || "Android & iOS"}</span>
        </div>
        <p class="project-detail-desc">${project.description}</p>
        ${highlightsHtml ? `<ul class="project-detail-list">${highlightsHtml}</ul>` : ""}
        <div class="project-actions">${storeButtons}</div>
      </div>

      <div class="qr-panel">
        <h4>Try on Your Phone</h4>
        <p class="qr-panel-sub">Scan with your camera to open the store listing.</p>
        <div class="qr-grid">${qrCards}</div>
      </div>
    </div>
  `;

  projectModal.showModal();
}

document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-open-project]");
  if (trigger) {
    openProjectModal(trigger.dataset.openProject);
    return;
  }

  const closeBtn = event.target.closest("[data-close-modal]");
  if (closeBtn) {
    closeBtn.closest("dialog")?.close();
    return;
  }

  if (event.target instanceof HTMLDialogElement) {
    event.target.close();
  }
});

/* ---------- Printable Resume Preview Modal ---------- */

const resumeModal = document.getElementById("resume-modal");
const resumeModalBody = document.getElementById("resume-modal-body");
const resumeDownloadLink = document.getElementById("resume-download-link");

if (resumeDownloadLink && siteConfig?.resumePdfUrl) {
  resumeDownloadLink.href = siteConfig.resumePdfUrl;
  resumeDownloadLink.hidden = false;
}

function openResumeModal() {
  if (!resumeModal || !resumeModalBody) return;

  const skillSummary = skills
    .map(g => `<li><strong>${g.title}:</strong> ${g.items.join(", ")}</li>`)
    .join("");

  const projectSummary = projects
    .map(
      p => `
        <li>
          <strong>${p.title}</strong> (${p.category})
          <span>${p.description}</span>
        </li>
      `
    )
    .join("");

  const journeySummary = timeline
    .map(t => `<li><strong>${t.year} &mdash; ${t.title}:</strong> ${t.description}</li>`)
    .join("");

  resumeModalBody.innerHTML = `
    <div class="resume-sheet">
      <div class="resume-top">
        <div>
          <h4>${siteConfig?.name || "Carlos Miguel Ramos"}</h4>
          <p>${siteConfig?.role || "Flutter Developer"} &middot; Android &amp; iOS</p>
        </div>
        <p>${emailAddress} &middot; carlmigz.github.io</p>
      </div>

      <div class="resume-section">
        <h5>Summary</h5>
        <p>
          Flutter Developer specializing in cross-platform Android and iOS
          applications with Clean Architecture, BLoC, REST APIs, and Firebase —
          delivering production apps from Figma concepts to Google Play and the
          App Store.
        </p>
      </div>

      <div class="resume-section">
        <h5>Technical Skills</h5>
        <ul class="project-detail-list">${skillSummary}</ul>
      </div>

      <div class="resume-section">
        <h5>Published Flutter Applications (${projects.length})</h5>
        <ul class="resume-projects-list">${projectSummary}</ul>
      </div>

      <div class="resume-section">
        <h5>Engineering Progression</h5>
        <ul class="project-detail-list">${journeySummary}</ul>
      </div>
    </div>
  `;

  resumeModal.showModal();
}

document.querySelectorAll("[data-open-resume]").forEach(btn => {
  btn.addEventListener("click", openResumeModal);
});

document.getElementById("print-resume-btn")?.addEventListener("click", () => {
  document.body.classList.add("printing-resume");
  window.print();
  document.body.classList.remove("printing-resume");
});

/* ---------- Navigation: scroll-spy + mobile menu ---------- */

const navbar = document.getElementById("navbar");
const menuBtn = document.getElementById("nav-menu-btn");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const navSectionIds = new Set(
  navLinks.map(link => link.getAttribute("href")?.slice(1)).filter(Boolean)
);
const observedSections = [...document.querySelectorAll("main section[id]")].filter(
  section => navSectionIds.has(section.id)
);

function setActiveLink(id) {
  if (!id || !navSectionIds.has(id)) return;

  navLinks.forEach(link => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setMenuOpen(open) {
  if (!navbar || !menuBtn) return;
  navbar.classList.toggle("nav-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
}

menuBtn?.addEventListener("click", () => {
  const isOpen = navbar?.classList.contains("nav-open");
  setMenuOpen(!isOpen);
});

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href")?.slice(1);
    setActiveLink(id);
    setMenuOpen(false);
  });
});

document.addEventListener("click", event => {
  if (navbar?.classList.contains("nav-open") && !navbar.contains(event.target)) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navbar?.classList.contains("nav-open")) {
    setMenuOpen(false);
    menuBtn?.focus();
  }
});

window.matchMedia("(min-width: 961px)").addEventListener("change", event => {
  if (event.matches) setMenuOpen(false);
});

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  { rootMargin: "-30% 0px -62% 0px" }
);

observedSections.forEach(section => sectionObserver.observe(section));

/* ---------- Theme: light / system / dark ---------- */

const root = document.documentElement;
const themeButtons = [...document.querySelectorAll("[data-theme-option]")];
const themeMeta = document.querySelector('meta[name="theme-color"]');
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

let currentMode = "system";
let themeAnimTimer = null;

function syncThemeColor() {
  const dark =
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && darkQuery.matches);

  themeMeta?.setAttribute("content", dark ? "#0f1623" : "#ffffff");
}

function applyTheme(mode, animate = false) {
  if (mode !== "light" && mode !== "dark") {
    mode = "system";
  }

  if (animate) {
    clearTimeout(themeAnimTimer);
    root.classList.add("theme-anim");
    themeAnimTimer = setTimeout(() => {
      root.classList.remove("theme-anim");
      themeAnimTimer = null;
    }, 400);
  }

  if (mode === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = mode;
  }

  currentMode = mode;

  themeButtons.forEach(button => {
    const selected = button.dataset.themeOption === mode;
    button.setAttribute("aria-checked", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });

  syncThemeColor();
}

function saveTheme(mode) {
  try {
    if (mode === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", mode);
    }
  } catch (e) {}
}

let savedTheme = "system";
try {
  savedTheme = localStorage.getItem("theme") || "system";
} catch (e) {}

applyTheme(savedTheme);

themeButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.themeOption, true);
    saveTheme(currentMode);
  });

  button.addEventListener("keydown", event => {
    const step = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1
    }[event.key];

    if (!step) return;

    event.preventDefault();
    const next =
      themeButtons[(index + step + themeButtons.length) % themeButtons.length];
    next.focus();
    next.click();
  });
});

darkQuery.addEventListener("change", syncThemeColor);

window.addEventListener("storage", event => {
  if (event.key === "theme") {
    applyTheme(event.newValue || "system", true);
  }
});

/* ---------- Scroll progress & bottom-of-page highlight ---------- */

const progress = document.getElementById("scroll-progress");
const lastObservedSection = observedSections[observedSections.length - 1];
let scrollRaf = null;

function handleScrollUpdate() {
  scrollRaf = null;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

  if (progress) {
    progress.style.transform = `scaleX(${ratio})`;
  }

  if (lastObservedSection && max > 0 && window.scrollY >= max - 40) {
    setActiveLink(lastObservedSection.id);
  }
}

function scheduleScrollUpdate() {
  if (scrollRaf !== null) return;
  scrollRaf = requestAnimationFrame(handleScrollUpdate);
}

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
handleScrollUpdate();

/* ---------- Reveal-on-scroll ---------- */

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add("in");
        obs.unobserve(el);

        setTimeout(
          () => el.classList.remove("reveal"),
          700 + Number(el.style.getPropertyValue("--i")) * 70
        );
      });
    },
    { threshold: 0.12 }
  );

  document
    .querySelectorAll(
      "section h2, .section-subtitle, .about p, .service-card, .skill-card, .timeline-item, .project-card, .contact-link, .copy-email-btn, .contact-form"
    )
    .forEach(el => {
      el.style.setProperty("--i", [...el.parentElement.children].indexOf(el));
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
}

/* ---------- Copy email button ---------- */

const copyBtn = document.getElementById("copy-email");
const copyAddress = document.getElementById("copy-email-address");
const copyLabel = document.getElementById("copy-email-label");
const copyStatus = document.getElementById("copy-status");

if (copyAddress && emailAddress) {
  copyAddress.textContent = emailAddress;
}

let copyTimer = null;

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

async function triggerCopyEmail() {
  try {
    await copyText(emailAddress);
    clearTimeout(copyTimer);

    copyBtn?.classList.add("copied");
    if (copyLabel) copyLabel.textContent = "Copied!";
    if (copyStatus) copyStatus.textContent = "Email address copied to clipboard.";

    copyTimer = setTimeout(() => {
      copyBtn?.classList.remove("copied");
      if (copyLabel) copyLabel.textContent = "Copy";
      if (copyStatus) copyStatus.textContent = "";
      copyTimer = null;
    }, 2000);
  } catch (e) {
    if (copyStatus) copyStatus.textContent = "Unable to copy email address.";
  }
}

copyBtn?.addEventListener("click", triggerCopyEmail);

/* ---------- Zero-backend Inquiry Form ---------- */

const contactForm = document.getElementById("contact-form");
const contactSubmit = document.getElementById("contact-submit");
const formStatus = document.getElementById("form-status");

contactForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const inquiryType = String(data.get("inquiryType") || "General Inquiry");
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    if (formStatus) {
      formStatus.textContent = "Please fill in your name, a valid email, and a message.";
      formStatus.classList.add("error");
    }
    return;
  }

  formStatus?.classList.remove("error");

  // Direct AJAX submit if a Formspree or Web3Forms endpoint is configured in data/contacts.js.
  if (siteConfig?.formEndpoint) {
    if (contactSubmit) contactSubmit.disabled = true;
    if (formStatus) formStatus.textContent = "Sending inquiry...";

    try {
      const payload = {
        name,
        email,
        subject: `[Portfolio] ${inquiryType} from ${name}`,
        inquiryType,
        message
      };
      if (siteConfig.web3formsKey) {
        payload.access_key = siteConfig.web3formsKey;
      }

      const res = await fetch(siteConfig.formEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      contactForm.reset();
      if (formStatus) formStatus.textContent = "Thanks! Your message has been sent.";
    } catch (err) {
      if (formStatus) {
        formStatus.textContent = "Could not send directly — please use the Email button above.";
        formStatus.classList.add("error");
      }
    } finally {
      if (contactSubmit) contactSubmit.disabled = false;
    }
    return;
  }

  // Zero-config fallback: open a pre-filled email draft in the visitor's mail client.
  const subject = `[Portfolio] ${inquiryType} — ${name}`;
  const body = `Hi Carlos,\n\n${message}\n\n— ${name}\n${email}`;
  window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (formStatus) {
    formStatus.textContent = "Opening your email app with your drafted inquiry...";
  }
});

/* ---------- Command Palette (Ctrl+K / Cmd+K) ---------- */

const cmdDialog = document.getElementById("cmd-palette");
const cmdInput = document.getElementById("cmd-input");
const cmdList = document.getElementById("cmd-list");

const commandItems = [
  { label: "Go to Home", tag: "Section", run: () => location.assign("#home") },
  { label: "Go to About", tag: "Section", run: () => location.assign("#about") },
  { label: "Go to Services", tag: "Section", run: () => location.assign("#services") },
  { label: "Go to Skills", tag: "Section", run: () => location.assign("#skills") },
  { label: "Go to Learning Journey", tag: "Section", run: () => location.assign("#timeline") },
  { label: "Go to Projects", tag: "Section", run: () => location.assign("#projects") },
  { label: "Go to Open Source", tag: "Section", run: () => location.assign("#opensource") },
  { label: "Go to Contact", tag: "Section", run: () => location.assign("#contact") },
  ...projects.map(p => ({
    label: `Inspect ${p.title} (${p.category})`,
    tag: "App & QR",
    run: () => openProjectModal(p.id)
  })),
  { label: "View / Print Resume", tag: "Action", run: () => openResumeModal() },
  { label: `Copy Email (${emailAddress})`, tag: "Action", run: () => triggerCopyEmail() },
  { label: "Theme: Light", tag: "Theme", run: () => { applyTheme("light", true); saveTheme("light"); } },
  { label: "Theme: System", tag: "Theme", run: () => { applyTheme("system", true); saveTheme("system"); } },
  { label: "Theme: Dark", tag: "Theme", run: () => { applyTheme("dark", true); saveTheme("dark"); } }
];

let filteredCommands = [...commandItems];
let selectedCmdIndex = 0;

function renderCommandList() {
  if (!cmdList) return;

  if (filteredCommands.length === 0) {
    cmdList.innerHTML = `<li class="cmd-empty">No matching commands.</li>`;
    return;
  }

  cmdList.innerHTML = filteredCommands
    .map(
      (cmd, idx) => `
        <li role="option" aria-selected="${idx === selectedCmdIndex}">
          <button
            type="button"
            class="cmd-item${idx === selectedCmdIndex ? " selected" : ""}"
            data-cmd-index="${idx}"
          >
            <span>${cmd.label}</span>
            <span class="cmd-item-tag">${cmd.tag}</span>
          </button>
        </li>
      `
    )
    .join("");
}

function openCommandPalette() {
  if (!cmdDialog) return;
  filteredCommands = [...commandItems];
  selectedCmdIndex = 0;
  if (cmdInput) cmdInput.value = "";
  renderCommandList();
  cmdDialog.showModal();
  cmdInput?.focus();
}

function executeCommand(index) {
  const item = filteredCommands[index];
  if (!item) return;
  cmdDialog?.close();
  item.run();
}

document.querySelectorAll("[data-open-cmd]").forEach(btn => {
  btn.addEventListener("click", openCommandPalette);
});

cmdInput?.addEventListener("input", () => {
  const q = cmdInput.value.trim().toLowerCase();
  filteredCommands = q
    ? commandItems.filter(
        c => c.label.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q)
      )
    : [...commandItems];
  selectedCmdIndex = 0;
  renderCommandList();
});

cmdInput?.addEventListener("keydown", event => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (filteredCommands.length) {
      selectedCmdIndex = (selectedCmdIndex + 1) % filteredCommands.length;
      renderCommandList();
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (filteredCommands.length) {
      selectedCmdIndex =
        (selectedCmdIndex - 1 + filteredCommands.length) % filteredCommands.length;
      renderCommandList();
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    executeCommand(selectedCmdIndex);
  }
});

cmdList?.addEventListener("click", event => {
  const btn = event.target.closest("[data-cmd-index]");
  if (!btn) return;
  executeCommand(Number(btn.dataset.cmdIndex));
});

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (cmdDialog?.open) {
      cmdDialog.close();
    } else {
      openCommandPalette();
    }
  }
});
