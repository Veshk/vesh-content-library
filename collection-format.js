(() => {
'use strict';
const typeLabels={'Статья':'Статьи','Кейс':'Кейсы','Мастер-класс':'Мастер-классы','Демо-курс':'Демо-курсы','Гайд':'Гайды'};
const actionLabels={'Мастер-класс':'Смотреть запись','Демо-курс':'Открыть демо-курс','Гайд':'Открыть гайд'};
function groups(items){
  const types=[...new Set([...Object.keys(typeLabels),...items.map(item=>item.type)])];
  return types.map(type=>({type,label:typeLabels[type]||type,items:items.filter(item=>item.type===type)})).filter(group=>group.items.length);
}
window.VESH_COLLECTION={groups,action:type=>actionLabels[type]||'Читать'};
})();
