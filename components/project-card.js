import { storeButton } from "./store-button.js?v=5";

export function projectCard(project) {
  const badge = project.category || "Flutter";
  const actions = [
    storeButton("android", project.android, project.title),
    storeButton("ios", project.ios, project.title)
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="project-card">
      <div class="project-header">
        <h3>${project.title}</h3>
        <span class="project-badge">${badge}</span>
      </div>

      <p>${project.description}</p>

      ${actions ? `<div class="project-actions">${actions}</div>` : ""}
    </article>
  `;
}
