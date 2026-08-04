/* Flowfield: two soft colour orbs that live behind every section. As you scroll from one
   section to the next they glide toward a new position and cross-fade toward a new hue -
   a continuous thread of motion tying the whole page together, rather than each section
   resetting on its own. Position/scale are lerped every frame (so they keep gliding for a
   moment after you stop scrolling); colour is handed to a CSS transition. */
(function(){
  var field = document.querySelector('.flowfield'); if (!field) return;
  var orbA = field.querySelector('.forb-a');
  var orbB = field.querySelector('.forb-b');
  if (!orbA || !orbB) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = window.matchMedia('(max-width: 700px)').matches;
  if (reduced || narrow) return;

  var STOPS = [
    { sel: '#top',     ca: 'var(--gold)',      cb: 'var(--steel-soft)', ax: 78, ay: 22, bx: 22, by: 68, scale: 1 },
    { sel: '#work',    ca: 'var(--steel)',     cb: 'var(--gold-deep)',  ax: 18, ay: 30, bx: 82, by: 74, scale: 1.1 },
    { sel: '#shipped', ca: 'var(--gold-deep)', cb: 'var(--steel-soft)', ax: 80, ay: 66, bx: 20, by: 24, scale: 0.95 },
    { sel: '#about',   ca: 'var(--steel-soft)',cb: 'var(--gold)',       ax: 28, ay: 50, bx: 74, by: 46, scale: 1.05 },
    { sel: '#words',   ca: 'var(--gold)',      cb: 'var(--steel)',      ax: 72, ay: 38, bx: 26, by: 70, scale: 1 },
    { sel: '#contact', ca: 'var(--steel)',     cb: 'var(--gold-deep)',  ax: 32, ay: 62, bx: 78, by: 30, scale: 1.15 }
  ].map(function(s){ s.el = document.querySelector(s.sel); return s; }).filter(function(s){ return s.el; });

  if (!STOPS.length) return;

  var current = STOPS[0];
  function applyColour(stop){
    orbA.style.setProperty('--fc', stop.ca);
    orbB.style.setProperty('--fc2', stop.cb);
  }
  applyColour(current);

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        var stop = STOPS.filter(function(s){ return s.el === e.target; })[0];
        if (stop && stop !== current) { current = stop; applyColour(stop); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    STOPS.forEach(function(s){ io.observe(s.el); });
  }

  var ax = current.ax, ay = current.ay, bx = current.bx, by = current.by, sc = current.scale;
  function frame(){
    ax += (current.ax - ax) * 0.035;
    ay += (current.ay - ay) * 0.035;
    bx += (current.bx - bx) * 0.035;
    by += (current.by - by) * 0.035;
    sc += (current.scale - sc) * 0.035;
    orbA.style.left = ax + '%'; orbA.style.top = ay + '%';
    orbB.style.left = bx + '%'; orbB.style.top = by + '%';
    orbA.style.transform = 'translate(-50%,-50%) scale(' + sc.toFixed(3) + ')';
    orbB.style.transform = 'translate(-50%,-50%) scale(' + (2 - sc).toFixed(3) + ')';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
