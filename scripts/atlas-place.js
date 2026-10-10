import {seedPlaces,categoryLabel,tagLabel} from "../content/places.js?v=20261010-find-makuhari";

const $=id=>document.getElementById(id);
const id=new URLSearchParams(location.search).get("id");
const place=seedPlaces.find(item=>item.id===id);
if(!place){
 $("place-title").textContent="Place not found";
 $("place-description").textContent="The requested record does not exist.";
}else{
 document.title=place.name+" — ARTIFICE Atlas";
 $("place-title").textContent=place.name;
 $("place-location").textContent=place.city+", "+place.country;
 $("place-year").textContent=place.year?"Construction / opening: "+place.year:"Construction date under review";
 $("place-description").textContent=place.description||"";
 $("place-category").textContent=categoryLabel(place.category);
 if(Array.isArray(place.coordinates) && place.coordinates.length===2){
  const link=document.createElement("a");
  link.href="atlas.html?place="+encodeURIComponent(place.id);
  link.textContent="Locate on Atlas map ↗";
  const p=document.createElement("p");p.append(link);
  $("place-research").append(p);
 }
 const research=$("place-research");
 for(const [label,value] of [
  ["Programme",place.program],
  ["Floor area",place.area],
  ["Area data reliability",place.areaReliability],
  ["Area scope / research notes",place.areaNote],
  ["Condition / research notes",place.condition],
  ["Location to verify",place.locationNote],
  ["Date context",place.dateNote]
 ]){
  if(!value)continue;
  const section=document.createElement("p");
  const title=document.createElement("strong");title.textContent=label+": ";
  section.append(title,document.createTextNode(value));
  research.append(section);
 }


 for(const tag of place.tags||[]){
  const link=document.createElement("a");
  link.className="atlas-detail-tag";
  link.href="atlas.html?tags="+encodeURIComponent(tag);
  link.textContent="#"+tagLabel(tag);
  $("place-tags").append(link);
 }
 if(place.areaSource && /^https?:\/\//i.test(place.areaSource)){
  const p=document.createElement("p");
  const a=document.createElement("a");a.href=place.areaSource;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Floor area reference";
  p.append(a);research.append(p);
 }
 if(place.source && /^https?:\/\//i.test(place.source)){
  const link=document.createElement("a");link.href=place.source;link.target="_blank";
  link.rel="noopener noreferrer";link.textContent="Reference";$("place-source").append(link);
 }
 if(place.project && /^projects\.html(?:\?project=[a-z0-9-]+)?$/.test(place.project)){
  const link=document.createElement("a");link.href=place.project;
  link.textContent="Explore ARTIFICE's project →";$("place-project").append(link);
 }

 // Add images in content/places.js, e.g. images: [{src:"assets/places/my-place/01.webp",caption:"...",alt:"..."}].
 const gallery=$("place-gallery");
 const entries=Array.isArray(place.images)?place.images:[];
 if(entries.length){
  let current=0;
  const viewer=document.createElement("figure");viewer.className="atlas-place-figure";
  const img=document.createElement("img");
  const cap=document.createElement("figcaption");
  const nav=document.createElement("div");nav.className="atlas-place-image-nav";
  const prev=document.createElement("button");prev.type="button";prev.textContent="← Previous";
  const next=document.createElement("button");next.type="button";next.textContent="Next →";
  const count=document.createElement("span");
  const update=()=>{
    const picture=entries[current];img.src=picture.src;img.alt=picture.alt||picture.caption||place.name;
    cap.textContent=picture.caption||"";count.textContent=String(current+1).padStart(2,"0")+" / "+String(entries.length).padStart(2,"0");
  };
  prev.onclick=()=>{current=(current-1+entries.length)%entries.length;update();};
  next.onclick=()=>{current=(current+1)%entries.length;update();};
  nav.append(prev,count,next);viewer.append(img,cap,nav);gallery.append(viewer);
  if(entries.length===1){prev.hidden=true;next.hidden=true;}
  update();
 }else{
  const note=document.createElement("p");note.className="atlas-place-no-images";
  note.textContent="DOCUMENTATION IN PROGRESS — Photographs, drawings, scans and field notes will appear here.";
  gallery.append(note);
 }
}
