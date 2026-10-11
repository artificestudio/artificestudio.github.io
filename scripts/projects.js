import {projects,findProject} from "../content/projects.js?v=20261012-dongtan";

const requested = new URLSearchParams(location.search).get("project");
const project = requested ? findProject(requested) : null;
const archive = document.getElementById("projects-archive");
const detail = document.getElementById("projects-detail");
if (project) {
 archive.hidden = true;
 detail.hidden = false;
const images=project.images.map((picture,index)=>[
 String(index+1).padStart(2,"0"),picture.caption||"",picture.alt||picture.caption||project.title,picture.src
]);
if(!images.length)throw Error("Project must include at least one image");

// All display information comes from content/projects.js.
document.title=project.title+" | ARTIFICE";
const pageDescription=document.querySelector('meta[name="description"]');
if(pageDescription)pageDescription.content=(project.description?.[0]||project.title).slice(0,220);

document.getElementById("project-title").textContent=project.title;
const locationNode=document.getElementById("project-location");
locationNode.replaceChildren();
locationNode.append(document.createTextNode(project.site+" · "));
if(project.atlasPlaceId){
 const a=document.createElement("a");a.className="project-atlas-link";
 a.href="atlas.html?place="+encodeURIComponent(project.atlasPlaceId);
 a.setAttribute("aria-label","Locate "+project.site+" in the ARTIFICE Atlas");
 const dot=document.createElement("span");dot.className="project-atlas-dot";dot.setAttribute("aria-hidden","true");
 a.append(dot,document.createTextNode(project.city+", "+project.country));
 locationNode.append(a);
}else locationNode.append(document.createTextNode(project.city+", "+project.country));
if(project.years)locationNode.append(document.createTextNode(" · "+project.years));
const description=document.getElementById("project-description");
description.replaceChildren();
for(const paragraph of (project.description||[])){
 const element=document.createElement("p");element.textContent=paragraph;description.append(element);
}

const related = document.getElementById("projects-related");
for (const [i, entry] of projects.entries()) {
  const link = document.createElement("a");
  link.href = "projects.html?project=" + encodeURIComponent(entry.id);
  const label = document.createElement("span");
  label.textContent = String(i + 1).padStart(2, "0") + " / " + String(projects.length).padStart(2,"0");
  const name = document.createElement("strong");
  name.textContent = entry.title;
  link.append(label, name);
  if (entry.id === project.id) {
    link.setAttribute("aria-current","page");
  }
  related.append(link);
}
document.getElementById("projects-detail-number").textContent =
  "DOCUMENT " + String(projects.indexOf(project) + 1).padStart(2, "0") +
  " / " + String(projects.length).padStart(2,"0");

// Use the first photo immediately, including when opening a different project.
const frame = document.getElementById("project-frame");
const image = document.getElementById("project-image");
const counter = document.getElementById("project-counter");
const caption = document.getElementById("project-caption");
let current = 0;
let previousX = null;
let distance = 0;
let wheelDistance = 0;
let touchStartX = null;
let suppressClick = false;

images.forEach(([, , ,src]) => {
  const preload = new Image();
  preload.src = src;
});

function showImage(index) {
  current = (index + images.length) % images.length;
  image.src = images[current][3];
  image.alt = images[current][2];
  counter.textContent = `${images[current][0]} / ${images.length}`;
  caption.textContent = images[current][1];
}

frame.addEventListener("pointerenter", event => {
  if (event.pointerType === "mouse" || event.pointerType === "pen") {
    previousX = event.clientX;
    distance = 0;
  }
});
frame.addEventListener("pointermove", event => {
  if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
  if (previousX === null) { previousX = event.clientX; return; }
  const delta = event.clientX - previousX;
  previousX = event.clientX;
  if (delta && Math.sign(delta) !== Math.sign(distance)) distance = 0;
  distance += delta;
  const step = Math.max(120, frame.clientWidth / 5);
  if (Math.abs(distance) >= step) {
    const direction = Math.sign(distance);
    showImage(current + direction);
    distance -= direction * step;
  }
});
frame.addEventListener("pointerleave", () => { previousX = null; distance = 0; });
frame.addEventListener("wheel", event => {
  if (Math.abs(event.deltaX) < 2) return;
  event.preventDefault();
  const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? frame.clientWidth : 1);
  if (Math.sign(delta) !== Math.sign(wheelDistance)) wheelDistance = 0;
  wheelDistance += delta;
  if (Math.abs(wheelDistance) >= 160) {
    const direction = Math.sign(wheelDistance);
    showImage(current + direction);
    wheelDistance -= direction * 160;
  }
}, { passive: false });
frame.addEventListener("touchstart", event => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });
frame.addEventListener("touchend", event => {
  if (touchStartX === null) return;
  const delta = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(delta) < 45) return;
  showImage(current + Math.sign(delta));
  suppressClick = true;
  setTimeout(() => { suppressClick = false; }, 350);
}, { passive: true });
frame.addEventListener("click", () => {
  if (!suppressClick) showImage(current + 1);
});
frame.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") { event.preventDefault(); showImage(current - 1); }
  if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
    event.preventDefault(); showImage(current + 1);
  }
});

// Initial frame must match the selected project, not the HTML placeholder.
showImage(0);

} else {
 archive.hidden = false;
 detail.hidden = true;

const archiveList = document.getElementById("projects-archive-list");
const archiveTotal = document.getElementById("projects-archive-total");
archiveTotal.textContent = String(projects.length).padStart(2, "0") + " ENTRIES";
archiveList.replaceChildren();

for (const [i, entry] of projects.entries()) {
  const record = document.createElement("article");
  record.className = "archive-record";
  const link = document.createElement("a");
  link.className = "archive-record-link";
  link.href = "projects.html?project=" + encodeURIComponent(entry.id);
  link.setAttribute("aria-label","Explore " + entry.title);

  const ordinal = document.createElement("div");
  ordinal.className = "archive-record-ordinal";
  const number = document.createElement("span");
  number.textContent = String(i + 1).padStart(2, "0");
  const coords = document.createElement("span");
  coords.textContent = entry.city + " / " + entry.country;
  const years = document.createElement("span");
  years.textContent = entry.years || "";
  ordinal.append(number, coords, years);

  const stage = document.createElement("div");
  stage.className = "archive-record-stage";
  const figure = document.createElement("div");
  figure.className = "archive-record-figure";
  const first = entry.images?.[0];
  const second = entry.images?.find((image, n) => n > 0 && image.src !== first?.src);
  if (first) {
    const front = document.createElement("img");
    front.className = "archive-record-image";
    front.src = first.src;
    front.alt = first.alt || entry.title;
    front.loading = i ? "lazy" : "eager";
    figure.append(front);
    if (second) {
      const hiddenPhoto = document.createElement("img");
      hiddenPhoto.className = "archive-record-reveal";
      hiddenPhoto.src = second.src;
      hiddenPhoto.alt = "";
      hiddenPhoto.loading = "lazy";
      hiddenPhoto.setAttribute("aria-hidden", "true");
      figure.append(hiddenPhoto);
    }
    const figureLabel = document.createElement("span");
    figureLabel.className = "archive-record-figure-label";
    figureLabel.textContent = "FIG. " + String(i+1).padStart(2,"0") + " / " + String(entry.images.length).padStart(2,"0");
    figure.append(figureLabel);
  }
  const info = document.createElement("div");
  info.className = "archive-record-info";
  const stamp = document.createElement("span");
  stamp.className = "archive-record-stamp";
  stamp.textContent = entry.city + ", " + entry.country + " / " + entry.years;
  const title = document.createElement("h2");
  title.textContent = entry.title;
  const synopsis = document.createElement("p");
  synopsis.textContent = entry.description?.[0] || "";
  const action = document.createElement("span");
  action.className = "archive-record-action";
  action.textContent = "OPEN RECORD ↗";
  info.append(stamp,title,synopsis,action);
  stage.append(figure,info);
  link.append(ordinal,stage);
  record.append(link);
  archiveList.append(record);

  // A moving circular aperture reveals the next research document on hover.
  // Touchscreens and reduced-motion settings receive an ordinary static image.
  if (second) {
    figure.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = figure.getBoundingClientRect();
      figure.style.setProperty("--lens-x", ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
      figure.style.setProperty("--lens-y", ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%");
    });
  }
}
document.title = "Projects | ARTIFICE";

}
