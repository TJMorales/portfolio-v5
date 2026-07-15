/* Scroll cube — pins the work section, rotates a 3D drum through the four cases, releases after the last. */
(function(){
  var mq = window.matchMedia('(min-width: 981px) and (pointer: fine)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var work = document.getElementById('work'); if (!work || !mq || reduced) return;

  var cases = [].slice.call(work.querySelectorAll('.case'));
  if (cases.length < 2) return;
  var kicker = work.querySelector('.kicker');

  /* restructure: track > sticky stage > cube > faces */
  var track = document.createElement('div'); track.className = 'cube-track';
  var stage = document.createElement('div'); stage.className = 'cube-stage';
  var scene = document.createElement('div'); scene.className = 'cube-scene';
  var cube  = document.createElement('div'); cube.className  = 'cube';
  var hud   = document.createElement('div'); hud.className   = 'cube-hud';
  hud.innerHTML = '<b>01</b> / 0' + cases.length;
  scene.appendChild(cube); stage.appendChild(scene); stage.appendChild(hud); track.appendChild(stage);
  work.appendChild(track);
  if (kicker) stage.insertBefore(kicker, scene);

  cases.forEach(function(c, i){
    var face = document.createElement('div'); face.className = 'cube-face';
    face.appendChild(c); cube.appendChild(face);
    c.classList.add('in');                    /* defeat reveal-translate inside 3D */
  });

  var N = cases.length, tz = 0, cur = 0, target = 0, hudIdx = -1;
  function size(){
    tz = scene.getBoundingClientRect().height / 2;
    cube.querySelectorAll('.cube-face').forEach(function(f, i){
      f.style.transform = 'rotateX(' + (i * -90) + 'deg) translateZ(' + tz + 'px)';
    });
    track.style.height = (N * 90) + 'vh';     /* 90vh of scroll per face + natural release */
  }
  function progress(){
    var r = track.getBoundingClientRect();
    var total = r.height - stage.offsetHeight;
    var raw = Math.max(0, Math.min(1, -r.top / total)) * (N - 1);
    var i = Math.floor(raw), f = raw - i;
    f = f*f*f*(f*(f*6 - 15) + 10);            /* smootherstep: dwell on each face, quick transit */
    return i + f;
  }
  function frame(){
    target = progress() * 90;
    cur += (target - cur) * 0.085;            /* eased in/out */
    if (Math.abs(target - cur) < 0.01) cur = target;
    var frac = (cur / 90) % 1, mid = Math.sin(frac * Math.PI);
    scene.style.transform = 'scale(' + (1 - 0.10 * mid) + ')';
    cube.style.transform = 'translateZ(' + (-tz) + 'px) rotateX(' + cur + 'deg)';
    var idx = Math.min(N - 1, Math.round(cur / 90));
    if (idx !== hudIdx){ hudIdx = idx; hud.innerHTML = '<b>0' + (idx + 1) + '</b> / 0' + N; }
    requestAnimationFrame(frame);
  }
  size();
  window.addEventListener('resize', size);
  document.documentElement.classList.add('has-cube');
  requestAnimationFrame(frame);
})();
