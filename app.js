/* ---- Озвучка ---- */
var TTS={a:null,q:[],i:0,on:false,btn:null,run:0};
function ttsKey(t){let x=0x811c9dc5;for(let i=0;i<t.length;i++){x^=t.charCodeAt(i);x=Math.imul(x,16777619)>>>0}return x.toString(36)}
function ttsAuto(){return localStorage.getItem('ot_autotts')==='1'}
function ttsVoice(){const v=(speechSynthesis.getVoices()||[]).filter(v=>/^ru/i.test(v.lang));return v.find(v=>/Milena|Svetlana|Google|Natural|Neural/i.test(v.name))||v[0]}
function ttsMark(){document.querySelectorAll('.tts-hl').forEach(e=>e.classList.remove('tts-hl'));const s=TTS.q[TTS.i];s&&s.el&&s.el.classList.add('tts-hl')}
function ttsUI(){if(!TTS.btn)return;TTS.btn.classList.toggle('playing',TTS.on);TTS.btn.innerHTML=TTS.on?'⏸ Пауза':'🔊 Прослушать'}
function ttsStop(){TTS.run++;TTS.on=false;TTS.q=[];TTS.i=0;if(TTS.a){TTS.a.pause();TTS.a.removeAttribute('src')}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}document.querySelectorAll('.tts-hl').forEach(e=>e.classList.remove('tts-hl'));ttsUI();TTS.btn=null}
function ttsPause(){TTS.run++;TTS.on=false;if(TTS.a)TTS.a.pause();try{speechSynthesis.cancel()}catch(e){}ttsUI()}
function ttsNext(run){if(run!==TTS.run)return;TTS.i++;ttsPlay()}
function ttsSpeak(t,run){if(!window.speechSynthesis){ttsNext(run);return}const u=new SpeechSynthesisUtterance(t);u.lang='ru-RU';const v=ttsVoice();if(v)u.voice=v;u.onend=u.onerror=()=>ttsNext(run);speechSynthesis.speak(u)}
function ttsPlay(){const run=TTS.run;if(TTS.i>=TTS.q.length){const b=TTS.btn;TTS.on=false;TTS.i=0;document.querySelectorAll('.tts-hl').forEach(e=>e.classList.remove('tts-hl'));ttsUI();return}
 TTS.on=true;ttsUI();ttsMark();const s=TTS.q[TTS.i];if(!TTS.a)TTS.a=new Audio();const a=TTS.a;let done=false;
 const fb=()=>{if(done||run!==TTS.run)return;done=true;ttsSpeak(s.t,run)};
 a.onended=()=>{if(!done){done=true;ttsNext(run)}};a.onerror=s.src?()=>{if(!done){done=true;TTS.on=false;ttsUI()}}:fb;a.src=s.src?s.src+'?v='+(window.AUDIO_V||1):'audio/'+ttsKey(s.t)+'.mp3';const p=a.play();p&&p.catch&&p.catch(e=>{if(e&&e.name==='NotAllowedError'){TTS.on=false;ttsUI();return}fb()})}
function ttsBind(btn,segs){TTS.btn=btn;TTS.q=segs;TTS.i=0;btn.onclick=e=>{e.stopPropagation();TTS.btn=btn;if(TTS.on)ttsPause();else{TTS.run++;if(TTS.i>=TTS.q.length)TTS.i=0;ttsPlay()}};
 const t=btn.parentNode.querySelector('.ttsauto');if(t){t.classList.toggle('on',ttsAuto());t.onclick=e=>{e.stopPropagation();const v=!ttsAuto();localStorage.setItem('ot_autotts',v?'1':'0');t.classList.toggle('on',v);if(v&&!TTS.on){TTS.run++;ttsPlay()}}}
 if(ttsAuto()){TTS.run++;ttsPlay()}}
function ttsBar(){return `<span class="ttsbar"><button class="ttsb" type="button">🔊 Прослушать</button><button class="ttsauto" type="button" title="Автоозвучка">Авто</button></span>`}
// ===== Backend (Google Apps Script). Пусто = локальный режим без сервера.
const API_URL=window.OT_API_URL||'https://script.google.com/macros/s/AKfycbxVl-Yb2Heq_QPYGp0QUdRsK7LQVHps0avgdT4_oIbReGW73D4B-PLASC6dZozi7w5p/exec';
const API_TOKEN='gBU-Yj7L-7h_2zGd2EXgr9Qy';
const SHEET_URL='https://docs.google.com/spreadsheets/d/17OdCnBHpzfZOEjSBPVcRiiO3-YCbVijOL9-UIiR9KnM/edit';
async function api(action,data,ms=30000){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms);
 try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({token:API_TOKEN,action,...data}),redirect:'follow',signal:ac.signal});
  if(!r.ok)throw new Error('http '+r.status);return await r.json()}finally{clearTimeout(t)}}
const NET='Нет связи, попробуйте позже';

// ===== Linear progress (simulated → ~90%, finish → 100%; real set() when known)
function progHTML(label,cls=''){return `<div class="pload ${cls}"><div class="plbl">${esc(label||'')}</div><div class="ptrack"><i class="pfill" style="width:0%"></i></div><div class="ppct">0%</div></div>`}
function startProg(root,{expect=40000}={}){const fill=root.querySelector('.pfill'),pct=root.querySelector('.ppct');if(!fill||!pct)return{set(){},finish(){},stop(){}};
 let cur=0,alive=true,t0=performance.now(),raf=0;
 const paint=p=>{cur=Math.max(0,Math.min(99.5,p));fill.style.width=cur.toFixed(1)+'%';pct.textContent=Math.round(cur)+'%'};
 const tick=()=>{if(!alive)return;const e=Math.min(1,(performance.now()-t0)/expect);paint(90*(1-Math.exp(-2.4*e)));raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick);
 return{set(p){paint(+p*100||+p)},finish(){alive=false;cancelAnimationFrame(raf);fill.style.transition='width .2s ease-out';cur=100;fill.style.width='100%';pct.textContent='100%'},stop(){alive=false;cancelAnimationFrame(raf)}}}
async function fetchBuf(url,onP){const r=await fetch(url);if(!r.ok)throw new Error('http '+r.status);const total=+r.headers.get('content-length')||0;
 if(!r.body||!total||!r.body.getReader){const b=await r.arrayBuffer();onP&&onP(1);return b}
 const reader=r.body.getReader();const chunks=[];let got=0;
 while(true){const{done,value}=await reader.read();if(done)break;chunks.push(value);got+=value.byteLength;onP&&onP(got/total)}
 const out=new Uint8Array(got);let o=0;for(const c of chunks){out.set(c,o);o+=c.byteLength}return out.buffer}
function syncSrv(types){S.srv=types;Object.entries(types).forEach(([k,t])=>{if(t.status==='none')delAtt(S.inn,k);else if(t.status==='passed'||t.status==='expired')delAtt(S.inn,k);else setAtt(S.inn,k,{...getAtt(S.inn,k),n:t.attempts,best:t.best,blocked:t.status==='blocked',fio:S.fio,phone:S.phone,type:TYPES[k],date:new Date().toISOString()})})}
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='ot_pr_lemana_completions', READ=window.FAST?0.05:3;
const TIMG={pick:'picker_stepladder.jpg',load:'loader_ramp.jpg',t4:'pallet_truck.jpg',t4p:'forklift.jpg'},TSUB={pick:'Отбор товара, ТСД, паллеты',load:'Ручной подъём, рампа, рохли',t4:'Электротележки, штабелёры',t4p:'Погрузчики, ричтраки'};
const BRAND='<div class="brand"><i>ПР</i><span>Персональное Решение</span></div>';
let S;function reset(){S={photo:null,photoAt:null,fio:'',inn:'',phone:'',type:null,slides:[],i:0,maxRead:-1,qs:[],ans:[],qi:0,tries:0,score:0,sig:null}}reset();
function innValid(v){if(!/^\d{12}$/.test(v))return false;const d=v.split('').map(Number);
 const k=w=>w.reduce((s,x,i)=>s+x*d[i],0)%11%10;
 return k([7,2,4,10,3,5,9,4,6,8])===d[10]&&k([3,7,2,4,10,3,5,9,4,6,8])===d[11];}
function toTop(){const f=()=>{window.scrollTo(0,0);if(document.scrollingElement)document.scrollingElement.scrollTop=0;document.body.scrollTop=0};f();requestAnimationFrame(f);setTimeout(f,60);setTimeout(f,250)}
function render(html,cls='screen'){ttsStop();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();app.className='';app.innerHTML=`<div class="${cls}">${html}</div>`;toTop()}
if('scrollRestoration' in history)history.scrollRestoration='manual';
(function(){const set=()=>{if(document.body.classList.contains('signing'))return;const h=window.visualViewport?visualViewport.height:innerHeight;document.documentElement.style.setProperty('--app-h',Math.round(h)+'px')};set();addEventListener('resize',set);window.visualViewport&&visualViewport.addEventListener('resize',set)})();
function buzz(){try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}}
document.addEventListener('pointerdown',e=>{if(e.target.closest('button'))buzz()});


const PROF_KEY='ot_profile';
function loadProf(){try{const p=JSON.parse(localStorage.getItem(PROF_KEY)||'null');return p&&typeof p==='object'?p:null}catch(e){return null}}
function saveProf(p){localStorage.setItem(PROF_KEY,JSON.stringify({fio:p.fio,inn:p.inn,phone:p.phone}));localStorage.setItem('ot_last_inn',p.inn)}
function clearProf(){localStorage.removeItem(PROF_KEY)}
function phoneDigits(raw){const s=String(raw||'').trim();let d=s.replace(/\D/g,'');const head=s.replace(/[\s()-]/g,'');if(/^(\+?7|8)/.test(head)||(d.length===11&&(d[0]==='7'||d[0]==='8'))){if(d[0]==='7'||d[0]==='8')d=d.slice(1)}return d.slice(0,10)}
function phoneFmt(d){d=phoneDigits(d);let o='+7';if(d.length)o+=' '+d.slice(0,Math.min(3,d.length));if(d.length>3)o+=' '+d.slice(3,Math.min(6,d.length));if(d.length>6)o+='-'+d.slice(6,Math.min(8,d.length));if(d.length>8)o+='-'+d.slice(8,10);return d.length?o:'+7 '}
function phoneE164(d){d=phoneDigits(d);return d.length===10?'+7'+d:''}
function bindPhone(el,init){const PREFIX='+7 ';let digits=phoneDigits(init||'');
 const paint=(caret)=>{el.value=phoneFmt(digits);const min=PREFIX.length,pos=caret==null?el.value.length:Math.max(min,Math.min(caret,el.value.length));try{el.setSelectionRange(pos,pos)}catch(e){}};
 const caretAfterDigits=n=>{let seen=0,i=PREFIX.length;const v=phoneFmt(digits);for(;i<v.length;i++){if(/\d/.test(v[i])){seen++;if(seen>=n)return i+1}}return v.length};
 paint();
 el.addEventListener('focus',()=>{if(!digits.length)paint();requestAnimationFrame(()=>{const min=PREFIX.length;if((el.selectionStart||0)<min)try{el.setSelectionRange(el.value.length,el.value.length)}catch(e){}})});
 el.addEventListener('click',()=>{const min=PREFIX.length;if((el.selectionStart||0)<min||(el.selectionEnd||0)<min)try{el.setSelectionRange(min,Math.max(min,el.selectionEnd||min))}catch(e){}});
 el.addEventListener('keydown',e=>{const min=PREFIX.length,s=el.selectionStart||0,en=el.selectionEnd||0;
  if(e.key==='Backspace'){e.preventDefault();if(s===en){if(s<=min)return;const before=phoneDigits(el.value.slice(0,s));digits=(before.slice(0,-1)+phoneDigits(el.value.slice(en))).slice(0,10);paint(caretAfterDigits(before.length-1))}else{const a=phoneDigits(el.value.slice(0,Math.max(s,min))),b=phoneDigits(el.value.slice(Math.max(en,min)));digits=(a+b).slice(0,10);paint(caretAfterDigits(a.length))}return}
  if(e.key==='Delete'){e.preventDefault();if(s===en){if(s<min){try{el.setSelectionRange(min,min)}catch(x){}return}const before=phoneDigits(el.value.slice(0,s)),after=phoneDigits(el.value.slice(en));digits=(before+after.slice(1)).slice(0,10);paint(caretAfterDigits(before.length))}else{const a=phoneDigits(el.value.slice(0,Math.max(s,min))),b=phoneDigits(el.value.slice(Math.max(en,min)));digits=(a+b).slice(0,10);paint(caretAfterDigits(a.length))}return}
  if(e.key==='ArrowLeft'||e.key==='Home'){requestAnimationFrame(()=>{if((el.selectionStart||0)<min)try{el.setSelectionRange(min,min)}catch(x){}})}
  if(e.key==='a'&&(e.metaKey||e.ctrlKey)){e.preventDefault();try{el.setSelectionRange(min,el.value.length)}catch(x){}}});
 el.addEventListener('paste',e=>{e.preventDefault();const t=(e.clipboardData||window.clipboardData).getData('text')||'';digits=phoneDigits(t);paint()});
 el.addEventListener('input',()=>{const cur=el.selectionStart||0;const before=phoneDigits(el.value.slice(0,cur));digits=phoneDigits(el.value);paint(caretAfterDigits(before.length))});
 return{digits:()=>digits,e164:()=>phoneE164(digits),set(v){digits=phoneDigits(v);paint()}}}
function applyProf(){const p=loadProf();if(!p)return;if(p.fio)S.fio=p.fio;if(p.inn)S.inn=p.inn;if(p.phone)S.phone=p.phone}

function start(){applyProf();const saved=loadProf();
 render(`<div class="hero"><img src="img/conveyor.jpg" alt="">${BRAND}<div class="in">
 <h1 class="mega">Безопасность<br><em>начинается с тебя</em></h1>
 <p>Инструктаж для исполнителей (самозанятых) ООО «Персональное Решение» на складе «Лемана ПРО».</p>
 <div class="chips"><span>⏱ ~15 минут</span><span>📝 10 вопросов</span><span>✍️ Подпись</span></div></div></div>
 <div class="pad"><div class="form">${saved?`<div class="whoami" id="whoami">Вход как <b>${esc(saved.fio||'исполнитель')}</b> · <a href="#" id="clr">Не вы? Очистить</a></div>`:''}
 <label>ФИО</label><input type="text" id="fio" autocomplete="name" autocapitalize="words" enterkeyhint="next" placeholder="Иванов Иван Иванович" value="${esc(S.fio)}"><div class="err" id="e1"></div>
 <label>ИНН · 12 цифр</label><input type="text" id="inn" inputmode="numeric" pattern="[0-9]*" autocomplete="off" enterkeyhint="next" maxlength="12" placeholder="000000000000" value="${esc(S.inn)}"><div class="err" id="e2"></div>
 <label>Телефон</label><input type="tel" id="phone" inputmode="tel" autocomplete="tel" enterkeyhint="done" maxlength="18" placeholder="+7 900 000-00-00" value="${esc(phoneFmt(S.phone||''))}"><div class="err" id="e3"></div>
 <label class="chk cns"><input type="checkbox" id="pdn"><span>Даю согласие на обработку персональных данных на условиях <a href="#" id="cnsopen">текста согласия</a></span></label>
 <label class="chk cns"><input type="checkbox" id="phc"><span>Даю согласие на фотосъёмку и использование моего изображения для подтверждения личности</span></label><div class="err" id="e4"></div>
 <button class="btn" id="go">Начать инструктаж →</button></div></div>`);
 const ph=bindPhone($('#phone'),S.phone||'');
 ['fio','inn','phone'].forEach((id,k,a)=>$('#'+id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();k<2?$('#'+a[k+1]).focus():$('#go').click()}}));
 $('#cnsopen').onclick=e=>{e.preventDefault();consentModal()};
 $('#inn').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,12);
 const clr=$('#clr');if(clr)clr.onclick=e=>{e.preventDefault();clearProf();S.fio='';S.inn='';S.phone='';$('#fio').value='';$('#inn').value='';ph.set('');const w=$('#whoami');if(w)w.remove()};
 $('#go').onclick=()=>{const fio=$('#fio').value.trim().replace(/\s+/g,' '),inn=$('#inn').value,e164=ph.e164();let ok=true;
  $('#e1').textContent=fio.split(' ').length<2||!/^[А-Яа-яЁёA-Za-z\- ]+$/.test(fio)?(ok=false,'Укажите фамилию и имя (и отчество при наличии)'):'';
  $('#e2').textContent=!/^\d{12}$/.test(inn)?(ok=false,'ИНН физического лица — ровно 12 цифр'):!innValid(inn)?(ok=false,'Неверная контрольная сумма ИНН — проверьте цифры'):'';
  $('#e3').textContent=!e164?(ok=false,'Введите 10 цифр после +7'):'';
  $('#e4').textContent=!$('#pdn').checked||!$('#phc').checked?(ok=false,'Необходимо дать оба согласия — без них инструктаж пройти нельзя'):'';
  if(!ok){$('.form').classList.remove('shake');void $('.form').offsetWidth;$('.form').classList.add('shake');return}
  S.fio=fio;S.inn=inn;S.phone=e164;S.consent={v:CONSENT_V,at:new Date().toISOString(),pdn:true,photo:true};localStorage.setItem('ot_consent_'+inn,JSON.stringify(S.consent));saveProf({fio,inn,phone:e164});
  if(API_URL){const g=$('#go');g.disabled=true;g.textContent='Проверяем…';
   let box=$('#go-prog');if(!box){box=document.createElement('div');box.id='go-prog';g.insertAdjacentElement('afterend',box)}
   box.innerHTML=progHTML('Проверяем допуск…','inline sm');const pg=startProg(box,{expect:40000});
   api('status',{inn},45000).then(r=>{if(!r.ok)throw new Error(r.error);pg.finish();syncSrv(r.types);hasHist()?dashboard():chooseType()}).catch(()=>{pg.stop();box.innerHTML='';g.disabled=false;g.textContent='Начать инструктаж →';$('#e3').textContent=NET})}
  else hasHist()?dashboard():chooseType();};
}
function chooseType(){render(`<div class="top"><button class="back" id="bk">←</button></div><div class="pad" style="padding-top:8px">
 <h1>Какой вид<br>услуг?</h1><p class="sub">Инструктаж и тест подберём под вид услуг, согласованный с Заказчиком.</p>
 <div class="bento">${Object.entries(TYPES).map(([k,t])=>`<button class="type${S.type===k?' sel':''}" data-k="${k}"><img src="img/${TIMG[k]}" alt=""><i class="rad">${S.type===k?'✓':''}</i><span>${t.name}<small>${TSUB[k]}</small></span></button>`).join('')}</div>
 <div class="dock"><button class="btn" id="nt" ${S.type?'':'disabled'}>Далее →</button></div></div>`);
 $('#bk').onclick=start;
 app.querySelectorAll('.type').forEach(b=>b.onclick=()=>{S.type=b.dataset.k;app.querySelectorAll('.type').forEach(x=>{x.classList.toggle('sel',x===b);x.querySelector('.rad').textContent=x===b?'✓':''});$('#nt').disabled=false});
 $('#nt').onclick=()=>startType(S.type);
}
let timer;
function slide(dir=1){clearTimeout(timer);const s=S.slides[S.i],n=S.slides.length,read=S.i<=S.maxRead,dia=s.img&&s.img.endsWith('.png');
 const chips=(arr,k,h,ic)=>arr.length?`<div class="chiph ${k}"><b>${ic}</b>${h}</div>${arr.map((p,j)=>`<span class="chip ${k}" style="animation-delay:${.15+j*.07}s">${esc(p)}</span>`).join('')}`:'';
 render(`<div class="story" id="story"><img class="bg${dia?' dia':''}" src="img/${s.img||'conveyor.jpg'}" alt=""><div class="shade"></div>
 <div class="segs">${S.slides.map((_,j)=>`<span class="${j<S.i||(j===S.i&&read)?'done':j===S.i?'cur':''}" style="--dur:${READ}s"><i></i></span>`).join('')}</div>
 <div class="shead">${BRAND}<button class="x" id="cls" aria-label="К выбору">✕</button></div>
 <div class="tap l" id="tl"></div><div class="tap r" id="tr"></div>
 <div class="scontent"><div class="slrow"><span class="slbl">${S.i+1}/${n} · ${esc(s.sec)}</span>${s.audio?ttsBar():''}</div><h2 class="stitle${s.pts.length+s.no.length+s.ok.length>7?' sm':''}">${esc(s.title)}</h2>
 <div class="sheet"><div class="chiprow">${chips(s.no,'no','ЗАПРЕЩЕНО','✕')}${chips(s.ok,'ok','ПРАВИЛЬНО','✓')}</div><ul>${s.pts.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div>
 <div class="row"><button class="btn glass" id="prev">←</button><button class="btn" id="next" ${read?'':'disabled'}>${read?(S.i<n-1?'Далее →':'К тесту →'):'Читаем…'}</button></div>
 <div class="hint">Свайп ← → или тап по краям фото</div></div></div>`,'');
 if(s.audio)ttsBind(app.querySelector('.ttsb'),[{t:s.voice||s.title,src:s.audio,el:app.querySelector('.sheet')}]);
 const nx=$('#next');
 if(!read)timer=setTimeout(()=>{S.maxRead=Math.max(S.maxRead,S.i);nx.disabled=false;nx.textContent=S.i<n-1?'Далее →':'К тесту →'},READ*1000);
 const fwd=()=>{if(nx.disabled){nx.animate([{transform:'scale(1)'},{transform:'scale(1.05)'},{transform:'scale(1)'}],{duration:300});return}if(S.i<n-1){S.i++;slide(1)}else startTest()};
 const bwd=()=>{if(S.i>0){S.i--;slide(-1)}};
 nx.onclick=fwd;$('#prev').onclick=bwd;$('#tr').onclick=fwd;$('#tl').onclick=bwd;$('#cls').onclick=()=>hasHist()?dashboard():chooseType();
 const st=$('#story'),sc=st.querySelector('.scontent');let x0=null,y0=0;
 st.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;x0=e.clientX;y0=e.clientY});
 st.addEventListener('pointermove',e=>{if(x0===null)return;const dx=e.clientX-x0;if(Math.abs(dx)>Math.abs(e.clientY-y0))sc.style.transform=`translateX(${dx*.35}px)`});
 const end=e=>{if(x0===null)return;const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;sc.style.transition='transform .35s cubic-bezier(.34,1.56,.64,1)';sc.style.transform='';setTimeout(()=>sc&&(sc.style.transition=''),360);
  if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)){dx<0?fwd():bwd()}};
 st.addEventListener('pointerup',end);st.addEventListener('pointercancel',()=>{x0=null;sc.style.transform=''});
}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startTest(){S.sent=false;S.qs=shuffle([...shuffle(Q_COMMON).slice(0,5),...Q_SPEC[S.type]]).map(q=>{const o=shuffle(q.a.map((t,j)=>({t,v:(q.va||[])[j]||t,r:j===q.c})));return{...q,a:o.map(x=>x.t),va:o.map(x=>x.v),c:o.findIndex(x=>x.r)}});S.ans=Array(10).fill(null);S.qi=0;const at=getAtt(S.inn,S.type);if(at.blocked){blocked(S.type);return}S.tries=at.n+1;question()}
function question(){const i=S.qi,q=S.qs[i];
 render(`<div class="qhead"><div class="top"><button class="back" id="bk">←</button><div class="qn" style="margin-left:6px">Вопрос ${i+1} из 10</div><div style="margin-left:auto;font-weight:800;color:var(--m);font-size:14px">Попытка ${S.tries} из ${MAXA}<br><span style="color:#E05A00">Осталось пересдач: ${MAXA-S.tries}</span></div></div>
 <div class="qbar">${S.qs.map((_,j)=>`<span class="${j<=i?'on':''}"></span>`).join('')}</div></div><div class="pad" style="padding-top:4px"><div class="qq">${esc(q.q)}</div>
 <div>${q.a.map((a,j)=>`<button class="opt${S.ans[i]===j?' sel':''}" data-a="${j}"><span class="k">${'АБВГ'[j]}</span>${esc(a)}</button>`).join('')}</div>
 <div class="dock"><button class="btn" id="qn" ${S.ans[i]===null?'disabled':''}>${i<9?'Следующий вопрос →':'Проверить ответы'}</button></div></div>`);
 $('#bk').onclick=()=>{if(i>0){S.qi--;question()}else{S.i=S.slides.length-1;slide(-1)}};
 app.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{S.ans[i]=+o.dataset.a;app.querySelectorAll('.opt').forEach(x=>x.classList.toggle('sel',x===o));$('#qn').disabled=false});
 $('#qn').onclick=()=>{if(i<9){S.qi++;question()}else check()};
}
function check(){if(API_URL&&!S.sent)return checkSrv();S.sent=false;S.score=S.qs.filter((q,i)=>S.ans[i]===q.c).length;const pass=S.score>=PASS;const at=getAtt(S.inn,S.type);at.n=S.tries;at.best=Math.max(at.best||0,S.score*10);at.fio=S.fio;at.phone=S.phone;at.type=TYPES[S.type].name;at.date=new Date().toISOString();
 if(pass)delAtt(S.inn,S.type);else{if(at.n>=MAXA)at.blocked=true;setAtt(S.inn,S.type,at)}const left=MAXA-S.tries,blk=!pass&&left<=0;
 render(`<div class="pad"><div class="res ${pass?'pass':'fail'}"><div class="score">${S.score*10}%</div><div style="font-weight:800;font-size:20px;margin-top:6px">${pass?'Тест сдан! 🎉':'Пока не сдан'}</div>
 <div style="opacity:.85;margin-top:6px;font-size:14px">${S.score} из 10 правильных${pass?'':(blk?' · нужно 90% (9 из 10).':' · нужно 90% (9 из 10). Изучите пояснения и попробуйте снова.')}</div><div class="left">${pass?'':blk?'Попытки исчерпаны':'Осталось пересдач: '+left}</div></div>
 ${blk?blkCard(at):''}
 <div class="dock" style="position:static;background:none">${pass?`<button class="btn" id="tosign">Подписать лист ознакомления →</button>`:(blk?`<button class="btn ghost" id="todash">Моё обучение</button>`:`<div class="row"><button class="btn ghost" id="rev">Правила</button><button class="btn" id="retry">Пройти тест заново</button></div>`)}</div>
 ${S.qs.map((q,i)=>`<div class="rcard"><div class="qn">Вопрос ${i+1} ${S.ans[i]===q.c?'· ✓':'· ✕'}</div><div class="qq">${esc(q.q)}</div>${q.a.map((a,j)=>`<div class="opt ${j===q.c?'right':(j===S.ans[i]?'wrong':'')}"><span class="k">${j===q.c?'✓':j===S.ans[i]?'✕':'АБВГ'[j]}</span>${esc(a)}</div>`).join('')}${S.ans[i]!==q.c?`<div class="expl">💡 ${esc(q.e)}</div>`:''}</div>`).join('')}</div>`);
 if(pass){$('#tosign').onclick=sign;confetti()}else if(blk){$('#todash').onclick=dashboard;$('.res').classList.add('shake')}else{$('#retry').onclick=startTest;$('#rev').onclick=()=>{S.i=0;slide()};$('.res').classList.add('shake')}
}
function confetti(){const c=$('#confetti'),x=c.getContext('2d'),W=c.width=innerWidth,H=c.height=innerHeight;const cols=['#FF6B00','#FF2D87','#16C47F','#FFD23F','#7C5CFF'];
 const P=Array.from({length:140},()=>({x:W/2,y:H*.3,vx:(Math.random()-.5)*14,vy:Math.random()*-14-4,s:Math.random()*8+4,r:Math.random()*6,c:cols[Math.random()*5|0]}));let t=0;
 (function f(){x.clearRect(0,0,W,H);P.forEach(p=>{p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});if(++t<160)requestAnimationFrame(f);else x.clearRect(0,0,W,H)})();}
function sign(){render(`<div class="top"><button class="back" id="bk">←</button></div><div class="pad" style="padding-top:8px"><h1>Последний<br>шаг ✍️</h1>
 <p class="sub">${esc(S.fio)} · ИНН ${S.inn}<br>${esc(TYPES[S.type].name)}</p>
 <div class="card"><label class="chk"><input type="checkbox" id="agree"><span>Ознакомлен(а) с Правилами техники безопасности и обязуюсь соблюдать</span></label></div>
 <div class="card"><b style="font-size:17px">Фото исполнителя</b><div class="sub" style="margin:4px 0 0;font-size:13px">Селфи с фронтальной камеры для подтверждения личности</div><div id="selfie"></div></div>
 <div class="card"><div style="display:flex;align-items:center"><b style="font-size:17px">Подпись пальцем</b><button class="btn ghost" id="clr" style="margin:0 0 0 auto;width:auto;padding:10px 16px;font-size:14px">Очистить</button></div><canvas id="sig"></canvas><div class="sighint" id="sighint">Распишитесь пальцем в поле выше</div></div>
 <button class="btn" id="done" disabled>Подписать</button></div>`);
 $('#bk').onclick=()=>{unlock();check()};
 const c=$('#sig'),hint=$('#sighint'),dpr=()=>window.devicePixelRatio||1;
 const x=c.getContext('2d');let dr=false,len=0,cssW=0,cssH=0,raf=0,pending=null,lockY=0;
 const lock=()=>{if(document.body.classList.contains('signing'))return;lockY=window.scrollY||document.documentElement.scrollTop||0;document.documentElement.classList.add('signing');document.body.classList.add('signing')};
 const unlock=()=>{if(!document.body.classList.contains('signing'))return;document.documentElement.classList.remove('signing');document.body.classList.remove('signing');window.scrollTo(0,lockY)};
 const styleStroke=()=>{x.setTransform(1,0,0,1,0,0);x.scale(dpr(),dpr());x.lineWidth=2.8;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#0B0B12'};
 const fit=(force)=>{if(dr&&!force)return;const r=c.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);if(!w||!h)return;if(!force&&w===cssW&&h===cssH)return;
  const prev=(cssW&&c.width)?c.toDataURL('image/png'):null;cssW=w;cssH=h;c.width=Math.round(w*dpr());c.height=Math.round(h*dpr());styleStroke();
  if(prev){const img=new Image();img.onload=()=>{x.setTransform(1,0,0,1,0,0);x.drawImage(img,0,0,c.width,c.height);styleStroke()};img.src=prev}};
 fit(true);
 const pt=e=>{const b=c.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
 const flush=()=>{raf=0;if(!pending||pending.length<2){pending=null;return}x.beginPath();x.moveTo(pending[0],pending[1]);for(let i=2;i<pending.length;i+=2)x.lineTo(pending[i],pending[i+1]);x.stroke();pending=null};
 const queue=(a,b)=>{if(!pending)pending=[a,b];else{pending.push(a,b)}if(!raf)raf=requestAnimationFrame(flush)};
 const onDown=e=>{if(e.button!=null&&e.button!==0)return;e.preventDefault();dr=true;lock();try{c.setPointerCapture(e.pointerId)}catch(_){}
  const[a,b]=pt(e);pending=null;if(raf){cancelAnimationFrame(raf);raf=0}x.beginPath();x.moveTo(a,b);queue(a,b);len++;upd()};
 const onMove=e=>{if(!dr)return;e.preventDefault();const[a,b]=pt(e);queue(a,b);len++;upd()};
 const onUp=e=>{if(!dr)return;e&&e.preventDefault&&e.preventDefault();dr=false;if(raf){cancelAnimationFrame(raf);raf=0}flush();unlock();try{e&&e.pointerId!=null&&c.releasePointerCapture(e.pointerId)}catch(_){};upd()};
 c.addEventListener('pointerdown',onDown);c.addEventListener('pointermove',onMove);c.addEventListener('pointerup',onUp);c.addEventListener('pointercancel',onUp);c.addEventListener('lostpointercapture',onUp);
 // iOS Safari: touch listeners must be non-passive to stop page scroll under the finger
 const pe=e=>{e.preventDefault()};c.addEventListener('touchstart',pe,{passive:false});c.addEventListener('touchmove',pe,{passive:false});
 const onResize=()=>{if(dr)return;fit(false)};addEventListener('resize',onResize);window.visualViewport&&visualViewport.addEventListener('resize',onResize);
 const done=$('#done'),upd=()=>{done.disabled=!($('#agree').checked&&len>10&&S.photo);hint.textContent=len>10?'Подпись принята — можно подписать':(len>0?'Продолжайте расписываться':'Распишитесь пальцем в поле выше')};S.upd=upd;drawSelfie();
 $('#clr').onclick=()=>{if(raf){cancelAnimationFrame(raf);raf=0}pending=null;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);styleStroke();len=0;upd()};$('#agree').onchange=upd;
 done.onclick=()=>{unlock();S.sig=c.toDataURL('image/png');finish()};done.insertAdjacentHTML('afterend','<div class="err" id="serr" style="text-align:center"></div>');
 window.__sigPad={fit,isDrawing:()=>dr,len:()=>len,unlock,cssSize:()=>({w:cssW,h:cssH})};
}
async function finish(){const d=new Date();S.recId=S.recId||Date.now().toString(36).toUpperCase();let id=S.recId;
 if(API_URL){const b=$('#done'),er=$('#serr');b.disabled=true;b.textContent='Сохраняем…';er.innerHTML='';
  const hold=document.createElement('div');hold.id='save-hold';hold.style.cssText='position:fixed;inset:0;z-index:90;background:rgba(244,245,248,.92);display:flex;align-items:center;justify-content:center;padding:24px';
  hold.innerHTML=`<div style="width:100%;max-width:320px;text-align:center"><h2 style="margin:0 0 6px;font-size:22px;font-weight:800">Сохраняем…</h2><p class="sub" style="margin:0 0 4px">Первый ответ сервера может занять до 1 минуты</p>${progHTML('Запись в Google Таблицу')}</div>`;
  document.body.appendChild(hold);const pg=startProg(hold,{expect:60000});
  let r,netErr=false;try{r=await api('complete',{consent:S.consent,inn:S.inn,type:S.type,fio:S.fio,phone:S.phone,agree:true,photo:S.photo,photoAt:S.photoAt,sig:S.sig,recordId:id,face:S.face||null},90000)}catch(e){r=null;netErr=true}
  const dropHold=()=>{pg.stop();hold.remove()};
  // ответ мог потеряться (таймаут/обрыв), а запись на сервере уже сделана — сверяемся со статусом
  if(!r||!r.ok){try{const st=await api('status',{inn:S.inn},45000);const t=st&&st.ok&&st.types&&st.types[S.type];
    if(t&&t.status==='passed'&&(t.recordId===id||(t.passedAt&&Date.now()-new Date(t.passedAt)<30*60000))){syncSrv(st.types);r={ok:true,recordId:t.recordId,passedAt:t.passedAt,validTo:t.validTo}}
    else if(t&&r&&r.error==='not_passed')r.detail=t.status}catch(e){}}
  if(!r||!r.ok){dropHold();b.disabled=false;b.textContent='Подписать';
   const msg=!r?'Нет связи с сервером или он не ответил вовремя. Данные не потеряны — проверьте интернет и нажмите «Повторить».'
    :r.error==='not_passed'?(r.detail==='blocked'?'Сервер не принял подпись: по этому виду услуг исчерпаны попытки (статус «Не допущен»). Обратитесь к координатору Заказчика.':r.detail==='progress'||r.detail==='none'?'Сервер не нашёл сданного теста по виду услуг «'+esc(TYPES[S.type].name)+'» для ИНН '+S.inn+'. Пройдите тест заново.':'Сервер не подтвердил сдачу теста. Нажмите «Повторить»; если ошибка повторится — обратитесь к координатору Заказчика.')
    :r.error==='busy'?'Сервер занят другими исполнителями. Подождите несколько секунд и нажмите «Повторить».'
    :r.error==='no_consent'?'Не найдено согласие на обработку персональных данных. Вернитесь на первый экран и отметьте согласие.'
    :/image/.test(r.error)?'Не удалось сохранить фото или подпись. Переснимите селфи и нажмите «Повторить».'
    :'Ошибка сервера ('+esc(r.error)+'). Нажмите «Повторить».';
   er.innerHTML=msg+'<button class="btn ghost" id="retry" style="margin-top:10px">Повторить</button>';$('#retry').onclick=finish;return}
  pg.finish();await new Promise(x=>setTimeout(x,180));dropHold();id=r.recordId;S.recId=null;if(S.srv)S.srv[S.type]={status:'passed',attempts:S.tries,best:S.score*10,passedAt:r.passedAt,validTo:r.validTo,recordId:id}}
 const rec={id,fio:S.fio,inn:S.inn,phone:S.phone,type:TYPES[S.type].name,date:d.toISOString(),score:S.score*10,tries:S.tries,sig:S.sig,photo:S.photo,photoAt:S.photoAt,consent:S.consent};
 const all=JSON.parse(localStorage.getItem(KEY)||'[]');all.push(rec);
 try{localStorage.setItem(KEY,JSON.stringify(all))}catch(e){alert('Память браузера заполнена: запись не сохранена в журнал на этом устройстве. Сообщите координатору — нужно выгрузить CSV и очистить журнал. Подтверждение ниже можно сохранить в PDF.')}cert(rec)}
function fmtS(iso){return new Date(iso).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function fmt(iso){return new Date(iso).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function cert(r){render(`<div class="pad"><h1 class="noprint" style="margin-top:14px">Готово!</h1><p class="sub noprint">Покажите этот пропуск координатору Заказчика или сохраните в PDF.</p>
 <div class="pass-w"><div class="cert"><div class="ph"><div class="ckw"><svg class="ck" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/><path d="M26 43l11 11 21-23"/></svg></div>
 <div class="brand"><i>ПР</i><span>Инструктаж пройден</span></div><div class="who">${r.photo?`<img class="face" src="${r.photo}" alt="фото">`:''}<div><div class="lbl">Исполнитель (самозанятый)</div><div class="nm">${esc(r.fio)}</div></div></div></div>
 <div class="perf"><i></i><i></i></div>
 <div class="grid"><div class="full"><span class="lbl">Вид услуг</span>${esc(r.type)}</div>
 <div><span class="lbl">ИНН</span>${r.inn}</div><div><span class="lbl">Телефон</span>${esc(r.phone)}</div>
 <div><span class="lbl">Результат</span><span class="big">${r.score}%</span></div><div><span class="lbl">Попытка</span>${r.tries} · сдан</div>
 <div><span class="lbl">Дата и время</span>${fmt(r.date)}</div><div><span class="lbl">Фото сделано</span>${r.photoAt?fmtS(r.photoAt):'—'}</div><div><span class="lbl">№ записи</span>${r.id}</div>
 <div class="full"><span class="lbl">Объект · Заказчик</span>Склад «Лемана ПРО» · ООО «Персональное Решение»</div>
 <div class="full"><span class="lbl">Подпись</span>${r.sig?`<img class="sig" src="${r.sig}" alt="подпись">`:'<span style="color:var(--m)">хранится в Google Таблице</span>'}</div></div>
 <p class="fine">Исполнитель ознакомлен с Правилами техники безопасности и правилами нахождения на объекте (приложение к договору возмездного оказания услуг) и обязуется их соблюдать. ${r.consent?`Согласие на обработку персональных данных и на использование изображения (версия ${esc(r.consent.v)}) дано ${fmtS(r.consent.at)}. `:''}Инструктаж на месте оказания услуг проводится координатором Заказчика / представителем объекта дополнительно.</p></div></div>
 <div class="noprint" style="margin-top:20px"><button class="btn" id="pdf">Скачать PDF</button><button class="btn ghost" id="mine">Моё обучение</button><button class="btn ghost" id="again">Выйти</button></div>
 ${recBlock(r)}</div>`);
 $('#pdf').onclick=()=>window.print();$('#again').onclick=()=>{reset();start()};$('#mine').onclick=()=>{if(!S.inn){S.inn=r.inn;S.fio=r.fio;S.phone=r.phone}dashboard()};
 app.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{if(!S.inn){S.inn=r.inn;S.fio=r.fio;S.phone=r.phone}startType(b.dataset.go)});
}
function admin(){if(API_URL)return adminSrv();adminLocal()}
function adminLocal(){app.className='wide';const all=JSON.parse(localStorage.getItem(KEY)||'[]');
 const ppl={};all.forEach(r=>{const p=ppl[r.inn]||(ppl[r.inn]={inn:r.inn,fio:r.fio,phone:r.phone,t:{},n:0,photo:false});p.fio=r.fio;p.phone=r.phone;p.n++;if(r.photo)p.photo=true;if(r.consent)p.cons=r.consent;const k=keyOf(r.type);if(k&&(!p.t[k]||p.t[k].date<r.date))p.t[k]=r});
 const AT=allAtt();Object.entries(AT).forEach(([key,a])=>{const [inn,k]=key.split('|');const p=ppl[inn]||(ppl[inn]={inn,fio:a.fio,phone:a.phone,t:{},n:0,photo:false});(p.a||(p.a={}))[k]=a});
 const P=Object.values(ppl);
 app.innerHTML=`<div class="pad screen"><h1>Прохождения (${all.length})</h1><p class="sub"><a href="${SHEET_URL}" target="_blank" rel="noopener" style="color:#FF2D87;font-weight:800">Открыть Google Таблицу с результатами →</a><br>${API_URL?'Источник истины — таблица; ниже — локальная копия этого устройства.':'Сервер не подключён (API_URL пуст): данные хранятся только в этом браузере (localStorage).'} Занято ≈ ${Math.round((localStorage.getItem(KEY)||'').length/1024)} КБ из ~5 000 КБ.</p><button class="btn" id="csv" style="max-width:260px;margin-bottom:16px">Экспорт CSV</button>
 <h2 style="margin:6px 0 10px">По исполнителям (${P.length})</h2><div class="adm" style="margin-bottom:24px"><table id="ppl"><tr><th>ФИО</th><th>ИНН</th><th>Телефон</th>${TK.map(k=>`<th>${TYPES[k].name}</th>`).join('')}<th>Фото</th></tr>${P.map(p=>`<tr><td>${esc(p.fio)}</td><td>${p.inn}</td><td>${esc(p.phone)}</td>${TK.map(k=>{const r=p.t[k],a=(p.a||{})[k];let h='—',col='inherit';
  if(a&&a.blocked){h=`⛔ Не допущен · ${a.n} попыт. · лучший ${a.best}%`;col='var(--no)'}
  else if(r){const exp=new Date(validTo(r))<new Date();h=`${exp?'⟳':'✓'} ${fmtD(r.date)} · ${r.score}%`;col=exp?'var(--no)':'var(--ok)'}
  if(a&&!a.blocked)h+=`<br><small style="color:var(--m)">попыток: ${a.n}/${MAXA}</small>`;
  return`<td style="color:${col};font-weight:700">${h}${a?`<br><button class="rst" data-rst="${p.inn}|${k}">Сбросить попытки</button>`:''}</td>`}).join('')}<td>${p.photo?'есть':'нет'}</td></tr>`).join('')}</table></div>
 <h2 style="margin:6px 0 10px">Все прохождения (${all.length})</h2><div class="adm"><table><tr><th>№</th><th>Дата</th><th>ФИО</th><th>ИНН</th><th>Телефон</th><th>Вид услуг</th><th>Результат</th><th>Попыток</th><th>Фото</th><th>Время фото</th><th>Подпись</th></tr>`+
 all.slice().reverse().map(r=>`<tr><td>${r.id}</td><td>${fmt(r.date)}</td><td>${esc(r.fio)}</td><td>${r.inn}</td><td>${esc(r.phone)}</td><td>${esc(r.type)}</td><td>${r.score}%</td><td>${r.tries}</td><td>${r.photo?`<img src="${r.photo}" style="height:44px;width:44px;object-fit:cover;border-radius:12px">`:'—'}</td><td>${r.photoAt?fmtS(r.photoAt):'—'}</td><td><img src="${r.sig}" style="height:30px"></td></tr>`).join('')+`</table></div></div>`;
 app.querySelectorAll('[data-rst]').forEach(b=>b.onclick=()=>{const [i,k]=b.dataset.rst.split('|');if(confirm('Сбросить попытки: '+TYPES[k].name+'?')){delAtt(i,k);admin()}});
 $('#csv').onclick=()=>{const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const head=['ФИО','ИНН','Телефон',...TK.flatMap(k=>[TYPES[k].name+': дата',TYPES[k].name+': результат',TYPES[k].name+': действует до',TYPES[k].name+': Допуск: допущен / не допущен',TYPES[k].name+': попыток / лучший']),'Фото: есть/нет','Согласие ПДн: дата/версия','Всего прохождений'];
  const rows=P.map(p=>[p.fio,'\t'+p.inn,p.phone,...TK.flatMap(k=>{const r=p.t[k],a=(p.a||{})[k];const ok=r&&new Date(validTo(r))>=new Date();return[r?fmt(r.date):'',r?r.score+'%':'',r?fmtD(validTo(r)):'',a&&a.blocked?'не допущен':ok?'допущен':'',a?a.n+' / '+a.best+'%':'']}),p.photo?'есть':'нет',p.cons?fmtS(p.cons.at)+' / '+p.cons.v:'',p.n]);
  const csv='\ufeff'+[head,...rows].map(r=>r.map(q).join(';')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='instruktazh_'+new Date().toISOString().slice(0,10)+'.csv';a.click()};
}

function drawSelfie(){const w=$('#selfie');if(!w)return;
 w.innerHTML=S.photo?`<div class="sfrow"><img class="sfthumb" src="${S.photo}" alt=""><div><div style="font-weight:800">Фото сделано ✓</div><div class="sub" style="margin:2px 0 0;font-size:13px">${fmtS(S.photoAt)}</div><button class="btn ghost" id="sfre" style="width:auto;padding:10px 16px;font-size:14px;margin-top:8px">Переснять</button></div></div>`
 :`<button class="btn" id="sfopen">📷 Сделать селфи</button>`;
 const b=$('#sfopen')||$('#sfre');b.onclick=openCam;S.upd&&S.upd();}
let stream=null,camLoop=0;
const MP='./mp/';let FL=null,FLp=null;
function loadFL(onP){if(FL){onP&&onP(1);return Promise.resolve(FL)}if(FLp)return FLp.then(x=>{onP&&onP(1);return x});
 FLp=(async()=>{onP&&onP(.02);const m=await import(MP+'vision_bundle.mjs');onP&&onP(.12);const fs=await m.FilesetResolver.forVisionTasks(MP+'wasm');onP&&onP(.2);
  let buf;try{buf=await fetchBuf(MP+'face_landmarker.task',p=>onP&&onP(.2+.7*p))}catch(e){buf=null}
  onP&&onP(.92);
  const mk=(d,base)=>m.FaceLandmarker.createFromOptions(fs,{baseOptions:{...base,delegate:d},runningMode:'VIDEO',numFaces:2,outputFaceBlendshapes:true,minFaceDetectionConfidence:.6,minFacePresenceConfidence:.6});
  const tryMk=async base=>{try{return await mk('GPU',base)}catch(e){return await mk('CPU',base)}};
  try{FL=buf?await tryMk({modelAssetBuffer:new Uint8Array(buf)}):await tryMk({modelAssetPath:MP+'face_landmarker.task'})}
  catch(e){if(buf)FL=await tryMk({modelAssetPath:MP+'face_landmarker.task'});else throw e}
  onP&&onP(1);return FL})();
 FLp.catch(()=>{FLp=null});return FLp}
let lastTs=0;function fts(){let t=performance.now();if(t<=lastTs)t=lastTs+1;lastTs=t;return t}
// оценка лица в кадре 3:4 (кроп по центру, как при съёмке)
function faceEval(res,vw,vh){const n=res&&res.faceLandmarks?res.faceLandmarks.length:0;if(n===0)return{ok:false,code:'none'};if(n>1)return{ok:false,code:'many'};
 const L=res.faceLandmarks[0];let x0=1,x1=0,y0=1,y1=0;L.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)});
 let cw=vw,ch=vh;if(vw/vh>3/4)cw=vh*3/4;else ch=vw*4/3;const ox=(vw-cw)/2/vw,oy=(vh-ch)/2/vh,sx=vw/cw,sy=vh/ch;
 const fx0=(x0-ox)*sx,fx1=(x1-ox)*sx,fy0=(y0-oy)*sy,fy1=(y1-oy)*sy,w=fx1-fx0,cx=(fx0+fx1)/2,cy=(fy0+fy1)/2;
 const bs={};(res.faceBlendshapes&&res.faceBlendshapes[0]?res.faceBlendshapes[0].categories:[]).forEach(c=>bs[c.categoryName]=c.score);
 const blink=Math.min(bs.eyeBlinkLeft||0,bs.eyeBlinkRight||0);const a=L[234],b=L[454],nz=L[1];const yaw=(nz.x-a.x)/((b.x-a.x)||1e-6);
 const r={w,cx,cy,blink,yaw};
 if(w<.25)return{...r,ok:false,code:'far'};if(w>.9)return{...r,ok:false,code:'near'};
 if(Math.abs(cx-.5)>.17||Math.abs(cy-.45)>.2)return{...r,ok:false,code:'center'};return{...r,ok:true,code:'ok'}}
const HINT={none:'Поместите лицо в овал',many:'В кадре должно быть одно лицо',far:'Подойдите ближе',near:'Отодвиньте телефон чуть дальше',center:'Поместите лицо в центр овала'};
function closeCam(){cancelAnimationFrame(camLoop);camLoop=0;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}const o=$('#cam');o&&o.remove()}
async function openCam(){closeCam();const o=document.createElement('div');o.id='cam';o.className='cam';document.body.appendChild(o);
 o.innerHTML=`<video id="vf" playsinline autoplay muted></video><div class="oval" id="oval"></div><div class="camtop"><button class="x" id="camx">✕</button></div>
 <div class="camhint" id="camhint">Включаем камеру…</div><div class="cambot"><div class="livebar"><i id="livefill"></i></div><button class="shutter" id="shot" disabled aria-label="Сделать фото"></button><div class="shl" id="shl">Фото сделается автоматически</div></div>`;
 $('#camx').onclick=closeCam;
 const fail=(msg,title='Камера недоступна',extra='<p class="small">Камера работает только при открытии приложения по защищённому адресу <b>https://</b>. Разрешите доступ к камере в настройках браузера и нажмите «Попробовать снова».</p>')=>{cancelAnimationFrame(camLoop);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
  o.innerHTML=`<div class="camerr"><div style="font-size:54px">📷</div><h2>${title}</h2><p>${msg}</p>${extra}<button class="btn" id="camretry">Попробовать снова</button><button class="btn glass" id="camclose">Закрыть</button></div>`;
  $('#camretry').onclick=openCam;$('#camclose').onclick=closeCam};
 if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){fail('Браузер не даёт доступ к камере на этой странице.');return}
 const hint=$('#camhint');
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720},height:{ideal:960}},audio:false})}
 catch(e){fail(e&&e.name==='NotAllowedError'?'Доступ к камере запрещён.':e&&e.name==='NotFoundError'?'На устройстве не найдена камера.':e&&e.name==='NotReadableError'?'Камера занята другим приложением.':e&&(e.name==='SecurityError'||e.name==='NotSupportedError')?'Браузер заблокировал доступ к камере.':'Не удалось включить камеру ('+esc(e&&e.name||e)+').');return}
 const v=$('#vf');if(!v){closeCam();return}v.srcObject=stream;
 await new Promise(r=>{if(v.readyState>=1)r();else v.onloadedmetadata=r});try{await v.play()}catch(e){}
 hint.textContent='Загружаем распознавание лица…';
 let pwrap=$('#cam-prog');if(!pwrap){pwrap=document.createElement('div');pwrap.id='cam-prog';pwrap.style.cssText='position:absolute;left:24px;right:24px;top:calc(70px + env(safe-area-inset-top));z-index:4';o.appendChild(pwrap)}
 pwrap.innerHTML=progHTML('Загрузка модели…','dark sm');const pg=startProg(pwrap,{expect:25000});
 let fl;try{fl=await Promise.race([loadFL(p=>pg.set(Math.min(.98,p))),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),45000))]);pg.finish()}
 catch(e){pg.stop();fail('Не удалось загрузить модуль распознавания лица. Проверьте интернет и попробуйте снова.','Нет распознавания лица','');return}
 pwrap.remove();
 if(!$('#cam'))return;
 const oval=$('#oval'),shot=$('#shot'),fill=$('#livefill'),shl=$('#shl');
 // фазы: align → live (моргнуть/повернуть) → hold (смотрим прямо) → снимок
 let bmin=1,phase='align',goodSince=0,base=null,eyesOpen=false,live=null,lastV=-1,lastE=null;
 const capture=async()=>{if(!stream)return;cancelAnimationFrame(camLoop);
  const W=480,vw=v.videoWidth,vh=v.videoHeight,H=Math.round(W*4/3);const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const sr=W/H;let sw=vw,sh=vw/sr;if(sh>vh){sh=vh;sw=vh*sr}x.translate(W,0);x.scale(-1,1);x.drawImage(v,(vw-sw)/2,(vh-sh)/2,sw,sh,0,0,W,H);
  // повторная проверка снимка
  let chk;try{chk=faceEval(fl.detectForVideo(c,fts()),W,H)}catch(e){chk={ok:false,code:'none'}}
  if(!chk.ok){phase='align';live=null;goodSince=0;hint.textContent='Лицо на снимке не найдено — '+(HINT[chk.code]||HINT.none).toLowerCase();fill.style.width='0';camLoop=requestAnimationFrame(tick);return}
  const url=c.toDataURL('image/jpeg',.7);const face={ok:true,live,w:Math.round(chk.w*100)/100,at:new Date().toISOString()};
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
  o.innerHTML=`<img class="prev" src="${url}" alt=""><div class="oval good"></div><div class="camhint">Лицо распознано ✓</div><div class="cambot two"><button class="btn glass" id="retake">Переснять</button><button class="btn" id="usep">Использовать фото</button></div>`;
  $('#retake').onclick=openCam;$('#usep').onclick=()=>{S.photo=url;S.photoAt=new Date().toISOString();S.face=face;closeCam();drawSelfie()}};
 shot.onclick=()=>{if(phase==='hold')capture()};
 const tick=()=>{if(!stream||!$('#cam'))return;camLoop=requestAnimationFrame(tick);
  if(v.readyState<2||v.currentTime===lastV)return;lastV=v.currentTime;
  let e;try{e=faceEval(fl.detectForVideo(v,fts()),v.videoWidth,v.videoHeight)}catch(err){return}lastE=e;window.__face=e;
  const now=performance.now();oval.classList.toggle('good',e.ok);oval.classList.toggle('bad',!e.ok&&e.code!=='none');
  if(!e.ok){shot.disabled=true;goodSince=0;if(phase!=='live'||e.code==='none'||e.code==='many'){phase='align';base=null;eyesOpen=false;fill.style.width='0'}hint.textContent=HINT[e.code];shl.textContent='Фото сделается автоматически';return}
  if(phase==='align'){if(!goodSince)goodSince=now;hint.textContent='Отлично, не двигайтесь…';fill.style.width=Math.min(30,(now-goodSince)/600*30)+'%';if(now-goodSince>600){phase='live';base=e.yaw;eyesOpen=false;bmin=1}return}
  if(phase==='live'){hint.textContent='Моргните или медленно поверните голову';fill.style.width='45%';
   bmin=Math.min(bmin,e.blink);if(e.blink<.4)eyesOpen=true;window.__bmax=Math.max(window.__bmax||0,e.blink);
   if(eyesOpen&&e.blink>Math.max(.45,bmin+.25))live='blink';else if(Math.abs(e.yaw-base)>.13)live='turn';
   if(live){phase='hold';goodSince=0}return}
  if(phase==='hold'){hint.textContent='Смотрите прямо в камеру';shot.disabled=false;shl.textContent='Сделать фото';
   const straight=Math.abs(e.yaw-base)<.08&&e.blink<Math.max(.4,bmin+.15);if(!straight){goodSince=0;fill.style.width='70%';return}
   if(!goodSince)goodSince=now;fill.style.width=(70+Math.min(30,(now-goodSince)/500*30))+'%';if(now-goodSince>500){phase='shot';capture()}}};
 hint.textContent=HINT.none;camLoop=requestAnimationFrame(tick);
}

// keyboard handling (iOS Safari / in-app browsers)
(function(){let fe=null,t;const vv=window.visualViewport;
 const center=()=>{if(!fe||!document.contains(fe))return;fe.scrollIntoView({block:'center',behavior:'smooth'})};
 const sync=()=>{if(vv)document.documentElement.style.setProperty('--vvh',vv.height+'px');const kb=vv?(innerHeight-vv.height>120):!!fe;document.body.classList.toggle('kbopen',!!fe||kb)};
 document.addEventListener('focusin',e=>{if(!e.target.matches('input[type=text],input[type=tel]'))return;fe=e.target;document.body.classList.add('kbopen');clearTimeout(t);t=setTimeout(center,300)});
 document.addEventListener('focusout',e=>{if(e.target===fe){fe=null;setTimeout(()=>{if(!fe)document.body.classList.remove('kbopen')},150)}});
 vv&&vv.addEventListener('resize',()=>{sync();clearTimeout(t);t=setTimeout(center,120)});
})();

const TK=['pick','load','t4','t4p'];
const REC={pick:[['load','Часто совмещается с комплектацией'],['t4','Электротележки ускоряют отбор']],load:[['pick','Смежный вид услуг на складе'],['t4','Перемещение паллет электротележкой']],t4:[['t4p','Следующий уровень. Нужно удостоверение тракториста-машиниста']],t4p:[['t4','Электротележки и штабелёры до 4 кВт']]};
function keyOf(name){return TK.find(k=>TYPES[k].name===name)}
function validTo(r){const d=new Date(r.date);d.setMonth(d.getMonth()+6);return d.toISOString()}
function fmtD(iso){return new Date(iso).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'})}
function myRecs(inn=S.inn){return JSON.parse(localStorage.getItem(KEY)||'[]').filter(r=>r.inn===inn)}
function status(inn=S.inn){const recs=myRecs(inn),now=new Date(),st={};
 TK.forEach(k=>{const r=recs.filter(x=>keyOf(x.type)===k).sort((a,b)=>a.date<b.date?1:-1)[0];if(r)st[k]={s:new Date(validTo(r))<now?'exp':'ok',r}});
 TK.forEach(k=>{const a=getAtt(inn,k);if(a.blocked&&!(st[k]&&st[k].s==='ok'))st[k]={s:'blk',a}});
 TK.forEach(k=>{if(st[k]&&st[k].s==='ok')(REC[k]||[]).forEach(([t,why])=>{if(!st[t])st[t]={s:'rec',why}})});
 if(S.srv&&inn===S.inn)TK.forEach(k=>{const t=S.srv[k];if(!t)return;
  if(t.status==='blocked')st[k]={s:'blk',a:{...getAtt(inn,k),best:t.best,n:t.attempts}};
  else if((t.status==='passed'||t.status==='expired')&&!(st[k]&&(st[k].s==='ok'||st[k].s==='exp'))){const r={id:t.recordId,fio:S.fio,inn,phone:S.phone,type:TYPES[k],date:t.passedAt,score:t.best,tries:t.attempts,sig:'',photo:''};st[k]={s:t.status==='passed'?'ok':'exp',r}}
  else if(t.status==='none'&&st[k]&&st[k].s==='blk')delete st[k];});
 TK.forEach(k=>{if(st[k]&&st[k].s==='ok')(REC[k]||[]).forEach(([t,why])=>{if(!st[t])st[t]={s:'rec',why}})});
 TK.forEach(k=>{if(!st[k])st[k]={s:'none'}});return st}
function nextRec(st){return TK.find(k=>st[k].s==='exp')||TK.find(k=>st[k].s==='rec')||TK.find(k=>st[k].s==='none')}
function startType(k){if(getAtt(S.inn,k).blocked){S.type=k;blocked(k);return}S.type=k;S.slides=[...COMMON_BEFORE,...SPECIFIC[k],...COMMON_AFTER];S.i=0;S.maxRead=-1;S.photo=null;S.photoAt=null;S.sig=null;S.face=null;S.recId=null;S.tries=getAtt(S.inn,k).n;slide()}
const BADGE={blk:['Не допущен','b-exp'],ok:['Пройдено ✓','b-ok'],rec:['Рекомендовано','b-rec'],exp:['Требуется повтор','b-exp'],none:['Не пройдено','b-none']};
function dashboard(){const st=status(),done=TK.filter(k=>st[k].s==='ok').length,nx=nextRec(st),C=2*Math.PI*44;
 render(`<div class="top"><button class="back" id="bk">←</button><div style="margin-left:auto;font-weight:700;color:var(--m);font-size:13px;text-align:right">${esc(S.fio)}<br>ИНН ${S.inn}</div></div>
 <div class="pad" style="padding-top:6px"><h1>Моё обучение</h1>
 <div class="dash"><svg class="ring" viewBox="0 0 100 100"><defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#FF6B00"/><stop offset="1" stop-color="#FF2D87"/></linearGradient></defs><circle cx="50" cy="50" r="44" class="rb"/><circle cx="50" cy="50" r="44" class="rf" style="stroke-dasharray:${C};--off:${C*(1-done/4)}"/></svg>
 <div><div class="rn"><b>${done}</b> из 4</div><div class="sub" style="margin:2px 0 0">видов услуг пройдено</div></div></div>
 ${nx?`<button class="btn" id="cta">${st[nx].s==='exp'?'Повторить':'Пройти'}: ${TYPES[nx].name} →</button>`:'<div class="card" style="text-align:center;font-weight:800">Все виды услуг пройдены 🎉</div>'}
 <div class="common"><span class="cico">${done||TK.some(k=>st[k].s==='exp')?'✓':'○'}</span><div><b>Общие правила и автоматика</b><div class="sub" style="margin:2px 0 0;font-size:13px">${done?'Пройдено в составе инструктажа':'Входит в любой вид услуг'}</div></div></div>
 <div class="dlist">${TK.map(k=>{const x=st[k],[bt,bc]=BADGE[x.s];return`<button class="dcard" data-k="${k}"><img src="img/${TIMG[k]}" alt=""><div class="dc"><span class="badge ${bc}">${bt}</span><b>${TYPES[k].name}</b>
 <small>${x.s==='ok'?`${fmtD(x.r.date)} · ${x.r.score}% · действует до ${fmtD(validTo(x.r))}`:x.s==='blk'?`Не допущен к оказанию услуг · лучший ${x.a.best}% · обратитесь к координатору`:x.s==='exp'?`Срок истёк ${fmtD(validTo(x.r))}`:x.s==='rec'?esc(x.why):TSUB[k]}</small></div><i class="chev">›</i></button>`}).join('')}</div></div>`);
 $('#bk').onclick=start;nx&&($('#cta').onclick=()=>startType(nx));
 app.querySelectorAll('.dcard').forEach(b=>b.onclick=()=>{const x=st[b.dataset.k];x.s==='ok'?cert(x.r):x.s==='blk'?blocked(b.dataset.k):startType(b.dataset.k)});
}
function recBlock(r){const st=status(r.inn),ks=TK.filter(k=>st[k].s==='rec'||st[k].s==='exp');if(!ks.length)return'';
 return `<div class="noprint"><h2 style="margin:28px 0 12px">Рекомендуем пройти далее</h2>${ks.map(k=>`<button class="dcard" data-go="${k}"><img src="img/${TIMG[k]}" alt=""><div class="dc"><span class="badge ${BADGE[st[k].s][1]}">${BADGE[st[k].s][0]}</span><b>${TYPES[k].name}</b><small>${esc(st[k].why||'Срок действия истёк')}</small></div><i class="chev">›</i></button>`).join('')}</div>`}


const PASS=9,MAXA=4,AKEY='ot_pr_attempts';
function allAtt(){return JSON.parse(localStorage.getItem(AKEY)||'{}')}
function getAtt(inn,k){return allAtt()[inn+'|'+k]||{n:0,best:0}}
function setAtt(inn,k,a){const all=allAtt();all[inn+'|'+k]=a;localStorage.setItem(AKEY,JSON.stringify(all))}
function delAtt(inn,k){const all=allAtt();delete all[inn+'|'+k];localStorage.setItem(AKEY,JSON.stringify(all))}
function blkCard(a){return `<div class="blk"><div class="bico">⛔</div><b>Не допущен к оказанию услуг</b><p>${esc(a.type)}: использованы все ${MAXA} попытки, лучший результат ${a.best}%.<br><b>Обратитесь к координатору Заказчика.</b></p></div>`}
function blocked(k){const a=getAtt(S.inn,k);render(`<div class="top"><button class="back" id="bk">←</button></div><div class="pad" style="padding-top:8px">
 <h1>Доступ<br>закрыт</h1>${blkCard({...a,type:TYPES[k].name})}
 <div class="card"><div class="grid" style="padding:0"><div><span class="lbl">Исполнитель</span>${esc(a.fio||S.fio)}</div><div><span class="lbl">ИНН</span>${S.inn}</div><div><span class="lbl">Попыток</span>${a.n} из ${MAXA}</div><div><span class="lbl">Лучший результат</span>${a.best}%</div><div class="full"><span class="lbl">Дата</span>${a.date?fmt(a.date):'—'}</div></div></div>
 <button class="btn ghost" id="todash">Моё обучение</button></div>`);$('#bk').onclick=$('#todash').onclick=dashboard}
// ===== Админка из Google Таблицы (все исполнители). Пароль — отдельный от публичного токена.
const AKP='ot_admin_pw',STN={passed:'Пройдено',expired:'Требуется повтор',blocked:'Не допущен',pending:'Ожидает подписи',progress:'В процессе',none:'—'};
const STC={passed:'var(--ok)',expired:'#E05A00',blocked:'var(--no)',pending:'#E05A00',progress:'var(--m)',none:'var(--m)'};
const AD={rows:null,att:[],q:'',t:'',s:''};
function adminLogin(err){app.className='';app.innerHTML=`<div class="pad screen"><h1>Админка</h1><p class="sub">Введите пароль администратора. Он нужен, чтобы загрузить всех исполнителей из Google Таблицы.</p>
 <input id="apw" type="password" autocomplete="current-password" placeholder="Пароль" style="width:100%;font-size:16px;padding:14px 16px;border-radius:16px;border:1px solid #E3E5EA;box-sizing:border-box">
 <div class="err" id="aer" style="color:var(--no);margin:8px 0;font-weight:700">${err?esc(err):''}</div><button class="btn" id="ago">Войти</button>
 <p class="sub" style="margin-top:18px"><a href="#" id="aloc" style="color:var(--m)">Показать данные только этого устройства</a></p></div>`;
 const go=()=>{const v=$('#apw').value.trim();if(!v)return;sessionStorage.setItem(AKP,v);adminLoad()};$('#ago').onclick=go;$('#apw').onkeydown=e=>{if(e.key==='Enter')go()};$('#aloc').onclick=e=>{e.preventDefault();adminLocal()}}
function adminSrv(){sessionStorage.getItem(AKP)?adminLoad():adminLogin()}
async function adminLoad(){app.className='';app.innerHTML=`<div class="pad screen"><h1>Админка</h1><p class="sub">Загружаем данные из Google Таблицы… Первый запрос может занять до 40 секунд.</p><div id="adm-prog">${progHTML('Загрузка списка')}</div></div>`;
 const pg=startProg($('#adm-prog'),{expect:40000});
 let r;try{r=await api('admin_list',{admin:sessionStorage.getItem(AKP)},60000);pg.finish()}catch(e){pg.stop();r={ok:false,error:'net'}}
 if(!r.ok){if(r.error==='bad_admin'){sessionStorage.removeItem(AKP);return adminLogin('Неверный пароль')}
  app.innerHTML=`<div class="pad screen"><h1>Админка</h1><div class="blk"><div class="bico">⚠️</div><b>Не удалось загрузить данные с сервера</b><p>${r.error==='net'?'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.':r.error==='unknown_action'?'На сервере старая версия скрипта. Обновите код в Apps Script и сделайте «Новую версию» развертывания.':'Ошибка сервера: '+esc(r.error)}</p></div>
  <button class="btn" id="arty" style="margin-top:14px">Повторить</button><p class="sub" style="margin-top:14px"><a href="${SHEET_URL}" target="_blank" rel="noopener" style="color:#FF2D87;font-weight:800">Открыть Google Таблицу →</a><br><a href="#" id="aloc" style="color:var(--m)">Данные только этого устройства</a></p></div>`;
  $('#arty').onclick=adminSrv;$('#aloc').onclick=e=>{e.preventDefault();adminLocal()};return}
 AD.rows=r.rows;AD.att=r.attempts||[];AD.max=r.max||MAXA;adminView()}
function adFilt(){const q=AD.q.toLowerCase().trim();return AD.rows.filter(x=>(!q||String(x.fio).toLowerCase().includes(q)||x.inn.includes(q))&&(!AD.t||x.type===AD.t)&&(!AD.s||x.state.status===AD.s))}
function adminView(){const sel='font-size:16px;padding:12px;border-radius:14px;border:1px solid #E3E5EA;background:#fff;min-width:0;flex:1';
 const cnt=s=>AD.rows.filter(x=>x.state.status===s).length;
 app.innerHTML=`<div class="pad screen"><h1>Исполнители</h1><p class="sub">Из Google Таблицы: ${AD.rows.length} записей · ✓ ${cnt('passed')} · ⛔ ${cnt('blocked')} · ⟳ ${cnt('expired')}<br><a href="${SHEET_URL}" target="_blank" rel="noopener" style="color:#FF2D87;font-weight:800">Открыть таблицу →</a></p>
 <input id="aq" type="search" placeholder="Поиск по ФИО или ИНН" value="${esc(AD.q)}" style="width:100%;box-sizing:border-box;font-size:16px;padding:12px 14px;border-radius:14px;border:1px solid #E3E5EA;margin-bottom:8px">
 <div style="display:flex;gap:8px;margin-bottom:8px"><select id="at" style="${sel}"><option value="">Все виды услуг</option>${TK.map(k=>`<option value="${k}"${AD.t===k?' selected':''}>${esc(TYPES[k].name)}</option>`).join('')}</select>
 <select id="as" style="${sel}"><option value="">Все статусы</option>${Object.keys(STN).filter(k=>k!=='none').map(k=>`<option value="${k}"${AD.s===k?' selected':''}>${STN[k]}</option>`).join('')}</select></div>
 <div style="display:flex;gap:8px;margin-bottom:14px"><button class="btn" id="acsv" style="flex:1">Экспорт CSV</button><button class="btn" id="arl" style="flex:1;background:#EEF0F3;color:inherit">Обновить</button></div>
 <div id="alist"></div>
 <h2 style="margin:22px 0 10px">Последние попытки</h2><div class="adm"><table><tr><th>Время</th><th>ФИО</th><th>ИНН</th><th>Вид</th><th>№</th><th>Балл</th><th>Результат</th></tr>${AD.att.slice(0,100).map(a=>`<tr><td>${a.at?fmt(a.at):''}</td><td>${esc(a.fio)}</td><td>${esc(a.inn)}</td><td>${esc(a.typeName)}</td><td>${esc(a.n)}</td><td>${esc(a.score)}%</td><td>${esc(a.result)}</td></tr>`).join('')}</table></div>
 <p class="sub" style="margin-top:16px"><a href="#" id="aout" style="color:var(--m)">Выйти</a></p></div>`;
 const list=()=>{const L=adFilt();$('#alist').innerHTML=L.length?L.map(x=>{const st=x.state,c=STC[st.status];return`<div class="card" style="margin-bottom:10px;padding:14px 16px">
  <div style="display:flex;justify-content:space-between;gap:8px"><b style="word-break:break-word">${esc(x.fio||'—')}</b><span style="color:${c};font-weight:800;white-space:nowrap">${STN[st.status]||esc(x.sheetStatus)}</span></div>
  <div style="color:var(--m);font-size:14px;margin:2px 0 6px">ИНН ${esc(x.inn)}${x.phone?' · '+esc(x.phone):''}<br>${esc(x.typeName)}</div>
  <div style="font-size:14px">Попыток: <b>${st.attempts}/${AD.max}</b> · лучший: <b>${st.best}%</b>${x.passedAt?`<br>Сдал: ${fmtD(x.passedAt)} · до ${x.validTo?fmtD(x.validTo):'—'}`:''}${x.rec?` · № ${esc(x.rec)}`:''}${x.upd?`<br><small style="color:var(--m)">Обновлено ${fmt(x.upd)}</small>`:''}</div>
  <div style="font-size:14px;margin-top:6px">${x.selfie?`<a href="${esc(x.selfie)}" target="_blank" rel="noopener" style="color:#FF2D87;font-weight:700">Селфи</a>`:'Селфи —'} · ${x.sig?`<a href="${esc(x.sig)}" target="_blank" rel="noopener" style="color:#FF2D87;font-weight:700">Подпись</a>`:'Подпись —'}</div>
  ${(st.attempts>0||st.status==='blocked')&&x.type?`<button class="rst" data-rst="${esc(x.inn)}|${x.type}">Сбросить попытки</button>`:''}</div>`}).join(''):'<p class="sub">Никого не найдено.</p>';
  app.querySelectorAll('[data-rst]').forEach(b=>b.onclick=async()=>{const [inn,k]=b.dataset.rst.split('|');if(!confirm('Сбросить попытки: '+TYPES[k].name+', ИНН '+inn+'?'))return;b.disabled=true;b.textContent='Сбрасываем…';
   let r;try{r=await api('admin_reset',{admin:sessionStorage.getItem(AKP),inn,type:k},60000)}catch(e){r={ok:false,error:'net'}}
   if(r.ok){delAtt(inn,k);const x=AD.rows.find(y=>y.inn===inn&&y.type===k);if(x)x.state=r.state;list()}else{b.disabled=false;b.textContent='Сбросить попытки';alert(r.error==='net'?NET:'Ошибка: '+r.error)}})};
 list();$('#aq').oninput=e=>{AD.q=e.target.value;list()};$('#at').onchange=e=>{AD.t=e.target.value;list()};$('#as').onchange=e=>{AD.s=e.target.value;list()};
 $('#arl').onclick=adminLoad;$('#aout').onclick=e=>{e.preventDefault();sessionStorage.removeItem(AKP);adminLogin()};
 $('#acsv').onclick=()=>{const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const head=['ФИО','ИНН','Телефон','Вид услуг','Статус','Статус в таблице','Попыток','Лучший %','Дата сдачи','Действует до','№ записи','Селфи','Подпись','Согласие ПДн','Проверка лица','Обновлено'];
  const rows=adFilt().map(x=>[x.fio,'\t'+x.inn,x.phone,x.typeName,STN[x.state.status],x.sheetStatus,x.state.attempts,x.state.best,x.passedAt?fmtD(x.passedAt):'',x.validTo?fmtD(x.validTo):'',x.rec,x.selfie,x.sig,x.cons,x.face,x.upd?fmt(x.upd):'']);
  const blob=new Blob(['\ufeff'+[head,...rows].map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ispolniteli_'+new Date().toISOString().slice(0,10)+'.csv';a.click()}}
new URLSearchParams(location.search).has('admin')?admin():start();
function hasHist(){return myRecs().length>0||(S.srv&&Object.values(S.srv).some(t=>t.status!=='none'))||Object.keys(allAtt()).some(k=>k.startsWith(S.inn+'|'))}

async function checkSrv(){const score=S.qs.filter((q,i)=>S.ans[i]===q.c).length;
 render(`<div class="pad" style="text-align:center;padding-top:22vh"><h2 style="margin:0 0 8px;font-size:22px;font-weight:800">Сохраняем результат…</h2><p class="sub">Первый ответ может занять до 40 секунд</p><div id="chk-prog">${progHTML('Отправка на сервер')}</div></div>`);
 const pg=startProg($('#chk-prog'),{expect:40000});
 let r;try{r=await api('attempt',{consent:S.consent,inn:S.inn,fio:S.fio,phone:S.phone,type:S.type,score});pg.finish();await new Promise(x=>setTimeout(x,160))}catch(e){pg.stop();r=null}
 if(!r){render(`<div class="pad" style="padding-top:12vh"><h1>Нет связи</h1><p class="sub">${NET}. Результат теста ещё не сохранён — ответы не потеряны.</p><button class="btn" id="resend">Отправить ещё раз</button></div>`);$('#resend').onclick=checkSrv;return}
 if(!r.ok&&r.error==='blocked'){setAtt(S.inn,S.type,{...getAtt(S.inn,S.type),n:r.state.attempts,best:r.state.best,blocked:true,fio:S.fio,type:TYPES[S.type],date:new Date().toISOString()});blocked(S.type);return}
 if(!r.ok){render(`<div class="pad" style="padding-top:12vh"><h1>Ошибка</h1><p class="sub">Сервер ответил: ${esc(r.error)}</p><button class="btn" id="resend">Повторить</button></div>`);$('#resend').onclick=checkSrv;return}
 S.tries=r.attempt;if(S.srv)S.srv[S.type]={...(S.srv[S.type]||{}),status:r.blocked?'blocked':r.passed?'pending':'progress',attempts:r.attempt,best:r.best};S.sent=true;check()}

const CONSENT_V='1.0 от 15.10.2026';
const CONSENT_HTML=`<h2>Согласие на обработку персональных данных</h2>
<p>Я, субъект персональных данных, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных», свободно, своей волей и в своём интересе даю согласие <b>ООО «Персональное Решение»</b> (далее — Оператор) на обработку моих персональных данных на следующих условиях.</p>
<h3>1. Перечень персональных данных</h3><p>Фамилия, имя, отчество; ИНН; номер телефона; фотографическое изображение (селфи), полученное при прохождении инструктажа; собственноручная подпись (графическое изображение); результаты тестирования, сведения о попытках, дата и время прохождения инструктажа и выдачи допуска.</p>
<h3>2. Цели обработки</h3><p>Проведение инструктажа по технике безопасности и правилам нахождения на объекте; подтверждение личности исполнителя и факта ознакомления с Правилами; допуск к оказанию услуг по договору возмездного оказания услуг; передача сведений о допуске представителю объекта (склад «Лемана ПРО»).</p>
<h3>3. Действия с персональными данными</h3><p>Сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передача (предоставление, доступ), блокирование, удаление, уничтожение — с использованием средств автоматизации и без их использования.</p>
<h3>4. Место хранения и трансграничная передача</h3><p>Данные хранятся в памяти моего устройства и в облачных сервисах Google (Google Таблицы, Google Диск). Серверы этих сервисов могут находиться за пределами Российской Федерации; я уведомлён(а) о возможной трансграничной передаче персональных данных и согласен(на) на неё.</p>
<h3>5. Фотографическое изображение</h3><p>Отдельно даю согласие на фотосъёмку и использование моего изображения исключительно для подтверждения личности при прохождении инструктажа и оформлении допуска.</p>
<h3>6. Срок действия и отзыв</h3><p>Согласие действует до истечения 3 (трёх) лет после прекращения договора возмездного оказания услуг либо до его отзыва. Согласие может быть отозвано письменным заявлением, направленным Оператору. Отзыв согласия не влияет на законность обработки, осуществлённой до отзыва; после отзыва допуск к оказанию услуг на объекте может быть невозможен.</p>
<p class="cv">Версия текста согласия: ${CONSENT_V}</p>`;
function consentModal(){const o=document.createElement('div');o.className='cmodal';o.innerHTML=`<div class="csheet"><button class="x2" aria-label="Закрыть">✕</button><div class="ctext">${CONSENT_HTML}</div><button class="btn" id="cnsok">Понятно</button></div>`;document.body.appendChild(o);
 const close=()=>o.remove();o.querySelector('.x2').onclick=close;o.querySelector('#cnsok').onclick=close;o.onclick=e=>{if(e.target===o)close()}}
