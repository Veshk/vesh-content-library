(() => {
'use strict';
const data=window.VESH_LIBRARY.materials;
const byId=new Map(data.map(x=>[x.id,x]));
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[—–-]/g,' ');
const plural=n=>n%10===1&&n%100!==11?'материал':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'материала':'материалов';
const words=n=>`${n} ${plural(n)}`;
const sorted=a=>[...new Set(a)].sort((a,b)=>a.localeCompare(b,'ru'));
const topicNames=sorted(data.flatMap(x=>x.topics));
const teacherNames=sorted(data.flatMap(x=>x.teachers));
const state={type:'',topics:new Set(),teachers:new Set(),query:'',selected:new Set()};
try {const stored=JSON.parse(localStorage.getItem('vesh-content-selection')||'[]');if(Array.isArray(stored))state.selected=new Set(stored.filter(id=>byId.has(id)));}catch{}
let matched=data;
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function save(){try{localStorage.setItem('vesh-content-selection',JSON.stringify([...state.selected]));}catch{}}
function makeOption(name,count,kind){const label=document.createElement('label');label.className='option';const input=document.createElement('input');input.type='checkbox';input.value=name;input.dataset.kind=kind;input.setAttribute('aria-label',name);const span=document.createElement('span');span.className='option-name';span.textContent=name;label.append(input,span);if(count!==null){const total=document.createElement('span');total.className='option-count';total.textContent=count;label.append(total);}return label;}
for(const name of topicNames)$('topics').append(makeOption(name,data.filter(x=>x.topics.includes(name)).length,'topic'));
for(const name of teacherNames)$('teachers').append(makeOption(name,null,'teacher'));
$('teachers').append(makeOption('Без указанного преподавателя',null,'teacher'));
const searchable=new Map(data.map(x=>[x.id,norm([x.title,...x.teachers,...x.topics].join(' '))]));
function matches(x){return(!state.type||x.type===state.type)&&(!state.topics.size||x.topics.some(t=>state.topics.has(t)))&&(!state.teachers.size||x.teachers.some(t=>state.teachers.has(t))||(!x.teachers.length&&state.teachers.has('Без указанного преподавателя')))&&norm(state.query).trim().split(/\s+/).filter(Boolean).every(t=>searchable.get(x.id).includes(t));}
function render(){
matched=data.filter(matches);
$('result-count').textContent=words(matched.length);
$('empty').hidden=!!matched.length;
$('add-all').disabled=!matched.some(x=>!state.selected.has(x.id));
$('materials').innerHTML=matched.map(x=>{const chosen=state.selected.has(x.id);return `<article class="material${chosen?' chosen':''}"><div><div class="material-labels"><span class="badge${x.type==='Кейс'?' case':''}">${esc(x.type)}</span></div><h3><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)} <span class="arrow" aria-hidden="true">↗</span></a></h3><p class="teacher-names${x.teachers.length?'':' missing'}">${esc(x.teachers.length?x.teachers.join(' · '):'Преподаватель не указан')}</p><div class="tags">${x.topics.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div><button class="add-button" data-id="${x.id}" aria-pressed="${chosen}" aria-label="${chosen?'Убрать из подборки':'Добавить в подборку'}: ${esc(x.title)}" title="${chosen?'Убрать из подборки':'Добавить в подборку'}">${chosen?'✓':'+'}</button></article>`;}).join('');
renderChips();renderSelection();
}
function renderChips(){const chips=[];if(state.type)chips.push({kind:'type',value:state.type});for(const value of state.topics)chips.push({kind:'topic',value});for(const value of state.teachers)chips.push({kind:'teacher',value});$('active-filters').innerHTML=chips.map(c=>`<button class="filter-chip" data-kind="${c.kind}" data-value="${esc(c.value)}" aria-label="Убрать фильтр ${esc(c.value)}">${esc(c.value)}<span aria-hidden="true">×</span></button>`).join('');$('teacher-label').textContent=state.teachers.size?`Выбрано: ${state.teachers.size}`:'Все преподаватели';}
function syncControls(){document.querySelectorAll('[data-type]').forEach(b=>{const active=b.dataset.type===state.type;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});document.querySelectorAll('input[data-kind]').forEach(input=>{input.checked=(input.dataset.kind==='topic'?state.topics:state.teachers).has(input.value);});$('search').value=state.query;}
function reset(){state.query='';state.type='';state.topics.clear();state.teachers.clear();$('teacher-search').value='';$('teachers').querySelectorAll('label').forEach(x=>x.hidden=false);syncControls();render();}
function renderSelection(){const n=state.selected.size;$('selected-count').textContent=n;$('selected-label').textContent=`${plural(n)} в подборке`;$('open-collection').disabled=!n;$('clear-selection').disabled=!n;}
function selectedItems(){return [...state.selected].map(id=>byId.get(id)).filter(Boolean);}
function renderCollection(){const items=selectedItems();$('collection-meta').textContent=words(items.length);$('collection-list').innerHTML=items.map(x=>`<li><div class="collection-row"><div><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)} ↗</a><p>${esc([x.type,...x.teachers].join(' · '))}</p></div><button class="remove-button" data-remove="${x.id}" aria-label="Убрать ${esc(x.title)}">×</button></div></li>`).join('');$('collection-empty').hidden=!!items.length;$('copy-collection').disabled=!items.length;$('download-collection').disabled=!items.length;}
$('topics').addEventListener('change',e=>{const x=e.target;if(x.type!=='checkbox')return;x.checked?state.topics.add(x.value):state.topics.delete(x.value);render();});
$('teachers').addEventListener('change',e=>{const x=e.target;if(x.type!=='checkbox')return;x.checked?state.teachers.add(x.value):state.teachers.delete(x.value);render();});
$('teacher-search').addEventListener('input',e=>{for(const label of $('teachers').querySelectorAll('label'))label.hidden=!norm(label.textContent).includes(norm(e.target.value));});
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{state.type=b.dataset.type;syncControls();render();}));
$('search').addEventListener('input',e=>{state.query=e.target.value;render();});
$('active-filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.kind==='type')state.type='';else(state[b.dataset.kind==='topic'?'topics':'teachers']).delete(b.dataset.value);syncControls();render();});
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
$('materials').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;state.selected.has(b.dataset.id)?state.selected.delete(b.dataset.id):state.selected.add(b.dataset.id);save();render();});
$('add-all').addEventListener('click',()=>{const before=state.selected.size;matched.forEach(x=>state.selected.add(x.id));save();render();toast(`Добавлено: ${words(state.selected.size-before)}`);});
$('clear-selection').addEventListener('click',()=>{state.selected.clear();save();render();});
$('open-collection').addEventListener('click',()=>{renderCollection();$('collection').append($('toast'));$('collection').showModal();});
$('close-collection').addEventListener('click',()=>$('collection').close());
$('collection').addEventListener('close',()=>document.body.append($('toast')));
$('collection-list').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;state.selected.delete(b.dataset.remove);save();render();renderCollection();});
function collectionText(){return [($('collection-title').value.trim()||'Подборка материалов ВЭШ'),$('collection-note').value.trim(),...selectedItems().map((x,i)=>`${i+1}. ${x.title}\n${[x.type,...x.teachers].join(' · ')}\n${x.url}`)].filter(Boolean).join('\n\n');}
$('copy-collection').addEventListener('click',async()=>{const text=collectionText();try{await navigator.clipboard.writeText(text);toast('Подборка скопирована');}catch{const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:0;top:0;opacity:.01';$('collection').append(area);area.focus();area.select();let ok=false;try{ok=document.execCommand('copy');}catch{}area.remove();toast(ok?'Подборка скопирована':'Не удалось скопировать. Сохраните подборку в PDF.');}});
$('download-collection').addEventListener('click',async()=>{
const items=selectedItems();
if(!items.length)return;
const button=$('download-collection'), label=button.innerHTML;
button.disabled=true;button.textContent='Готовим PDF…';
try{
await new Promise(resolve=>setTimeout(resolve,30));
const title=$('collection-title').value.trim()||'Подборка материалов ВЭШ';
const doc=window.createVeshPDF({title,note:$('collection-note').value.trim(),items});
const filename=(title.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'').slice(0,100)||'Подборка ВЭШ')+'.pdf';
await doc.save(filename,{returnPromise:true});
toast('PDF-подборка сохранена');
}catch(error){console.error('PDF export failed',error);toast('Не удалось создать PDF. Попробуйте ещё раз.');}
finally{button.innerHTML=label;button.disabled=!state.selected.size;}
});
render();
})();
