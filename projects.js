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
let previousX = null;
let distance = 0;
let wheelDistance = 0;
let touchStartX = null;
let suppressClick = false;

images.forEach(([number]) => {
  const preload = new Image();
  preload.src = `assets/maine-${number}.webp`;
});

function showImage(index) {
  current = (index + images.length) % images.length;
  image.src = `assets/maine-${images[current][0]}.webp`;
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
