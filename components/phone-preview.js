import { icons } from "./icons.js?v=6";

export function phonePreview(project, { interactive = true } = {}) {
  const accent = project.accent || "#0468D7";
  const initials = project.title
    .split(/\s+/)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const highlights = (project.highlights || [])
    .slice(0, 2)
    .map(item => `<li>${item}</li>`)
    .join("");

  const hasScreenshot = Array.isArray(project.screenshots) && project.screenshots.length > 0;

  return `
    <div class="phone-app" style="--app-accent: ${accent}">
      <div class="phone-app-banner">
        <div class="phone-app-avatar" aria-hidden="true">${initials}</div>
        <div class="phone-app-heading">
          <span class="phone-app-cat">${project.category}</span>
          <strong>${project.title}</strong>
        </div>
      </div>

      ${
        hasScreenshot
          ? `<img class="phone-screenshot" src="${project.screenshots[0]}" alt="${project.title} app screenshot" loading="lazy" />`
          : `
            <div class="phone-app-card">
              <p class="phone-app-tagline">${project.tagline || project.description}</p>
              <div class="phone-ui-bars" aria-hidden="true">
                <span class="bar-lg"></span>
                <span class="bar-sm"></span>
              </div>
              <ul class="phone-mini-list">${highlights}</ul>
            </div>
          `
      }

      <div class="phone-app-footer">
        <span class="phone-store-pill">${icons.android} Play</span>
        <span class="phone-store-pill">${icons.apple} iOS</span>
        ${
          interactive
            ? `<button type="button" class="phone-inspect-btn" data-open-project="${project.id}">Details &rarr;</button>`
            : ""
        }
      </div>
    </div>
  `;
}
