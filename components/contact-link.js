import { icons } from "./icons.js?v=5";

export function contactLink(contact) {
  const isExternal = /^https?:\/\//i.test(contact.url);
  const externalAttrs = isExternal
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";

  return `
    <a href="${contact.url}"${externalAttrs} class="contact-link">
      ${icons[contact.icon] || ""}
      <span>${contact.label}</span>
    </a>
  `;
}
