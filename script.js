import { projects } from "./data/projects.js";
import { contacts } from "./data/contacts.js";

import { projectCard } from "./components/project-card.js";
import { contactLink } from "./components/contact-link.js";

const projectsGrid =
  document.getElementById("projects-grid");

projectsGrid.innerHTML =
  projects
    .map(projectCard)
    .join("");

const contactLinks =
  document.getElementById("contact-links");

contactLinks.innerHTML =
  contacts
    .map(contactLink)
    .join("");

const navLinks =
  document.querySelectorAll(".nav-links a");

const sections =
  document.querySelectorAll("section");

function setActiveLink(id) {

  navLinks.forEach(link => {

    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${id}`
    );

  });

}

navLinks.forEach(link => {

  link.addEventListener("click", () => {

    setActiveLink(
      link.getAttribute("href").slice(1)
    );

  });

});

// A thin band near the top third of the viewport decides the active
// section, so tall sections on small screens still highlight correctly.
const observer = new IntersectionObserver(
  entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }

    });

  },
  {
    rootMargin: "-35% 0px -60% 0px"
  }
);

sections.forEach(section => {
  observer.observe(section);
});

document
  .getElementById("cta-contact")
  ?.addEventListener("click", () => {

    document
      .getElementById("contact")
      .scrollIntoView({
        behavior: "smooth"
      });

  });

/* ---------- Theme: light / system / dark ---------- */

const root = document.documentElement;

const themeButtons = [
  ...document.querySelectorAll("[data-theme-option]")
];

const themeMeta =
  document.querySelector('meta[name="theme-color"]');

const darkQuery =
  window.matchMedia("(prefers-color-scheme: dark)");

let currentMode = "system";

function syncThemeColor() {

  const dark =
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && darkQuery.matches);

  themeMeta?.setAttribute(
    "content",
    dark ? "#0f1623" : "#ffffff"
  );

}

function applyTheme(mode, animate = false) {

  if (mode !== "light" && mode !== "dark") {
    mode = "system";
  }

  if (animate) {
    root.classList.add("theme-anim");
    setTimeout(() => root.classList.remove("theme-anim"), 400);
  }

  if (mode === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = mode;
  }

  currentMode = mode;

  themeButtons.forEach(button => {

    const selected =
      button.dataset.themeOption === mode;

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
  savedTheme =
    localStorage.getItem("theme") || "system";
} catch (e) {}

applyTheme(savedTheme);

themeButtons.forEach((button, index) => {

  button.addEventListener("click", () => {

    applyTheme(button.dataset.themeOption, true);
    saveTheme(currentMode);

  });

  // Arrow keys move through the options, like a native radio group
  button.addEventListener("keydown", event => {

    const step =
      { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];

    if (!step) return;

    event.preventDefault();

    const next =
      themeButtons[
        (index + step + themeButtons.length) % themeButtons.length
      ];

    next.focus();
    next.click();

  });

});

darkQuery.addEventListener("change", syncThemeColor);

// Keep multiple open tabs in sync
window.addEventListener("storage", event => {

  if (event.key === "theme") {
    applyTheme(event.newValue || "system", true);
  }

});

/* ---------- Scroll progress + reveal-on-scroll ---------- */

const progress =
  document.getElementById("scroll-progress");

function updateProgress() {

  const max =
    document.documentElement.scrollHeight - window.innerHeight;

  progress.style.transform =
    `scaleX(${max > 0 ? window.scrollY / max : 0})`;

}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const revealObserver = new IntersectionObserver(
  (entries, obs) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {
        const el = entry.target;

        el.classList.add("in");
        obs.unobserve(el);

        // Drop the reveal transition afterwards so hover effects stay snappy
        setTimeout(
          () => el.classList.remove("reveal"),
          700 + Number(el.style.getPropertyValue("--i")) * 70
        );
      }

    });

  },
  { threshold: 0.12 }
);

document
  .querySelectorAll(
    "section h2, .about p, .skill-card, .timeline-item, .project-card, .contact-link"
  )
  .forEach(el => {

    // Stagger siblings inside the same grid
    el.style.setProperty(
      "--i",
      [...el.parentElement.children].indexOf(el)
    );

    el.classList.add("reveal");
    revealObserver.observe(el);

  });
