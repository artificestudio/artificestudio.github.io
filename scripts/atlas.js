import {seedPlaces,CATEGORIES,TAG_LABELS,categoryLabel,tagLabel,matchesFilters} from "../content/places.js?v=20261012-inventory-clean";
import { PROPOSAL_EMAIL } from "../content/email.js";

const $=id=>document.getElementById(id);
const tooltip=$("atlas-tooltip"),list=$("atlas-list"),mapStatus=$("atlas-map-status");
let places=[...seedPlaces], selectMode=false, chosen=null, selectedMarker=null;
const markers=[];
let activeCategory="all", activeTags=[],searchTerm="";
const categoryControls=$("atlas-categories"),tagControls=$("atlas-tags"),searchInput=$("atlas-search"),clearFilters=$("atlas-clear-filters"),filterCount=$("atlas-filter-count");

const map=new maplibregl.Map({
  container:"atlas-map",
  style:{version:8,sources:{},layers:[{id:"initial-white",type:"background",paint:{"background-color":"#ffffff"}}]},
  center:[133,36],zoom:2.25,minZoom:1,maxZoom:19,
  attributionControl:false,renderWorldCopies:false,
  dragRotate:false,pitchWithRotate:false,touchPitch:false,
  cooperativeGestures:false
});
map.addControl(new maplibregl.AttributionControl({compact:true}),"bottom-right");
map.touchZoomRotate.disableRotation();
const HOME={center:[133,36],zoom:2.25};
const sidebar=$("atlas-directory"),sidebarToggle=$("atlas-sidebar-toggle"),sidebarClose=$("atlas-sidebar-close");
function setSidebar(open){sidebar.classList.toggle("is-open",open);sidebarToggle.setAttribute("aria-expanded",String(open));sidebarToggle.textContent=open?"CLOSE ×":"FILTERS / PLACES";if(open)sidebarClose.focus({preventScroll:true});}
sidebarToggle.addEventListener("click",()=>setSidebar(!sidebar.classList.contains("is-open")));
sidebarClose.addEventListener("click",()=>{setSidebar(false);sidebarToggle.focus();});
sidebarToggle.addEventListener("mouseenter",()=>{if(matchMedia("(hover:hover) and (pointer:fine)").matches)setSidebar(true);});
sidebar.addEventListener("mouseleave",()=>{if(matchMedia("(hover:hover) and (pointer:fine)").matches)setSidebar(false);});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&sidebar.classList.contains("is-open"))setSidebar(false);});

function configureBlackWhite(style){
 const s=JSON.parse(JSON.stringify(style));
 for(const layer of s.layers){
   const id=(layer.id||"").toLowerCase();
   const sourceLayer=(layer["source-layer"]||"").toLowerCase();
   const key=id+" "+sourceLayer;
   const water=/(water|ocean|lake|river|sea)/.test(key);
   const building=/(building)/.test(key);
   const terrain=/(contour|elevation|topograph)/.test(key);
   const countryLabel=false;
   const cityLabel=false;
   if(layer.type==="background"){
     layer.paint={"background-color":"#ffffff"};
   }else if(layer.type==="fill"){
     if(water)layer.paint={"fill-color":"#ffffff","fill-opacity":1};
     else if(building)layer.paint={"fill-color":"#111111","fill-opacity":["interpolate",["linear"],["zoom"],11,0,13,1]};
     else layer.layout={...(layer.layout||{}),visibility:"none"};
   }else if(layer.type==="line"){
     if(water)layer.paint={"line-color":"#cecece","line-width":.7,"line-opacity":1};
     else if(terrain)layer.paint={"line-color":"#e5e5e5","line-width":.5,"line-opacity":["interpolate",["linear"],["zoom"],9,0,12,.65]};
     else layer.layout={...(layer.layout||{}),visibility:"none"};
   }else if(layer.type==="symbol"){
     if(countryLabel||cityLabel){
       layer.paint={...(layer.paint||{}),"text-color":"#555555","text-halo-color":"#ffffff","text-halo-width":1,"icon-opacity":0,"text-opacity":["interpolate",["linear"],["zoom"],5,1,11,0]};
     }else layer.layout={...(layer.layout||{}),visibility:"none"};
   }else{
     layer.layout={...(layer.layout||{}),visibility:"none"};
   }
 }
 return s;
}
async function loadVectorBasemap(){
 try{
   const r=await fetch("https://tiles.openfreemap.org/styles/liberty");
   if(!r.ok)throw Error("Vector style HTTP "+r.status);
   const style=configureBlackWhite(await r.json());
   map.setStyle(style,{diff:false});
   map.once("style.load",()=>{
     map.addSource("artifice-countries",{type:"geojson",data:"https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"});
     map.addLayer({id:"artifice-country-fill",type:"fill",source:"artifice-countries",paint:{"fill-color":"#111111","fill-opacity":["interpolate",["linear"],["zoom"],3,1,7,0]}});
     map.addLayer({id:"artifice-country-borders",type:"line",source:"artifice-countries",paint:{"line-color":"#777777","line-width":["interpolate",["linear"],["zoom"],1,.45,5,.75],"line-opacity":["interpolate",["linear"],["zoom"],4,1,8,0]}});
     const nameEl=$("atlas-country-name");
     map.on("mousemove","artifice-country-fill",event=>{
       if(map.getZoom()>=6||!event.features?.length){nameEl.textContent="";return;}
       const properties=event.features[0].properties||{};
       nameEl.textContent=properties.ADMIN||properties.name||properties.NAME||"";
     });
     map.on("mouseleave","artifice-country-fill",()=>{nameEl.textContent="";});
     map.on("zoom",()=>{if(map.getZoom()>=6)nameEl.textContent="";});
   });
   $("atlas-basemap-credit").textContent="OpenFreeMap / OSM";
   mapStatus.textContent="Rendering map…";
 }catch(e){
   console.error("ARTIFICE Atlas vector style unavailable:",e);
   mapStatus.textContent="Map basemap could not load. Please reload.";
 }
}
map.on("idle",()=>{if(map.isStyleLoaded()&&map.getStyle().sources && Object.keys(map.getStyle().sources).length)mapStatus.hidden=true;});
map.on("error",e=>{console.warn("Map tile/render issue:",e.error);});

function showTip(p,el){
 tooltip.replaceChildren();
 const firstPhoto=Array.isArray(p.images)?p.images.find(item=>item && typeof item.src==="string" && item.src.trim()):null;
 if(firstPhoto){
   const frame=document.createElement("div");
   frame.className="atlas-tooltip-photo-frame";
   const message=document.createElement("span");
   message.className="atlas-tooltip-photo-message";
   message.textContent="Loading photograph…";
   const photo=document.createElement("img");
   photo.className="atlas-tooltip-photo";
   photo.alt=firstPhoto.alt||("Photograph of "+p.name);
   photo.loading="eager";
   photo.decoding="async";
   const localUrl=new URL(firstPhoto.src,document.baseURI).href;
   const rawUrl="https://raw.githubusercontent.com/artificestudio/artificestudio.github.io/main/"+firstPhoto.src.replace(new RegExp("^/+"), "");
   let fallbackAttempted=false;
   photo.addEventListener("load",()=>{
     frame.classList.add("is-loaded");
     message.remove();
   });
   photo.addEventListener("error",()=>{
     if(!fallbackAttempted){
       fallbackAttempted=true;
       photo.src=rawUrl;
     }else{
       photo.remove();
       message.textContent="Photograph unavailable";
       frame.classList.add("is-unavailable");
     }
   });
   frame.append(message,photo);
   tooltip.append(frame);
   photo.src=localUrl;
 }else{
   const note=document.createElement("div");
   note.className="atlas-tooltip-photo-empty";
   note.textContent="Photographic documentation in progress";
   tooltip.append(note);
 }
 const information=document.createElement("div");
 information.className="atlas-tooltip-info";
 const heading=document.createElement("strong");heading.textContent=p.name;
 const city=document.createElement("div");city.textContent=p.city+", "+p.country;
 const date=document.createElement("div");date.textContent=p.year?"Construction / opening: "+p.year:"Date under review";
 const type=document.createElement("div");type.textContent=categoryLabel(p.category);
 information.append(heading,city,type,date);
 tooltip.append(information);
 tooltip.hidden=false;
 const container=$("atlas-map").getBoundingClientRect(),rect=el.getBoundingClientRect();
 const tooltipWidth=tooltip.offsetWidth;
 const tooltipHeight=tooltip.offsetHeight;
 tooltip.style.left=Math.max(8,Math.min(rect.left-container.left+18,container.width-tooltipWidth-8))+"px";
 tooltip.style.top=Math.max(8,Math.min(rect.top-container.top-tooltipHeight-10,container.height-tooltipHeight-8))+"px";
 el.classList.add("is-selected");
}
function openPlace(p){location.href="atlas-place.html?id="+encodeURIComponent(p.id);}
function visiblePlaces(){return places.filter(place=>matchesFilters(place,activeCategory,activeTags,searchTerm));}
function resetMarkers(){
 markers.forEach(marker=>marker.remove());markers.length=0;
 // In dense parts of the map, let markers with real photos remain clickable on top.
 const displayed=visiblePlaces().slice().sort((a,b)=>Number(Boolean(a.images?.length))-Number(Boolean(b.images?.length)));
 for(const p of displayed){
   if(!Array.isArray(p.coordinates) || p.coordinates.length!==2 || !p.coordinates.every(Number.isFinite))continue;
   const el=document.createElement("button");
   el.type="button";el.className="atlas-marker";el.setAttribute("aria-label",p.name+", "+p.city);
   const marker=new maplibregl.Marker({element:el,anchor:"center"}).setLngLat(p.coordinates).addTo(map);
   markers.push(marker);
   el.addEventListener("mouseenter",()=>showTip(p,el));
   el.addEventListener("mouseleave",()=>{tooltip.hidden=true;el.classList.remove("is-selected")});
   el.addEventListener("focus",()=>showTip(p,el));
   el.addEventListener("blur",()=>{tooltip.hidden=true;el.classList.remove("is-selected")});
   el.addEventListener("click",()=>{if(!selectMode)openPlace(p);});
 }
}
function makeChip(label,selected,onclick,disabled=false){
 const b=document.createElement("button");b.type="button";b.className="atlas-filter-chip"+(selected?" is-active":"");
 b.textContent=label;b.disabled=disabled;b.setAttribute("aria-pressed",String(selected));b.addEventListener("click",onclick);return b;
}
function focusSingleSearchResult(){
 if(!searchTerm.trim())return;
 const found=visiblePlaces();
 if(found.length!==1)return;
 const target=found[0];
 if(!Array.isArray(target.coordinates)||target.coordinates.length!==2)return;
 map.easeTo({center:target.coordinates,zoom:Math.max(map.getZoom(),12),duration:400});
}
function syncFilters(){
 renderFilters();renderList();resetMarkers();
 focusSingleSearchResult();
 const url=new URL(window.location.href);
 if(activeCategory==="all")url.searchParams.delete("category");else url.searchParams.set("category",activeCategory);
 if(activeTags.length)url.searchParams.set("tags",activeTags.join(","));else url.searchParams.delete("tags");
 if(searchTerm)url.searchParams.set("q",searchTerm);else url.searchParams.delete("q");
 history.replaceState(null,"",url);
}
function renderFilters(){
 categoryControls.replaceChildren();
 const counts=new Map(CATEGORIES.map(category=>[category.id,places.filter(p=>p.category===category.id).length]));
 categoryControls.append(makeChip("All / "+places.length,activeCategory==="all",()=>{activeCategory="all";syncFilters();}));
 for(const category of CATEGORIES){
   const count=counts.get(category.id);
   if(!count)continue;
   categoryControls.append(makeChip(category.label+" / "+count,activeCategory===category.id,()=>{activeCategory=activeCategory===category.id?"all":category.id;syncFilters();}));
 }
 tagControls.replaceChildren();
 const tags=[...new Set(places.flatMap(p=>Array.isArray(p.tags)?p.tags:[]))].sort();
 for(const tag of tags)tagControls.append(makeChip("#"+tagLabel(tag),activeTags.includes(tag),()=>{
   activeTags=activeTags.includes(tag)?activeTags.filter(t=>t!==tag):[...activeTags,tag];syncFilters();
 }));
 clearFilters.hidden=activeCategory==="all"&&!activeTags.length&&!searchTerm;
}
const urlState=new URLSearchParams(location.search);
const initialCategory=urlState.get("category");
if(CATEGORIES.some(c=>c.id===initialCategory))activeCategory=initialCategory;
activeTags=(urlState.get("tags")||"").split(",").filter(Boolean);
searchTerm=urlState.get("q")||"";
searchInput.value=searchTerm;
searchInput.addEventListener("input",()=>{searchTerm=searchInput.value;syncFilters();});
clearFilters.addEventListener("click",()=>{activeCategory="all";activeTags=[];searchTerm="";searchInput.value="";syncFilters();});

function renderList(){
 list.replaceChildren();
 const shown=visiblePlaces().slice().sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:"base"}));
 filterCount.textContent=String(shown.length).padStart(2,"0")+" / "+String(places.length).padStart(2,"0")+" PLACES";
 if(!shown.length){const msg=document.createElement("p");msg.className="atlas-no-results";msg.textContent="No places match these filters.";list.append(msg);}
 for(const p of shown){
   const b=document.createElement("button");b.className="atlas-list-item";b.type="button";
   const n=document.createElement("span");n.textContent=p.name+", "+p.city+", "+p.country;
   const typ=document.createElement("span");typ.className="atlas-entry-type";typ.textContent=categoryLabel(p.category);
   const y=document.createElement("small");y.textContent=(p.year||"date unknown")+(p.coordinates?"":" / LOCATION TO VERIFY");
   b.append(n,typ,y);b.onclick=()=>openPlace(p);list.append(b);
 }
 $("atlas-count").textContent=String(places.length).padStart(2,"0");
}
// Curated Atlas catalogue: published records live in atlas-data.js.
// Email suggestions never appear here until editors add them to GitHub.
function loadPlaces(){
 renderFilters();
 renderList();
 resetMarkers();
 const selected=places.find(p=>p.id===urlState.get("place"));
 if(selected?.coordinates)map.jumpTo({center:selected.coordinates,zoom:13});
}
$("atlas-home").onclick=()=>map.easeTo({...HOME,duration:500});
$("atlas-zoom-in").onclick=()=>map.zoomIn({duration:300});
$("atlas-zoom-out").onclick=()=>map.zoomOut({duration:300});
// Email proposals require no external backend: the visitor sends the draft.
const dialog=$("propose-dialog"),form=$("propose-form");
const proposalStatus=$("proposal-status");
for(const category of CATEGORIES){
 const option=document.createElement("option");
 option.value=category.id;option.textContent=category.label;
 $("propose-category").append(option);
}
$("propose-button").onclick=()=>{
 selectMode=false;
 dialog.showModal();
 proposalStatus.textContent="Complete the form and select a location on the map.";
};
$("atlas-pick-location").onclick=()=>{
 selectMode=true;
 dialog.close();
 proposalStatus.textContent="Click the map to set the location.";
 map.getCanvas().style.cursor="crosshair";
};
dialog.querySelector("[data-close]").onclick=()=>{selectMode=false;dialog.close();};
map.on("click",event=>{
 if(!selectMode)return;
 chosen=[event.lngLat.lng,event.lngLat.lat];
 selectedMarker?.remove();
 const element=document.createElement("span");
 element.className="atlas-proposal-pin";
 selectedMarker=new maplibregl.Marker({element}).setLngLat(chosen).addTo(map);
 $("propose-coordinate").textContent=chosen[1].toFixed(6)+"°, "+chosen[0].toFixed(6)+"° (WGS84)";
 proposalStatus.textContent="Location selected. You can now prepare the email.";
 selectMode=false;
 map.getCanvas().style.cursor="";
 dialog.showModal();
});
function composeProposal(){
 if(!form.reportValidity())return null;
 if(!chosen){proposalStatus.textContent="Select a location using the map button before sending.";return null;}
 const formData=new FormData(form);
 const string=key=>String(formData.get(key)||"").trim();
 const name=string("name"),city=string("city");
 const lat=chosen[1].toFixed(6),lon=chosen[0].toFixed(6);
 const mapLink="https://www.openstreetmap.org/?mlat="+lat+"&mlon="+lon+"#map=17/"+lat+"/"+lon;
 const subject="[ARTIFICE ATLAS] Place proposal — "+name+" / "+city;
 const body=[
  "ARTIFICE ATLAS — NEW PLACE PROPOSAL",
  "",
  "Place: "+name,
  "City: "+city,
  "Country: "+string("country"),
  "Construction / opening date: "+(string("year")||"Unknown"),
  "Typology: "+categoryLabel(string("category")),
  "Tags: "+(string("tags")||"None"),
  "",
  "LOCATION — WGS84",
  "Latitude: "+lat,
  "Longitude: "+lon,
  "OpenStreetMap: "+mapLink,
  "",
  "DESCRIPTION",
  string("description"),
  "",
  "SOURCE",
  string("source")||"Not supplied",
  "",
  "This place is proposed for ARTIFICE editorial review. Nothing is published automatically."
 ].join("\n");
 return {subject,body};
}
form.addEventListener("submit",event=>{
 event.preventDefault();
 const message=composeProposal();
 if(!message)return;
 if(!PROPOSAL_EMAIL){proposalStatus.textContent="ARTIFICE contact email is not configured.";return;}
 const url="mailto:"+PROPOSAL_EMAIL+
  "?subject="+encodeURIComponent(message.subject)+
  "&body="+encodeURIComponent(message.body);
 proposalStatus.textContent="Your email app should open with the prepared proposal. Press Send there; we have not sent anything automatically. If no app opens, click Copy proposal.";
 window.location.href=url;
});
$("atlas-copy-proposal").addEventListener("click",async()=>{
 const message=composeProposal();
 if(!message)return;
 try{
  await navigator.clipboard.writeText("To: "+PROPOSAL_EMAIL+"\nSubject: "+message.subject+"\n\n"+message.body);
  proposalStatus.textContent="Proposal copied. Paste it into an email addressed to "+PROPOSAL_EMAIL+" and send it.";
 }catch{
  proposalStatus.textContent="Copying was blocked by your browser. Try Open email to send instead.";
 }
});
loadVectorBasemap();
loadPlaces();
focusSingleSearchResult();
