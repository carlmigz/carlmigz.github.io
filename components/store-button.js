import { icons } from "./icons.js";

export function storeButton(type, url) {

  return `
    <a
      href="${url}"
      target="_blank"
      rel="noopener noreferrer"
      class="project-link store-link"
    >

      <span class="store-icon">
        ${type === "android"
          ? icons.android
          : icons.apple}
      </span>

      <span>
        ${type === "android"
          ? "Android"
          : "iOS"}
      </span>

    </a>
  `;
}