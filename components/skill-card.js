import { icons } from "./icons.js?v=6";

export function skillCard(group) {
  const items = (group.items || [])
    .map(item => `<li class="skill-item">${item}</li>`)
    .join("");

  return `
    <div class="skill-card">
      <div class="skill-card-header">
        <span class="skill-icon" aria-hidden="true">
          ${icons[group.icon] || icons.code}
        </span>
        <h3>${group.title}</h3>
      </div>
      <ul class="skill-list">${items}</ul>
    </div>
  `;
}
