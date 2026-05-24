(function () {
  "use strict";
  
  var yOffset = 0; // window.pageYOffset 대신 쓸 변수
  var prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  var currentSection = 0;
  var enterNewScene = false; // 새로운 scene이 시작된 순간 true
  var delayedYOffset = 0;
  var acc = 0.2
  var rafId;
  var rafState;
  
  var indexSection = [
    {
      // 0 : secion intro
      type: 'normal',
      scrollHeight: 0,
      objs: {
        container: document.querySelector('.section-index-intro'),
        heading: document.querySelector('.index-intro__heading'),
        bg: document.querySelector('.index-intro__bg'),
        bg1: document.querySelector('.section-index-intro .bg-sm'),
        bg2: document.querySelector('.section-index-intro .bg-lg'),
        bg3: document.querySelector('.section-index-intro .bg-line-lg'),
      },
      values: {
        bg1_translateY_in: [1, 0, {start: 0, end: 1}],
        bg2_translateY_in: [1, 0, {start: 0, end: 1}],
        bg3_translateY_in: [1, 0, {start: 0, end: 1}],
        bg1_translateY_out: [0, 200, {start: 0, end: 1}],
        bg2_translateY_out: [0, 50, {start: 0, end: 1}],
        bg3_translateY_out: [0, 50, {start: 0, end: 1}]
      }
    },
    {
      // 1 : section hitalk & hicall
      type: 'normal',
      scrollHeight: 0,
      objs: {
        container: document.querySelector('.section-index-hitalk'),
        heading: document.querySelector('.index-review__heading')
      }
    },
    {
      // 2 : section hiclass
      type: 'normal',
      scrollHeight: 0,
      objs: {
        container: document.querySelector('.section-index-hiclass'),
        heading: document.querySelector('.index-review__heading'),
        bg1: document.querySelector('.section-index-hiclass .bg-sm'),
        bg2: document.querySelector('.section-index-hiclass .bg-lg'),
        bg3: document.querySelector('.section-index-hiclass .bg-dot-lg'),
      },
      values: {
        bg1_translateY_in: [1, 0, {start: 0, end: 1}],
        bg2_translateY_in: [1, 0, {start: 0, end: 1}],
        bg3_translateY_in: [1, 0, {start: 0, end: 1}],
        bg1_translateY_out: [0, -200, {start: 0, end: 1}],
        bg2_translateY_out: [0, -50, {start: 0, end: 1}],
        bg3_translateY_out: [0, -50, {start: 0, end: 1}]
      }
    },
    {
      // 3 : section form
      type: 'normal',
      scrollHeight: 0,
      objs: {
        container: document.querySelector('.section-index-form'),
        heading: document.querySelector('.index-review__heading')
      }
    },
    {
      // 4 : section eletter
      type: 'normal',
      scrollHeight: 0,
      objs: {
        container: document.querySelector('.section-index-eletter'),
        heading: document.querySelector('.index-review__heading')
      }
    },
    {
      // 5 : section price plan
      type: 'normal',
      scrollHeight: 0,
      objs: {
        container: document.querySelector('.section-index-price-plan'),
        heading: document.querySelector('.index-review__heading')
      }
    },
    {
      // 6 : section review
      type: 'normal',
      scrollHeight: 0,
      objs: {
        container: document.querySelector('.section-index-review'),
        heading: document.querySelector('.index-review__heading')
      }
    }
  ];
  
  function setLayout() {
    // 각 스크롤 섹션의 높이 세팅
    for (var i = 0; i < indexSection.length; i++) {
      if (indexSection[i].type === 'normal') {
        indexSection[i].scrollHeight = indexSection[i].objs.container.offsetHeight;
      }
    }
    
    yOffset = window.pageYOffset;
    
    var totalScrollHeight = 0;
    for (var j = 0; j < indexSection.length; j++) {
      totalScrollHeight += indexSection[j].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentSection = j;
        break;
      }
    }
  }
  
  function calcValues(values, currentYOffset) {
    var rv;
    // 현재 씬(스크롤섹션)에서 스크롤된 범위를 비율로 구하기
    var scrollHeight = indexSection[currentSection].scrollHeight;
    var scrollRatio = currentYOffset / scrollHeight;
    
    if (values.length === 3) {
      // start ~ end 사이에 애니메이션 실행
      var partScrollStart = values[2].start * scrollHeight;
      var partScrollEnd = values[2].end * scrollHeight;
      var partScrollHeight = partScrollEnd - partScrollStart;
      
      if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
        rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
      } else if (currentYOffset < partScrollStart) {
        rv = values[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1];
      }
    } else {
      rv = scrollRatio * (values[1] - values[0]) + values[0];
    }
    
    return rv;
  }
  
  function loop() {
    delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;
    rafId = requestAnimationFrame(loop);
    
    if (Math.abs(yOffset - delayedYOffset) < 1) {
      cancelAnimationFrame(rafId);
      rafState = false;
    }
  }
  
  function scrollLoop() {
    enterNewScene = false;
    prevScrollHeight = 0;
    
    for (var i = 0; i < currentSection; i++) {
      prevScrollHeight += indexSection[i].scrollHeight;
    }
    
    if (delayedYOffset > prevScrollHeight + (indexSection[currentSection].scrollHeight)) {
      enterNewScene = true;
      
      if (currentSection < indexSection.length - 1) {
        currentSection++;
      }
    }
    
    if (delayedYOffset < prevScrollHeight) {
      enterNewScene = true;
      // 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일)
      if (currentSection === 0) return;
      currentSection--;
    }
    
    if (enterNewScene) return;
    playAnimation();
  }
  
  function playAnimation() {
    var objs = indexSection[currentSection].objs;
    var values = indexSection[currentSection].values;
    var currentYOffset = yOffset - prevScrollHeight;
    var scrollHeight = indexSection[currentSection].scrollHeight;
    var scrollRatio = currentYOffset / scrollHeight;
    
    switch (currentSection) {
      case 0:
      case 2:
        if (scrollRatio <= 0) {
          // in
          objs.bg1.style.transform = 'translate3d(0, ' + calcValues(values.bg1_translateY_in, currentYOffset) + '%, 0)';
          objs.bg2.style.transform = 'translate3d(0, ' + calcValues(values.bg2_translateY_in, currentYOffset) + '%, 0)';
          objs.bg3.style.transform = 'translate3d(0, ' + calcValues(values.bg3_translateY_in, currentYOffset) + '%, 0)';
        } else {
          // out
          objs.bg1.style.transform = 'translate3d(0, ' + calcValues(values.bg1_translateY_out, currentYOffset) + '%, 0)';
          objs.bg2.style.transform = 'translate3d(0, ' + calcValues(values.bg2_translateY_out, currentYOffset) + '%, 0)';
          objs.bg3.style.transform = 'translate3d(0, ' + calcValues(values.bg3_translateY_out, currentYOffset) + '%, 0)';
        }
        break;
      case 5:
        if (document.querySelector('body').clientWidth >= 1240) {
          if (scrollRatio <= 0) {
            objs.heading.classList.remove('is-fixed-ie');
          } else {
            objs.heading.classList.add('is-fixed-ie');
          }
        } else {
          objs.heading.classList.remove('is-fixed-ie');
        }
    }
  }
  
  function showSection(target) {
    var winH = $(window).height();
    var scrollPos = $('html').scrollTop() || $('body').scrollTop();
    
    $(target).each(function () {
      if ($(this).closest('section').hasClass('is-active')) return;
      
      if ($(this).offset().top - winH <= scrollPos && $(this).offset().top + $(this).height() > scrollPos) {
        $(this).closest('section').addClass('is-active');
      }
    });
  }
  
  // section - hitalk, form animation
  var animationLoop = false;
  
  function showAnimation(target, timing) {
    var $target = $(target);
    var winH = $(window).height();
    var scrollPos = $('html').scrollTop() || $('body').scrollTop();
    
    function _loop() {
      $target.removeClass('is-animated');
      
      setTimeout(function () {
        $target.addClass('is-animated');
      }, 1000);
      
      if (animationLoop) return;
    }
    
    $target.each(function () {
      if ($(this).hasClass('is-animated')) return;
      
      if ($(this).offset().top - winH <= scrollPos && $(this).offset().top + $(this).height() > scrollPos) {
        $(this).addClass('is-animated');
        
        animationLoop = true;
        setInterval(_loop, timing);
      }
    });
  }
  
  // init
  indexSection[0].objs.container.classList.add('is-active');
  showSection('.section-index-hitalk .section-index__text');
  showSection('.section-index-form .section-index__text');
  showSection('.section-index-eletter .section-index__text');
  showSection('.section-index-price-plan .section-index__text');
  showAnimation('.section-index-hitalk .index-image__animation', 14000);
  showAnimation('.section-index-form .index-image__animation', 8500);
  
  setLayout();
  scrollLoop();
  
  window.addEventListener('scroll', function () {
    yOffset = window.pageYOffset;
    
    scrollLoop();
    showSection('.section-index-hitalk .section-index__text');
    showSection('.section-index-form .section-index__text');
    showSection('.section-index-eletter .section-index__text');
    showSection('.section-index-price-plan .section-index__text');
    showAnimation('.section-index-hitalk .index-image__animation', 14000);
    showAnimation('.section-index-form .index-image__animation', 8500);
    
    if (!rafState) {
      rafId = requestAnimationFrame(loop);
      rafState = true;
    }
  });
  
  
})();