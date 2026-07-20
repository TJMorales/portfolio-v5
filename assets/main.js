(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll progress */
  var bar = document.querySelector('.progress');
  function progress(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
  }

  /* hero type drifts apart as you scroll: transform only */
  var shifts = document.querySelectorAll('[data-shift]');
  function drift(){
    if (reduced) return;
    var narrow = window.innerWidth <= 1024;
    var y = window.scrollY;
    shifts.forEach(function(el){
      if (narrow){ el.style.transform = ''; return; }
      var f = parseFloat(el.getAttribute('data-shift'));
      el.style.transform = 'translateX(' + (y * f * 0.08) + 'px)';
    });
  }

  /* full-bleed parallax dividers: transform only */
  var pls = document.querySelectorAll('.bleed img');
  function parallax(){
    if (reduced) return;
    var vh = window.innerHeight;
    pls.forEach(function(im){
      var fr = im.parentElement;
      var r = fr.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var overflow = im.offsetHeight - fr.offsetHeight;
      if (overflow <= 0){ im.style.transform = 'translateY(0)'; return; }
      var prog = (vh - r.top) / (vh + r.height);
      prog = prog < 0 ? 0 : prog > 1 ? 1 : prog;
      im.style.transform = 'translateY(' + (-overflow * prog).toFixed(1) + 'px)';
    });
  }
  pls.forEach(function(im){ im.addEventListener('load', parallax); });
  window.addEventListener('load', parallax);

  /* HMW question: words fill with scroll */
  var hmw = document.querySelector('.hmw');
  var words = hmw ? hmw.querySelectorAll('.w') : [];
  function wordfill(){
    if (reduced || !hmw) return;
    var r = hmw.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (vh * 0.6)));
    var n = Math.round(p * words.length);
    words.forEach(function(w, i){ w.classList.toggle('on', i < n); });
  }

  /* ghost numerals drift slower than the page */
  var ghosts = document.querySelectorAll('.ghost');
  function ghostDrift(){
    if (reduced) return;
    ghosts.forEach(function(g){
      var r = g.parentElement.getBoundingClientRect();
      g.style.transform = 'translateY(' + (r.top * -0.12) + 'px)';
    });
  }

  window.addEventListener('scroll', function(){ progress(); drift(); parallax(); wordfill(); ghostDrift(); }, { passive: true });
  window.addEventListener('resize', function(){ drift(); parallax(); }, { passive: true });
  progress(); parallax(); wordfill(); ghostDrift();

  /* impact stats count up when they land */
  function countUp(el){
    var raw = el.getAttribute('data-val');
    var m = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) { el.textContent = raw; return; }
    var target = parseFloat(m[1]), suffix = m[2];
    var dec = (m[1].split('.')[1] || '').length;
    var t0 = null;
    function tick(t){
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var stats = document.querySelectorAll('.impact-stats b[data-val]');
  if (reduced || !('IntersectionObserver' in window)) {
    stats.forEach(function(s){ s.textContent = s.getAttribute('data-val'); });
  } else {
    var statObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { countUp(e.target); statObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    stats.forEach(function(s){ statObs.observe(s); });
  }

  /* wayfinding rail */
  var rail = document.querySelector('.rail');
  var railColors = { Work: 'var(--violet)', Clients: 'var(--lime)', Words: 'var(--teal)', Contact: 'var(--rose)' };
  var sections = document.querySelectorAll('[data-rail]');
  if ('IntersectionObserver' in window) {
    var railObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          var name = e.target.getAttribute('data-rail');
          rail.textContent = name;
          rail.style.color = railColors[name] || '';
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function(s){ railObs.observe(s); });

    /* reveal: transform only, content is always visible */
    var revObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ revObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  /* cursor dot */
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    var dot = document.querySelector('.dot');
    var dx = 0, dy = 0, cx = 0, cy = 0, shown = false;
    window.addEventListener('mousemove', function(e){
      dx = e.clientX; dy = e.clientY;
      if (!shown) { dot.classList.add('on'); shown = true; }
    });
    (function loop(){
      cx += (dx - cx) * 0.2; cy += (dy - cy) * 0.2;
      dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a').forEach(function(a){
      a.addEventListener('mouseenter', function(){ dot.classList.add('grow'); });
      a.addEventListener('mouseleave', function(){ dot.classList.remove('grow'); });
    });
  }
})();

/* back-to-top visibility: after the work cycle completes */
(function(){
  var btn = document.getElementById('totop'); if(!btn) return;
  function gate(){ return document.getElementById('work'); }
  function check(){
    var g = gate(); if(!g) return;
    var r = g.getBoundingClientRect();
    btn.classList.toggle('on', r.bottom <= window.innerHeight);
  }
  window.addEventListener('scroll', check, {passive:true});
  window.addEventListener('resize', check);
  check();
})();

/* dark mode toggle */
(function(){
  var b = document.getElementById('themeToggle'); if(!b) return;
  var h = document.documentElement;
  function sync(){ b.setAttribute('aria-pressed', h.getAttribute('data-theme')==='dark' ? 'true' : 'false'); }
  b.addEventListener('click', function(){
    var dark = h.getAttribute('data-theme')==='dark';
    if (dark) h.removeAttribute('data-theme'); else h.setAttribute('data-theme','dark');
    try{ localStorage.setItem('tjm-theme', dark ? 'light' : 'dark'); }catch(e){}
    sync();
  });
  sync();
})();

/* case index hover peek */
(function(){
  var wrap = document.querySelector('.morecases');
  if (!wrap || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var peek = document.createElement('div'); peek.className='case-peek'; peek.setAttribute('aria-hidden','true');
  var img = document.createElement('img'); img.alt=''; peek.appendChild(img);
  document.body.appendChild(peek);
  var ty = window.innerHeight/2, cy = ty, active = false, raf = null;
  function loop(){
    cy += (ty - cy) * 0.12;
    peek.style.top = cy + 'px';
    raf = (active || Math.abs(ty - cy) > 0.5) ? requestAnimationFrame(loop) : null;
  }
  wrap.addEventListener('mousemove', function(e){ ty = e.clientY; if(!raf) raf = requestAnimationFrame(loop); });
  wrap.querySelectorAll('a[data-img]').forEach(function(a){
    a.addEventListener('mouseenter', function(){
      var src = a.getAttribute('data-img');
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      active = true; peek.classList.add('on');
    });
    a.addEventListener('mouseleave', function(){ active = false; peek.classList.remove('on'); });
  });
})();

/* card group: fuzz the rest of the group while one card is hovered */
(function(){
  var work=document.getElementById('work'); if(!work) return;
  if(!window.matchMedia('(min-width:981px) and (hover:hover) and (pointer:fine)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  work.querySelectorAll('.case').forEach(function(c){
    c.addEventListener('mouseenter',function(){ work.classList.add('dim'); });
    c.addEventListener('mouseleave',function(){ work.classList.remove('dim'); });
  });
})();

/* card -> page: the accent expands from the card, then fades into the destination */
(function(){
  var work=document.getElementById('work'); if(!work) return;
  var cards=[].slice.call(work.querySelectorAll('.case')); if(!cards.length) return;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var going=false;
  function accent(el){ var v=getComputedStyle(el).getPropertyValue('--c').trim(); return (v && v.indexOf('var(')!==0) ? v : '#101010'; }
  cards.forEach(function(card){
    card.addEventListener('click', function(e){
      if(reduced || going) return;
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0) return;  /* let new-tab work */
      var href=card.getAttribute('href'); if(!href) return;
      e.preventDefault(); going=true;
      var col=accent(card);
      try{ sessionStorage.setItem('tjm-xfade', col); }catch(_){}
      card.classList.add('leaving');
      var d=60;
      cards.forEach(function(o){ if(o===card) return; setTimeout(function(){o.classList.add('out');}, d); d+=70; });
      setTimeout(function(){
        var r=card.getBoundingClientRect();
        var cv=document.createElement('div'); cv.className='xcover';
        cv.style.left=r.left+'px'; cv.style.top=r.top+'px';
        cv.style.width=r.width+'px'; cv.style.height=r.height+'px';
        cv.style.background=col;
        document.body.appendChild(cv);
        cv.getBoundingClientRect();
        var sx=window.innerWidth/r.width, sy=window.innerHeight/r.height;
        var ox=(window.innerWidth/2 - r.width/2 - r.left)/sx;
        var oy=(window.innerHeight/2 - r.height/2 - r.top)/sy;
        cv.style.borderRadius='0px';
        cv.style.transform='scaleX('+sx+') scaleY('+sy+') translate3d('+ox+'px,'+oy+'px,0)';
        setTimeout(function(){ window.location.href=href; }, 580);
      }, 250);
    });
  });
  /* returning via back/bfcache must reset the group */
  window.addEventListener('pageshow', function(){
    going=false;
    cards.forEach(function(o){ o.classList.remove('out','leaving'); });
    var old=document.querySelector('.xcover'); if(old&&old.parentNode) old.parentNode.removeChild(old);
  });
})();

/* destination: the head script already painted the colour; fade it away */
(function(){
  var h=document.documentElement; if(!h.classList.contains('xfading')) return;
  requestAnimationFrame(function(){requestAnimationFrame(function(){h.classList.add('xfaded');});});
  setTimeout(function(){h.classList.remove('xfading','xfaded');},900);
})();
