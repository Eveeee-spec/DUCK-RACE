(() => {
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE = {people:'duckRace.people.v1', rosters:'duckRace.rosters.v1', history:'duckRace.history.v1', groups:'duckRace.groups.v1', settings:'duckRace.settings.v1'};
const GROUP_NAMES=['The Quack Pack','Splash Squad','The Golden Feathers','The Pond Legends','Turbo Ducks','The Bubble Racers','The Waddle Warriors','The Aqua Champs'];
const DUCK_COLORS=['#ffd43b','#ff9c42','#ff6c77','#55d7d2','#8b8df5','#f58fc8','#a4d85d','#5da8ff','#ffbd5c','#d9a2ff','#52c7a0','#ff8870'];
const GROUP_COLORS=['#ffbd43','#42c8e0','#ff777b','#8c85ef','#66c58d','#f18fc1','#ff9456','#5d9df5'];
const defaultSettings={duration:25,speed:2,intensity:'standard',events:2,sound:true,music:false,sfxVolume:55,musicVolume:18};
const state={
 people:load(STORAGE.people,[]), rosters:load(STORAGE.rosters,[]), history:load(STORAGE.history,[]), groups:load(STORAGE.groups,[]),
 settings:{...defaultSettings,...load(STORAGE.settings,{})}, mode:'individual', view:'home', groupList:[], groupsLocked:false, currentRace:null, lastResult:null, raceTimer:null, raf:0, audio:null, musicTimer:null, deferredInstall:null, lastFrame:0, toastTimer:null, countdownTimers:[]
};
function load(key,fallback){try{const x=JSON.parse(localStorage.getItem(key));return x==null?fallback:x}catch{return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{toast('Storage is full. Export a backup or remove old race history.');}}
function uid(){return 'd'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
function view(name){if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;if(name!=='race'){state.countdownTimers.forEach(clearTimeout);state.countdownTimers=[]}state.view=name;$$('.view').forEach(v=>v.classList.toggle('active',v.id===name+'View'));if(name==='home')renderHome();if(name==='participants')renderParticipants();if(name==='setup')renderSetup();if(name==='history')renderHistory();if(name==='settings')renderSettings();window.scrollTo({top:0,behavior:'smooth'})}
function setMode(mode){state.mode=mode;$('#individualModeBtn').classList.toggle('active',mode==='individual');$('#groupModeBtn').classList.toggle('active',mode==='group');$('#individualSetup').hidden=mode!=='individual';$('#groupSetup').hidden=mode!=='group';renderSetup()}
function makeDuck(color='#ffd43b',number=1,accessory='none'){
 const safe=color;
 const helmet=accessory==='helmet'?'<path d="M38 24 Q42 8 61 11 Q78 13 78 31 L39 31Z" fill="#ef5d62" stroke="#c9434c" stroke-width="2"/><path d="M45 21 Q58 14 72 22" fill="none" stroke="#fff5df" stroke-width="3"/>':'';
 const shades=accessory==='shades'?'<g fill="#173d52" stroke="#fff" stroke-width="1.5"><rect x="42" y="35" width="13" height="8" rx="3"/><rect x="59" y="35" width="13" height="8" rx="3"/><path d="M55 38 L59 38" stroke="#173d52" stroke-width="3"/></g>':'';
 return `<svg class="duck-svg" viewBox="0 0 110 100" role="img" aria-label="Glossy rubber duck ${number}">
 <defs><linearGradient id="body${number}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6a1"/><stop offset=".24" stop-color="${safe}"/><stop offset=".68" stop-color="${safe}"/><stop offset="1" stop-color="#d38a1e"/></linearGradient><linearGradient id="beak${number}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffc05c"/><stop offset="1" stop-color="#ef7027"/></linearGradient><radialGradient id="shine${number}" cx=".25" cy=".15" r=".85"><stop stop-color="#fff" stop-opacity=".9"/><stop offset=".42" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><filter id="soft${number}" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="1.5"/></filter></defs>
 <ellipse cx="54" cy="87" rx="36" ry="7" fill="#064965" opacity=".22" filter="url(#soft${number})"/>
 <path d="M20 68 Q10 65 12 57 Q15 52 25 58 L37 62Z" fill="${safe}" stroke="#d99b25" stroke-width="1.2"/>
 <ellipse cx="53" cy="62" rx="39" ry="25" fill="url(#body${number})" stroke="#d89c25" stroke-width="1.3"/>
 <ellipse cx="43" cy="53" rx="24" ry="12" fill="url(#shine${number})" opacity=".85"/>
 <path d="M43 48 Q35 32 43 20 Q51 7 65 14 Q78 20 76 37 L70 53Z" fill="url(#body${number})" stroke="#d99b25" stroke-width="1.3"/>
 <ellipse cx="56" cy="24" rx="16" ry="13" fill="url(#shine${number})" opacity=".55"/>
 <path d="M72 34 Q91 31 99 40 Q92 48 73 44Z" fill="url(#beak${number})" stroke="#d86624" stroke-width="1.2"/>
 <path d="M76 37 Q87 36 94 40" fill="none" stroke="#ffe1a0" stroke-width="2" stroke-linecap="round"/>
 <ellipse cx="64" cy="30" rx="4.2" ry="5" fill="#182b35"/><ellipse cx="65.2" cy="28.5" rx="1.4" ry="1.6" fill="#fff"/>
 <path d="M39 67 Q50 79 70 72" fill="none" stroke="#fff7bd" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
 <path d="M28 72 Q44 84 59 79" fill="none" stroke="#b97818" stroke-width="1.5" opacity=".55"/>
 ${helmet}${shades}
 <circle cx="31" cy="55" r="4" fill="#fff" opacity=".55"/><path d="M34 49 Q45 41 51 45" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
 <g transform="translate(18 66)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#d4e9ef" stroke-width="1"/><text x="0" y="3.1" text-anchor="middle" font-size="8" font-weight="900" fill="#17475b">${number}</text></g>
 </svg>`;
}
function duckHTML(color,num,accessory='none',cls=''){return `<div class="${cls}">${makeDuck(color,num,accessory)}</div>`}
function currentPeople(){return state.people.map(p=>({...p}))}
function renderHome(){
 $('#homeRaceCount').textContent=state.history.length;
 $('#homeParticipantCount').textContent=state.people.length;
 $('#homeWinner').textContent=state.history[0]?.winner?.name||'—';
 const hero=$('#heroDuck');if(hero&&!hero.dataset.ready){hero.innerHTML=makeDuck('#ffd43b',1,'shades');hero.dataset.ready='1'}
 const recent=$('#recentRaces');
 if(!state.history.length){recent.innerHTML='<p class="empty-state">Your race highlights will show up here.</p>';return}
 recent.innerHTML=state.history.slice(0,4).map(r=>`<div class="recent-row"><span class="mini-medal">🏆</span><div><strong>${escapeHtml(r.winner?.name||'Race complete')}</strong><small>${r.mode==='group'?'Group race':'Individual race'} · ${r.entries?.length||0} racers</small></div><span class="result-time">${new Date(r.date).toLocaleDateString()}</span></div>`).join('');
}
function renderParticipants(){
 const q=($('#participantSearch')?.value||'').trim().toLowerCase();
 $('#rosterCount').textContent=`${state.people.length} students`;$('#rosterFooterCount').textContent=`${state.people.length} participants`;
 const list=$('#participantList'),matches=state.people.map((p,i)=>({...p,index:i})).filter(p=>p.name.toLowerCase().includes(q));
 list.innerHTML=matches.length?matches.map(p=>`<div class="participant-row" data-id="${p.id}"><span class="participant-num">${p.index+1}</span><input class="participant-edit" aria-label="Participant name" value="${escapeHtml(p.name)}" maxlength="80" data-id="${p.id}"><button class="row-delete" data-delete-person="${p.id}" aria-label="Delete ${escapeHtml(p.name)}">×</button></div>`).join(''):'<p class="empty-state">No participants found. Add names above to get started.</p>';
 renderSavedRosters();
}
function addNames(raw){const names=raw.split(/\r?\n/).map(n=>n.trim()).filter(Boolean);if(!names.length){toast('Enter at least one name first.');return}names.forEach(name=>state.people.push({id:uid(),name}));save(STORAGE.people,state.people);renderParticipants();renderSetup();toast(`${names.length} participant${names.length===1?'':'s'} added!`)}
function renderSavedRosters(){
 const el=$('#savedRosters');if(!state.rosters.length){el.innerHTML='<p class="muted">No saved rosters yet.</p>';return}
 el.innerHTML=state.rosters.map(r=>`<div class="saved-item"><strong>${escapeHtml(r.name)}</strong><span>${r.people.length} names</span><button data-load-roster="${r.id}">Load</button><button class="delete-saved" data-delete-roster="${r.id}">×</button></div>`).join('');
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function renderSetup(){
 $('#individualCount').textContent=`${state.people.length} ducks`;
 const preview=$('#individualPreview');
 if(!state.people.length)preview.innerHTML='<p class="empty-state">No students yet. Add participants in Manage Participants first.</p>';
 else preview.innerHTML=state.people.slice(0,80).map((p,i)=>`<div class="preview-racer"><div class="duck-mini">${makeDuck(DUCK_COLORS[i%DUCK_COLORS.length],i+1,i%7===3?'helmet':'none')}</div><strong title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</strong><small>LANE ${String(i+1).padStart(2,'0')}</small></div>`).join('')+(state.people.length>80?`<p class="muted">Showing first 80 of ${state.people.length} students.</p>`:'');
 $('#groupCount').textContent=`${state.groupList.length} groups`;
 renderGroupEditor();renderSavedGroups();
 $('#durationSetting').value=state.settings.duration;$('#durationValue').textContent=`${state.settings.duration} sec`;
 $('#speedSetting').value=state.settings.speed;$('#speedValue').textContent=['','Slow','Standard','Fast'][state.settings.speed];
 $('#intensitySetting').value=state.settings.intensity;$('#eventSetting').value=state.settings.events;$('#eventValue').textContent=['Off','Low','Normal','High'][state.settings.events];
 $('#soundSetting').checked=state.settings.sound;$('#musicSetting').checked=state.settings.music;
}
function generateGroups(){
 if(state.groupsLocked&&state.groupList.length){toast('Groups are locked. Unlock them to regenerate.');return}
 const people=shuffle(currentPeople());if(!people.length){toast('Add participants before making groups.');return}
 const method=$('input[name="groupMethod"]:checked').value;let amount=Math.max(1,Math.min(40,parseInt($('#groupAmount').value,10)||5));let count=method==='count'?Math.min(amount,people.length):Math.ceil(people.length/amount);
 state.groupList=Array.from({length:count},(_,i)=>({id:uid(),name:GROUP_NAMES[i%GROUP_NAMES.length],color:GROUP_COLORS[i%GROUP_COLORS.length],members:[]}));
 people.forEach((p,i)=>state.groupList[i%count].members.push(p.id));
 // Distribute shuffled list round-robin; group sizes differ by at most one.
 state.groupList.forEach(g=>g.members=g.members.map(id=>people.find(p=>p.id===id)).filter(Boolean));
 state.groupList=state.groupList.map(g=>({...g,members:g.members.map(p=>p.id)}));
 save(STORAGE.groups,state.groupList);renderSetup();toast(`${state.groupList.length} balanced groups created.`);
}
function renderGroupEditor(){
 const el=$('#groupsEditor');if(!state.groupList.length){el.innerHTML='<p class="empty-state">Generate groups to see teams here. Every student will be assigned.</p>';return}
 el.innerHTML=state.groupList.map((g,i)=>`<div class="group-edit-card" data-group="${g.id}"><div class="group-edit-top"><span class="group-color-dot" style="background:${g.color}"></span><input data-group-name="${g.id}" value="${escapeHtml(g.name)}" aria-label="Group name"><span class="count-badge">${g.members.length}</span></div><div class="member-tags">${g.members.map(id=>{const p=state.people.find(x=>x.id===id);return p?`<span class="member-tag">${escapeHtml(p.name)} <button data-move-member="${id}" data-from-group="${g.id}" title="Move to another group">↗</button></span>`:''}).join('')||'<span class="muted">No members</span>'}</div><div class="group-edit-actions"><button data-rename-suggest="${g.id}">Suggest name</button><button data-move-menu="${g.id}">Move a member</button></div></div>`).join('');
}
function renderSavedGroups(){const el=$('#savedGroups');if(!state.groups.length){el.innerHTML='';return}el.innerHTML=state.groups.map(g=>`<div class="saved-item"><strong>${escapeHtml(g.name)}</strong><span>${g.groups.length} teams</span><button data-load-groups="${g.id}">Load</button><button class="delete-saved" data-delete-groups="${g.id}">×</button></div>`).join('')}
function buildEntries(){
 if(state.mode==='individual')return shuffle(currentPeople()).map((p,i)=>({id:p.id,name:p.name,color:DUCK_COLORS[i%DUCK_COLORS.length],number:i+1,memberCount:1}));
 return state.groupList.map((g,i)=>({id:g.id,name:g.name,color:g.color||GROUP_COLORS[i%GROUP_COLORS.length],number:i+1,memberCount:g.members.length,members:g.members.map(id=>state.people.find(p=>p.id===id)?.name).filter(Boolean)})).filter(g=>g.memberCount>0);
}
function showPreview(){if(!state.people.length){toast('Add participants first, then start a race.');view('participants');return}if(state.mode==='group'&&!state.groupList.length){generateGroups();if(!state.groupList.length)return}const entries=buildEntries();if(!entries.length){toast('There are no racers to start.');return}state.currentRace={mode:state.mode,entries,finished:false};view('race');setupRaceTrack();resetRaceUI();$('#raceTitle').textContent=state.mode==='group'?'GROUP GRAND PRIX':'INDIVIDUAL GRAND PRIX';$('#raceStatus').textContent='READY';$('#goBtn').disabled=false;$('#pauseBtn').disabled=true;$('#skipBtn').disabled=false;$('#countdownOverlay').style.display='none';$('#winnerOverlay').hidden=true;$('#progressFill').style.width='0%';$('#progressPercent').textContent='0%';$('#progressLabel').textContent='READY ON THE STARTING LINE';$('#eventLog').innerHTML='<p class="muted">The race announcer is ready…</p>';$('#leaderboardCount').textContent=`${entries.length} racers`;renderLeaderboard();toast(`${entries.length} racers are at the starting line!`)}
function setupRaceTrack(){
 const track=$('#trackLanes');const entries=state.currentRace.entries;const compact=$('#compactMode').checked||entries.length>18;
 const laneH=entries.length>28?30:entries.length>18?34:entries.length>10?39:48;
 track.style.setProperty('--lane-height',laneH+'px');
 track.innerHTML=entries.map((e,i)=>`<div class="race-lane" data-lane="${e.id}" style="--lane-height:${laneH}px;height:${laneH}px"><span class="lane-number">${String(i+1).padStart(2,'0')}</span><span class="lane-ripple" data-ripple="${e.id}"></span><div class="race-duck-wrap" data-duck="${e.id}" style="--progress:0%;width:${entries.length>28?'31px':entries.length>18?'37px':'clamp(35px,5.8vw,60px)'}">${makeDuck(e.color,e.number,e.number%9===0?'helmet':e.number%7===0?'shades':'none')}<span class="duck-label">${escapeHtml(e.name)}</span></div></div>`).join('');
 if(compact)$('#track').classList.add('compact-track');else $('#track').classList.remove('compact-track');
 $('#track').style.minHeight=Math.max(210,entries.length*laneH+20)+'px';
}
function resetRaceUI(){if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;state.currentRace.entries.forEach(e=>{e.progress=0;e.speed=0;e.accel=0;e.eventUntil=0;e.finishTime=null;e.finished=false});state.currentRace.startedAt=null;state.currentRace.elapsed=0;state.currentRace.paused=false;state.currentRace.finished=false;state.currentRace.events=[];state.currentRace.manual=false;$('#winnerOverlay').hidden=true;$('#countdownOverlay').style.display='none';$('#eventBanner').classList.remove('show');$('#finishConfetti').innerHTML='';$('#goBtn').disabled=false;$('#pauseBtn').disabled=true;$('#pauseBtn').textContent='Ⅱ Pause';$('#progressFill').style.width='0%';$('#progressPercent').textContent='0%';$('#progressLabel').textContent='READY ON THE STARTING LINE';$('#raceStatus').textContent='READY';$('#eventLog').innerHTML='<p class="muted">The race announcer is ready…</p>'}
function startCountdown(){
 if(!state.currentRace||state.currentRace.finished)return;
 $('#goBtn').disabled=true;$('#pauseBtn').disabled=true;$('#countdownOverlay').style.display='flex';
 const overlay=$('#countdownOverlay'),num=$('#countdownNumber');let count=3;num.textContent=count;$('#raceStatus').textContent='GET READY';playTone(480,.1,'sine');
 const tick=()=>{if(!state.currentRace||state.view!=='race')return;if(count>1){count--;num.textContent=count;playTone(430+count*60,.12,'sine');state.countdownTimers.push(setTimeout(tick,800))}else{num.textContent='GO!';num.style.fontSize='clamp(65px,12vw,110px)';playTone(160,.45,'sawtooth');state.countdownTimers.push(setTimeout(()=>{if(state.view!=='race')return;overlay.style.display='none';num.style.fontSize='';beginRace()},550))}};
 state.countdownTimers.push(setTimeout(tick,800));
}
function beginRace(){
 const r=state.currentRace;if(!r||r.finished)return;
 const now=performance.now();r.startedAt=now;r.lastNow=now;r.elapsed=0;r.paused=false;r.duration=state.settings.duration*1000;r.events=[];r.entries.forEach(e=>{e.speed=.19+Math.random()*.05;e.accel=0;e.progress=0;e.eventUntil=0;e.finished=false;e.finishTime=null});
 $('#raceStatus').textContent='● LIVE';$('#pauseBtn').disabled=false;$('#goBtn').disabled=true;$('#progressLabel').textContent='THE POND IS IN MOTION!';
 logEvent('🏁','And they’re off! Every duck has a fresh chance at glory.');state.lastFrame=now;state.raf=requestAnimationFrame(frameRace);
 if(state.settings.music)startMusic();
}
function frameRace(now){
 const r=state.currentRace;if(!r||r.finished||r.paused)return;
 const dt=Math.min(0.06,Math.max(0,(now-(r.lastNow||now))/1000));r.lastNow=now;r.elapsed=now-r.startedAt;
 const duration=r.duration||25000;const intensity={casual:.48,standard:.8,chaotic:1.25}[state.settings.intensity]||.8;
 const speedFactor=[0,.72,1,1.28][state.settings.speed]||1;
 r.entries.forEach(e=>{
   if(e.finished)return;
   const t=r.elapsed/1000;const base=(1/duration)*1000*(.92+Math.random()*.16)*speedFactor*intensity;
   // Each duck gets independent small fluctuations and event-driven changes. Position is monotonic.
   const wave=Math.sin(t*(.65+e.number*.013)+e.number*2.1)*.11;
   const jitter=(Math.random()-.5)*.18*intensity;
   let factor=Math.max(.58,Math.min(1.48,1+wave*intensity+jitter*intensity+e.accel));
   if(r.elapsed<900)factor*=.72;
   if(r.elapsed>duration*.76)factor+=Math.random()*.13;
   // Keep average progress tied to configured duration; intensity changes variance, not a built-in advantage.
   let step=(dt/duration)*100*speedFactor*factor;
   // normalize to complete within configured duration while preserving relative race variation
   step=Math.max(0,step);
   e.progress=Math.min(100,e.progress+step);
   e.accel*=Math.max(0,1-dt*.65);
   if(state.settings.events>0&&Math.random()<dt*state.settings.events*.19&&!e.finished){triggerRandomEvent(e,r)}
   if(e.progress>=100){e.progress=100;e.finished=true;e.finishTime=r.elapsed/1000}
   const wrap=$(`[data-duck="${e.id}"]`);if(wrap){wrap.style.setProperty('--progress',e.progress+'%');wrap.classList.toggle('finished',e.finished)}
   const ripple=$(`[data-ripple="${e.id}"]`);if(ripple)ripple.style.setProperty('--progress',e.progress+'%');
 });
 updateProgress();renderLeaderboard();
 const finishers=r.entries.filter(e=>e.finished).length;
 if(finishers===r.entries.length){finishRace(false);return}
 state.raf=requestAnimationFrame(frameRace);
}
function triggerRandomEvent(e,r){
 const types=state.settings.intensity==='casual'?['SPLASH BOOST','BUBBLE BOOST','WATER CURRENT']:state.settings.intensity==='chaotic'?['SPLASH BOOST','BUBBLE BOOST','WATER CURRENT','SLOWDOWN','LANE CURRENT','LAST-MINUTE SPRINT']:['SPLASH BOOST','BUBBLE BOOST','WATER CURRENT','SLOWDOWN','LAST-MINUTE SPRINT'];
 const type=types[Math.floor(Math.random()*types.length)];const event={type,name:e.name,time:r.elapsed/1000};r.events.push(event);
 const mods={'SPLASH BOOST':.24,'BUBBLE BOOST':.20,'WATER CURRENT':.13,'SLOWDOWN':-.20,'LANE CURRENT':.17,'LAST-MINUTE SPRINT':.28};
 e.accel=Math.max(-.25,Math.min(.4,(e.accel||0)+mods[type]));
 const icon={'SPLASH BOOST':'💦','BUBBLE BOOST':'🫧','WATER CURRENT':'🌊','SLOWDOWN':'🐌','LANE CURRENT':'💨','LAST-MINUTE SPRINT':'⚡'}[type];
 showBanner(`${icon} ${e.name}: ${type}!`);logEvent(icon,`<strong>${escapeHtml(e.name)}</strong> ${type.toLowerCase().replaceAll('-',' ')}!`);
 playTone(type==='SLOWDOWN'?180:650,.09,type==='BUBBLE BOOST'?'sine':'triangle');
}
function showBanner(msg){const el=$('#eventBanner');el.textContent=msg;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),1600)}
function logEvent(icon,msg){const log=$('#eventLog');if(log.querySelector('.muted'))log.innerHTML='';const row=document.createElement('div');row.className='event-entry';row.innerHTML=`<span>${icon}</span><div>${msg}<br><small>${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</small></div>`;log.prepend(row);while(log.children.length>30)log.lastElementChild.remove()}
function updateProgress(){const r=state.currentRace;if(!r)return;const avg=r.entries.reduce((s,e)=>s+e.progress,0)/Math.max(1,r.entries.length);$('#progressFill').style.width=avg+'%';$('#progressPercent').textContent=Math.round(avg)+'%';$('#progressLabel').textContent=`${r.entries.filter(e=>e.finished).length} OF ${r.entries.length} DUCKS FINISHED`}
function renderLeaderboard(){
 const r=state.currentRace;if(!r)return;
 const ordered=[...r.entries].sort((a,b)=>b.progress-a.progress);
 $('#leaderboard').innerHTML=ordered.map((e,i)=>`<div class="leader-row"><span class="leader-rank">${e.finished?`#${i+1}`:i+1}</span><div class="leader-avatar">${makeDuck(e.color,e.number)}</div><div><span class="leader-name">${escapeHtml(e.name)}</span><span class="leader-meta">${e.finished?'FINISHED':`${Math.round(e.progress)}% progress`}</span><div class="leader-progress"><div style="width:${e.progress}%"></div></div></div><span class="leader-percent">${e.finished?`${e.finishTime.toFixed(2)}s`:`${Math.round(e.progress)}%`}</span></div>`).join('');
}
function pauseRace(){const r=state.currentRace;if(!r||!r.startedAt||r.finished)return;if(!r.paused){r.paused=true;r.pauseAt=performance.now();if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;$('#pauseBtn').textContent='▶ Resume';$('#raceStatus').textContent='PAUSED';$('#progressLabel').textContent='TIME OUT — DUCKS HOLD POSITION';stopMusic()}else{r.paused=false;const now=performance.now();r.startedAt+=now-r.pauseAt;r.lastNow=now;$('#pauseBtn').textContent='Ⅱ Pause';$('#raceStatus').textContent='● LIVE';state.raf=requestAnimationFrame(frameRace);if(state.settings.music)startMusic()}}
function finishRace(manual=false){
 const r=state.currentRace;if(!r||r.finished)return;
 if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;r.finished=true;r.manual=manual;
 const remaining=r.entries.filter(e=>!e.finished).sort((a,b)=>b.progress-a.progress);
 if(manual){let time=r.elapsed/1000;remaining.forEach((e,i)=>{e.progress=100;e.finished=true;e.finishTime=time+(i+1)*.001})}
 const ranking=[...r.entries].sort((a,b)=>{if(a.finishTime==null&&b.finishTime==null)return b.progress-a.progress;if(a.finishTime==null)return 1;if(b.finishTime==null)return -1;return a.finishTime-b.finishTime});
 // For a natural finish, the first crossing is the official winner; ties use the earliest high-resolution finish timestamp.
 ranking.forEach((e,i)=>{e.rank=i+1;const w=$(`[data-duck="${e.id}"]`);if(w){w.style.setProperty('--progress','100%');w.classList.add('finished')}});
 r.ranking=ranking;r.endedAt=new Date().toISOString();r.durationActual=r.elapsed/1000;stopMusic();$('#raceStatus').textContent=manual?'MANUAL FINISH':'RACE COMPLETE';$('#pauseBtn').disabled=true;$('#skipBtn').disabled=true;$('#goBtn').disabled=true;$('#progressFill').style.width='100%';$('#progressPercent').textContent='100%';$('#progressLabel').textContent=manual?'MANUAL OVERRIDE — RESULTS RECORDED':'CHECKERED FLAG! THE RACE IS COMPLETE';
 playTone(740,.2,'triangle');setTimeout(()=>playTone(980,.35,'sine'),180);createConfetti();showWinner(ranking,manual);
 const record={id:uid(),mode:r.mode,date:r.endedAt,winner:{id:ranking[0].id,name:ranking[0].name,color:ranking[0].color,number:ranking[0].number},entries:ranking.map(e=>({id:e.id,name:e.name,color:e.color,number:e.number,memberCount:e.memberCount||1,members:e.members||[],finishTime:e.finishTime,progress:e.progress})),duration:r.durationActual,manual,events:r.events.slice(-30),intensity:state.settings.intensity};
 state.lastResult=record;state.history.unshift(record);state.history=state.history.slice(0,500);save(STORAGE.history,state.history);renderHome();
}
function showWinner(ranking,manual){
 const winner=ranking[0];$('#winnerName').textContent=winner.name;$('#winnerDuck').innerHTML=makeDuck(winner.color,winner.number,'helmet');$('#winnerSub').textContent=manual?'MANUAL FINISH — OFFICIAL OVERRIDE':'THE CHAMPION OF THE POND!';$('#podiumTop').textContent=ranking.slice(0,3).map((e,i)=>`${['🥇','🥈','🥉'][i]} ${e.name}`).join('   •   ');$('#winnerOverlay').hidden=false;
}
function createConfetti(){const el=$('#finishConfetti');el.innerHTML='';const colors=['#ffdf4e','#ff7777','#fff','#56e0e7','#f79ed0','#9b8cff'];for(let i=0;i<80;i++){const p=document.createElement('i');p.className='confetti-piece';p.style.left=Math.random()*100+'%';p.style.background=colors[i%colors.length];p.style.animationDelay=Math.random()*.8+'s';p.style.transform=`rotate(${Math.random()*360}deg)`;el.appendChild(p)}}
function openResults(record=state.lastResult){if(!record){toast('Complete a race first.');return}state.lastResult=record;view('results');$('#resultsMeta').textContent=`${record.mode==='group'?'Group race':'Individual race'} · ${new Date(record.date).toLocaleString()} · ${record.duration.toFixed(2)} seconds${record.manual?' · Manual override':''}`;const podium=$('#resultsPodium'),top=record.entries.slice(0,3);const places=[1,0,2];podium.innerHTML=places.filter(i=>top[i]).map(i=>{const e=top[i];return `<div class="podium-card ${i===0?'first':''}"><div class="podium-place">${['🥇','🥈','🥉'][i]}</div><div class="podium-duck">${makeDuck(e.color,e.number,i===0?'helmet':'none')}</div><h3>${escapeHtml(e.name)}</h3><p>${e.memberCount>1?`${e.memberCount} team members`:'Racer'} · ${e.finishTime==null?'—':e.finishTime.toFixed(2)+'s'}</p><strong>${['FIRST PLACE','SECOND PLACE','THIRD PLACE'][i]}</strong></div>`}).join('');
 $('#resultsTable').innerHTML='<div class="result-table-row header"><span>PLACE</span><span>RACER</span><span>TIME</span><span>TYPE</span></div>'+record.entries.map((e,i)=>`<div class="result-table-row"><span><b class="place-pill">#${i+1}</b></span><span><strong>${escapeHtml(e.name)}</strong>${e.members?.length?`<small class="muted" style="display:block">${escapeHtml(e.members.join(', '))}</small>`:''}</span><span>${e.finishTime==null?'—':e.finishTime.toFixed(2)+' s'}</span><span>${record.manual?'Override':record.mode==='group'?'Group':'Individual'}</span></div>`).join('');
}
function renderHistory(){const q=($('#historySearch')?.value||'').toLowerCase(),filter=$('#historyFilter')?.value||'all';const rows=state.history.filter(r=>(filter==='all'||r.mode===filter)&&(`${r.winner?.name} ${r.entries?.map(e=>e.name).join(' ')}`).toLowerCase().includes(q));const el=$('#historyList');if(!rows.length){el.innerHTML='<div class="panel empty-state">No races match this search yet. Finish a race and it will appear here.</div>';return}el.innerHTML=rows.map(r=>`<article class="history-card"><div class="history-trophy">🏆</div><div class="history-main"><h3>${escapeHtml(r.winner?.name||'Race results')}</h3><p>${r.mode==='group'?'Group race':'Individual race'} · ${r.entries.length} racers · ${new Date(r.date).toLocaleString()}<br>${r.duration.toFixed(2)} seconds${r.manual?' · Manual override':''} · ${escapeHtml(r.intensity||'standard')} mode</p></div><div class="history-actions"><button data-open-history="${r.id}">View results</button><button data-replay-history="${r.id}">Replay reveal</button><button class="danger-text" data-delete-history="${r.id}">Delete</button></div></article>`).join('')}
function csvEscape(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function exportCSV(record=null){const races=record?[record]:state.history;if(!races.length){toast('There are no results to export yet.');return}const rows=[['Race ID','Date','Race Type','Place','Racer / Group','Members','Finish Time (s)','Winner','Manual Override','Random Events']];races.forEach(r=>r.entries.forEach((e,i)=>rows.push([r.id,r.date,r.mode,i+1,e.name,(e.members||[]).join('; '),e.finishTime==null?'':Number(e.finishTime).toFixed(3),r.winner?.name||'',r.manual?'Yes':'No',(r.events||[]).map(x=>`${x.name}: ${x.type}`).join('; ')])));const csv=rows.map(row=>row.map(csvEscape).join(',')).join('\r\n');downloadBlob('\ufeff'+csv,'duck-race-results.csv','text/csv;charset=utf-8')}
function downloadBlob(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function audioCtx(){if(!state.audio){const C=window.AudioContext||window.webkitAudioContext;if(C)state.audio=new C()}if(state.audio?.state==='suspended')state.audio.resume();return state.audio}
function playTone(freq=440,duration=.12,wave='sine'){if(!state.settings.sound||$('#muteRaceBtn')?.textContent.includes('Sound off'))return;try{const c=audioCtx();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=wave;o.frequency.setValueAtTime(freq,c.currentTime);g.gain.setValueAtTime((state.settings.sfxVolume/100)*.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration)}catch{}}
function startMusic(){if(!state.settings.music||state.musicTimer)return;let n=0;const notes=[261.6,329.6,392,329.6,293.7,349.2,440,349.2];state.musicTimer=setInterval(()=>{if(state.currentRace?.paused||state.view!=='race')return;try{const c=audioCtx();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=notes[n++%notes.length];g.gain.value=(state.settings.musicVolume/100)*.035;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.3);o.stop(c.currentTime+.3)}catch{}},380)}
function stopMusic(){if(state.musicTimer){clearInterval(state.musicTimer);state.musicTimer=null}}
function renderSettings(){$('#globalSound').checked=state.settings.sound;$('#globalMusic').checked=state.settings.music;$('#sfxVolume').value=state.settings.sfxVolume;$('#musicVolume').value=state.settings.musicVolume;$('#sfxVolumeText').textContent=state.settings.sfxVolume+'%';$('#musicVolumeText').textContent=state.settings.musicVolume+'%'}
function persistSettings(){save(STORAGE.settings,state.settings)}
function exportBackup(){downloadBlob(JSON.stringify({version:1,people:state.people,rosters:state.rosters,history:state.history,groups:state.groups,settings:state.settings},null,2),'duck-race-backup.json','application/json')}
function importBackup(file){const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!d||!Array.isArray(d.people)||!Array.isArray(d.history))throw Error('Invalid backup');state.people=d.people;state.rosters=Array.isArray(d.rosters)?d.rosters:[];state.history=Array.isArray(d.history)?d.history:[];state.groups=Array.isArray(d.groups)?d.groups:[];state.settings={...defaultSettings,...(d.settings||{})};Object.entries({people:state.people,rosters:state.rosters,history:state.history,groups:state.groups,settings:state.settings}).forEach(([k,v])=>save(STORAGE[k],v));renderHome();toast('Backup imported successfully.');}catch{toast('That backup file could not be read.')}};reader.readAsText(file)}
// Navigation and controls
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-view]');if(nav){const target=nav.dataset.view;if(target==='setup'&&nav.dataset.mode)setMode(nav.dataset.mode);view(target);return}
 const del=e.target.closest('[data-delete-person]');if(del){state.people=state.people.filter(p=>p.id!==del.dataset.deletePerson);save(STORAGE.people,state.people);renderParticipants();renderSetup();return}
 const loadR=e.target.closest('[data-load-roster]');if(loadR){const r=state.rosters.find(x=>x.id===loadR.dataset.loadRoster);if(r&&confirm(`Load "${r.name}"? This replaces the current class list.`)){state.people=r.people.map(p=>({...p}));save(STORAGE.people,state.people);renderParticipants();renderSetup();toast('Roster loaded.')}return}
 const delR=e.target.closest('[data-delete-roster]');if(delR){state.rosters=state.rosters.filter(x=>x.id!==delR.dataset.deleteRoster);save(STORAGE.rosters,state.rosters);renderSavedRosters();return}
 const loadG=e.target.closest('[data-load-groups]');if(loadG){const g=state.groups.find(x=>x.id===loadG.dataset.loadGroups);if(g){state.groupList=JSON.parse(JSON.stringify(g.groups));state.groupsLocked=false;renderSetup();toast('Group arrangement loaded.')}return}
 const delG=e.target.closest('[data-delete-groups]');if(delG){state.groups=state.groups.filter(x=>x.id!==delG.dataset.deleteGroups);save(STORAGE.groups,state.groups);renderSavedGroups();return}
 const rename=e.target.closest('[data-rename-suggest]');if(rename){const g=state.groupList.find(x=>x.id===rename.dataset.renameSuggest);if(g)g.name=GROUP_NAMES[Math.floor(Math.random()*GROUP_NAMES.length)];renderGroupEditor();return}
 const move=e.target.closest('[data-move-member]');if(move){const id=move.dataset.moveMember,from=state.groupList.find(g=>g.id===move.dataset.fromGroup),others=state.groupList.filter(g=>g.id!==from.id);if(!others.length){toast('Create at least two groups to move members.');return}const target=others[0];from.members=from.members.filter(x=>x!==id);target.members.push(id);renderGroupEditor();return}
 const moveMenu=e.target.closest('[data-move-menu]');if(moveMenu){const g=state.groupList.find(x=>x.id===moveMenu.dataset.moveMenu);if(!g?.members.length){toast('This group has no members to move.');return}const id=g.members[0],target=state.groupList.find(x=>x.id!==g.id);if(target){g.members.shift();target.members.push(id);renderGroupEditor();toast(`Moved ${state.people.find(p=>p.id===id)?.name||'participant'} to ${target.name}.`)}return}
 const open=e.target.closest('[data-open-history]');if(open){openResults(state.history.find(r=>r.id===open.dataset.openHistory));return}
 const replay=e.target.closest('[data-replay-history]');if(replay){openResults(state.history.find(r=>r.id===replay.dataset.replayHistory));return}
 const delH=e.target.closest('[data-delete-history]');if(delH){if(confirm('Delete this race record?')){state.history=state.history.filter(r=>r.id!==delH.dataset.deleteHistory);save(STORAGE.history,state.history);renderHistory();renderHome()}return}
});
$('#addNameBtn').addEventListener('click',()=>{const n=$('#singleName').value.trim();if(!n){toast('Type a participant name first.');return}addNames(n);$('#singleName').value='';$('#singleName').focus()});
$('#singleName').addEventListener('keydown',e=>{if(e.key==='Enter')$('#addNameBtn').click()});
$('#addBulkBtn').addEventListener('click',()=>{addNames($('#bulkNames').value);$('#bulkNames').value=''});
$('#clearBulkBtn').addEventListener('click',()=>$('#bulkNames').value='');
$('#participantSearch').addEventListener('input',renderParticipants);
$('#participantList').addEventListener('change',e=>{if(e.target.matches('.participant-edit')){const p=state.people.find(p=>p.id===e.target.dataset.id);if(p){p.name=e.target.value.trim()||'Unnamed racer';save(STORAGE.people,state.people);renderParticipants();renderSetup()}}});
$('#shuffleRosterBtn').addEventListener('click',()=>{state.people=shuffle(state.people);save(STORAGE.people,state.people);renderParticipants();toast('Roster shuffled.')});
$('#clearRosterBtn').addEventListener('click',()=>{if(confirm('Clear every participant from the current class list? Saved rosters remain safe.')){state.people=[];state.groupList=[];save(STORAGE.people,state.people);renderParticipants();renderSetup()}});
$('#saveRosterBtn').addEventListener('click',()=>{if(!state.people.length){toast('Add participants before saving a roster.');return}const name=$('#rosterName').value.trim()||`Class roster ${state.rosters.length+1}`;state.rosters.unshift({id:uid(),name,people:currentPeople()});save(STORAGE.rosters,state.rosters);$('#rosterName').value='';renderSavedRosters();toast('Roster saved on this device.')});
$('#individualModeBtn').addEventListener('click',()=>setMode('individual'));$('#groupModeBtn').addEventListener('click',()=>setMode('group'));
$('#generateGroupsBtn').addEventListener('click',generateGroups);$('#regenerateGroupsBtn').addEventListener('click',generateGroups);
$('#lockGroups').addEventListener('change',e=>{state.groupsLocked=e.target.checked;toast(state.groupsLocked?'Groups locked.':'Groups unlocked.')});
$('#groupsEditor').addEventListener('change',e=>{if(e.target.matches('[data-group-name]')){const g=state.groupList.find(x=>x.id===e.target.dataset.groupName);if(g){g.name=e.target.value.trim()||'Unnamed group';renderGroupEditor()}}});
$('#saveGroupsBtn').addEventListener('click',()=>{if(!state.groupList.length){toast('Generate groups first.');return}const name=prompt('Name this group arrangement:','Class teams');if(name===null)return;state.groups.unshift({id:uid(),name:name.trim()||'Class teams',groups:JSON.parse(JSON.stringify(state.groupList))});save(STORAGE.groups,state.groups);renderSavedGroups();toast('Group arrangement saved.')});
$('#shufflePositionsBtn').addEventListener('click',()=>{state.people=shuffle(state.people);save(STORAGE.people,state.people);renderSetup();toast('Starting positions shuffled.')});
$('#durationSetting').addEventListener('input',e=>{state.settings.duration=+e.target.value;$('#durationValue').textContent=state.settings.duration+' sec';persistSettings()});
$('#speedSetting').addEventListener('input',e=>{state.settings.speed=+e.target.value;$('#speedValue').textContent=['','Slow','Standard','Fast'][state.settings.speed];persistSettings()});
$('#intensitySetting').addEventListener('change',e=>{state.settings.intensity=e.target.value;persistSettings()});
$('#eventSetting').addEventListener('input',e=>{state.settings.events=+e.target.value;$('#eventValue').textContent=['Off','Low','Normal','High'][state.settings.events];persistSettings()});
$('#soundSetting').addEventListener('change',e=>{state.settings.sound=e.target.checked;persistSettings()});$('#musicSetting').addEventListener('change',e=>{state.settings.music=e.target.checked;persistSettings()});
$('#previewRaceBtn').addEventListener('click',showPreview);$('#startIndividual').addEventListener('click',()=>{setMode('individual');view('setup')});$('#startGroup').addEventListener('click',()=>{setMode('group');view('setup')});
$('#raceHomeBtn').addEventListener('click',()=>{if(state.currentRace&&!state.currentRace.finished&&state.currentRace.startedAt&&!confirm('Leave this race? The unfinished race will not be saved.'))return;stopMusic();view('home')});
$('#goBtn').addEventListener('click',()=>{if(!state.currentRace)return;if(!state.currentRace.startedAt)startCountdown();else if(state.currentRace.paused)pauseRace()});
$('#pauseBtn').addEventListener('click',pauseRace);
$('#restartBtn').addEventListener('click',()=>{if(!state.currentRace)return;if(confirm('Restart this race with a fresh random simulation?')){resetRaceUI();setupRaceTrack();startCountdown()}});
$('#skipBtn').addEventListener('click',()=>{if(!state.currentRace)return;if(confirm('Skip to finish? This will be recorded as a MANUAL OVERRIDE, not a natural race finish.'))finishRace(true)});
$('#raceAgainBtn').addEventListener('click',()=>{if(state.currentRace){state.currentRace.finished=false;setupRaceTrack();resetRaceUI();$('#winnerOverlay').hidden=true;startCountdown()}});
$('#viewResultsBtn').addEventListener('click',()=>openResults());
$('#resultsRaceAgain').addEventListener('click',()=>{setMode(state.lastResult?.mode||'individual');view('setup')});
$('#exportCsvBtn').addEventListener('click',()=>exportCSV());$('#resultsExportBtn').addEventListener('click',()=>exportCSV(state.lastResult));
$('#historySearch').addEventListener('input',renderHistory);$('#historyFilter').addEventListener('change',renderHistory);
$('#clearHistoryBtn').addEventListener('click',()=>{if(confirm('Permanently clear all saved race history? This cannot be undone.')){state.history=[];save(STORAGE.history,state.history);renderHistory();renderHome();toast('Race history cleared.')}});
$('#fullScreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('#raceStage').requestFullscreen();else await document.exitFullscreen()}catch{document.body.classList.toggle('fullscreen-active')}});
document.addEventListener('fullscreenchange',()=>document.body.classList.toggle('fullscreen-active',!!document.fullscreenElement));
$('#muteRaceBtn').addEventListener('click',()=>{state.settings.sound=!state.settings.sound;$('#muteRaceBtn').textContent=state.settings.sound?'♫ Sound on':'♫ Sound off';persistSettings()});
$('#soundToggle').addEventListener('click',()=>{state.settings.sound=!state.settings.sound;$('#soundToggle').textContent=state.settings.sound?'♫ Sound':'♫ Muted';persistSettings();toast(state.settings.sound?'Sound enabled.':'Sound muted.')});
$('#globalSound').addEventListener('change',e=>{state.settings.sound=e.target.checked;persistSettings()});$('#globalMusic').addEventListener('change',e=>{state.settings.music=e.target.checked;persistSettings()});
$('#sfxVolume').addEventListener('input',e=>{state.settings.sfxVolume=+e.target.value;$('#sfxVolumeText').textContent=e.target.value+'%';persistSettings()});$('#musicVolume').addEventListener('input',e=>{state.settings.musicVolume=+e.target.value;$('#musicVolumeText').textContent=e.target.value+'%';persistSettings()});
$('#downloadBackupBtn').addEventListener('click',exportBackup);$('#importBackupInput').addEventListener('change',e=>{if(e.target.files[0])importBackup(e.target.files[0]);e.target.value=''});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstall=e;$('#installBtn').hidden=false});
$('#installBtn').addEventListener('click',async()=>{if(!state.deferredInstall){toast('Use Chrome menu → Add to Home screen if install is not offered.');return}state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;$('#installBtn').hidden=true});
window.addEventListener('online',()=>{$('#connectionStatus').textContent='● ONLINE';$('#connectionStatus').style.color='#138b8d'});window.addEventListener('offline',()=>{$('#connectionStatus').textContent='● OFFLINE READY';$('#connectionStatus').style.color='#b46b13'});
window.addEventListener('error',()=>toast('Something went wrong. Refresh the page and try again.'));
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderHome();renderParticipants();renderSetup();renderSettings();
})();