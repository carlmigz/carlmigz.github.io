import { storeButton } from "./store-button.js";

export function projectCard(project) {

  return `
    <div class="project-card">

      <div class="project-header">

        <h3>${project.title}</h3>

        <span class="project-badge">
          Flutter
        </span>

      </div>

      <p>${project.description}</p>

      <div class="tech-stack">


      </div>

      <div class="project-actions">

        ${storeButton(
          "android",
          project.android
        )}

        ${storeButton(
          "ios",
          project.ios
        )}

      </div>

    </div>
  `;
}