// supabase/functions/atlas-submit/index.ts
// Deploy publicly with verify_jwt=false (see supabase/config.toml).
// This server function checks Turnstile BEFORE inserting an unpublished submission.
// The service-role key is used ONLY on the Supabase server, NEVER on GitHub Pages.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const origins = new Set([
  "https://www.artificepractice.com",
  "https://artificepractice.com"
]);
const headersFor = (origin:string)=>({
  "Access-Control-Allow-Origin": origins.has(origin) ? origin : "https://www.artificepractice.com",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Access-Control-Allow-Headers":"apikey, authorization, content-type, x-client-info",
  "Vary":"Origin"
});
function result(status:number,message:string,origin:string){
 return new Response(JSON.stringify({message}),{
  status, headers:{"Content-Type":"application/json; charset=utf-8",...headersFor(origin)}
 });
}
function short(input:unknown,max:number){return typeof input==="string"?input.trim().slice(0,max):""}
function tagList(input:unknown):string[]{
 if(!Array.isArray(input))return [];
 return [...new Set(input.filter((x):x is string=>typeof x==="string")
   .map(x=>x.trim().toLowerCase()).filter(x=>/^[a-z0-9]+(-[a-z0-9]+)*$/.test(x)&&x.length<=50))].slice(0,12);
}

serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")
   return new Response(null,{status:204,headers:headersFor(origin)});
 if(req.method!=="POST")return result(405,"Method not allowed",origin);
 if(!origins.has(origin))return result(403,"Origin not allowed",origin);

 const size=Number(req.headers.get("content-length")||"0");
 if(size>10000)return result(413,"Request too large",origin);
 let data:Record<string,unknown>;
 try{data=await req.json();if(!data||Array.isArray(data)||typeof data!=="object")throw Error();}
 catch{return result(400,"Invalid request",origin);}
 if(short(data.website,100))return result(400,"Invalid submission",origin); // honeypot
 const token=short(data.turnstileToken,3000);
 if(!token)return result(400,"Spam verification required",origin);
 const secret=Deno.env.get("TURNSTILE_SECRET_KEY");
 const url=Deno.env.get("SUPABASE_URL");
 const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!secret||!url||!serviceKey)return result(503,"Service temporarily unavailable",origin);

 try{
  const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
   method:"POST",
   body:new URLSearchParams({secret,response:token})
  });
  const resultCaptcha=await response.json();
  if(!resultCaptcha.success||
     !["artificepractice.com","www.artificepractice.com"].includes(resultCaptcha.hostname)){
    return result(403,"Spam verification failed",origin);
  }
 }catch{return result(503,"Verification service unavailable",origin);}

 const name=short(data.name,151),city=short(data.city,101),country=short(data.country,101);
 const description=short(data.description,1501),year=short(data.year,51);
 const longitude=Number(data.longitude),latitude=Number(data.latitude);
 const category=short(data.category,61).toLowerCase()||"other";
 const source=short(data.source,1501);
 if(!name||name.length>150||!city||city.length>100||!country||country.length>100||
    description.length<10||description.length>1500||year.length>50||
    !Number.isFinite(longitude)||longitude < -180||longitude>180||
    !Number.isFinite(latitude)||latitude < -85||latitude>85||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(category)||
    (source!=="" && !/^https?:\/\//i.test(source))){
  return result(400,"Please check the place details",origin);
 }
 const db=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await db.from("atlas_submissions").insert({
   name,city,country,description,year,longitude,latitude,
   category,tags:tagList(data.tags),source:source||null,status:"pending"
 });
 if(error){
  console.error("Atlas insert error",error.code);
  return result(503,"Could not save your proposal",origin);
 }
 return result(201,"Proposal received for editorial review",origin);
});
