/* Case-study stack: pinned scroll cards, scroll-linked scale/parallax, and a colour wash
   that tracks whichever card is active. Native scroll the whole way — position:sticky
   does the pinning, this just layers polish on top. */
(function(){
  var stack = document.querySelector('.stack'); if (!stack) return;
  var wraps = [].slice.call(stack.querySelectorAll('.stackwrap'));
  if (!wraps.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fancy = !reduced && window.matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;

  /* ---- scroll-linked pin scale/dim + background image parallax ---- */
  function applyProgress(){
    var vh = window.innerHeight;
    wraps.forEach(function(w){
      var r = w.getBoundingClientRect();
      var span = r.height - vh;
      var p = span > 0 ? (-r.top) / span : 0;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var card = w.querySelector('.stackcard');
      var img = w.querySelector('.sc-media img');
      if (card) {
        card.style.transform = 'scale(' + (1 - p * 0.08).toFixed(3) + ')';
        card.style.filter = 'brightness(' + (1 - p * 0.32).toFixed(3) + ') saturate(' + (1 - p * 0.2).toFixed(3) + ')';
      }
      if (img) img.style.transform = 'scale(1.14) translateY(' + ((p - 0.5) * 46).toFixed(1) + 'px)';
    });
  }
  if (fancy) {
    window.addEventListener('scroll', applyProgress, { passive: true });
    window.addEventListener('resize', applyProgress);
    applyProgress();
  }

  /* ---- active-card reveal + backdrop colour wash ---- */
  var bg = stack.querySelector('.stack-bg');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        e.target.classList.toggle('in', e.isIntersecting);
        if (e.isIntersecting && bg) {
          var c = getComputedStyle(e.target).getPropertyValue('--c').trim();
          if (c) { bg.style.setProperty('--wash', c); bg.classList.add('on'); }
        }
      });
    }, { threshold: 0.45 });
    wraps.forEach(function(w){ io.observe(w); });

    if (bg) {
      var sectionIo = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if (!e.isIntersecting) bg.classList.remove('on'); });
      }, { threshold: 0 });
      sectionIo.observe(stack);
    }
  } else {
    wraps.forEach(function(w){ w.classList.add('in'); });
  }

  /* ---- card -> destination page: the accent expands from the card, then fades in ---- */
  var cards = [].slice.call(stack.querySelectorAll('.stackcard'));
  var going = false;
  cards.forEach(function(card){
    card.addEventListener('click', function(e){
      if (reduced || going) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var href = card.getAttribute('href'); if (!href) return;
      e.preventDefault(); going = true;
      var col = getComputedStyle(card).getPropertyValue('--c').trim() || '#101010';
      try { sessionStorage.setItem('tjm-xfade', col); } catch (_) {}
      var r = card.getBoundingClientRect();
      var cv = document.createElement('div'); cv.className = 'xcover';
      cv.style.left = r.left + 'px'; cv.style.top = r.top + 'px';
      cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
      cv.style.background = col;
      document.body.appendChild(cv);
      cv.getBoundingClientRect();
      var sx = window.innerWidth / r.width, sy = window.innerHeight / r.height;
      var ox = (window.innerWidth / 2 - r.width / 2 - r.left) / sx;
      var oy = (window.innerHeight / 2 - r.height / 2 - r.top) / sy;
      cv.style.borderRadius = '0px';
      cv.style.transform = 'scaleX(' + sx + ') scaleY(' + sy + ') translate3d(' + ox + 'px,' + oy + 'px,0)';
      setTimeout(function(){ window.location.href = href; }, 580);
    });
  });
  window.addEventListener('pageshow', function(){
    going = false;
    var old = document.querySelector('.xcover'); if (old && old.parentNode) old.parentNode.removeChild(old);
  });
})();
