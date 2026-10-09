import {projects,findProject} from "../content/projects.js";

// projects.html?project=<id> selects a project; bare projects.html shows the first.
const requested=new URLSearchParams(location.search).get("project");
const project=findProject(requested)||projects[0];
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
const index=document.getElementById("projects-index");
index.replaceChildren();
for(const entry of projects){
 const a=document.createElement("a");a.href="projects.html?project="+encodeURIComponent(entry.id);
 a.textContent=entry.title;
 if(entry.id===project.id)a.setAttribute("aria-current","page");
 index.append(a);
}

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
