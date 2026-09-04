// About page CMS photo only. No text or layout rewriting.
(async()=>{
  const element=document.querySelector('.about-page .operator-photo');
  if(!element)return;
  try{
    const base='https://uksoinulgbchzvvbcezi.supabase.co';
    const key='sb_publishable_fm6TZ6GTN8papKDtKakX9w_O5Vf8Oax';
    const response=await fetch(base+'/rest/v1/website_content?select=content_key,content_value,desktop_position_x,desktop_position_y,mobile_position_x,mobile_position_y,image_brightness&content_key=eq.about_profile_image',{headers:{apikey:key,Authorization:'Bearer '+key}});
    if(!response.ok)return;
    const row=(await response.json())[0];
    if(!row?.content_value)return;
    element.classList.add('cms-photo');
    element.style.backgroundImage=`url("${String(row.content_value).replace(/"/g,'%22')}")`;
    element.style.setProperty('--cms-dx',(row.desktop_position_x??50)+'%');
    element.style.setProperty('--cms-dy',(row.desktop_position_y??50)+'%');
    element.style.setProperty('--cms-mx',(row.mobile_position_x??50)+'%');
    element.style.setProperty('--cms-my',(row.mobile_position_y??50)+'%');
    element.style.filter=`brightness(${Math.max(50,Math.min(200,Number(row.image_brightness??100)))}%)`;
    element.innerHTML='';
  }catch(error){
    console.warn('About profile image unavailable',error);
  }
})();
