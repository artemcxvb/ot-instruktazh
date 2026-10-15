// ===== Backend (Google Apps Script). Пусто = локальный режим без сервера.
const API_URL=window.OT_API_URL||'https://script.google.com/macros/s/AKfycbzW686AVecKW5PNf1oBDf62XteloBCL0jb9eInkFE44HPg1TDIC5JFvLYS5FyvaK_Tm/exec';
const API_TOKEN='gBU-Yj7L-7h_2zGd2EXgr9Qy';
const SHEET_URL='https://docs.google.com/spreadsheets/d/17OdCnBHpzfZOEjSBPVcRiiO3-YCbVijOL9-UIiR9KnM/edit';
async function api(action,data){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),20000);
 try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({token:API_TOKEN,action,...data}),redirect:'follow',signal:ac.signal});
  if(!r.ok)throw new Error('http '+r.status);return await r.json()}finally{clearTimeout(t)}}
const NET='Нет связи, попробуйте позже';
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
function render(html,cls='screen'){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();app.className='';app.innerHTML=`<div class="${cls}">${html}</div>`;toTop()}
if('scrollRestoration' in history)history.scrollRestoration='manual';
(function(){const set=()=>{const h=window.visualViewport?visualViewport.height:innerHeight;document.documentElement.style.setProperty('--app-h',Math.round(h)+'px')};set();addEventListener('resize',set);window.visualViewport&&visualViewport.addEventListener('resize',set)})();
function buzz(){try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}}
document.addEventListener('pointerdown',e=>{if(e.target.closest('button'))buzz()});

function start(){render(`<div class="hero"><img src="img/conveyor.jpg" alt="">${BRAND}<div class="in">
 <h1 class="mega">Безопасность<br><em>начинается с тебя</em></h1>
 <p>Инструктаж для исполнителей (самозанятых) ООО «Персональное Решение» на складе «Лемана ПРО».</p>
 <div class="chips"><span>⏱ ~15 минут</span><span>📝 10 вопросов</span><span>✍️ Подпись</span></div></div></div>
 <div class="pad"><div class="form"><label>ФИО</label><input type="text" id="fio" autocomplete="name" autocapitalize="words" enterkeyhint="next" placeholder="Иванов Иван Иванович" value="${esc(S.fio)}"><div class="err" id="e1"></div>
 <label>ИНН · 12 цифр</label><input type="text" id="inn" inputmode="numeric" pattern="[0-9]*" autocomplete="off" enterkeyhint="next" maxlength="12" placeholder="000000000000" value="${esc(S.inn)}"><div class="err" id="e2"></div>
 <label>Телефон</label><input type="tel" id="phone" inputmode="tel" autocomplete="tel" enterkeyhint="done" placeholder="+7 900 000-00-00" value="${esc(S.phone)}"><div class="err" id="e3"></div>
 <label class="chk cns"><input type="checkbox" id="pdn"><span>Даю согласие на обработку персональных данных на условиях <a href="#" id="cnsopen">текста согласия</a></span></label>
 <label class="chk cns"><input type="checkbox" id="phc"><span>Даю согласие на фотосъёмку и использование моего изображения для подтверждения личности</span></label><div class="err" id="e4"></div>
 <button class="btn" id="go">Начать инструктаж →</button></div></div>`);
 ['fio','inn','phone'].forEach((id,k,a)=>$('#'+id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();k<2?$('#'+a[k+1]).focus():$('#go').click()}}));
 $('#cnsopen').onclick=e=>{e.preventDefault();consentModal()};
 $('#inn').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,12);
 $('#go').onclick=()=>{const fio=$('#fio').value.trim().replace(/\s+/g,' '),inn=$('#inn').value,ph=$('#phone').value.trim();let ok=true;
  $('#e1').textContent=fio.split(' ').length<2||!/^[А-Яа-яЁёA-Za-z\- ]+$/.test(fio)?(ok=false,'Укажите фамилию и имя (и отчество при наличии)'):'';
  $('#e2').textContent=!/^\d{12}$/.test(inn)?(ok=false,'ИНН физического лица — ровно 12 цифр'):!innValid(inn)?(ok=false,'Неверная контрольная сумма ИНН — проверьте цифры'):'';
  const pd=ph.replace(/\D/g,'');$('#e3').textContent=!(pd.length===11&&/^[78]/.test(pd))&&!(pd.length===10)?(ok=false,'Введите номер в формате +7XXXXXXXXXX'):'';
  $('#e4').textContent=!$('#pdn').checked||!$('#phc').checked?(ok=false,'Необходимо дать оба согласия — без них инструктаж пройти нельзя'):'';
  if(!ok){$('.form').classList.remove('shake');void $('.form').offsetWidth;$('.form').classList.add('shake');return}
  S.fio=fio;S.inn=inn;S.phone='+7'+pd.slice(-10);S.consent={v:CONSENT_V,at:new Date().toISOString(),pdn:true,photo:true};localStorage.setItem('ot_consent_'+inn,JSON.stringify(S.consent));localStorage.setItem('ot_last_inn',inn);
  if(API_URL){const g=$('#go');g.disabled=true;g.textContent='Проверяем…';api('status',{inn}).then(r=>{if(!r.ok)throw new Error(r.error);syncSrv(r.types);hasHist()?dashboard():chooseType()}).catch(()=>{g.disabled=false;g.textContent='Начать инструктаж →';$('#e3').textContent=NET})}
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
 <div class="scontent"><span class="slbl">${S.i+1}/${n} · ${esc(s.sec)}</span><h2 class="stitle${s.pts.length+s.no.length+s.ok.length>7?' sm':''}">${esc(s.title)}</h2>
 <div class="sheet"><div class="chiprow">${chips(s.no,'no','ЗАПРЕЩЕНО','✕')}${chips(s.ok,'ok','ПРАВИЛЬНО','✓')}</div><ul>${s.pts.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div>
 <div class="row"><button class="btn glass" id="prev">←</button><button class="btn" id="next" ${read?'':'disabled'}>${read?(S.i<n-1?'Далее →':'К тесту →'):'Читаем…'}</button></div>
 <div class="hint">Свайп ← → или тап по краям фото</div></div></div>`,'');
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
function startTest(){S.sent=false;S.qs=shuffle([...shuffle(Q_COMMON).slice(0,5),...Q_SPEC[S.type]]).map(q=>{const o=shuffle(q.a.map((t,j)=>({t,r:j===q.c})));return{...q,a:o.map(x=>x.t),c:o.findIndex(x=>x.r)}});S.ans=Array(10).fill(null);S.qi=0;const at=getAtt(S.inn,S.type);if(at.blocked){blocked(S.type);return}S.tries=at.n+1;question()}
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
 <div class="card"><div style="display:flex;align-items:center"><b style="font-size:17px">Подпись пальцем</b><button class="btn ghost" id="clr" style="margin:0 0 0 auto;width:auto;padding:10px 16px;font-size:14px">Очистить</button></div><canvas id="sig"></canvas></div>
 <button class="btn" id="done" disabled>Подписать</button></div>`);
 $('#bk').onclick=check;
 const c=$('#sig'),r=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;c.width=r.width*dpr;c.height=r.height*dpr;
 const x=c.getContext('2d');x.scale(dpr,dpr);x.lineWidth=2.8;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#0B0B12';let dr=false,len=0;
 const pt=e=>{const b=c.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
 c.onpointerdown=e=>{dr=true;c.setPointerCapture(e.pointerId);x.beginPath();x.moveTo(...pt(e))};
 c.onpointermove=e=>{if(!dr)return;x.lineTo(...pt(e));x.stroke();len++;upd()};
 c.onpointerup=c.onpointercancel=()=>dr=false;
 const done=$('#done'),upd=()=>done.disabled=!($('#agree').checked&&len>10&&S.photo);S.upd=upd;drawSelfie();
 $('#clr').onclick=()=>{x.clearRect(0,0,c.width,c.height);len=0;upd()};$('#agree').onchange=upd;
 done.onclick=()=>{S.sig=c.toDataURL('image/png');finish()};done.insertAdjacentHTML('afterend','<div class="err" id="serr" style="text-align:center"></div>');
}
async function finish(){const d=new Date();let id=Date.now().toString(36).toUpperCase();
 if(API_URL){const b=$('#done');b.disabled=true;b.textContent='Сохраняем…';$('#serr').textContent='';
  let r;try{r=await api('complete',{consent:S.consent,inn:S.inn,type:S.type,fio:S.fio,phone:S.phone,agree:true,photo:S.photo,photoAt:S.photoAt,sig:S.sig,recordId:id})}catch(e){r=null}
  if(!r||!r.ok){b.disabled=false;b.textContent='Подписать';$('#serr').textContent=!r?NET:r.error==='not_passed'?'Сервер не подтвердил сдачу теста. Обратитесь к координатору Заказчика.':'Ошибка сервера: '+r.error;return}
  id=r.recordId;if(S.srv)S.srv[S.type]={status:'passed',attempts:S.tries,best:S.score*10,passedAt:r.passedAt,validTo:r.validTo,recordId:id}}
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
function admin(){app.className='wide';const all=JSON.parse(localStorage.getItem(KEY)||'[]');
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
let stream=null;
function closeCam(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}const o=$('#cam');o&&o.remove()}
async function openCam(){closeCam();const o=document.createElement('div');o.id='cam';o.className='cam';document.body.appendChild(o);
 o.innerHTML=`<video id="vf" playsinline autoplay muted></video><div class="oval"></div><div class="camtop"><button class="x" id="camx">✕</button></div>
 <div class="camhint" id="camhint">Поместите лицо в овал</div><div class="cambot"><button class="shutter" id="shot" disabled aria-label="Сделать фото"></button><div class="shl">Сделать фото</div></div>`;
 $('#camx').onclick=closeCam;
 const fail=(msg)=>{o.innerHTML=`<div class="camerr"><div style="font-size:54px">📷</div><h2>Камера недоступна</h2><p>${msg}</p><p class="small">Камера работает только при открытии приложения по защищённому адресу <b>https://</b> или с <b>localhost</b>. Разрешите доступ к камере в настройках браузера и нажмите «Попробовать снова».</p><button class="btn" id="camretry">Попробовать снова</button><button class="btn glass" id="camclose">Закрыть</button></div>`;
  $('#camretry').onclick=openCam;$('#camclose').onclick=closeCam};
 if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){fail('Браузер не даёт доступ к камере на этой странице.');return}
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720},height:{ideal:960}},audio:false})}
 catch(e){fail(e&&e.name==='NotAllowedError'?'Доступ к камере запрещён.':e&&e.name==='NotFoundError'?'На устройстве не найдена камера.':e&&e.name==='NotReadableError'?'Камера занята другим приложением.':e&&(e.name==='SecurityError'||e.name==='NotSupportedError')?'Браузер заблокировал доступ к камере.':'Не удалось включить камеру ('+esc(e&&e.name||e)+').');return}
 const v=$('#vf');if(!v){closeCam();return}v.srcObject=stream;
 v.onloadedmetadata=()=>{v.play();$('#shot').disabled=false};
 $('#shot').onclick=()=>{const W=480,vw=v.videoWidth,vh=v.videoHeight,H=Math.round(W*4/3);const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const sr=W/H;let sw=vw,sh=vw/sr;if(sh>vh){sh=vh;sw=vh*sr}x.translate(W,0);x.scale(-1,1);x.drawImage(v,(vw-sw)/2,(vh-sh)/2,sw,sh,0,0,W,H);
  const url=c.toDataURL('image/jpeg',.7);o.querySelector('.flash')||o.insertAdjacentHTML('beforeend','<div class="flash"></div>');
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
  o.innerHTML=`<img class="prev" src="${url}" alt=""><div class="oval"></div><div class="cambot two"><button class="btn glass" id="retake">Переснять</button><button class="btn" id="usep">Использовать фото</button></div>`;
  $('#retake').onclick=openCam;$('#usep').onclick=()=>{S.photo=url;S.photoAt=new Date().toISOString();closeCam();drawSelfie()}};
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
function startType(k){if(getAtt(S.inn,k).blocked){S.type=k;blocked(k);return}S.type=k;S.slides=[...COMMON_BEFORE,...SPECIFIC[k],...COMMON_AFTER];S.i=0;S.maxRead=-1;S.photo=null;S.photoAt=null;S.sig=null;S.tries=getAtt(S.inn,k).n;slide()}
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
new URLSearchParams(location.search).has('admin')?admin():start();
function hasHist(){return myRecs().length>0||(S.srv&&Object.values(S.srv).some(t=>t.status!=='none'))||Object.keys(allAtt()).some(k=>k.startsWith(S.inn+'|'))}

async function checkSrv(){const score=S.qs.filter((q,i)=>S.ans[i]===q.c).length;
 render(`<div class="pad" style="text-align:center;padding-top:30vh"><div class="spin"></div><p class="sub">Сохраняем результат…</p></div>`);
 let r;try{r=await api('attempt',{consent:S.consent,inn:S.inn,fio:S.fio,phone:S.phone,type:S.type,score})}catch(e){r=null}
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
