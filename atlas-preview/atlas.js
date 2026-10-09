import {seedPlaces} from "./atlas-data.js";
import {SUPABASE_URL,SUPABASE_ANON_KEY} from "./atlas-config.js";

const $=id=>document.getElementById(id);
const configured=Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const tooltip=$("atlas-tooltip"),list=$("atlas-list"),mapStatus=$("atlas-map-status");
let places=[...seedPlaces], selectMode=false, chosen=null, selectedMarker=null;
const markers=[];
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
 tooltip.append(heading,city,date);
 const container=$("atlas-map").getBoundingClientRect(),rect=el.getBoundingClientRect();
 tooltip.style.left=Math.max(8,Math.min(rect.left-container.left+18,container.width-255))+"px";
 tooltip.style.top=Math.max(8,rect.top-container.top-80)+"px";
 tooltip.hidden=false;
 el.classList.add("is-selected");
}
function openPlace(p){location.href="atlas-place.html?id="+encodeURIComponent(p.id);}
function resetMarkers(){
 markers.forEach(marker=>marker.remove());markers.length=0;
 for(const p of places){
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
function renderList(){
 list.replaceChildren();
 for(const p of places){
   const b=document.createElement("button");b.className="atlas-list-item";b.type="button";
   const n=document.createElement("span");n.textContent=p.name+" — "+p.city+", "+p.country;
   const y=document.createElement("small");y.textContent=p.year||"date unknown";
   b.append(n,y);b.onclick=()=>openPlace(p);list.append(b);
 }
 $("atlas-count").textContent=String(places.length).padStart(2,"0");
}
async function loadPlaces(){
 if(configured){
  try{
   const r=await rest("atlas_places?status=eq.published&select=id,name,city,country,year,longitude,latitude,description,project,source&order=name.asc");
   if(r.ok){
    for(const p of await r.json()){
      const converted={...p,coordinates:[p.longitude,p.latitude]};
      const idx=places.findIndex(x=>x.id===p.id);
      if(idx<0)places.push(converted);else places[idx]=converted;
    }
   }
  }catch(e){console.warn("Atlas records unavailable",e);}
 }
 renderList();resetMarkers();
}
$("atlas-home").onclick=()=>map.easeTo({...HOME,duration:500});
$("atlas-zoom-in").onclick=()=>map.zoomIn({duration:300});
$("atlas-zoom-out").onclick=()=>map.zoomOut({duration:300});
const dialog=$("propose-dialog"),form=$("propose-form");
$("propose-button").onclick=()=>{
 dialog.show();selectMode=true;
 $("proposal-status").textContent=configured?"":"Public submissions will be enabled after the editorial service is connected.";
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
 if(!chosen){$("proposal-status").textContent="Click or tap the map to choose a point first.";return;}
 if(!configured){$("proposal-status").textContent="Contributions are not enabled yet.";return;}
 const d=new FormData(form);
 const body={name:String(d.get("name")).trim(),city:String(d.get("city")).trim(),country:String(d.get("country")).trim(),year:String(d.get("year")).trim(),description:String(d.get("description")).trim(),source:String(d.get("source")).trim()||null,longitude:chosen[0],latitude:chosen[1],status:"pending"};
 try{
  const r=await rest("atlas_places",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify(body)});
  $("proposal-status").textContent=r.ok?"Thank you. Your proposal will be reviewed.":"Unable to submit ("+r.status+").";
  if(r.ok){form.reset();chosen=null;}
 }catch{$("proposal-status").textContent="Network unavailable. Please retry.";}
};
loadVectorBasemap();
loadPlaces();
