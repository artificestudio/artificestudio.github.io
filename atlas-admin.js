import {CATEGORIES} from "./atlas-data.js";
import {SUPABASE_URL,SUPABASE_ANON_KEY} from "./atlas-config.js";

const $=id=>document.getElementById(id);
let client=null,items=[],places=[],tab="pending",selected=null,busy=false;
const message=t=>$("admin-message").textContent=t;
const show=(id,visible)=>$(id).hidden=!visible;
const slug=text=>String(text||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,105);
function setBusy(value){
 busy=value;
 for(const b of $("admin-detail").querySelectorAll("button"))b.disabled=value;
}
function render(){
 const active=tab==="pending"?items.filter(x=>x.status==="pending"):
   tab==="reviewed"?items.filter(x=>x.status!=="pending"):places;
 const list=$("admin-list");list.replaceChildren();
 $("admin-pending-count").textContent=String(items.filter(x=>x.status==="pending").length).padStart(2,"0");
 if(!active.length){const p=document.createElement("p");p.textContent="No records in this section.";list.append(p);return;}
 for(const item of active){
  const row=document.createElement("button");row.type="button";row.className="admin-row";
  const title=document.createElement("span");title.textContent=item.name+" — "+item.city+", "+item.country;
  const details=document.createElement("span");details.textContent=item.status+" · "+(item.year||"date unknown");
  row.append(title,details);
  row.onclick=()=>select(item,tab==="published"?"place":"proposal");
  list.append(row);
 }
}
function select(item,type){
 selected={item,type};const reviewed=type==="proposal"&&item.status!=="pending";
 const f=$("admin-record-form");
 $("admin-detail-title").textContent=type==="place"?"Edit place":reviewed?"Reviewed proposal":"Review proposal";
 const values={
  id:type==="proposal"?slug(item.name)+"-"+item.id.slice(0,6):item.id,
  name:item.name,city:item.city,country:item.country,year:item.year,
  category:item.category||"other",longitude:item.longitude,latitude:item.latitude,
  tags:(item.tags||[]).join(", "),description:item.description,source:item.source||"",
  project:item.project||"",editor_note:item.editor_note||"",
  status:item.status==="draft"?"draft":"published"
 };
 for(const [key,value] of Object.entries(values)){
  const field=f.elements.namedItem(key);if(field)field.value=String(value??"");
 }
 for(const input of f.querySelectorAll("input,select,textarea"))input.disabled=reviewed;
 f.elements.namedItem("id").readOnly=type==="place";
 show("admin-visibility-wrap",type==="place");
 $("admin-approve").hidden=reviewed;
 $("admin-approve").textContent=type==="place"?"Save changes":"Approve & publish";
 $("admin-draft").hidden=reviewed||type==="place";
 $("admin-reject").hidden=reviewed||type==="place";
 show("admin-detail",true);
 $("admin-detail").scrollIntoView({behavior:"smooth",block:"start"});
}
function payload(){
 const d=new FormData($("admin-record-form"));
 const tags=[...new Set(String(d.get("tags")||"").split(",").map(v=>v.trim().toLowerCase()).filter(Boolean))];
 if(tags.length>12||tags.some(v=>!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)))throw Error("Use up to 12 comma-separated tags (lowercase and hyphens).");
 const rec={
  id:String(d.get("id")||"").trim(),name:String(d.get("name")||"").trim(),
  city:String(d.get("city")||"").trim(),country:String(d.get("country")||"").trim(),
  year:String(d.get("year")||"").trim(),category:String(d.get("category")||"other"),
  longitude:Number(d.get("longitude")),latitude:Number(d.get("latitude")),
  tags,description:String(d.get("description")||"").trim(),
  source:String(d.get("source")||"").trim()||null,
  project:String(d.get("project")||"").trim()||null
 };
 if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(rec.id)||!rec.name||!rec.city||!rec.country||!rec.description||
    !Number.isFinite(rec.longitude)||rec.longitude < -180||rec.longitude>180||
    !Number.isFinite(rec.latitude)||rec.latitude < -85||rec.latitude>85)throw Error("Check required fields and coordinates.");
 if(rec.project&&!/^[a-z0-9][a-z0-9_/-]*\.html$/.test(rec.project))throw Error("Linked project must be a local .html page.");
 return rec;
}
async function refresh(){
 const [subs,pubs]=await Promise.all([
   client.from("atlas_submissions").select("*").order("submitted_at",{ascending:false}),
   client.from("atlas_places").select("*").order("name",{ascending:true})
 ]);
 if(subs.error)throw subs.error;if(pubs.error)throw pubs.error;
 items=subs.data||[];places=pubs.data||[];render();
}
async function commit(action){
 if(busy||!selected)return;
 const isPlace=selected.type==="place";
 try{
  setBusy(true);
  const d=new FormData($("admin-record-form"));
  const note=String(d.get("editor_note")||"").trim()||null;
  let response;
  if(action==="reject"){
   if(!confirm("Reject the proposal for "+selected.item.name+"?"))return;
   response=await client.rpc("atlas_review_submission",{
    p_id:selected.item.id,p_action:"reject",p_record:null,p_note:note
   });
  }else{
   const record=payload();
   if(isPlace){
    record.status=d.get("status")==="draft"?"draft":"published";
    response=await client.from("atlas_places").upsert(record,{onConflict:"id"});
   }else{
    record.status=action==="draft"?"draft":"published";
    response=await client.rpc("atlas_review_submission",{
     p_id:selected.item.id,p_action:"approve",p_record:record,p_note:note
    });
   }
  }
  if(response.error)throw response.error;
  message(action==="reject"?"Proposal rejected.":action==="draft"?"Approved as private draft.":"Record saved and "+(isPlace?"updated.":"approved."));
  show("admin-detail",false);await refresh();
 }catch(e){message("Could not save: "+(e.message||String(e)));}
 finally{setBusy(false);}
}
for(const category of CATEGORIES){
 const option=document.createElement("option");option.value=category.id;option.textContent=category.label;
 $("admin-category").append(option);
}
for(const b of document.querySelectorAll("[data-tab]"))b.onclick=()=>{
 tab=b.dataset.tab;
 for(const btn of document.querySelectorAll("[data-tab]"))btn.setAttribute("aria-pressed",String(btn===b));
 show("admin-detail",false);render();
};
$("admin-close").onclick=()=>show("admin-detail",false);
$("admin-record-form").onsubmit=e=>{e.preventDefault();commit("approve")};
$("admin-draft").onclick=()=>commit("draft");
$("admin-reject").onclick=()=>commit("reject");
$("admin-logout").onclick=async()=>{await client.auth.signOut();location.reload()};
$("admin-login-form").onsubmit=async e=>{
 e.preventDefault();
 const email=String(new FormData(e.currentTarget).get("email"));
 message("Sending login link…");
 const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
 message(error?"Login error: "+error.message:"Check your email for your login link.");
};
async function boot(){
 if(!SUPABASE_URL||!SUPABASE_ANON_KEY||!window.supabase?.createClient){
  show("admin-setup",true);message("Editorial database not connected yet.");return;
 }
 client=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const {data:{session},error}=await client.auth.getSession();
 if(error)throw error;
 if(!session){show("admin-login",true);message("Please sign in as an ARTIFICE editor.");return;}
 const role=await client.rpc("atlas_is_editor");
 if(role.error||role.data!==true){
  message("Access denied. This email is not on the editorial whitelist.");
  await client.auth.signOut();show("admin-login",true);return;
 }
 $("admin-user").textContent="Signed in: "+session.user.email;
 show("admin-workspace",true);message("Editorial access confirmed.");
 await refresh();
}
boot().catch(error=>message("Unable to load dashboard: "+(error.message||String(error))));
