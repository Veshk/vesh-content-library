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
const badgeClass={'Кейс':' case','Мастер-класс':' masterclass','Демо-курс':' demo','Гайд':' guide'};
$('library-count').textContent=data.length;
$('library-updated').textContent='Версия базы от '+window.VESH_LIBRARY.updated.split('-').reverse().join('.');
const state={types:new Set(),topics:new Set(),teachers:new Set(),query:'',selected:new Set()};
function restoreSelection(){
  try{
    const stored=JSON.parse(localStorage.getItem('vesh-content-selection')||'[]');
    state.selected=new Set(Array.isArray(stored)?stored.filter(id=>byId.has(id)):[]);
  }catch{state.selected.clear();}
}
restoreSelection();
let matched=data;
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function save(){try{localStorage.setItem('vesh-content-selection',JSON.stringify([...state.selected]));}catch{}}
function makeOption(name,count,kind){const label=document.createElement('label');label.className='option';const input=document.createElement('input');input.type='checkbox';input.value=name;input.dataset.kind=kind;input.setAttribute('aria-label',name);const span=document.createElement('span');span.className='option-name';span.textContent=name;label.append(input,span);if(count!==null){const total=document.createElement('span');total.className='option-count';total.textContent=count;label.append(total);}return label;}
for(const name of topicNames)$('topics').append(makeOption(name,data.filter(x=>x.topics.includes(name)).length,'topic'));
for(const name of teacherNames)$('teachers').append(makeOption(name,null,'teacher'));
$('teachers').append(makeOption('Без указанного преподавателя',null,'teacher'));
const searchable=new Map(data.map(x=>[x.id,norm([x.title,...x.teachers,...x.topics].join(' '))]));
function matches(x){return(!state.types.size||state.types.has(x.type))&&(!state.topics.size||x.topics.some(t=>state.topics.has(t)))&&(!state.teachers.size||x.teachers.some(t=>state.teachers.has(t))||(!x.teachers.length&&state.teachers.has('Без указанного преподавателя')))&&norm(state.query).trim().split(/\s+/).filter(Boolean).every(t=>searchable.get(x.id).includes(t));}
function render(){
matched=data.filter(matches);
$('result-count').textContent=words(matched.length);
$('empty').hidden=!!matched.length;
$('add-all').disabled=!matched.some(x=>!state.selected.has(x.id));
$('materials').innerHTML=matched.map(x=>{const chosen=state.selected.has(x.id);return `<article class="material${chosen?' chosen':''}"><div><div class="material-labels"><span class="badge${badgeClass[x.type]||''}">${esc(x.type)}</span><p class="teacher-names${x.teachers.length?'':' missing'}">${esc(x.teachers.length?x.teachers.join(', '):'Преподаватель не указан')}</p></div><h3><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)} <span class="arrow" aria-hidden="true">↗</span></a></h3><div class="tags">${x.topics.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div><button class="add-button" data-id="${x.id}" aria-pressed="${chosen}" aria-label="${chosen?'Убрать из подборки':'Добавить в подборку'}: ${esc(x.title)}" title="${chosen?'Убрать из подборки':'Добавить в подборку'}">${chosen?'✓':'+'}</button></article>`;}).join('');
renderChips();renderSelection();
}
function renderChips(){const chips=[];for(const value of state.types)chips.push({kind:'type',value});for(const value of state.topics)chips.push({kind:'topic',value});for(const value of state.teachers)chips.push({kind:'teacher',value});$('active-filters').innerHTML=chips.map(c=>`<button class="filter-chip" data-kind="${c.kind}" data-value="${esc(c.value)}" aria-label="Убрать фильтр ${esc(c.value)}">${esc(c.value)}<span aria-hidden="true">×</span></button>`).join('');$('teacher-label').textContent=state.teachers.size?`Выбрано: ${state.teachers.size}`:'Все преподаватели';}
function syncControls(){document.querySelectorAll('[data-type]').forEach(b=>{const active=b.dataset.type?state.types.has(b.dataset.type):!state.types.size;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});document.querySelectorAll('input[data-kind]').forEach(input=>{input.checked=(input.dataset.kind==='topic'?state.topics:state.teachers).has(input.value);});$('search').value=state.query;}
function reset(){state.query='';state.types.clear();state.topics.clear();state.teachers.clear();$('teacher-search').value='';$('teachers').querySelectorAll('label').forEach(x=>x.hidden=false);syncControls();render();}
function renderSelection(){const n=state.selected.size;$('selected-count').textContent=n;$('selected-label').textContent=`${plural(n)} в подборке`;$('open-collection').disabled=!n;$('clear-selection').disabled=!n;}
function selectedItems(){return [...state.selected].map(id=>byId.get(id)).filter(Boolean);}
function renderCollection(){const items=selectedItems();$('collection-meta').textContent=words(items.length);$('collection-list').innerHTML=items.map(x=>`<li><div class="collection-row"><div><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)} ↗</a><p>${esc(materialMeta(x))}</p></div><button class="remove-button" data-remove="${x.id}" aria-label="Убрать ${esc(x.title)}">×</button></div></li>`).join('');$('collection-empty').hidden=!!items.length;$('copy-collection').disabled=!items.length;$('download-collection').disabled=!items.length;renderEmailPreview();}
$('topics').addEventListener('change',e=>{const x=e.target;if(x.type!=='checkbox')return;x.checked?state.topics.add(x.value):state.topics.delete(x.value);render();});
$('teachers').addEventListener('change',e=>{const x=e.target;if(x.type!=='checkbox')return;x.checked?state.teachers.add(x.value):state.teachers.delete(x.value);render();});
$('teacher-search').addEventListener('input',e=>{for(const label of $('teachers').querySelectorAll('label'))label.hidden=!norm(label.textContent).includes(norm(e.target.value));});
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.type;if(!type)state.types.clear();else if(state.types.has(type))state.types.delete(type);else state.types.add(type);syncControls();render();}));
$('search').addEventListener('input',e=>{state.query=e.target.value;render();});
$('active-filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state[{type:'types',topic:'topics',teacher:'teachers'}[b.dataset.kind]].delete(b.dataset.value);syncControls();render();});
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
$('materials').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;state.selected.has(b.dataset.id)?state.selected.delete(b.dataset.id):state.selected.add(b.dataset.id);save();render();});
$('add-all').addEventListener('click',()=>{const before=state.selected.size;matched.forEach(x=>state.selected.add(x.id));save();render();toast(`Добавлено: ${words(state.selected.size-before)}`);});
function clearSelection(){
  state.selected.clear();save();
  $('collection-title').value='Подборка материалов ВЭШ';
  $('collection-note').value='';
  render();renderCollection();
}
$('clear-selection').addEventListener('click',clearSelection);
const savedSelectionDialog=$('saved-selection');
function askAboutSavedSelection(){
  if(!state.selected.size||savedSelectionDialog.open)return;
  $('saved-selection-count').textContent=words(state.selected.size);
  savedSelectionDialog.showModal();
}
function continueSavedSelection(){
  save();savedSelectionDialog.close();
  $('open-collection').focus({preventScroll:true});
}
$('continue-selection').addEventListener('click',continueSavedSelection);
$('start-new-selection').addEventListener('click',()=>{
  clearSelection();savedSelectionDialog.close();
  $('search').focus({preventScroll:true});
  toast('Предыдущая подборка очищена. Можно собирать новую.');
});
// Escape preserves the saved work, just like the explicit Continue action.
savedSelectionDialog.addEventListener('cancel',event=>{event.preventDefault();continueSavedSelection();});
// A Back navigation may restore the page without re-running its scripts.
window.addEventListener('pageshow',event=>{
  if(!event.persisted)return;
  $('collection').close();
  restoreSelection();render();askAboutSavedSelection();
});
$('open-collection').addEventListener('click',()=>{renderCollection();$('collection').append($('toast'));$('collection').showModal();});
$('close-collection').addEventListener('click',()=>$('collection').close());
$('collection').addEventListener('close',()=>document.body.append($('toast')));
$('collection-list').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;state.selected.delete(b.dataset.remove);save();render();renderCollection();});
function materialMeta(item){return [item.type,item.teachers.join(', ')].filter(Boolean).join(' — ');}
function collectionText(createdDate=window.VESH_LINKS.creationDate()){
  const groups=window.VESH_COLLECTION.groups(selectedItems()).map(group=>[group.label,...group.items.map(x=>`${x.title}\n${window.VESH_COLLECTION.action(x.type)}: ${window.VESH_LINKS.track(x.url,'email',createdDate)}`)].join('\n\n'));
  return [($('collection-title').value.trim()||'Подборка материалов ВЭШ'),$('collection-note').value.trim(),...groups].filter(Boolean).join('\n\n');
}
function collectionHtml(createdDate=window.VESH_LINKS.creationDate()){
  const title=$('collection-title').value.trim()||'Подборка материалов ВЭШ';
  const note=$('collection-note').value.trim();
  // Email clients do not load this site's styles or fonts. Keep formatting inline.
  const textStyle='font:normal 11pt/1.45 Verdana,Arial,sans-serif;color:#222222;text-align:left;';
  const intro=note?`<p style="margin:0 0 12px;${textStyle}">${esc(note).replace(/\r?\n/g,'<br>')}</p>`:'';
  const groups=window.VESH_COLLECTION.groups(selectedItems()).map(group=>{
    const rows=group.items.map(x=>{
      const url=esc(window.VESH_LINKS.track(x.url,'email',createdDate));
      return `<p style="margin:0 0 10px;${textStyle}">${esc(x.title)}<br><a href="${url}" target="_blank" rel="noopener" style="font:normal 11pt/1.45 Verdana,Arial,sans-serif;color:#1155cc;text-decoration:underline;">${esc(window.VESH_COLLECTION.action(x.type))}</a></p>`;
    }).join('');
    return `<p style="margin:16px 0 8px;${textStyle}"><strong>${esc(group.label)}</strong></p>${rows}`;
  }).join('');
  return `<div lang="ru" style="${textStyle}"><p style="margin:0 0 12px;${textStyle}">${esc(title)}</p>${intro}${groups}</div>`;
}
function renderEmailPreview(){
  $('email-preview').innerHTML=collectionHtml();
  $('email-details').hidden=!state.selected.size;
  $('copy-status').hidden=true;
}
for(const id of ['collection-title','collection-note'])$(id).addEventListener('input',renderEmailPreview);
function legacyCopy(html,text){
  const area=document.createElement('div'),focused=document.activeElement;
  area.contentEditable='true';area.innerHTML=html;
  area.style.cssText='position:fixed;left:-9999px;top:0;';
  $('collection').append(area);area.focus();
  const selection=window.getSelection(),range=document.createRange();
  range.selectNodeContents(area);selection.removeAllRanges();selection.addRange(range);
  let copied=false;
  const onCopy=e=>{if(!e.clipboardData)return;e.clipboardData.setData('text/html',html);e.clipboardData.setData('text/plain',text);e.preventDefault();copied=true;};
  document.addEventListener('copy',onCopy);
  try{return document.execCommand('copy')&&copied;}catch{return false;}
  finally{document.removeEventListener('copy',onCopy);selection.removeAllRanges();area.remove();focused?.focus({preventScroll:true});}
}
$('copy-collection').addEventListener('click',async()=>{
  if(!state.selected.size)return;
  const createdDate=window.VESH_LINKS.creationDate();
  const html=collectionHtml(createdDate),text=collectionText(createdDate);
  let copied=false;
  $('copy-status').hidden=true;
  try{
    if(navigator.clipboard?.write&&window.ClipboardItem){
      await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})]);
      copied=true;
    }
  }catch{}
  if(!copied)copied=legacyCopy(html,text);
  if(copied){toast('Текст со ссылками скопирован. Вставьте его в письмо.');return;}
  $('email-details').open=true;
  $('copy-status').textContent='Браузер не разрешил копирование. Выделите текст в предпросмотре и скопируйте вручную.';
  $('copy-status').hidden=false;
  $('email-preview').focus();
});
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
askAboutSavedSelection();
})();
