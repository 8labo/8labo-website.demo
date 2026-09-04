// 8LABO clean shared JavaScript.
// Responsibilities: navigation + CMS content only. No layout CSS injection and no copy/line-break rewriting.

// The approved stable site loaded Noto Sans JP at 400/500/600/700/900.
// Rebuild pages initially requested 800 as well, which changes glyph metrics/weight rendering.
// Normalize the font request so the rebuilt pages use the same font faces as the stable render.
document.querySelectorAll('link[href*="fonts.googleapis.com/css2?family=Noto+Sans+JP"]').forEach(link=>{
  const stableFont='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;900&display=swap';
  if(link.href!==stableFont)link.href=stableFont;
});

const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.global-nav');
if(menuButton&&nav){
  menuButton.addEventListener('click',()=>{
    const open=nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('menu-open',open);
    menuButton.textContent=open?'CLOSE':'MENU';
  });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded','false');
    menuButton.textContent='MENU';
  }));
}

const CMS_URL='https://uksoinulgbchzvvbcezi.supabase.co';
const CMS_KEY='sb_publishable_fm6TZ6GTN8papKDtKakX9w_O5Vf8Oax';
const cmsHeaders={apikey:CMS_KEY,Authorization:`Bearer ${CMS_KEY}`};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

async function cms(path){
  const response=await fetch(`${CMS_URL}/rest/v1/${path}`,{headers:cmsHeaders});
  if(!response.ok)throw new Error(await response.text());
  return response.json();
}

function setPhoto(element,row){
  if(!element)return;
  if(!row?.content_value){
    element.classList.remove('cms-photo');
    element.classList.add('cms-photo-empty');
    element.style.backgroundImage='none';
    element.style.filter='none';
    element.textContent='Coming Soon';
    return;
  }
  const url=row.content_value.replace(/"/g,'%22');
  element.textContent='';
  element.classList.remove('cms-photo-empty');
  element.classList.add('cms-photo');
  element.style.backgroundImage=`linear-gradient(rgba(4,18,35,.08),rgba(4,18,35,.08)),url("${url}")`;
  element.style.backgroundRepeat='no-repeat';
  element.style.setProperty('--cms-dx',(row.desktop_position_x??50)+'%');
  element.style.setProperty('--cms-dy',(row.desktop_position_y??50)+'%');
  element.style.setProperty('--cms-dz',Number(row.desktop_zoom??1));
  element.style.setProperty('--cms-mx',(row.mobile_position_x??50)+'%');
  element.style.setProperty('--cms-my',(row.mobile_position_y??50)+'%');
  element.style.setProperty('--cms-mz',Number(row.mobile_zoom??1));
  const brightness=Math.max(50,Math.min(200,Number(row.image_brightness??100)));
  element.style.filter=`brightness(${brightness}%)`;
}

function ensurePhotoSlots(){
  if(document.body.classList.contains('home-page')){
    const grid=document.querySelector('.activity-photo-grid');
    if(grid){
      while(grid.children.length<5){
        const item=document.createElement('div');
        item.className='activity-photo';
        item.textContent='Coming Soon';
        grid.appendChild(item);
      }
    }
  }
  if(document.body.classList.contains('academy-page')){
    const gallery=document.querySelector('.academy-activity-gallery');
    if(gallery){
      while(gallery.children.length<5){
        const item=document.createElement('div');
        item.className='academy-activity-photo';
        item.textContent='Coming Soon';
        gallery.appendChild(item);
      }
    }
  }
}

async function loadWebsiteContent(){
  try{
    const rows=await cms('website_content?select=content_key,content_value,desktop_position_x,desktop_position_y,desktop_zoom,mobile_position_x,mobile_position_y,mobile_zoom,image_brightness');
    const byKey=Object.fromEntries(rows.map(row=>[row.content_key,row]));
    if(document.body.classList.contains('home-page')){
      setPhoto(document.querySelector('.photo-stage'),byKey.home_hero_image);
      setPhoto(document.querySelector('.featured-visual'),byKey.home_featured_image);
      const photos=document.querySelectorAll('.activity-photo');
      ['home_activity_kids_image','home_activity_school_image','home_activity_sports_image','home_activity_community_image','home_activity_event_image']
        .forEach((key,index)=>setPhoto(photos[index],byKey[key]));
    }
    if(document.body.classList.contains('academy-page')){
      setPhoto(document.querySelector('.academy-photo'),byKey.academy_hero_image);
      const photos=document.querySelectorAll('.academy-activity-photo');
      ['academy_activity_1_image','academy_activity_2_image','academy_activity_3_image','academy_activity_4_image','academy_activity_5_image']
        .forEach((key,index)=>setPhoto(photos[index],byKey[key]));
    }
  }catch(error){
    console.warn('CMS content unavailable',error);
  }
}

async function loadNews(){
  if(!document.body.classList.contains('home-page'))return;
  try{
    const rows=await cms('website_news?select=id,title,body,category,image_url,link_url,published_at&is_published=eq.true&order=published_at.desc&limit=3');
    if(!rows.length)return;
    const grid=document.querySelector('.home-news .content-grid');
    if(!grid)return;
    const wrap=document.createElement('div');
    wrap.className='cms-news-grid';
    wrap.innerHTML=rows.map(item=>{
      const date=item.published_at?new Date(item.published_at).toLocaleDateString('ja-JP',{year:'numeric',month:'short',day:'numeric'}):'';
      const inner=`<span class="tag">${esc(item.category)}${date?' / '+esc(date):''}</span>${item.image_url?`<div class="cms-news-image" style="background-image:url('${esc(item.image_url)}')"></div>`:''}<h3>${esc(item.title)}</h3><p>${esc(item.body||'')}</p>${item.link_url?'<span class="mini-link">詳しく見る →</span>':''}`;
      return item.link_url?`<a class="content-card cms-news-card" href="${esc(item.link_url)}" target="_blank" rel="noopener">${inner}</a>`:`<article class="content-card cms-news-card">${inner}</article>`;
    }).join('');
    grid.parentNode.insertBefore(wrap,grid);
  }catch(error){
    console.warn('CMS news unavailable',error);
  }
}

async function loadAcademyVoices(){
  if(!document.body.classList.contains('academy-page'))return;
  const slot=document.querySelector('.voice-empty');
  if(!slot)return;
  try{
    const rows=await cms('website_voices?select=id,audience,quote,class_name,sort_order,is_published&is_published=eq.true&order=sort_order.asc,id.asc');
    if(!rows.length)return;
    slot.className='academy-voices';
    slot.innerHTML=rows.map(item=>`<article class="academy-voice"><p class="academy-voice-quote">${esc(item.quote)}</p><p class="academy-voice-meta">${esc([item.audience,item.class_name].filter(Boolean).join(' / '))}</p></article>`).join('');
  }catch(error){
    console.warn('CMS voices unavailable',error);
  }
}

ensurePhotoSlots();
loadWebsiteContent();
loadNews();
loadAcademyVoices();
