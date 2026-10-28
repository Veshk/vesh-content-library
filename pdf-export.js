(() => {
'use strict';
// Text remains selectable; embedded brand fonts preserve Cyrillic offline.
window.createVeshPDF = ({title,note,items}) => {
  const {jsPDF}=window.jspdf, assets=window.VESH_EXPORT_ASSETS;
  const doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
  for(const [file,family,style,key] of [
    ['Lato-Regular.ttf','Lato','normal','latoRegular'],
    ['Lato-Bold.ttf','Lato','bold','latoBold'],
    ['Qanelas-Bold.ttf','Qanelas','bold','qanelasBold']
  ]){doc.addFileToVFS(file,assets.fonts[key]);doc.addFont(file,family,style);}
  const navy='#0E394B',ink='#18252A',muted='#5F7286';
  const left=18,right=192,bottom=273,width=174,perPage=8;
  let y=44,pageItems=0;
  const clean=value=>String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[\u2011\u2013\u2014]/g,'-');
  const font=(family,size,style='normal',color=ink)=>{doc.setFont(family,style);doc.setFontSize(size);doc.setTextColor(color);};
  const wrap=(value,w=width)=>doc.splitTextToSize(clean(value),w);
  const rule=at=>{doc.setDrawColor('#DCE4E8');doc.setLineWidth(.25);doc.line(left,at,right,at);};
  function nextPage(){
    doc.addPage();font('Lato',9,'normal',muted);doc.text('ВЭШ / Библиотека экспертизы',left,18);
    y=32;pageItems=0;
  }
  function paragraph(text,{family='Lato',size=11,style='normal',color=ink,leading=5.3,w=width,x=left}={}){
    font(family,size,style,color);
    const wrapped=wrap(text,w);
    for(const line of wrapped){
      if(y+leading>bottom){nextPage();font(family,size,style,color);}
      doc.text(line,x,y);y+=leading;
    }
  }
  doc.setProperties({title:clean(title),subject:'Подборка материалов Высшей экономической школы',author:'Высшая экономическая школа',creator:'Библиотека экспертизы ВЭШ'});
  doc.addImage(assets.logo,'PNG',left,10,42,42*456/1090);
  font('Lato',9,'normal',muted);doc.text('Библиотека экспертизы',right,21,{align:'right'});
  paragraph(title,{family:'Qanelas',size:21,style:'bold',color:navy,leading:8});
  y+=3;
  if(note){paragraph(note,{size:10.5,color:muted,leading:4.8});y+=4;}
  y+=6;
  items.forEach(item=>{
    const x=54,w=right-x,leading=5.3;
    font('Qanelas',13.5,'bold',navy);const titleLines=wrap(item.title,w);
    const height=Math.max(22,titleLines.length*leading+8);
    // Keep each material together and never place more than eight on a page.
    if(pageItems===perPage||y+height>bottom)nextPage();
    rule(y);
    const baseline=y+8;
    font('Lato',8.5,'normal',muted);doc.text(clean(item.type).toLocaleUpperCase('ru'),left,baseline);
    font('Qanelas',13.5,'bold',navy);
    titleLines.forEach((line,index)=>doc.textWithLink(line,x,baseline+index*leading,{url:item.url}));
    y+=height;pageItems++;
  });
  const total=doc.getNumberOfPages();
  for(let page=1;page<=total;page++){
    doc.setPage(page);
    font('Lato',8.5,'normal',muted);doc.textWithLink('veshk.ru',left,288,{url:'https://veshk.ru/'});
    doc.text(`${page} / ${total}`,right,288,{align:'right'});
  }
  return doc;
};
})();
