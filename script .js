function showOverlay(seg) {
  const f = FLOW[seg];
  const olay = document.getElementById('choiceOverlay');
  const btns = document.getElementById('overlayBtns');
  const q    = document.getElementById('overlayQ');

  if(!f || !olay || !btns) return;

  btns.innerHTML = ''; // تنظيف عشان ميتكرروش

  if(f.type === 'choice') {
    // السؤال الرئيسي (زي ما كان في الصورة)
    q.innerHTML = EPISODES[currentEp].overlayQ; 
    
    // الزراير اللي كنت محتاجها بالظبط
    btns.innerHTML = `
      <button class="ov-btn elm" onclick="choosePath('elm')">عايز تسمع رأي العلم؟</button>
      <button class="ov-btn fan" onclick="choosePath('fan')">عايز تسمع رأي الفنكوش؟</button>
    `;
  } 
  else if(f.type === 'continue') {
    const isElm = f.path === 'elm';
    btns.innerHTML = `
      <button class="ov-btn-next ${isElm?'elm-next':'fan-next'}" onclick="goNext('${f.next}')">المعلومة التالية ←</button>
      <button class="ov-btn-next skip" onclick="goNext('ending')">تخطي للخاتمة</button>
    `;
  }

  olay.classList.add('visible'); // ده اللي بيخليهم يظهروا بالـ CSS بتاعك
}
