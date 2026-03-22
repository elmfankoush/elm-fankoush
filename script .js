/* ══════════════════════════════════════════
   علم ولا فنكوش؟ — script.js
   ══════════════════════════════════════════ */

// ── CUSTOM CURSOR ──
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0, my=0, rx=0, ry=0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx+'px'; cur.style.top = my+'px';
});
(function animRing(){
  rx += (mx-rx)*.12; ry += (my-ry)*.12;
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(animRing);
})();

// ── PARTICLES ──
const pc = document.getElementById('particles');
for(let i=0;i<25;i++){
  const p = document.createElement('div');
  p.className = 'particle';
  const sz = Math.random()*3+1, e = Math.random()>.5;
  p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;
    background:${e?'rgba(56,189,248,':'rgba(251,146,60,'}${Math.random()*.4+.1});
    animation-duration:${Math.random()*15+10}s;
    animation-delay:${Math.random()*10}s;
    box-shadow:0 0 ${sz*3}px ${e?'rgba(56,189,248,.5)':'rgba(251,146,60,.5)'};`;
  pc.appendChild(p);
}

// ── REVEAL ON SCROLL ──
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('revealed'); ro.unobserve(e.target); }
  });
}, { threshold:.15 });
document.querySelectorAll('[data-reveal]').forEach(el => ro.observe(el));

// ── PAGE NAVIGATION ──
function goPage(name, el){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  if(el) el.classList.add('active');
  window.scrollTo({ top:0, behavior:'smooth' });
  setTimeout(() => {
    document.querySelectorAll('#page-'+name+' [data-reveal]').forEach(el => {
      if(!el.classList.contains('revealed')) ro.observe(el);
    });
  }, 100);
}

function scrollToPlayer(){
  document.getElementById('playerSection').scrollIntoView({ behavior:'smooth' });
}

// ══════════════════════════════════════════
//  EPISODES CONFIG
// ══════════════════════════════════════════
const EPISODES = {
  1: {
    suffix: '',
    title: 'تفسير الأحلام',
    desc: 'تفسير الأحلام — بين علم الأعصاب والتراث الشعبي',
    endingDesc: 'الصورة الكاملة — ماذا يقول العلم وما الفرق الحقيقي؟',
    overlayQ: 'تفسير الأحلام…<br><span style="color:var(--elm)">علم</span> ولا <span style="color:var(--fan)">فنكوش</span>؟',
  },
  2: {
    suffix: '2',
    title: 'الأبراج',
    desc: 'الأبراج — بين علم النفس والتراث الشعبي',
    endingDesc: 'الصورة الكاملة — ماذا يقول العلم عن الأبراج؟',
    overlayQ: 'الأبراج…<br><span style="color:var(--elm)">علم</span> ولا <span style="color:var(--fan)">فنكوش</span>؟',
  }
};

let currentEp = 1;

function getVideos(ep) {
  const s = EPISODES[ep].suffix;
  return {
    intro:  `intro${s}.mp4`,
    elm_1:  `elm_1${s}.mp4`, elm_2: `elm_2${s}.mp4`, elm_3: `elm_3${s}.mp4`,
    fan_1:  `fan_1${s}.mp4`, fan_2: `fan_2${s}.mp4`, fan_3: `fan_3${s}.mp4`,
    ending: `ending${s}.mp4`
  };
}

let VIDEOS = getVideos(1);

const FLOW = {
  intro  : { type:'choice'                                       },
  elm_1  : { type:'continue', path:'elm', step:1, next:'elm_2'  },
  elm_2  : { type:'continue', path:'elm', step:2, next:'elm_3'  },
  elm_3  : { type:'auto',     path:'elm', step:3, next:'ending' },
  fan_1  : { type:'continue', path:'fan', step:1, next:'fan_2'  },
  fan_2  : { type:'continue', path:'fan', step:2, next:'fan_3'  },
  fan_3  : { type:'auto',     path:'fan', step:3, next:'ending' },
  ending : { type:'end'                                          }
};

const vid         = document.getElementById('mainVideo');
const olay        = document.getElementById('choiceOverlay');
const overlayQ    = document.getElementById('overlayQ');
const overlayBtns = document.getElementById('overlayBtns');
const overlayHint = document.getElementById('overlayHint');
const pBtn        = document.getElementById('playBtn');
const pFill       = document.getElementById('pFill');
const tDisp       = document.getElementById('timDisp');
const wrap        = document.getElementById('playerWrap');
const pathProg    = document.getElementById('pathProgress');
const pathLbl     = document.getElementById('pathLabel');
const metaDesc    = document.getElementById('metaDesc');
const ctrl        = document.querySelector('.player-controls');

let curSeg    = '';
let ctrlTimer = null;

function loadSeg(seg, play=false){
  curSeg = seg;
  vid.src = VIDEOS[seg];
  vid.load();
  updateProgressUI(seg);
  updateMeta(seg);
  if(play) vid.play();
}

function updateProgressUI(seg){
  const f = FLOW[seg];
  if(!f || !f.path){ pathProg.classList.remove('visible'); return; }
  pathProg.classList.add('visible');
  const isElm = f.path === 'elm';
  pathLbl.className = 'path-label ' + (isElm ? 'elm-label' : 'fan-label');
  pathLbl.textContent = isElm ? 'مسار العلم 🔬' : 'مسار الفنكوش 🔮';
  for(let i=1;i<=3;i++){
    const d = document.getElementById('dot'+i);
    d.className = 'step-dot' + (isElm ? '' : ' fan-dot');
    if(i < f.step)        d.classList.add('done');
    else if(i === f.step) d.classList.add('current');
  }
}

// ── LOAD EPISODE ──
function loadEpisode(ep) {
  currentEp = ep;
  VIDEOS = getVideos(ep);
  const epData = EPISODES[ep];
  const epNum = ep === 1 ? 'الأولى' : ep === 2 ? 'الثانية' : ep === 3 ? 'الثالثة' : ep;

  const titleEl = document.getElementById('epTitle');
  if(titleEl) titleEl.textContent = `الحلقة ${epNum}: ${epData.title}`;

  const rb = document.getElementById('restartBtn');
  if(rb) rb.remove();

  goPage('home', document.querySelector('.nav-links a'));
  setTimeout(() => {
    scrollToPlayer();
    loadSeg('intro', true);
  }, 400);

  const heroBtn = document.querySelector('.hero-cta-primary');
  if(heroBtn) {
    heroBtn.textContent = `شاهد الحلقة ${epNum} ↓`;
    heroBtn.onclick = () => scrollToPlayer();
  }
}

function updateMeta(seg){
  const badge = document.getElementById('epBadge');
  const epData = EPISODES[currentEp];
  if(seg === 'intro'){
    metaDesc.textContent = epData.desc;
    badge.textContent = 'مسار مزدوج ✦';
    badge.style.cssText = 'background:rgba(56,189,248,.08);border-color:rgba(56,189,248,.25);color:var(--elm)';
  } else if(seg === 'ending'){
    metaDesc.textContent = epData.endingDesc;
    badge.textContent = 'الخاتمة الموحدة ✦';
    badge.style.cssText = 'background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.15);color:#fff';
  } else {
    const f = FLOW[seg]; if(!f) return;
    const isElm = f.path === 'elm';
    const names = {
      elm_1:'المعلومة الأولى', elm_2:'المعلومة الثانية', elm_3:'المعلومة الثالثة',
      fan_1:'المعلومة الأولى', fan_2:'المعلومة الثانية', fan_3:'المعلومة الثالثة'
    };
    metaDesc.textContent = (names[seg]||'') + (isElm ? ' — مسار العلم' : ' — مسار الفنكوش');
    badge.textContent = isElm ? 'مسار العلم 🔬' : 'مسار الفنكوش 🔮';
    badge.style.cssText = isElm
      ? 'background:rgba(56,189,248,.08);border-color:rgba(56,189,248,.25);color:var(--elm)'
      : 'background:rgba(251,146,60,.08);border-color:rgba(251,146,60,.25);color:var(--fan)';
  }
}

function showOverlay(seg){
  const f = FLOW[seg];
  if(!f || f.type === 'end') return;
  olay.classList.remove('visible');
  overlayBtns.innerHTML = '';
  if(f.type === 'choice'){
    overlayQ.innerHTML = EPISODES[currentEp].overlayQ;
    overlayHint.textContent = 'اختر المسار الذي تريد متابعته';
    overlayBtns.innerHTML = `
      <div class="overlay-btns-choice">
        <button class="ov-btn elm" onclick="choosePath('elm');event.stopPropagation()">علم</button>
        <button class="ov-btn fan" onclick="choosePath('fan');event.stopPropagation()">فنكوش</button>
      </div>`;
  } else if(f.type === 'continue'){
    const isElm = f.path === 'elm';
    const col = isElm ? 'var(--elm)' : 'var(--fan)';
    const cls = isElm ? 'elm-next' : 'fan-next';
    const nextTxt = f.step === 2 ? 'المعلومة الثالثة ←' : 'المعلومة التالية ←';
    overlayQ.innerHTML = `المعلومة <span style="color:${col}">${f.step} / 3</span> انتهت…`;
    overlayHint.textContent = 'أو تخطّ للخاتمة الموحدة مباشرة';
    overlayBtns.innerHTML = `
      <div class="overlay-btns-continue">
        <button class="ov-btn-next ${cls}" onclick="goNext('${f.next}');event.stopPropagation()">${nextTxt}</button>
        <button class="ov-btn-next skip"   onclick="goNext('ending');event.stopPropagation()">انتقل للخاتمة ←</button>
      </div>`;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => olay.classList.add('visible')));
}

function hideOverlay(){ olay.classList.remove('visible'); }
function choosePath(path){ hideOverlay(); loadSeg(path+'_1', true); }
function goNext(seg)      { hideOverlay(); loadSeg(seg, true); }

function showRestartBtn(){
  if(document.getElementById('restartBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'restartBtn';
  btn.textContent = '↺ جرّب المسار الآخر';
  btn.onclick = (e) => {
    e.stopPropagation();
    btn.remove();
    loadSeg('intro', true);
  };
  wrap.appendChild(btn);
}

// ── CONTROLS AUTO-HIDE ──
function showControls(){
  ctrl.classList.add('visible');
  clearTimeout(ctrlTimer);
  ctrlTimer = setTimeout(() => {
    if(!vid.paused) ctrl.classList.remove('visible');
  }, 2500);
}

wrap.addEventListener('mousemove', showControls);
wrap.addEventListener('touchstart', () => {
  ctrl.classList.contains('visible')
    ? ctrl.classList.remove('visible')
    : showControls();
}, { passive:true });

// ── VIDEO EVENTS ──
vid.addEventListener('play', () => {
  pBtn.textContent = '⏸';
  clearTimeout(ctrlTimer);
  ctrlTimer = setTimeout(() => ctrl.classList.remove('visible'), 2500);
});
vid.addEventListener('pause', () => {
  pBtn.textContent = '▶';
  clearTimeout(ctrlTimer);
  ctrl.classList.add('visible');
});
vid.addEventListener('timeupdate', () => {
  if(!vid.duration) return;
  pFill.style.width = (vid.currentTime / vid.duration * 100) + '%';
  tDisp.textContent = fmt(vid.currentTime) + ' / ' + fmt(vid.duration);
});
vid.addEventListener('ended', () => {
  pBtn.textContent = '▶';
  clearTimeout(ctrlTimer);
  ctrl.classList.add('visible');
  const f = FLOW[curSeg];
  if(!f) return;
  if(f.type === 'auto')     loadSeg(f.next, true);
  else if(f.type === 'end') showRestartBtn();
  else                      showOverlay(curSeg);
});

// ── PLAYER CONTROLS ──
function handleWrapClick(){ if(!olay.classList.contains('visible')) togglePlay(); }
function togglePlay(){ vid.paused ? vid.play() : vid.pause(); }
function seekVid(e){
  const b = document.getElementById('pBar'), r = b.getBoundingClientRect();
  if(vid.duration) vid.currentTime = ((e.clientX - r.left) / r.width) * vid.duration;
}
function toggleMute(){
  vid.muted = !vid.muted;
  document.getElementById('volBtn').textContent = vid.muted ? '🔇' : '🔊';
}
function toggleFS(){
  document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen();
}
function fmt(s){ return Math.floor(s/60) + ':' + Math.floor(s%60).toString().padStart(2,'0'); }

// ── BOOT ──
loadSeg('intro', true);
ctrl.classList.add('visible');

// ── ABOUT SLOGAN ──
const sbo = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.querySelectorAll('.step-item').forEach((s,i) => setTimeout(() => s.classList.add('animated'), i*220));
      e.target.querySelectorAll('.step-connector').forEach((c,i) => setTimeout(() => c.classList.add('show'), (i+1)*220+100));
      sbo.unobserve(e.target);
    }
  });
}, { threshold:.3 });
const sb = document.getElementById('sloganBig');
if(sb) sbo.observe(sb);

document.addEventListener('keydown', e => {
  if(e.code === 'Space' && document.activeElement.tagName !== 'BUTTON'){
    e.preventDefault(); togglePlay();
  }
});
