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
  const navy='#0E394B',ink='#18252A',muted='#5F7286',blue='#226D8D',red='#8D1638';
  const left=18,right=192,bottom=273,width=174;
  let y=52;
  const clean=value=>String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[\u2011\u2013\u2014]/g,'-');
  const font=(family,size,style='normal',color=ink)=>{doc.setFont(family,style);doc.setFontSize(size);doc.setTextColor(color);};
  const wrap=(value,w=width)=>doc.splitTextToSize(clean(value),w);
  const rule=at=>{doc.setDrawColor('#DCE4E8');doc.setLineWidth(.25);doc.line(left,at,right,at);};
  function nextPage(){
    doc.addPage();font('Lato',9,'bold',navy);doc.text('ВЭШ / БИБЛИОТЕКА ЭКСПЕРТИЗЫ',left,17);
    rule(23);y=34;
  }
  function lines(textLines,x,leading){
    for(const line of textLines){
      if(y+leading>bottom)nextPage();
      doc.text(line,x,y);y+=leading;
    }
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
  doc.addImage(assets.logo,'PNG',left,12,48,48*456/1090);
  font('Lato',10,'normal',muted);doc.text('Библиотека экспертизы',right,24,{align:'right'});
  rule(39);
  paragraph(title,{family:'Qanelas',size:26,style:'bold',color:navy,leading:10});
  y+=3;
  if(note){paragraph(note,{size:11,color:muted,leading:5.4});y+=5;}
  const n=items.length,word=n%10===1&&n%100!==11?'материал':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'материала':'материалов';
  if(y+65>bottom)nextPage();
  paragraph(`${n} ${word}`,{size:10,color:muted,leading:5});y+=5;
  items.forEach((item,index)=>{
    const x=30,w=162;
    font('Qanelas',17,'bold',navy);const titleLines=wrap(item.title,w);
    font('Lato',10.5,'normal',muted);const teachers=item.teachers.length?wrap(item.teachers.join(' · '),w):[];
    font('Lato',9.5,'normal',muted);const topics=wrap(item.topics.join(' / '),w);
    const height=10+titleLines.length*6.7+(teachers.length?teachers.length*4.8+2:0)+topics.length*4.5+15;
    if(y+height>bottom)nextPage();
    rule(y);y+=8;
    font('Lato',9,'bold',muted);doc.text(String(index+1).padStart(2,'0'),left,y);
    font('Lato',9,'bold',red);doc.text(clean(item.type).toLocaleUpperCase('ru'),x,y);y+=7;
    font('Qanelas',17,'bold',navy);
    const titleTop=y-5;
    lines(titleLines,x,6.7);
    doc.link(x,titleTop,w,titleLines.length*6.7+1,{url:item.url});
    y+=1;
    if(teachers.length){font('Lato',10.5,'normal',muted);lines(teachers,x,4.8);y+=2;}
    font('Lato',9.5,'normal',muted);lines(topics,x,4.5);y+=3;
    font('Lato',10,'bold',blue);const linkLabel=item.type==='Мастер-класс'?(item.url.startsWith('https://rutube.ru/')?'Смотреть запись на Rutube':'Смотреть запись мастер-класса'):item.type==='Демо-курс'?'Открыть демо-курс':'Читать на veshk.ru';doc.textWithLink(linkLabel,x,y,{url:item.url});y+=11;
  });
  const total=doc.getNumberOfPages();
  for(let page=1;page<=total;page++){
    doc.setPage(page);rule(282);
    font('Lato',8.5,'normal',muted);doc.text('Высшая экономическая школа',left,288);
    doc.textWithLink('veshk.ru',105,288,{url:'https://veshk.ru/'});
    doc.text(`${page} / ${total}`,right,288,{align:'right'});
  }
  return doc;
};
})();
