import { icons } from "./icons.js?v=6";

export function storeButton(type, url, projectTitle = "") {
  if (!url) return "";

  const isAndroid = type === "android";
  const label = isAndroid ? "Android" : "iOS";
  const storeName = isAndroid ? "Google Play" : "App Store";
  const ariaLabel = projectTitle
    ? `View ${projectTitle} on ${storeName}`
    : `View on ${storeName}`;

  return `
    <a
      href="${url}"
      target="_blank"
      rel="noopener noreferrer"
      class="project-link"
      aria-label="${ariaLabel}"
    >
      <span class="store-icon">
        ${isAndroid ? icons.android : icons.apple}
      </span>
      <span>${label}</span>
      ${icons.external ? `<span class="external-icon">${icons.external}</span>` : ""}
    </a>
  `;
}
