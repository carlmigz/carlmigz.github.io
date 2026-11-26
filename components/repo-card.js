import { icons } from "./icons.js?v=6";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const LANG_COLORS = {
  Dart: "#00B4AB",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Kotlin: "#A97BFF",
  Swift: "#F05138"
};

export function repoCard(repo) {
  const name = escapeHtml(repo.name);
  const desc = escapeHtml(
    repo.description || "Public repository on GitHub."
  );
  const lang = escapeHtml(repo.language || "");
  const langColor = LANG_COLORS[repo.language] || "var(--primary)";
  const stars = Number(repo.stargazers_count) || 0;
  const url = escapeHtml(repo.html_url);

  return `
    <a
      href="${url}"
      target="_blank"
      rel="noopener noreferrer"
      class="repo-card"
    >
      <div class="repo-header">
        <span class="repo-name">${name}</span>
        <span class="external-icon">${icons.external}</span>
      </div>
      <p class="repo-desc">${desc}</p>
      <div class="repo-meta">
        ${
          lang
            ? `<span class="repo-lang"><span class="lang-dot" style="background:${langColor}"></span>${lang}</span>`
            : ""
        }
        ${
          stars > 0
            ? `<span class="repo-stars">${icons.star}${stars}</span>`
            : ""
        }
      </div>
    </a>
  `;
}
