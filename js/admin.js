(()=>{const $=x=>document.getElementById(x),db=supabase.createClient(ZAMSON_SUPABASE_URL,ZAMSON_SUPABASE_PUBLISHABLE_KEY),bucket="zamson-website";let tab="projects";
const msg=t=>$("msg").textContent=t,esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function admin(session){if(!session){$("login").classList.remove("hidden");$("dash").classList.add("hidden");return}
const {data,error}=await db.from("profiles").select("role,full_name").eq("id",session.user.id).single();
if(error||data?.role!=="admin"){await db.auth.signOut();$("loginMsg").textContent="This account does not have administrator access.";return}
$("login").classList.add("hidden");$("dash").classList.remove("hidden");$("who").textContent="Signed in: "+(data.full_name||session.user.email);await Promise.all([load("projects"),load("news"),load("leadership")]);}
$("loginForm").onsubmit=async e=>{e.preventDefault();$("loginMsg").textContent="Signing in…";const {data,error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error)$("loginMsg").textContent=error.message;else await admin(data.session)};
$("logout").onclick=async()=>{await db.auth.signOut();location.reload()};
async function upload(f){if(!f)return null;if(f.size>8*1024*1024)throw Error("Image must be under 8 MB");let p=Date.now()+"-"+crypto.randomUUID()+"-"+f.name.replace(/[^a-z0-9._-]/gi,"-");let {error}=await db.storage.from(bucket).upload(p,f,{contentType:f.type});if(error)throw error;return db.storage.from(bucket).getPublicUrl(p).data.publicUrl}
async function load(t){let {data,error}=await db.from(t).select("*").order("created_at",{ascending:false});if(error){msg(error.message);return}let target={projects:"pr",news:"nr",leadership:"lrw"}[t];$(target).innerHTML=(data||[]).map(r=>{let title=r.title||r.full_name,sub=t==="projects"?(r.location+" · "+r.status):t==="news"?(r.published?"Published":"Draft"):r.position;return `<tr><td>${esc(title)}<br><small>${esc(sub)}</small></td><td><button data-edit="${r.id}" data-table="${t}">Edit</button><button data-del="${r.id}" data-table="${t}">Delete</button></td></tr>`}).join("")||"<tr><td>No records yet.</td></tr>"}
async function save(t,row,id,file){try{let image=await upload(file);if(image)row[t==="projects"?"image_url":t==="news"?"image_url":"photo_url"]=image;let q=id?db.from(t).update(row).eq("id",id):db.from(t).insert(row);let {error}=await q;if(error)throw error;msg("Saved successfully.");await load(t)}catch(e){msg(e.message)}}
$("pf").onsubmit=e=>{e.preventDefault();save("projects",{title:$("pt").value,location:$("pl").value,status:$("ps").value,description:$("pd").value},$("pid").value,$("pi").files[0])};
$("nf").onsubmit=e=>{e.preventDefault();save("news",{title:$("nt").value,content:$("nc").value,published:$("np").checked},$("nid").value,$("ni").files[0])};
$("lf").onsubmit=e=>{e.preventDefault();save("leadership",{full_name:$("ln").value,position:$("lr").value,biography:$("lb").value},$("lid").value,$("li").files[0])};
[["pc","pf","pid"],["nclear","nf","nid"],["lclear","lf","lid"]].forEach(([b,f,i])=>$(b).onclick=()=>{$(f).reset();$(i).value=""});
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;["projects","news","leadership"].forEach(x=>$(x).classList.toggle("hidden",x!==tab))});
document.addEventListener("click",async e=>{let b=e.target.closest("[data-del],[data-edit]");if(!b)return;let t=b.dataset.table,id=b.dataset.del||b.dataset.edit;if(b.dataset.del){if(confirm("Delete this record?")){let {error}=await db.from(t).delete().eq("id",id);msg(error?error.message:"Deleted.");load(t)}return}
let {data,error}=await db.from(t).select("*").eq("id",id).single();if(error)return msg(error.message);
if(t==="projects"){ $("pid").value=id;$("pt").value=data.title||"";$("pl").value=data.location||"";$("ps").value=data.status||"Upcoming";$("pd").value=data.description||""}
if(t==="news"){$("nid").value=id;$("nt").value=data.title||"";$("nc").value=data.content||"";$("np").checked=!!data.published}
if(t==="leadership"){$("lid").value=id;$("ln").value=data.full_name||"";$("lr").value=data.position||"";$("lb").value=data.biography||""}
});
db.auth.getSession().then(({data})=>admin(data.session));db.auth.onAuthStateChange((ev,s)=>{if(ev==="SIGNED_OUT")admin(null)});
})();
