/* Case-study stack: pinned scroll cards, scroll-linked scale/parallax, per-card ambient
   particles, and a colour wash that tracks whichever card is active. Native scroll the
   whole way — position:sticky does the pinning, this just layers polish on top. */
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

  /* ---- ambient particles per card, only animating while its wrapper is on screen ---- */
  if (fancy && 'IntersectionObserver' in window) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    wraps.forEach(function(w){
      var canvas = w.querySelector('.sc-particles'); if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var col = getComputedStyle(w).getPropertyValue('--c').trim() || '#ffffff';
      var W, H, parts = [], raf = null;
      function size(){
        var r = canvas.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        W = r.width; H = r.height;
        canvas.width = W * DPR; canvas.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
      function init(){
        parts = [];
        var N = 44;
        for (var i = 0; i < N; i++) {
          parts.push({
            x: Math.random() * W, y: Math.random() * H,
            s: 0.6 + Math.random() * 2.2,
            v: 0.15 + Math.random() * 0.45,
            a: 0.08 + Math.random() * 0.28,
            d: Math.random() * Math.PI * 2
          });
        }
      }
      function frame(){
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y -= p.v; p.d += 0.01; p.x += Math.sin(p.d) * 0.25;
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          ctx.globalAlpha = p.a; ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(frame);
      }
      size(); init();
      window.addEventListener('resize', function(){ size(); init(); });
      var pio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting && !raf) frame();
          else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 });
      pio.observe(w);
    });
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
