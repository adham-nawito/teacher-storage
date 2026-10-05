import './style.css';
import {sb} from './supabase.js';
const SYSTEMS=['British','IB','American'],GRADES=[6,7,8,9,10,11,12],FOLDERS=['PPT','Worksheet'],WTYPES=['Fiction','Non-fiction','Analytical Essay'];
const SKILLS=[['Reading Skills','--c1'],['Reading Comprehension','--c2'],['Vocabulary Strategies','--c3'],['Grammar','--c4'],['Writing','--c5']];
const keys=['subject_id','system','grade','skill','writing_type'];
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB';
let user,uid,subjects=[],mats=[],path=[],folder='PPT',mode='in',msg='';
const inPath=(m,p)=>p.every((v,i)=>String(m[keys[i]])===String(v));
const cnt=p=>mats.filter(m=>inPath(m,p)).length;
const list=f=>mats.filter(m=>inPath(m,path)&&m.folder===f);

sb.auth.onAuthStateChange((_e,s)=>{const u=s?.user||null;if(u?.id===uid&&(u||app.innerHTML))return;uid=u?.id;user=u;path=[];u?setTimeout(boot,0):renderAuth()});
async function boot(){await load();render()}
async function load(){const[a,b]=await Promise.all([sb.from('subjects').select('*').order('created_at'),sb.from('materials').select('*').order('created_at',{ascending:false})]);subjects=a.data||[];mats=b.data||[]}

function renderAuth(){
  app.innerHTML=`<div class="auth"><div class="kicker">🧳 Carry-On</div><h1>Your teaching materials, always with you</h1><form id="f"><input name="email" type="email" placeholder="Email" required autocomplete="email"><input name="password" type="password" placeholder="Password (min 6 characters)" minlength="6" required autocomplete="${mode==='in'?'current-password':'new-password'}"><button class="btn">${mode==='in'?'Sign in':'Create account'}</button></form><p class="msg">${esc(msg)}</p><button class="link" id="sw">${mode==='in'?'New here? Create an account':'Have an account? Sign in'}</button></div>`;
  $('#f').onsubmit=async e=>{e.preventDefault();const d=new FormData(e.target),c={email:d.get('email'),password:d.get('password')};
    const r=mode==='in'?await sb.auth.signInWithPassword(c):await sb.auth.signUp(c);
    if(r.error)msg=r.error.message;else if(!r.data.session){msg='Check your email to confirm your account, then sign in.';mode='in'}
    if(r.error||!r.data.session)renderAuth()};
  $('#sw').onclick=()=>{mode=mode==='in'?'up':'in';msg='';renderAuth()};
}

const card=(v,t,s,n,c,i)=>`<button class="card" style="--i:${i};--a:var(${c})" data-v="${esc(v)}"><span>${esc(t)}${s?`<small>${esc(s)}</small>`:''}</span><span class="badge${n?'':' zero'}">${n}</span></button>`;

function render(){
  const L=path.length,sub=subjects.find(s=>s.id===path[0]),leaf=L===5||(L===4&&path[3]!=='Writing');
  const labels=['🏠 Home',sub?.name,path[1],path[2]&&'Grade '+path[2],path[3],path[4]].slice(0,L+1);
  let body='';
  if(L===0)body=`<h2>Your subjects</h2><div class="list">${subjects.map((s,i)=>card(s.id,s.name,'British · IB · American',cnt([s.id]),'--board',i)).join('')||'<p class="empty">Add your first subject below.</p>'}</div><form id="ns" class="row"><input name="n" placeholder="New subject, e.g. English" required maxlength="60"><button class="btn">Add</button></form>`;
  else if(L===1)body=`<h2>Education system</h2><div class="list">${SYSTEMS.map((s,i)=>card(s,s,'Grades 6 – 12',cnt([path[0],s]),'--board',i)).join('')}</div>`;
  else if(L===2)body=`<h2>Level</h2><div class="grid">${GRADES.map((g,i)=>card(g,'Grade '+g,'',cnt([...path,g]),`--c${i%5+1}`,i)).join('')}</div>`;
  else if(L===3)body=`<h2>Skills</h2><div class="list">${SKILLS.map(([n,c],i)=>card(n,n,n==='Writing'?'Fiction · Non-fiction · Analytical Essay':'PPT · Worksheet',cnt([...path,n]),c,i)).join('')}</div>`;
  else if(!leaf)body=`<h2>Writing types</h2><div class="list">${WTYPES.map((n,i)=>card(n,n,'PPT · Worksheet',cnt([...path,n]),'--c5',i)).join('')}</div>`;
  else body=leafHTML();
  app.innerHTML=`<header><div class="wrap"><div class="top"><span class="kicker">🧳 Carry-On</span><button class="link" id="out">Sign out</button></div><h1>${esc(sub?.name||'My subjects')}</h1><nav class="crumbs">${labels.map((t,i)=>(i?'<i>›</i>':'')+`<button data-i="${i}">${esc(t)}</button>`).join('')}</nav></div></header><main>${body}</main>`;
  window.scrollTo(0,0);
  $('#out').onclick=()=>sb.auth.signOut();
  app.querySelectorAll('.crumbs button').forEach(b=>b.onclick=()=>{path=path.slice(0,+b.dataset.i);render()});
  app.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{path=[...path,b.dataset.v];render()});
  if($('#ns'))$('#ns').onsubmit=async e=>{e.preventDefault();const r=await sb.from('subjects').insert({name:new FormData(e.target).get('n').trim()});if(r.error)alert(r.error.message);await load();render()};
  if(leaf)bindLeaf();
}

function leafHTML(){
  const a=path[3]==='Writing'?'--c5':SKILLS.find(s=>s[0]===path[3])[1];
  return `<div style="--a:var(${a})"><div class="tabs">${FOLDERS.map(f=>`<button class="tab" aria-selected="${f===folder}" data-f="${f}">${f==='PPT'?'📊':'📝'} ${f} · ${list(f).length}</button>`).join('')}</div><div class="drop" id="drop"><label class="btn" tabindex="0">＋ Add to ${folder}<input type="file" id="inp" multiple hidden></label><p>or drop files here</p></div><div class="list">${list(folder).map(m=>`<div class="file"><div class="ext">${esc((m.file_name.split('.').pop()||'').slice(0,4))}</div><div class="fi"><b>${esc(m.file_name)}</b><span>${fmt(m.file_size||0)} · ${new Date(m.created_at).toLocaleDateString()}</span></div><button class="ib" data-o="${m.id}">Open</button><button class="ib del" data-x="${m.id}" aria-label="Delete ${esc(m.file_name)}">✕</button></div>`).join('')||'<p class="empty">Nothing in this folder yet.</p>'}</div></div>`;
}

function bindLeaf(){
  app.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{folder=t.dataset.f;render()});
  $('#inp').onchange=e=>add([...e.target.files]);
  const d=$('#drop');d.ondragover=e=>{e.preventDefault();d.classList.add('over')};d.ondragleave=()=>d.classList.remove('over');d.ondrop=e=>{e.preventDefault();add([...e.dataTransfer.files])};
  app.querySelectorAll('[data-o]').forEach(b=>b.onclick=async()=>{const m=mats.find(x=>x.id===b.dataset.o);const{data,error}=await sb.storage.from('materials').createSignedUrl(m.storage_path,60,{download:m.file_name});if(error)return alert(error.message);const a=document.createElement('a');a.href=data.signedUrl;a.click()});
  app.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{const m=mats.find(x=>x.id===b.dataset.x);if(!confirm('Delete '+m.file_name+'?'))return;await sb.storage.from('materials').remove([m.storage_path]);await sb.from('materials').delete().eq('id',m.id);await load();render()});
}

async function add(files){
  const[sid,system,grade,skill,wt]=path;
  for(const f of files){
    const p=`${user.id}/${crypto.randomUUID()}-${f.name.replace(/[^\w.\-]+/g,'_')}`;
    const u=await sb.storage.from('materials').upload(p,f,{contentType:f.type||undefined});
    if(u.error){alert(f.name+': '+u.error.message);continue}
    const r=await sb.from('materials').insert({subject_id:sid,system,grade:+grade,skill,writing_type:wt||null,folder,file_name:f.name,file_size:f.size,mime_type:f.type,storage_path:p});
    if(r.error){alert(r.error.message);await sb.storage.from('materials').remove([p])}
  }
  await load();render();
}
