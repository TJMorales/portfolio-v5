/* Particle vortex — a forming loading screen, then a subtle hero background */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#5E3FBA','#BA3F5E','#3FBA9B','#9BBA3F'];
  var DPR = Math.min(window.devicePixelRatio||1, 2);
  function vary(max){ return 0.5 + Math.pow(Math.random(),1.7) * max; } // varied sizes, mostly small

  /* ---------- LOADING SCREEN: vortex forms from large + blown-out to rest ---------- */
  var overlay = document.getElementById('loader');
  if (overlay) {
    var lc = overlay.querySelector('canvas'), lctx = lc.getContext('2d');
    document.body.style.overflow = 'hidden';
    var LW, LH, lcx, lcy, LR, lp = [], onR;
    function lresize(){
      LW = window.innerWidth; LH = window.innerHeight;
      lc.width = LW*DPR; lc.height = LH*DPR; lc.style.width = LW+'px'; lc.style.height = LH+'px';
      lctx.setTransform(DPR,0,0,DPR,0,0);
      LR = Math.min(LW,LH)*0.30; lcx = LW*0.5; lcy = LH*0.5;
    }
    function linit(){
      lp = []; var N = LW<760 ? 150 : 300;
      for (var i=0;i<N;i++){
        var rr = Math.sqrt(Math.random())*LR;
        lp.push({ r:rr, a:Math.random()*6.283, size:vary(4.2),
                  col:COLORS[(Math.random()*4)|0], alpha:0.12 + 0.5*(1-rr/LR) });
      }
    }
    function hideLoader(){
      overlay.classList.add('hide');
      document.body.style.overflow = '';
      setTimeout(function(){ if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 850);
    }
    var failsafe = setTimeout(hideLoader, 5000); // hard backstop — never block the site
    if (reduced){
      clearTimeout(failsafe); hideLoader();
    } else {
      lresize(); linit();
      onR = function(){ lresize(); linit(); };
      window.addEventListener('resize', onR);
      var t0 = null, FORM = 1600, HOLD = 380;
      var ease = function(x){ return 1 - Math.pow(1-x,3); };
      function lframe(t){
        if (t0===null) t0 = t;
        var el = t - t0, e = ease(Math.min(1, el/FORM));
        lctx.clearRect(0,0,LW,LH);
        for (var i=0;i<lp.length;i++){
          var q = lp[i];
          var cr = q.r + (1-e)*(LR*1.9);        // blown-out -> converges to rest radius
          var cs = q.size*(1 + (1-e)*2.4);       // large -> settles to normal size
          var ca = q.alpha*Math.min(1, el/450);  // fade in
          q.a += (0.006 + 0.02*(1-q.r/LR))*(1 + (1-e)*1.5); // center faster, extra spin while forming
          var x = lcx + Math.cos(q.a)*cr, y = lcy + Math.sin(q.a)*cr;
          lctx.globalAlpha = ca; lctx.fillStyle = q.col;
          lctx.beginPath(); lctx.arc(x, y, Math.max(0.2, cs), 0, 6.283); lctx.fill();
        }
        lctx.globalAlpha = 1;
        if (el < FORM + HOLD) requestAnimationFrame(lframe);
        else { clearTimeout(failsafe); window.removeEventListener('resize', onR); hideLoader(); }
      }
      requestAnimationFrame(lframe);
    }
  }

  /* ---------- HERO BACKGROUND VORTEX (subtle, behind the copy) ---------- */
  var hero = document.getElementById('top');
  if (hero) {
    var canvas = document.createElement('canvas');
    canvas.className = 'vortex'; canvas.setAttribute('aria-hidden','true');
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext('2d');
    var W, H, cx, cy, R, parts = [];
    function resize(){
      var r = hero.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = W*DPR; canvas.height = H*DPR; canvas.style.width = W+'px'; canvas.style.height = H+'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
      R = Math.min(W,H)*0.34; cx = W*0.72; cy = H*0.36;
    }
    function init(){
      parts = []; var N = W<760 ? 120 : 240;
      for (var i=0;i<N;i++){
        var rr = Math.sqrt(Math.random())*R;
        parts.push({ r:rr, a:Math.random()*6.283, size:vary(3.4),
                     col:COLORS[(Math.random()*4)|0], alpha:0.07 + 0.30*(1-rr/R) });
      }
    }
    var boost = 0, last = window.scrollY;
    window.addEventListener('scroll', function(){
      var y = window.scrollY, dv = y-last; last = y;
      boost += dv*0.00035; boost = Math.max(-0.09, Math.min(0.09, boost));
    }, {passive:true});
    function draw(anim){
      ctx.clearRect(0,0,W,H);
      for (var i=0;i<parts.length;i++){
        var p = parts[i];
        if (anim){ p.a += (0.0055 + 0.021*(1-p.r/R))*(1 + boost*9); }
        var x = cx + Math.cos(p.a)*p.r, y = cy + Math.sin(p.a)*p.r;
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; boost *= 0.93;
      if (anim) requestAnimationFrame(function(){ draw(true); });
    }
    resize(); init();
    window.addEventListener('resize', function(){ resize(); init(); });
    draw(!reduced);
  }
})();
