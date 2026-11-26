export function timelineItem(entry) {
  const currentClass = entry.current ? " current" : "";
  return `
    <li class="timeline-item${currentClass}">
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-content">
        <div class="timeline-year">${entry.year}</div>
        <div class="timeline-title">${entry.title}</div>
        <div class="timeline-desc">${entry.description}</div>
      </div>
    </li>
  `;
}
