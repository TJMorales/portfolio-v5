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
    var y = window.scrollY;
    shifts.forEach(function(el){
      var f = parseFloat(el.getAttribute('data-shift'));
      el.style.transform = 'translateX(' + (y * f * 0.08) + 'px)';
    });
  }

  window.addEventListener('scroll', function(){ progress(); drift(); }, { passive: true });
  progress();

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
