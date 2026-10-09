import {seedPlaces,CATEGORIES,TAG_LABELS,categoryLabel,tagLabel,matchesFilters} from "./atlas-data.js";
import {SUPABASE_URL,SUPABASE_ANON_KEY,TURNSTILE_SITE_KEY} from "./atlas-config.js";

const $=id=>document.getElementById(id);
const configured=Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const contributionsReady=configured&&Boolean(TURNSTILE_SITE_KEY);
const tooltip=$("atlas-tooltip"),list=$("atlas-list"),mapStatus=$("atlas-map-status");
let places=[...seedPlaces], selectMode=false, chosen=null, selectedMarker=null;
const markers=[];
let activeCategory="all", activeTags=[],searchTerm="";
const categoryControls=$("atlas-categories"),tagControls=$("atlas-tags"),searchInput=$("atlas-search"),clearFilters=$("atlas-clear-filters"),filterCount=$("atlas-filter-count");

const map=new maplibregl.Map({
  container:"atlas-map",
  style:{version:8,sources:{},layers:[{id:"initial-white",type:"background",paint:{"background-color":"#ffffff"}}]},
  center:[62,25],zoom:1.65,minZoom:1,maxZoom:19,
  attributionControl:false,renderWorldCopies:false,
  dragRotate:false,pitchWithRotate:false,touchPitch:false,
  cooperativeGestures:false
});
map.addControl(new maplibregl.AttributionControl({compact:true}),"bottom-right");
map.touchZoomRotate.disableRotation();
const HOME={center:[62,25],zoom:1.65};

function rest(path,options={}){
 return fetch(SUPABASE_URL+"/rest/v1/"+path,{...options,headers:{apikey:SUPABASE_ANON_KEY,"Content-Type":"application/json",...options.headers}});
}
function configureBlackWhite(style){
 const s=JSON.parse(JSON.stringify(style));
 for(const layer of s.layers){
   const id=(layer.id||"").toLowerCase(),sourceLayer=(layer["source-layer"]||"").toLowerCase();
   const water=/(water|ocean|lake|river|sea)/.test(id+" "+sourceLayer);
   const boundary=/(boundary|admin|border)/.test(id+" "+sourceLayer);
   const road=/(road|street|transportation|highway|bridge|tunnel|rail)/.test(id+" "+sourceLayer);
   const building=/(building)/.test(id+" "+sourceLayer);
   const placeLabel=layer.type==="symbol";
   if(layer.type==="background"){layer.paint={"background-color":"#080808"};continue;}
   if(layer.type==="fill"){
     layer.paint={"fill-color":water?"#ffffff":building?"#252525":"#080808","fill-opacity":1};
   }else if(layer.type==="line"){
     layer.paint={"line-color":water?"#ffffff":boundary?"#ffffff":road?"#3d3d3d":"#777777","line-width":boundary?["interpolate",["linear"],["zoom"],1,.65,8,1.1,13,1.5]:road?["interpolate",["linear"],["zoom"],4,.25,12,.65,17,1.4]:.5,"line-opacity":boundary?0.9:0.85};
   }else if(layer.type==="symbol"){
     // Keep legibility, but avoid colorful, high-density labels at global scale.
     layer.paint={"text-color":"#ffffff","text-halo-color":"#090909","text-halo-width":1.1,"icon-opacity":0,"text-opacity":/(poi|housenumber|house-number|aeroway)/.test(id)?0:1};
   }else if(layer.type==="circle"){
     layer.paint={"circle-color":"#ffffff","circle-radius":1};
   }else if(layer.type==="fill-extrusion"){
     layer.layout={...(layer.layout||{}),visibility:"none"};
   }else if(layer.type==="raster"){
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
 const heading=document.createElement("strong");heading.textContent=p.name;
 const city=document.createElement("div");city.textContent=p.city+", "+p.country;
 const date=document.createElement("div");date.textContent=p.year?"Construction / opening: "+p.year:"Date under review";
 const type=document.createElement("div");type.textContent=categoryLabel(p.category);
 tooltip.append(heading,city,type,date);
 const container=$("atlas-map").getBoundingClientRect(),rect=el.getBoundingClientRect();
 tooltip.style.left=Math.max(8,Math.min(rect.left-container.left+18,container.width-255))+"px";
 tooltip.style.top=Math.max(8,rect.top-container.top-80)+"px";
 tooltip.hidden=false;
 el.classList.add("is-selected");
}
function openPlace(p){location.href="atlas-place.html?id="+encodeURIComponent(p.id);}
function visiblePlaces(){return places.filter(place=>matchesFilters(place,activeCategory,activeTags,searchTerm));}
function resetMarkers(){
 markers.forEach(marker=>marker.remove());markers.length=0;
 for(const p of visiblePlaces()){
   const el=document.createElement("button");
   el.type="button";el.className="atlas-marker";el.setAttribute("aria-label",p.name+", "+p.city);
   const marker=new maplibregl.Marker({element:el,anchor:"center"}).setLngLat(p.coordinates).addTo(map);
   markers.push(marker);
   el.addEventListener("mouseenter",()=>showTip(p,el));
   el.addEventListener("mouseleave",()=>{tooltip.hidden=true;el.classList.remove("is-selected")});
   el.addEventListener("focus",()=>showTip(p,el));
   el.addEventListener("blur",()=>{tooltip.hidden=true;el.classList.remove("is-selected")});
   el.addEventListener("click",()=>openPlace(p));
 }
}
function makeChip(label,selected,onclick,disabled=false){
 const b=document.createElement("button");b.type="button";b.className="atlas-filter-chip"+(selected?" is-active":"");
 b.textContent=label;b.disabled=disabled;b.setAttribute("aria-pressed",String(selected));b.addEventListener("click",onclick);return b;
}
function syncFilters(){
 renderFilters();renderList();resetMarkers();
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
 const shown=visiblePlaces();
 filterCount.textContent=String(shown.length).padStart(2,"0")+" / "+String(places.length).padStart(2,"0")+" PLACES";
 if(!shown.length){const msg=document.createElement("p");msg.className="atlas-no-results";msg.textContent="No places match these filters.";list.append(msg);}
 for(const p of shown){
   const b=document.createElement("button");b.className="atlas-list-item";b.type="button";
   const n=document.createElement("span");n.textContent=p.name+" — "+p.city+", "+p.country;
   const typ=document.createElement("span");typ.className="atlas-entry-type";typ.textContent=categoryLabel(p.category);
   const y=document.createElement("small");y.textContent=p.year||"date unknown";
   b.append(n,typ,y);b.onclick=()=>openPlace(p);list.append(b);
 }
 $("atlas-count").textContent=String(places.length).padStart(2,"0");
}
async function loadPlaces(){
 if(configured){
  try{
   const r=await rest("atlas_places?status=eq.published&select=id,name,city,country,year,longitude,latitude,description,project,source,category,tags&order=name.asc");
   if(r.ok){
    for(const p of await r.json()){
      const converted={...p,coordinates:[p.longitude,p.latitude],tags:Array.isArray(p.tags)?p.tags:[],category:p.category||"other"};
      const idx=places.findIndex(x=>x.id===p.id);
      if(idx<0)places.push(converted);else places[idx]=converted;
    }
   }
  }catch(e){console.warn("Atlas records unavailable",e);}
 }
 renderFilters();renderList();resetMarkers();
 const selectedId=urlState.get("place");
 const selectedPlace=places.find(p=>p.id===selectedId);
 if(selectedPlace?.coordinates) {
   // A project-to-atlas URL centers precisely on the associated building.
   map.jumpTo({center:selectedPlace.coordinates,zoom:13});
 }
}
$("atlas-home").onclick=()=>map.easeTo({...HOME,duration:500});
$("atlas-zoom-in").onclick=()=>map.zoomIn({duration:300});
$("atlas-zoom-out").onclick=()=>map.zoomOut({duration:300});
const dialog=$("propose-dialog"),form=$("propose-form");
for(const category of CATEGORIES){
 const option=document.createElement("option");
 option.value=category.id;option.textContent=category.label;
 $("propose-category").append(option);
}
let captchaWidget=null;
function initCaptcha(){
 if(!contributionsReady||captchaWidget!==null||!window.turnstile?.render)return;
 captchaWidget=window.turnstile.render("#atlas-turnstile",{
  sitekey:TURNSTILE_SITE_KEY,
  theme:"light",
  appearance:"always"
 });
}
$("propose-button").onclick=()=>{
 dialog.show();selectMode=true;
 $("proposal-status").textContent=contributionsReady?
   "Click on the map to choose the location, then complete your proposal.":
   "Contributions are not enabled yet. ARTIFICE is setting up moderation.";
 initCaptcha();
};
dialog.querySelector("[data-close]").onclick=()=>dialog.close();
dialog.addEventListener("close",()=>{selectMode=false;selectedMarker?.remove();selectedMarker=null});
map.on("click",e=>{
 if(!selectMode)return;
 chosen=[e.lngLat.lng,e.lngLat.lat];
 selectedMarker?.remove();
 const el=document.createElement("span");el.className="atlas-proposal-pin";
 selectedMarker=new maplibregl.Marker({element:el}).setLngLat(chosen).addTo(map);
 $("propose-coordinate").textContent=chosen[1].toFixed(5)+"° N / "+chosen[0].toFixed(5)+"° E";
});
form.onsubmit=async e=>{
 e.preventDefault();
 const status=$("proposal-status");
 if(!chosen){status.textContent="Click or tap the map to choose the location first.";return;}
 if(!contributionsReady){status.textContent="Contributions are not enabled yet.";return;}
 initCaptcha();
 const captcha=window.turnstile?.getResponse(captchaWidget);
 if(!captcha){status.textContent="Complete the spam verification before submitting.";return;}
 const d=new FormData(form);
 const button=form.querySelector('[type="submit"]');
 button.disabled=true;status.textContent="Submitting…";
 const tags=String(d.get("tags")||"").split(",").map(tag=>tag.trim().toLowerCase()).filter(tag=>/^[a-z0-9]+(-[a-z0-9]+)*$/.test(tag)).slice(0,12);
 const body={
  name:String(d.get("name")||"").trim(),
  city:String(d.get("city")||"").trim(),
  country:String(d.get("country")||"").trim(),
  year:String(d.get("year")||"").trim(),
  description:String(d.get("description")||"").trim(),
  source:String(d.get("source")||"").trim(),
  category:String(d.get("category")||"other"),
  tags,
  longitude:chosen[0],latitude:chosen[1],
  website:String(d.get("website")||""),
  turnstileToken:captcha
 };
 try{
  const url=SUPABASE_URL.replace(/\/$/,"")+"/functions/v1/atlas-submit";
  const response=await fetch(url,{
   method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY},
   body:JSON.stringify(body)
  });
  let result={};try{result=await response.json()}catch{}
  if(!response.ok)throw Error(result.message||"Submission could not be saved.");
  status.textContent="Thank you! Your proposal is awaiting review by ARTIFICE.";
  form.reset();chosen=null;selectedMarker?.remove();selectedMarker=null;
  if(captchaWidget!==null)window.turnstile?.reset(captchaWidget);
 }catch(error){
  status.textContent=error.message||"Could not submit. Please try again.";
  if(captchaWidget!==null)window.turnstile?.reset(captchaWidget);
 }finally{button.disabled=false;}
};
loadVectorBasemap();
loadPlaces();
