import { icons } from "./icons.js?v=6";
import { storeButton } from "./store-button.js?v=6";

export function projectCard(project) {
  const badge = project.category || "Flutter";
  const actions = [
    storeButton("android", project.android, project.title),
    storeButton("ios", project.ios, project.title)
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="project-card" data-project-id="${project.id}">
      <div class="project-header">
        <h3>${project.title}</h3>
        <span class="project-badge">${badge}</span>
      </div>

      <p>${project.description}</p>

      <div class="project-actions">
        ${actions}
        <button
          type="button"
          class="project-details-btn"
          data-open-project="${project.id}"
          aria-label="Open details and QR codes for ${project.title}"
        >
          ${icons.qr}
          <span>Details &amp; QR</span>
        </button>
      </div>
    </article>
  `;
}
