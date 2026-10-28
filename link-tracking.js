(() => {
'use strict';
const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Yekaterinburg',year:'numeric',month:'2-digit',day:'2-digit'});
function creationDate(now=new Date()){
  const parts=Object.fromEntries(formatter.formatToParts(now).map(part=>[part.type,part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function track(url,medium,date=creationDate()){
  const tracked=new URL(url);
  tracked.searchParams.set('utm_source','vesh_library');
  tracked.searchParams.set('utm_medium',medium);
  tracked.searchParams.set('utm_campaign',`selection_${date}`);
  return tracked.toString();
}
window.VESH_LINKS={creationDate,track};
})();
