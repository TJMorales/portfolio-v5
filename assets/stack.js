/* Case-study grid: cards fade/rise into place as they're scrolled into view, and clicking
   one expands its accent colour to fill the screen before handing off to the destination. */
(function(){
  var stack = document.querySelector('.stack'); if (!stack) return;
  var cards = [].slice.call(stack.querySelectorAll('.stackcard'));
  if (!cards.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal: fade + rise as each card scrolls into view ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    cards.forEach(function(c){ io.observe(c); });
  } else {
    cards.forEach(function(c){ c.classList.add('in'); });
  }

  /* ---- card -> destination page: the accent expands from the card, then fades in ---- */
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
