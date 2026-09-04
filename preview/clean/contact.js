const form=document.getElementById('contactForm');
if(form){
  form.addEventListener('submit',function(event){
    event.preventDefault();
    if(!this.reportValidity())return;
    const type=document.getElementById('contactType').value;
    const name=document.getElementById('contactName').value.trim();
    const org=document.getElementById('contactOrg').value.trim();
    const email=document.getElementById('contactEmail').value.trim();
    const message=document.getElementById('contactMessage').value.trim();
    const subject='【８LABOお問い合わせ】'+type;
    const body=['お問い合わせ内容：'+type,'お名前：'+name,'所属・団体名：'+(org||'なし'),'メールアドレス：'+email,'','お問い合わせ内容の詳細',message].join('\n');
    location.href='mailto:8labo.deportare@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });
}
