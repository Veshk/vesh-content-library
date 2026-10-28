(() => {
'use strict';
// Text remains selectable; embedded brand fonts preserve Cyrillic offline.
window.createVeshPDF = ({title,note,items,createdDate=window.VESH_LINKS.creationDate()}) => {
  const {jsPDF}=window.jspdf, assets=window.VESH_EXPORT_ASSETS;
  const doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
  for(const [file,family,style,key] of [
    ['Lato-Regular.ttf','Lato','normal','latoRegular'],
    ['Lato-Bold.ttf','Lato','bold','latoBold'],
    ['Qanelas-Bold.ttf','Qanelas','bold','qanelasBold']
  ]){doc.addFileToVFS(file,assets.fonts[key]);doc.addFont(file,family,style);}
  const navy='#0E394B',ink='#18252A',muted='#5F7286',blue='#226D8D',wine='#8D1638';
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
  for(const group of window.VESH_COLLECTION.groups(items)){
    let needsHeading=true;
    for(const item of group.items){
      const url=window.VESH_LINKS.track(item.url,'pdf',createdDate);
      const leading=5.2;
      font('Qanelas',13.5,'bold',navy);const titleLines=wrap(item.title);
      const height=Math.max(18,titleLines.length*leading+10);
      const headingSpace=needsHeading?8+(pageItems?2:0):0;
      // Keep headings with their first item and repeat them after a page break.
      if(pageItems===perPage||y+headingSpace+height>bottom){nextPage();needsHeading=true;}
      if(needsHeading){
        if(pageItems)y+=2;
        font('Lato',11,'bold',wine);doc.text(clean(group.label),left,y+4);
        y+=8;needsHeading=false;
      }
      rule(y);
      const baseline=y+6;
      font('Qanelas',13.5,'bold',navy);
      titleLines.forEach((line,index)=>doc.textWithLink(line,left,baseline+index*leading,{url}));
      const action=window.VESH_COLLECTION.action(group.type);
      const actionY=baseline+(titleLines.length-1)*leading+5;
      font('Lato',9.5,'bold',blue);
      const actionWidth=doc.textWithLink(action,left,actionY,{url});
      doc.setDrawColor(blue);doc.setLineWidth(.15);doc.line(left,actionY+.8,left+actionWidth,actionY+.8);
      y+=height;pageItems++;
    }
  }
  const total=doc.getNumberOfPages();
  for(let page=1;page<=total;page++){
    doc.setPage(page);
    font('Lato',8.5,'normal',muted);doc.textWithLink('veshk.ru',left,288,{url:window.VESH_LINKS.track('https://veshk.ru/','pdf',createdDate)});
    doc.text(`${page} / ${total}`,right,288,{align:'right'});
  }
  return doc;
};
})();
