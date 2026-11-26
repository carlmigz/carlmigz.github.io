import { icons } from "./icons.js?v=6";

export function serviceCard(service) {
  const pills = (service.deliverables || [])
    .map(item => `<li class="service-pill">${item}</li>`)
    .join("");

  return `
    <article class="service-card">
      <span class="service-icon" aria-hidden="true">
        ${icons[service.icon] || icons.mobile}
      </span>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      ${pills ? `<ul class="service-pills">${pills}</ul>` : ""}
    </article>
  `;
}
