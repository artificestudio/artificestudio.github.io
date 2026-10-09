import {seedPlaces} from "./atlas-data.js";
import {SUPABASE_URL,SUPABASE_ANON_KEY} from "./atlas-config.js";
const $=id=>document.getElementById(id);
const configured=!!(SUPABASE_URL&&SUPABASE_ANON_KEY);
const api=(path,options={})=>fetch(SUPABASE_URL+"/rest/v1/"+path,{...options,headers:{"apikey":SUPABASE_ANON_KEY,"Content-Type":"application/json",...options.headers}});
const tooltip=$("atlas-tooltip"),mapElement=$("atlas-map"),list=$("atlas-list");
let places=[...seedPlaces],selectMode=false,chosen=null,pin=null,selectedOverlay=null;
proj4.defs("EPSG:8857","+proj=eqearth +lon_0=0 +datum=WGS84 +units=m +no_defs +type=crs");
ol.proj.proj4.register(proj4);
const projection=ol.proj.get("EPSG:8857");
const homeCenter=ol.proj.transform([13,24],"EPSG:4326",projection);
const view=new ol.View({projection,center:homeCenter,zoom:1.4,minZoom:1,maxZoom:19,constrainResolution:false,smoothResolutionConstraint:true});
const osm=new ol.layer.Tile({source:new ol.source.OSM({crossOrigin:"anonymous"}),preload:2});
const map=new ol.Map({target:"atlas-map",layers:[osm],view,controls:[]});
const overlayElements=[];
function resetMarkers(){for(const o of overlayElements)map.removeOverlay(o);overlayElements.length=0;for(const p of places){const el=document.createElement("button");el.className="atlas-marker";el.type="button";el.setAttribute("aria-label",p.name+", "+p.city);const o=new ol.Overlay({element:el,position:ol.proj.transform(p.coordinates,"EPSG:4326",projection),positioning:"center-center",stopEvent:true});map.addOverlay(o);overlayElements.push(o);el.addEventListener("mouseenter",e=>showTip(p,e,el));el.addEventListener("mouseleave",()=>{tooltip.hidden=true;el.classList.remove("is-selected")});el.addEventListener("focus",e=>showTip(p,e,el));el.addEventListener("blur",()=>{tooltip.hidden=true;el.classList.remove("is-selected")});el.addEventListener("click",()=>openPlace(p));}}
function showTip(p,e,el){tooltip.innerHTML="";const name=document.createElement("strong");name.textContent=p.name;const meta=document.createElement("div");meta.textContent=p.city+", "+p.country;const year=document.createElement("div");year.textContent=p.year?"Construction / opening: "+p.year:"Date under review";tooltip.append(name,meta,year);const box=mapElement.getBoundingClientRect(),rect=el.getBoundingClientRect();tooltip.style.left=Math.max(8,Math.min(rect.left-box.left+18,box.width-250))+"px";tooltip.style.top=Math.max(8,rect.top-box.top-70)+"px";tooltip.hidden=false;el.classList.add("is-selected")}
function openPlace(p){location.href="atlas-place.html?id="+encodeURIComponent(p.id)}
function renderList(){list.replaceChildren();for(const p of places){const b=document.createElement("button");b.className="atlas-list-item";b.type="button";const n=document.createElement("span");n.textContent=p.name+" — "+p.city+", "+p.country;const y=document.createElement("small");y.textContent=p.year||"date unknown";b.append(n,y);b.onclick=()=>openPlace(p);list.append(b)}$("atlas-count").textContent=String(places.length).padStart(2,"0")}
async function loadPlaces(){if(configured){try{const r=await api("atlas_places?status=eq.published&select=id,name,city,country,year,longitude,latitude,description,project,source&order=name.asc");if(r.ok){const data=await r.json();places=[...seedPlaces];for(const p of data){const converted={...p,coordinates:[p.longitude,p.latitude]};const idx=places.findIndex(x=>x.id===p.id);if(idx>=0)places[idx]=converted;else places.push(converted)}}}catch(err){console.warn("Atlas: public records unavailable",err)}}renderList();resetMarkers()}
$("atlas-home").onclick=()=>view.animate({center:homeCenter,zoom:1.4,duration:500});
$("atlas-zoom-in").onclick=()=>view.animate({zoom:Math.min(view.getZoom()+1,19),duration:250});
$("atlas-zoom-out").onclick=()=>view.animate({zoom:Math.max(view.getZoom()-1,1),duration:250});
const dialog=$("propose-dialog"),form=$("propose-form");
$("propose-button").onclick=()=>{dialog.show();selectMode=true;$("proposal-status").textContent=configured?"":"Public submissions require the site's contribution service to be connected."};
dialog.querySelector("[data-close]").onclick=()=>dialog.close();
dialog.addEventListener("close",()=>{selectMode=false;if(pin)map.removeOverlay(pin);pin=null});
map.on("singleclick",e=>{if(!selectMode)return;chosen=ol.proj.transform(e.coordinate,projection,"EPSG:4326");if(pin)map.removeOverlay(pin);const el=document.createElement("span");el.className="atlas-proposal-pin";pin=new ol.Overlay({element:el,position:e.coordinate,positioning:"center-center"});map.addOverlay(pin);$("propose-coordinate").textContent=chosen[1].toFixed(5)+"° N / "+chosen[0].toFixed(5)+"° E"});
form.onsubmit=async e=>{e.preventDefault();if(!chosen){$("proposal-status").textContent="Choose a point on the map first.";return}if(!configured){$("proposal-status").textContent="Contributions are not enabled yet. ARTIFICE must configure the backend.";return}const data=new FormData(form),body={name:String(data.get("name")).trim(),city:String(data.get("city")).trim(),country:String(data.get("country")).trim(),year:String(data.get("year")).trim(),description:String(data.get("description")).trim(),source:String(data.get("source")).trim()||null,longitude:chosen[0],latitude:chosen[1],status:"pending"};try{const r=await api("atlas_places",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify(body)});$("proposal-status").textContent=r.ok?"Thank you. Your place has been submitted for review.":"Submission failed ("+r.status+"). Please try again.";if(r.ok){form.reset();chosen=null}}catch{$("proposal-status").textContent="Network unavailable; please try again."}};
loadPlaces();