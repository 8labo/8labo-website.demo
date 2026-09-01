(function(){
  const el=document.querySelector('.about-page .operator-photo');
  if(!el)return;
  const base='https://uksoinulgbchzvvbcezi.supabase.co';
  const key='sb_publishable_fm6TZ6GTN8papKDtKakX9w_O5Vf8Oax';
  fetch(base+'/rest/v1/website_content?select=content_key,content_value,desktop_position_x,desktop_position_y,mobile_position_x,mobile_position_y,image_brightness&content_key=eq.about_profile_image',{headers:{apikey:key,Authorization:'Bearer '+key}})
    .then(r=>r.ok?r.json():Promise.reject(r.status))
    .then(rows=>{
      const row=rows[0];
      if(!row?.content_value)return;
      const dx=row.desktop_position_x??50,dy=row.desktop_position_y??50,mx=row.mobile_position_x??50,my=row.mobile_position_y??50,b=Math.max(50,Math.min(200,Number(row.image_brightness??100)));
      el.classList.add('cms-photo');
      el.style.backgroundImage=`url("${String(row.content_value).replace(/"/g,'%22')}")`;
      el.style.setProperty('--cms-dx',dx+'%');
      el.style.setProperty('--cms-dy',dy+'%');
      el.style.setProperty('--cms-mx',mx+'%');
      el.style.setProperty('--cms-my',my+'%');
      el.style.filter=`brightness(${b}%)`;
      el.innerHTML='';
    })
    .catch(()=>{});
})();
