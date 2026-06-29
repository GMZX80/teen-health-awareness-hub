async function loadSources() {
  const container = document.querySelector("#source-list");
  if (!container) return;

  try {
    const response = await fetch("data/sources.json");
    if (!response.ok) throw new Error(`Source load failed: ${response.status}`);
    const sources = await response.json();

    container.innerHTML = sources.map((source) => `
      <article class="source-card">
        <h3><a href="${source.url}">${source.title}</a></h3>
        <p>${source.summary}</p>
        <div class="tags">
          ${source.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
      </article>
    `).join("");
  } catch (error) {
    container.innerHTML = "<p>Source register could not be loaded. Open data/sources.json directly.</p>";
  }
}

loadSources();

