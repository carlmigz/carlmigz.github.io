import { projects } from "./data/projects.js?v=5";
import { contacts } from "./data/contacts.js?v=5";
import { projectCard } from "./components/project-card.js?v=5";
import { contactLink } from "./components/contact-link.js?v=5";

const emailContact = contacts.find(contact => contact.url?.startsWith("mailto:"));
const emailAddress =
  emailContact?.url.replace(/^mailto:/i, "") ||
  document.getElementById("copy-email-address")?.textContent?.trim() ||
  "";

/* ---------- Render dynamic sections ---------- */

const projectsGrid = document.getElementById("projects-grid");
if (projectsGrid) {
  projectsGrid.innerHTML = projects.map(projectCard).join("");
}

const projectCount = document.getElementById("project-count");
if (projectCount) {
  projectCount.textContent = String(projects.length);
}

const contactLinks = document.getElementById("contact-links");
if (contactLinks) {
  contactLinks.innerHTML = contacts.map(contactLink).join("");
}

const footerYear = document.getElementById("footer-year");
if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

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

window.matchMedia("(min-width: 821px)").addEventListener("change", event => {
  if (event.matches) setMenuOpen(false);
});

// Observe a thin upper-middle band so tall sections highlight accurately.
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

  // Arrow keys move through the options, like a native radio group.
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

// Keep multiple open tabs in sync.
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

  // Ensure the last section (#contact) activates even when shorter than the viewport.
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

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add("in");
        obs.unobserve(el);

        // Drop the reveal transition afterwards so hover effects stay snappy.
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
      "section h2, .section-subtitle, .about p, .skill-card, .timeline-item, .project-card, .contact-link, .copy-email-btn"
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

if (copyAddress) {
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

copyBtn?.addEventListener("click", async () => {
  try {
    await copyText(emailAddress);
    clearTimeout(copyTimer);

    copyBtn.classList.add("copied");
    if (copyLabel) copyLabel.textContent = "Copied!";
    if (copyStatus) copyStatus.textContent = "Email address copied to clipboard.";

    copyTimer = setTimeout(() => {
      copyBtn.classList.remove("copied");
      if (copyLabel) copyLabel.textContent = "Copy";
      if (copyStatus) copyStatus.textContent = "";
      copyTimer = null;
    }, 2000);
  } catch (e) {
    if (copyStatus) copyStatus.textContent = "Unable to copy email address.";
  }
});
