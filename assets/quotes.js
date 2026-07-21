(function(){
  var track = document.querySelector('.quotes .q-track');
  if(!track) return;
  var viewport = document.querySelector('.quotes .q-viewport');
  var slides = track.children;
  var dots = document.querySelectorAll('.quotes .q-dot');
  var prevBtn = document.querySelector('.quotes .q-prev');
  var nextBtn = document.querySelector('.quotes .q-next');
  var index = 0;

  function go(i){
    index = (i + slides.length) % slides.length;
    for(var n = 0; n < slides.length; n++){ slides[n].classList.toggle('is-active', n === index); }
    var active = slides[index];
    var offset = active.offsetLeft - (viewport.clientWidth - active.offsetWidth) / 2;
    track.style.transform = 'translateX(' + (-offset) + 'px)';
    for(var m = 0; m < dots.length; m++){
      dots[m].classList.toggle('is-active', m === index);
      dots[m].setAttribute('aria-selected', m === index ? 'true' : 'false');
    }
  }

  prevBtn.addEventListener('click', function(){ go(index - 1); });
  nextBtn.addEventListener('click', function(){ go(index + 1); });
  for(var d = 0; d < dots.length; d++){
    dots[d].addEventListener('click', function(){ go(Array.prototype.indexOf.call(dots, this)); });
  }
  document.querySelector('.quotes').addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){ go(index - 1); }
    if(e.key === 'ArrowRight'){ go(index + 1); }
  });
  window.addEventListener('resize', function(){ go(index); });

  go(0);
})();
