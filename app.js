const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='ot_pr_lemana_completions', READ=window.FAST?0.05:3;
const TIMG={pick:'picker_stepladder.jpg',load:'loader_ramp.jpg',t4:'pallet_truck.jpg',t4p:'forklift.jpg'},TSUB={pick:'Отбор товара, ТСД, паллеты',load:'Ручной подъём, рампа, рохли',t4:'Электротележки, штабелёры',t4p:'Погрузчики, ричтраки'};
const BRAND='<div class="brand"><i>ПР</i><span>Персональное Решение</span></div>';
let S;function reset(){S={photo:null,photoAt:null,fio:'',inn:'',phone:'',type:null,slides:[],i:0,maxRead:-1,qs:[],ans:[],qi:0,tries:0,score:0,sig:null}}reset();
function innValid(v){if(!/^\d{12}$/.test(v))return false;const d=v.split('').map(Number);
 const k=w=>w.reduce((s,x,i)=>s+x*d[i],0)%11%10;
 return k([7,2,4,10,3,5,9,4,6,8])===d[10]&&k([3,7,2,4,10,3,5,9,4,6,8])===d[11];}
function render(html,cls='screen'){app.className='';app.innerHTML=`<div class="${cls}">${html}</div>`;window.scrollTo(0,0)}
function buzz(){try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}}
document.addEventListener('pointerdown',e=>{if(e.target.closest('button'))buzz()});

function start(){render(`<div class="hero"><img src="img/conveyor.jpg" alt="">${BRAND}<div class="in">
 <h1 class="mega">Безопасность<br><em>начинается с тебя</em></h1>
 <p>Инструктаж для исполнителей (самозанятых) ООО «Персональное Решение» на складе «Лемана ПРО».</p>
 <div class="chips"><span>⏱ ~15 минут</span><span>📝 10 вопросов</span><span>✍️ Подпись</span></div></div></div>
 <div class="pad"><div class="form"><label>ФИО</label><input type="text" id="fio" autocomplete="name" placeholder="Иванов Иван Иванович" value="${esc(S.fio)}"><div class="err" id="e1"></div>
 <label>ИНН · 12 цифр</label><input type="tel" id="inn" inputmode="numeric" maxlength="12" placeholder="000000000000" value="${esc(S.inn)}"><div class="err" id="e2"></div>
 <label>Телефон</label><input type="tel" id="phone" inputmode="tel" placeholder="+7 900 000-00-00" value="${esc(S.phone)}"><div class="err" id="e3"></div>
 <button class="btn" id="go">Начать инструктаж →</button></div></div>`);
 $('#inn').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,12);
 $('#go').onclick=()=>{const fio=$('#fio').value.trim().replace(/\s+/g,' '),inn=$('#inn').value,ph=$('#phone').value.trim();let ok=true;
  $('#e1').textContent=fio.split(' ').length<2||!/^[А-Яа-яЁёA-Za-z\- ]+$/.test(fio)?(ok=false,'Укажите фамилию и имя (и отчество при наличии)'):'';
  $('#e2').textContent=!/^\d{12}$/.test(inn)?(ok=false,'ИНН физического лица — ровно 12 цифр'):!innValid(inn)?(ok=false,'Неверная контрольная сумма ИНН — проверьте цифры'):'';
  const pd=ph.replace(/\D/g,'');$('#e3').textContent=!(pd.length===11&&/^[78]/.test(pd))&&!(pd.length===10)?(ok=false,'Введите номер в формате +7XXXXXXXXXX'):'';
  if(!ok){$('.form').classList.remove('shake');void $('.form').offsetWidth;$('.form').classList.add('shake');return}
  S.fio=fio;S.inn=inn;S.phone='+7'+pd.slice(-10);chooseType();};
}
function chooseType(){render(`<div class="top"><button class="back" id="bk">←</button></div><div class="pad" style="padding-top:8px">
 <h1>Какой вид<br>услуг?</h1><p class="sub">Инструктаж и тест подберём под вид услуг, согласованный с Заказчиком.</p>
 <div class="bento">${Object.entries(TYPES).map(([k,t])=>`<button class="type${S.type===k?' sel':''}" data-k="${k}"><img src="img/${TIMG[k]}" alt=""><i class="rad">${S.type===k?'✓':''}</i><span>${t.name}<small>${TSUB[k]}</small></span></button>`).join('')}</div>
 <div class="dock"><button class="btn" id="nt" ${S.type?'':'disabled'}>Далее →</button></div></div>`);
 $('#bk').onclick=start;
 app.querySelectorAll('.type').forEach(b=>b.onclick=()=>{S.type=b.dataset.k;app.querySelectorAll('.type').forEach(x=>{x.classList.toggle('sel',x===b);x.querySelector('.rad').textContent=x===b?'✓':''});$('#nt').disabled=false});
 $('#nt').onclick=()=>{S.slides=[...COMMON_BEFORE,...SPECIFIC[S.type],...COMMON_AFTER];S.i=0;S.maxRead=-1;slide()};
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
 nx.onclick=fwd;$('#prev').onclick=bwd;$('#tr').onclick=fwd;$('#tl').onclick=bwd;$('#cls').onclick=chooseType;
 const st=$('#story'),sc=st.querySelector('.scontent');let x0=null,y0=0;
 st.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;x0=e.clientX;y0=e.clientY});
 st.addEventListener('pointermove',e=>{if(x0===null)return;const dx=e.clientX-x0;if(Math.abs(dx)>Math.abs(e.clientY-y0))sc.style.transform=`translateX(${dx*.35}px)`});
 const end=e=>{if(x0===null)return;const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;sc.style.transition='transform .35s cubic-bezier(.34,1.56,.64,1)';sc.style.transform='';setTimeout(()=>sc&&(sc.style.transition=''),360);
  if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)){dx<0?fwd():bwd()}};
 st.addEventListener('pointerup',end);st.addEventListener('pointercancel',()=>{x0=null;sc.style.transform=''});
}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startTest(){S.qs=shuffle([...shuffle(Q_COMMON).slice(0,5),...Q_SPEC[S.type]]).map(q=>{const o=shuffle(q.a.map((t,j)=>({t,r:j===q.c})));return{...q,a:o.map(x=>x.t),c:o.findIndex(x=>x.r)}});S.ans=Array(10).fill(null);S.qi=0;S.tries++;question()}
function question(){const i=S.qi,q=S.qs[i];
 render(`<div class="top"><button class="back" id="bk">←</button><div style="margin-left:auto;font-weight:800;color:var(--m);font-size:14px">Попытка ${S.tries}</div></div><div class="pad" style="padding-top:4px">
 <div class="qbar">${S.qs.map((_,j)=>`<span class="${j<=i?'on':''}"></span>`).join('')}</div>
 <div class="qn">Вопрос ${i+1} из 10</div><div class="qq">${esc(q.q)}</div>
 <div>${q.a.map((a,j)=>`<button class="opt${S.ans[i]===j?' sel':''}" data-a="${j}"><span class="k">${'АБВГ'[j]}</span>${esc(a)}</button>`).join('')}</div>
 <div class="dock"><button class="btn" id="qn" ${S.ans[i]===null?'disabled':''}>${i<9?'Следующий вопрос →':'Проверить ответы'}</button></div></div>`);
 $('#bk').onclick=()=>{if(i>0){S.qi--;question()}else{S.i=S.slides.length-1;slide(-1)}};
 app.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{S.ans[i]=+o.dataset.a;app.querySelectorAll('.opt').forEach(x=>x.classList.toggle('sel',x===o));$('#qn').disabled=false});
 $('#qn').onclick=()=>{if(i<9){S.qi++;question()}else check()};
}
function check(){S.score=S.qs.filter((q,i)=>S.ans[i]===q.c).length;const pass=S.score>=8;
 render(`<div class="pad"><div class="res ${pass?'pass':'fail'}"><div class="score">${S.score*10}%</div><div style="font-weight:800;font-size:20px;margin-top:6px">${pass?'Тест сдан! 🎉':'Пока не сдан'}</div>
 <div style="opacity:.85;margin-top:6px;font-size:14px">${S.score} из 10 правильных${pass?'':' · нужно 80%. Изучите пояснения и попробуйте снова.'}</div></div>
 <div class="dock" style="position:static;background:none">${pass?`<button class="btn" id="tosign">Подписать лист ознакомления →</button>`:`<div class="row"><button class="btn ghost" id="rev">Правила</button><button class="btn" id="retry">Пройти тест заново</button></div>`}</div>
 ${S.qs.map((q,i)=>`<div class="rcard"><div class="qn">Вопрос ${i+1} ${S.ans[i]===q.c?'· ✓':'· ✕'}</div><div class="qq">${esc(q.q)}</div>${q.a.map((a,j)=>`<div class="opt ${j===q.c?'right':(j===S.ans[i]?'wrong':'')}"><span class="k">${j===q.c?'✓':j===S.ans[i]?'✕':'АБВГ'[j]}</span>${esc(a)}</div>`).join('')}${S.ans[i]!==q.c?`<div class="expl">💡 ${esc(q.e)}</div>`:''}</div>`).join('')}</div>`);
 if(pass){$('#tosign').onclick=sign;confetti()}else{$('#retry').onclick=startTest;$('#rev').onclick=()=>{S.i=0;slide()};$('.res').classList.add('shake')}
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
 done.onclick=()=>{S.sig=c.toDataURL('image/png');finish()};
}
function finish(){const d=new Date();const rec={id:Date.now().toString(36).toUpperCase(),fio:S.fio,inn:S.inn,phone:S.phone,type:TYPES[S.type].name,date:d.toISOString(),score:S.score*10,tries:S.tries,sig:S.sig,photo:S.photo,photoAt:S.photoAt};
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
 <div class="full"><span class="lbl">Подпись</span><img class="sig" src="${r.sig}" alt="подпись"></div></div>
 <p class="fine">Исполнитель ознакомлен с Правилами техники безопасности и правилами нахождения на объекте (приложение к договору возмездного оказания услуг) и обязуется их соблюдать. Инструктаж на месте оказания услуг проводится координатором Заказчика / представителем объекта дополнительно.</p></div></div>
 <div class="noprint" style="margin-top:20px"><button class="btn" id="pdf">Скачать PDF</button><button class="btn ghost" id="again">Новый инструктаж</button></div></div>`);
 $('#pdf').onclick=()=>window.print();$('#again').onclick=()=>{reset();start()};
}
function admin(){app.className='wide';const all=JSON.parse(localStorage.getItem(KEY)||'[]');
 app.innerHTML=`<div class="pad screen"><h1>Прохождения (${all.length})</h1><p class="sub">Данные хранятся только в этом браузере (localStorage). Занято ≈ ${Math.round((localStorage.getItem(KEY)||'').length/1024)} КБ из ~5 000 КБ.</p><button class="btn" id="csv" style="max-width:260px;margin-bottom:16px">Экспорт CSV</button><div class="adm"><table><tr><th>№</th><th>Дата</th><th>ФИО</th><th>ИНН</th><th>Телефон</th><th>Вид услуг</th><th>Результат</th><th>Попыток</th><th>Фото</th><th>Время фото</th><th>Подпись</th></tr>`+
 all.slice().reverse().map(r=>`<tr><td>${r.id}</td><td>${fmt(r.date)}</td><td>${esc(r.fio)}</td><td>${r.inn}</td><td>${esc(r.phone)}</td><td>${esc(r.type)}</td><td>${r.score}%</td><td>${r.tries}</td><td>${r.photo?`<img src="${r.photo}" style="height:44px;width:44px;object-fit:cover;border-radius:12px">`:'—'}</td><td>${r.photoAt?fmtS(r.photoAt):'—'}</td><td><img src="${r.sig}" style="height:30px"></td></tr>`).join('')+`</table></div></div>`;
 $('#csv').onclick=()=>{const h=['id','date','fio','inn','phone','type','score','tries'];const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
  const csv='\ufeff'+[...h,'Фото: есть/нет','Время фото'].join(';')+'\n'+all.map(r=>[...h.map(k=>q(k==='date'?fmt(r[k]):k==='inn'?'\t'+r[k]:r[k])),q(r.photo?'есть':'нет'),q(r.photoAt?fmtS(r.photoAt):'')].join(';')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='instruktazh_'+new Date().toISOString().slice(0,10)+'.csv';a.click()};
}
new URLSearchParams(location.search).has('admin')?admin():start();

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
