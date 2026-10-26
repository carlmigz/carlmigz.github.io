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

navLinks.forEach(link => {

  link.addEventListener("click", () => {

    navLinks.forEach(l =>
      l.classList.remove("active")
    );

    link.classList.add("active");

  });

});

const observer = new IntersectionObserver(
  entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        const id =
          entry.target.getAttribute("id");

        navLinks.forEach(link => {

          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${id}`
          );

        });

      }

    });

  },
  {
    threshold: 0.6
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


const themeButtons =
  document.querySelectorAll("[data-theme-option]");

function applyTheme(mode) {

  if (mode === "light" || mode === "dark") {
    document.documentElement.dataset.theme = mode;
  } else {
    mode = "system";
    delete document.documentElement.dataset.theme;
  }

  themeButtons.forEach(button =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeOption === mode)
    )
  );

  return mode;

}

let savedTheme = "system";

try {
  savedTheme =
    localStorage.getItem("theme") || "system";
} catch (e) {}

applyTheme(savedTheme);

themeButtons.forEach(button => {

  button.addEventListener("click", () => {

    const mode =
      applyTheme(button.dataset.themeOption);

    try {
      if (mode === "system") {
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem("theme", mode);
      }
    } catch (e) {}

  });

});
