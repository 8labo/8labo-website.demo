const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.global-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    menuButton.textContent = open ? 'CLOSE' : 'MENU';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = 'MENU';
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const CMS_URL = 'https://uksoinulgbchzvvbcezi.supabase.co';
const CMS_KEY = 'sb_publishable_fm6TZ6GTN8papKDtKakX9w_O5Vf8Oax';
const cmsHeaders = { apikey: CMS_KEY, Authorization: `Bearer ${CMS_KEY}` };

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

async function cms(path) {
  const response = await fetch(`${CMS_URL}/rest/v1/${path}`, { headers: cmsHeaders });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function setPhoto(el, row) {
  if (!el) return;

  if (!row?.content_value) {
    el.classList.remove('cms-photo');
    el.classList.add('cms-photo-empty');
    el.style.backgroundImage = 'none';
    el.style.filter = 'none';
    el.textContent = 'Coming Soon';
    return;
  }

  const url = row.content_value.replace(/"/g, '%22');
  el.textContent = '';
  el.classList.remove('cms-photo-empty');
  el.classList.add('cms-photo');
  el.style.backgroundImage = `linear-gradient(rgba(4,18,35,.08),rgba(4,18,35,.08)),url("${url}")`;
  el.style.backgroundRepeat = 'no-repeat';

  const dx = row.desktop_position_x ?? 50;
  const dy = row.desktop_position_y ?? 50;
  const dz = Number(row.desktop_zoom ?? 1);
  const mx = row.mobile_position_x ?? 50;
  const my = row.mobile_position_y ?? 50;
  const mz = Number(row.mobile_zoom ?? 1);
  const brightness = Math.max(50, Math.min(200, Number(row.image_brightness ?? 100)));

  el.style.setProperty('--cms-dx', `${dx}%`);
  el.style.setProperty('--cms-dy', `${dy}%`);
  el.style.setProperty('--cms-dz', dz);
  el.style.setProperty('--cms-mx', `${mx}%`);
  el.style.setProperty('--cms-my', `${my}%`);
  el.style.setProperty('--cms-mz', mz);
  el.style.filter = `brightness(${brightness}%)`;
}

function ensurePhotoLayouts() {
  if (location.pathname.endsWith('academy.html')) {
    let gallery = document.querySelector('.academy-activity-gallery');

    if (!gallery) {
      const program = document.querySelector('#program');
      if (program) {
        const section = document.createElement('section');
        section.className = 'academy-gallery-section';
        section.innerHTML = '<div class="wrap"><div class="section-head"><p class="kicker">ACTIVITY</p><h2>教室の活動風景</h2><p>子どもたちが実際に動き、考え、挑戦している様子をご紹介します。</p></div><div class="academy-activity-gallery"></div></div>';
        program.insertAdjacentElement('afterend', section);
        gallery = section.querySelector('.academy-activity-gallery');
      }
    }

    if (gallery) {
      while (gallery.children.length < 5) {
        const div = document.createElement('div');
        div.className = 'academy-activity-photo';
        div.textContent = 'Coming Soon';
        gallery.appendChild(div);
      }
      while (gallery.children.length > 5) gallery.lastElementChild.remove();
    }
    return;
  }

  const grid = document.querySelector('.activity-photo-grid');
  if (grid && grid.children.length < 5) {
    const div = document.createElement('div');
    div.className = 'activity-photo';
    div.textContent = 'Coming Soon';
    grid.appendChild(div);
  }
}

async function loadWebsiteContent() {
  try {
    const rows = await cms('website_content?select=content_key,content_value,desktop_position_x,desktop_position_y,desktop_zoom,mobile_position_x,mobile_position_y,mobile_zoom,image_brightness');
    const byKey = Object.fromEntries(rows.map(row => [row.content_key, row]));
    const map = Object.fromEntries(rows.map(row => [row.content_key, row.content_value]));

    if (location.pathname.endsWith('academy.html')) {
      setPhoto(document.querySelector('.academy-photo'), byKey.academy_hero_image);
      const photos = document.querySelectorAll('.academy-activity-photo');
      [
        ['academy_activity_1_image', 0],
        ['academy_activity_2_image', 1],
        ['academy_activity_3_image', 2],
        ['academy_activity_4_image', 3],
        ['academy_activity_5_image', 4]
      ].forEach(([key, index]) => setPhoto(photos[index], byKey[key]));
      return;
    }

    setPhoto(document.querySelector('.photo-stage'), byKey.home_hero_image);
    setPhoto(document.querySelector('.featured-visual'), byKey.home_featured_image);

    const photos = document.querySelectorAll('.activity-photo');
    [
      ['home_activity_kids_image', 0],
      ['home_activity_school_image', 1],
      ['home_activity_sports_image', 2],
      ['home_activity_community_image', 3],
      ['home_activity_event_image', 4]
    ].forEach(([key, index]) => setPhoto(photos[index], byKey[key]));

    const newsSection = [...document.querySelectorAll('section')].find(section => section.querySelector('.kicker')?.textContent.trim() === 'NEWS / NOTE');
    if (newsSection) {
      const heading = newsSection.querySelector('.section-head h2');
      const lead = newsSection.querySelector('.section-head p:last-child');
      if (heading && map.home_notice_heading) heading.textContent = map.home_notice_heading;
      if (lead && map.home_notice_lead) lead.textContent = map.home_notice_lead;
    }

    const contact = document.querySelector('.renew-contact');
    if (contact && map.home_contact_lead) {
      const paragraph = contact.querySelector('.wrap>p:not(.kicker)');
      if (paragraph) paragraph.textContent = map.home_contact_lead;
    }
  } catch (error) {
    console.warn('CMS content unavailable', error);
  }
}

async function loadNews() {
  if (location.pathname.endsWith('academy.html')) return;

  try {
    const rows = await cms('website_news?select=id,title,body,category,image_url,link_url,published_at&is_published=eq.true&order=published_at.desc&limit=3');
    if (!rows.length) return;

    const section = [...document.querySelectorAll('section')].find(item => item.querySelector('.kicker')?.textContent.trim() === 'NEWS / NOTE');
    const grid = section?.querySelector('.content-grid');
    if (!grid) return;

    const wrap = document.createElement('div');
    wrap.className = 'cms-news-grid';
    wrap.innerHTML = rows.map(item => {
      const date = item.published_at
        ? new Date(item.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';
      const inner = `<span class="tag">${esc(item.category)}${date ? ` / ${esc(date)}` : ''}</span>${item.image_url ? `<div class="cms-news-image" style="background-image:url('${esc(item.image_url)}')"></div>` : ''}<h3>${esc(item.title)}</h3><p>${esc(item.body || '')}</p>${item.link_url ? '<span class="mini-link">詳しく見る →</span>' : ''}`;
      return item.link_url
        ? `<a class="content-card cms-news-card" href="${esc(item.link_url)}" target="_blank" rel="noopener">${inner}</a>`
        : `<article class="content-card cms-news-card">${inner}</article>`;
    }).join('');

    grid.parentNode.insertBefore(wrap, grid);
  } catch (error) {
    console.warn('CMS news unavailable', error);
  }
}

async function loadAcademyVoices() {
  if (!location.pathname.endsWith('academy.html')) return;

  const section = [...document.querySelectorAll('section')].find(item => item.querySelector('.kicker')?.textContent.trim() === 'VOICE');
  const slot = section?.querySelector('.voice-empty');
  if (!slot) return;

  try {
    const rows = await cms('website_voices?select=id,audience,quote,class_name,sort_order,is_published&is_published=eq.true&order=sort_order.asc,id.asc');

    if (!rows.length) {
      slot.innerHTML = '<strong>Coming Soon</strong><p>保護者・参加者の皆さまからいただいた実際の声を、順次ご紹介します。</p>';
      return;
    }

    slot.className = 'academy-voices';
    slot.innerHTML = rows.map(item => `<article class="academy-voice"><p class="academy-voice-quote">${esc(item.quote)}</p><p class="academy-voice-meta">${esc([item.audience, item.class_name].filter(Boolean).join(' / '))}</p></article>`).join('');
  } catch (error) {
    console.warn('CMS voices unavailable', error);
    slot.innerHTML = '<strong>Coming Soon</strong><p>保護者・参加者の皆さまからいただいた実際の声を、順次ご紹介します。</p>';
  }
}

function refineAcademySupervision() {
  if (location.pathname.endsWith('academy.html')) {
    const section = [...document.querySelectorAll('section')].find(item => item.querySelector('.kicker')?.textContent.trim() === 'INSTRUCTOR / EXPERTISE');
    const head = section?.querySelector('.section-head');

    if (head) {
      head.innerHTML = '<p class="kicker">PROGRAM SUPERVISION</p><h2>子どもの成長に合わせた運動指導を。</h2><p>スポーツ・身体に関する専門知識と、さまざまなスポーツ現場での指導経験をもつスタッフが、一人ひとりの発達段階や運動経験に合わせて指導します。</p><div class="program-supervisor"><span>プログラム監修</span><strong>８LABO 代表　林 泰光</strong><a href="about.html#program-supervisor">プログラム監修者情報を見る →</a></div>';
    }
  }

  if (location.pathname.endsWith('about.html')) {
    const operator = document.querySelector('.about-operator');
    if (operator) operator.id = 'program-supervisor';
  }
}

function connectExpansionPages() {
  const path = location.pathname;
  if (path.endsWith('academy.html') || path.endsWith('adults.html') || path.endsWith('about.html') || path.endsWith('contact.html')) return;

  const cards = document.querySelectorAll('.entrance-grid .entrance-card');
  if (cards[0]) cards[0].href = 'academy.html';
  if (cards[1]) cards[1].href = 'adults.html';
  if (cards[2]) cards[2].href = 'contact.html';
  if (cards[3]) cards[3].href = 'contact.html';
  document.querySelectorAll('.renew-contact .contact-choice a').forEach(link => { link.href = 'contact.html'; });
}

/* Runtime CSS is limited to elements that only exist after CMS/JS execution.
   Page layout, line breaks, gutters and typography belong to CSS files. */
const runtimeStyle = document.createElement('style');
runtimeStyle.textContent = `
.cms-news-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:0 0 16px}
.cms-news-card{min-height:0}
.cms-news-image{height:150px;background-size:cover;background-position:center;border-radius:10px;margin:10px 0 16px}
.cms-photo{color:transparent!important;background-position:var(--cms-dx,50%) var(--cms-dy,50%)!important;background-size:cover!important}
.cms-photo:before{content:none!important;display:none!important}
.cms-photo .photo-note{display:none!important}
.cms-photo-empty{background:#eef3f7!important;color:#8a9aaa!important;display:grid!important;place-items:center!important;font-size:.72rem!important;font-weight:800!important;letter-spacing:.12em!important}
.preview-badge{font-variant-numeric:tabular-nums}
@media(max-width:800px){
  .cms-news-grid{grid-template-columns:1fr}
  .cms-news-image{height:190px}
  .cms-photo{background-position:var(--cms-mx,50%) var(--cms-my,50%)!important;background-size:cover!important}
}
`;
document.head.appendChild(runtimeStyle);

ensurePhotoLayouts();
connectExpansionPages();
refineAcademySupervision();
loadWebsiteContent();
loadNews();
loadAcademyVoices();
