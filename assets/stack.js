/* Case-study grid: cards fade/rise into place as they're scrolled into view, and clicking
   one expands its accent colour to fill the screen before handing off to the destination. */
(function(){
  var stack = document.querySelector('.stack'); if (!stack) return;
  var cards = [].slice.call(stack.querySelectorAll('.stackcard'));
  if (!cards.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- title: split into per-letter spans for a flip-clock style reveal. Pure DOM setup -
     the actual animation is a CSS transition keyed off .stackcard.in, so it plays once on
     scroll-entrance and is never touched by hover or by the image's cursor tilt. ---- */
  cards.forEach(function(card){
    var title = card.querySelector('.sc-title'); if (!title) return;
    var text = title.textContent;
    title.textContent = '';
    var words = text.split(' '), n = 0;
    words.forEach(function(word, wi){
      var wordWrap = document.createElement('span');
      wordWrap.style.display = 'inline-block';
      word.split('').forEach(function(ch){
        var wrap = document.createElement('span');
        wrap.className = 'tchar';
        var inner = document.createElement('span');
        inner.textContent = ch;
        inner.style.transitionDelay = (n * 0.02) + 's';
        n++;
        wrap.appendChild(inner);
        wordWrap.appendChild(wrap);
      });
      title.appendChild(wordWrap);
      if (wi < words.length - 1) title.appendChild(document.createTextNode(' '));
    });
  });

  /* ---- reveal: fade + rise as each card scrolls into view (also triggers the title flip) ---- */
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

  /* ---- cursor tilt: the card frame stays put - only the photo behind the mask tilts in 3D ---- */
  if (!reduced && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    cards.forEach(function(card){
      var img = card.querySelector('.sc-media img'); if (!img) return;
      card.addEventListener('mousemove', function(e){
        var r = img.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * 10, ry = (px - 0.5) * 14;
        img.style.transform = 'perspective(700px) scale(1.12) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function(){ img.style.transform = ''; });
    });
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
