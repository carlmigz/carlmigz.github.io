export function testimonialCard(item) {
  return `
    <figure class="testimonial-card">
      <blockquote>&ldquo;${item.quote}&rdquo;</blockquote>
      <figcaption>
        <strong>${item.author}</strong>
        <span>${item.role}${item.project ? ` &middot; ${item.project}` : ""}</span>
      </figcaption>
    </figure>
  `;
}
