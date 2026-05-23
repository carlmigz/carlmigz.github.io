import { icons } from "./icons.js";

export function contactLink(contact) {

  return `
    <a
      href="${contact.url}"
      target="_blank"
      rel="noopener noreferrer"
      class="contact-link"
    >

      ${icons[contact.icon]}

      <span>
        ${contact.label}
      </span>

    </a>
  `;
}