/* Particle vortex — forms as a loading intro (with a % counter), then a subtle hero background. One canvas. */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#5E3FBA','#BA3F5E','#3FBA9B','#9BBA3F'];
  var DPR = Math.min(window.devicePixelRatio||1, 2);
  function vary(m){ return 0.5 + Math.pow(Math.random(),1.7)*m; } // varied sizes, mostly small

  var hero = document.getElementById('top'); if(!hero) return;
  var pct = document.getElementById('loadpct');
  var canvas = document.createElement('canvas');
  canvas.className = 'vortex'; canvas.setAttribute('aria-hidden','true');
  hero.insertBefore(canvas, hero.firstChild);           // sits behind the copy (copy is z-index:1)
  var ctx = canvas.getContext('2d');
  var W,H,cx,cy,R,hx,hy,tx,ty,parts=[];
  function resize(){
    var r = hero.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width = W*DPR; canvas.height = H*DPR; canvas.style.width = W+'px'; canvas.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    R = Math.min(W,H)*0.34; hx = W*0.66; hy = H*0.40;
    if (cx===undefined){ cx = hx; cy = hy; }
    tx = hx; ty = hy;
  }
  function init(){
    parts = []; var N = W<760 ? 300 : 560;
    for (var i=0;i<N;i++){
      var rr = Math.sqrt(Math.random())*R;
      parts.push({ r:rr, a:Math.random()*6.283, size:vary(3.8),
                   col:COLORS[(Math.random()*4)|0], alpha:0.14 + 0.42*(1-rr/R) });
    }
  }
  resize(); init();
  window.addEventListener('resize', function(){ resize(); init(); });

  if (window.matchMedia('(pointer: fine)').matches){
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', function(){ tx = hx; ty = hy; });
  }

  var boost = 0, last = window.scrollY;
  window.addEventListener('scroll', function(){
    var y = window.scrollY, dv = y-last; last = y;
    boost += dv*0.00035; boost = Math.max(-0.09, Math.min(0.09, boost));
  }, {passive:true});

  var seen = false; try{ seen = sessionStorage.getItem('tjm-intro') === '1'; }catch(e){}
  if (reduced){
    document.documentElement.classList.remove('loading');
    if(pct && pct.parentNode) pct.parentNode.removeChild(pct);
    ctx.clearRect(0,0,W,H);
    for (var i=0;i<parts.length;i++){ var p=parts[i];
      var x=cx+Math.cos(p.a)*p.r, y=cy+Math.sin(p.a)*p.r;
      ctx.globalAlpha=p.alpha; ctx.fillStyle=p.col;
      ctx.beginPath(); ctx.arc(x,y,p.size,0,6.283); ctx.fill(); }
    ctx.globalAlpha=1; return;
  }

  var forming = !seen, t0 = null, FORM = 1900, ended = seen, failsafe;
  function endLoad(){ if(ended) return; ended = true; forming = false;
    clearTimeout(failsafe);
    try{ sessionStorage.setItem('tjm-intro','1'); }catch(e){}
    document.documentElement.classList.remove('loading');
    if(pct){ pct.textContent = '100%'; pct.classList.add('hide'); setTimeout(function(){ if(pct.parentNode) pct.parentNode.removeChild(pct); }, 700); } }
  if (seen){                                          // intro already played this session
    document.documentElement.classList.remove('loading');
    if(pct && pct.parentNode) pct.parentNode.removeChild(pct);
  } else {
    failsafe = setTimeout(endLoad, 4200);             // backstop only
    setTimeout(endLoad, FORM + 120);                  // reveal right at 100%
  }
  var ease = function(x){ return 1 - Math.pow(1-x,3); };

  function frame(t){
    if (t0===null) t0 = t;
    var el = t - t0, e = forming ? ease(Math.min(1, el/FORM)) : 1;
    ctx.clearRect(0,0,W,H);
    for (var i=0;i<parts.length;i++){
      var p = parts[i], cr = p.r, cs = p.size, ca = p.alpha, sb = 1 + boost*9;
      if (forming){
        cr = p.r + (1-e)*(R*1.9);       // blown-out large -> converges to rest radius
        cs = p.size*(1 + (1-e)*2.4);      // large -> settles to normal size
        ca = p.alpha*Math.min(1, el/500); // fade in
        sb = 1 + (1-e)*1.6;               // extra spin while forming
      }
      p.a += (0.005225 + 0.01995*(1-p.r/R))*sb;   // center faster, edges slower (-5%)
      var x = cx + Math.cos(p.a)*cr, y = cy + Math.sin(p.a)*cr;
      ctx.globalAlpha = ca; ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(x, y, Math.max(0.2, cs), 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1; boost *= 0.93;
    if (forming){ cx += (hx - cx)*0.08; cy += (hy - cy)*0.08; }
    else { cx += (tx - cx)*0.055; cy += (ty - cy)*0.055; }
    if (forming){
      if (pct) pct.textContent = Math.round(Math.min(1, el/FORM)*100) + '%';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
