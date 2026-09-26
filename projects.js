const images = [
  ["01", "The architectural model", "Architectural model showing the open stacked levels of the project"],
  ["02", "Spaces for discussion", "Frontal view of the model, with public spaces across the levels"],
  ["03", "The existing passage", "Dark interior of the existing Maine Montparnasse shopping centre"],
  ["04", "The existing centre", "Vacant interior of the shopping centre"],
  ["05", "Maine Montparnasse in its urban setting", "Site model seen from above"],
  ["06", "The model in progress", "Hands at work on a physical model of the project"],
  ["07", "Longitudinal section", "Long architectural section of the existing building and intervention"],
  ["08", "The citizens’ assembly", "Drawing of the assembly chamber and surrounding public spaces"],
  ["09", "Public circulation", "Architectural drawing showing movement through the project"],
  ["10", "Thematic pavilions", "Architectural drawing of a pavilion within the building"],
  ["11", "Section and programmes", "Architectural section showing the relationship between uses"],
  ["12", "Ground floor plan", "Plan of the ground floor and public approaches"],
  ["13", "Upper floor plan", "Plan of the second floor of the proposed building"]
];

const frame = document.getElementById("project-frame");
const image = document.getElementById("project-image");
const counter = document.getElementById("project-counter");
const caption = document.getElementById("project-caption");
let current = 0;
let timer;
let loading = false;

function showImage(index) {
  if (loading) return;
  const next = (index + images.length) % images.length;
  if (next === current) return;
  loading = true;
  const preview = new Image();
  preview.onload = () => {
    current = next;
    image.src = preview.src;
    image.alt = images[current][2];
    counter.textContent = `${images[current][0]} / ${images.length}`;
    caption.textContent = images[current][1];
    loading = false;
  };
  preview.onerror = () => { loading = false; };
  preview.src = `assets/maine-${images[next][0]}.webp`;
}

const nextImage = () => showImage(current + 1);
const previousImage = () => showImage(current - 1);

function stopHover() {
  clearInterval(timer);
  timer = undefined;
}

frame.addEventListener("mouseenter", () => {
  if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
  stopHover();
  timer = setInterval(nextImage, 1500);
});
frame.addEventListener("mouseleave", stopHover);
document.addEventListener("visibilitychange", () => { if (document.hidden) stopHover(); });
frame.addEventListener("click", nextImage);
frame.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") { event.preventDefault(); previousImage(); }
  if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
    event.preventDefault(); nextImage();
  }
});
document.getElementById("project-previous").addEventListener("click", previousImage);
document.getElementById("project-next").addEventListener("click", nextImage);
