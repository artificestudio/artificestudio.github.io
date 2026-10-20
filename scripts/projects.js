import { projects, findProject } from "../content/projects.js?v=20261012-dongtan";

const requested = new URLSearchParams(window.location.search).get("project");
const selected = requested ? findProject(requested) : null;
const listing = document.getElementById("projects-index-view");
const detail = document.getElementById("projects-detail-view");
const twoDigits = number => String(number).padStart(2, "0");

document.getElementById("projects-total").textContent = twoDigits(projects.length);

function renderIndex() {
  document.title = "Projects | ARTIFICE";
  listing.hidden = false;
  detail.hidden = true;
  const container = document.getElementById("projects-index-items");
  container.replaceChildren();
  for (const [index, project] of projects.entries()) {
    const article = document.createElement("article");
    article.className = "clean-project-entry";
    const link = document.createElement("a");
    link.className = "clean-project-link";
    link.href = "projects.html?project=" + encodeURIComponent(project.id);

    const figure = document.createElement("figure");
    figure.className = "clean-project-figure";
    const cover = project.images?.[0];
    if (cover) {
      if (cover.type === "video") { const video = document.createElement("video"); video.src = cover.src; video.muted = true; video.playsInline = true; video.preload = "metadata"; video.setAttribute("aria-label", project.title); figure.append(video); } else { const img = document.createElement("img"); img.src = cover.src; img.alt = cover.alt || project.title; img.loading = index === 0 ? "eager" : "lazy"; figure.append(img); }
    }

    const meta = document.createElement("p");
    meta.className = "clean-project-metadata";
    const number = document.createElement("span");
    number.className = "clean-project-entry-number";
    number.textContent = twoDigits(index + 1);
    const location = document.createElement("span");
    location.textContent = project.category ? project.category : project.city + ", " + project.country;
    const years = document.createElement("span");
    years.textContent = project.years || "";
    meta.append(number, location, years);

    const title = document.createElement("h2");
    title.className = "clean-project-title";
    title.textContent = project.title;
    link.append(figure, meta, title);
    article.append(link);
    container.append(article);
  }
}

function renderDetail(project) {
  listing.hidden = true;
  detail.hidden = false;
  document.title = project.title + " | ARTIFICE";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = (project.description?.[0] || project.title).slice(0, 210);
  const index = projects.indexOf(project);
  document.getElementById("project-number").textContent =
    twoDigits(index + 1) + " of " + twoDigits(projects.length);
  document.getElementById("project-title").textContent = project.title;
  const location = document.getElementById("project-location");
  location.replaceChildren(document.createTextNode(project.site + ", "));
  if (project.atlasPlaceId) {
    const link = document.createElement("a");
    link.href = "atlas.html?place=" + encodeURIComponent(project.atlasPlaceId);
    link.textContent = project.city + ", " + project.country;
    location.append(link);
  } else {
    location.append(document.createTextNode(project.city + ", " + project.country));
  }
  document.getElementById("project-years").textContent = project.years || "";

  const description = document.getElementById("project-description");
  description.replaceChildren();
  for (const paragraph of project.description || []) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    description.append(p);
  }
  const other = projects[(index + 1) % projects.length];
  const related = document.getElementById("other-project");
  related.href = "projects.html?project=" + encodeURIComponent(other.id);
  related.textContent = other.title;

  const gallery = Array.isArray(project.images) ? project.images : [];
  const image = document.getElementById("project-image");
  const video = document.getElementById("project-video");
  const caption = document.getElementById("project-caption");
  const count = document.getElementById("project-image-count");
  const stage = document.getElementById("project-stage");
  const prev = document.getElementById("project-prev");
  const next = document.getElementById("project-next");
  let current = 0;
  const thumbnailGrid = document.getElementById("project-thumbnails");
  document.getElementById("project-documents-count").textContent = twoDigits(gallery.length);
  thumbnailGrid.replaceChildren();
  const thumbnails = gallery.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "clean-document-tile";
    button.setAttribute("aria-label", "View document " + (index + 1) + ": " + (item.caption || project.title));
    const img = item.type === "video" ? document.createElement("video") : document.createElement("img");
    img.preload = item.type === "video" ? "metadata" : undefined;
    if(item.type === "video"){img.muted=true;img.playsInline=true;}else{img.loading="lazy";img.alt="";}
    img.src = item.src;
    const note = document.createElement("span");
    note.textContent = twoDigits(index + 1) + "  " + (item.caption || "");
    button.append(img, note);
    button.addEventListener("click", () => {
      show(index - current);
      stage.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "center"
      });
    });
    thumbnailGrid.append(button);
    return button;
  });
  function show(offset) {
    if (!gallery.length) return;
    current = (current + offset + gallery.length) % gallery.length;
    const item = gallery[current];
    const isVideo = item.type === "video";
    video.pause();
    video.hidden = !isVideo;
    image.hidden = isVideo;
    if(isVideo){video.src=item.src;video.load();}else{image.src=item.src;image.alt=item.alt || item.caption || project.title;}
    caption.textContent = item.caption || "";
    count.textContent = twoDigits(current + 1) + " of " + twoDigits(gallery.length);
    thumbnails.forEach((button, index) => button.setAttribute("aria-pressed", String(index === current)));
  }
  prev.addEventListener("click", () => show(-1));
  next.addEventListener("click", () => show(1));
  stage.addEventListener("click", event => { if(event.target.closest("video"))return; show(1); });
  stage.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") { event.preventDefault(); show(-1); }
    if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      show(1);
    }
  });
  let touchStart = null;
  stage.addEventListener("touchstart", event => {
    touchStart = event.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener("touchend", event => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    touchStart = null;
    if (Math.abs(delta) >= 50) {
      event.preventDefault();
      show(delta < 0 ? 1 : -1);
    }
  }, { passive: false });
  show(0);
}

if (selected) renderDetail(selected);
else renderIndex();
