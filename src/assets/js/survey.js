// textarea 자동 리사이징
function autosizeTextarea(el, height) {
    var $el = $(el);
    var lineHeight = height;
    
    $el.on('keydown keyup keypress', function() {
        $(this).height(0).height( ($(this).prop('scrollHeight') - lineHeight) + lineHeight );
        var scrollHeight = $(this).prop('scrollHeight');
    });
}

autosizeTextarea($('.survey-create__box .survey__heading textarea'), 30); 
autosizeTextarea($('.survey-create__box .survey__desc textarea'), 24); 
autosizeTextarea($('.survey-create__box .objective__box textarea'), 24); 
autosizeTextarea($('.survey-create__box .textareabox.count-textarea'), 24); 
autosizeTextarea($('.survey-create__box .survey__upload .textareabox'), 24); 

// CLICK EVENT
window.addEventListener('load', function() {
    // 설문 만들기 > TYPE 클릭 이벤트
    $('.type__item:not(.is-disabled)').on('click', function() {
        $('.type__item').removeClass('is-active');
        $(this).toggleClass('is-active');
    });

    // 설문 만들기 > LNB > 편집
    $('.l-page-survey .column-left #btnEdit01').on('click', function() {
        $(this).closest('.column-left').addClass('is-editable');
        $(this).closest('.is-fixed-bottom').hide();
        $(this).closest('.is-fixed-bottom').siblings('.is-fixed-bottom').show();
    });

    $('.l-page-survey .column-left #btnEdit02').on('click', function() {
        $(this).closest('.column-left').removeClass('is-editable');
        $(this).closest('.is-fixed-bottom').hide();
        $(this).closest('.is-fixed-bottom').siblings('.is-fixed-bottom').show();
    });
    
    // 설문 만들기 > LNB > TYPE 클릭 이벤트
    $('.setting__box, .question__box').on('click', function() {
        $('.setting__box').removeClass('is-active');
        $('.question__box').removeClass('is-active');
        $(this).toggleClass('is-active');
    });

    // 설문 만들기 > LNB > 질문 박스 PREVENT BUBBLING
    $('.question__list button').on('mousedown click', function(e) {
        e.stopPropagation();
    });

    // 설문 만들기 > LNB toggle
    $('.l-page-survey .btn-column-left-toggle').on('click', function() {
        var $parent = $(this).closest('.column-left'); 
        if( $parent.hasClass('is-opened') ) {
            $parent.removeClass('is-opened');
            $parent.addClass('is-collapsed');
        } else {
            $parent.removeClass('is-collapsed');
            $parent.addClass('is-opened');
        }
    });

    // 설문 만들기 > LNB > 그룹 토글
    $('.l-page-survey .column-left.is-opened .btn-toggle').on('click', function() {
        $(this).toggleClass('is-opened');
        $(this).siblings('.group').toggle();
    });

    // 설문 만들기 > LNB > 질문 영역 우클릭시 더보기 메뉴 show & hide
    var questionbox = document.querySelectorAll('.question__box');
    
    for(var i = 0; i < questionbox.length; i++) {
        questionbox[i].addEventListener('mousedown', function(e) {
            var isRightButton;
            e = e || window.event;

            if('which' in e) // Webkit, Firefox
                isRightButton = e.which == 3;
            else if ('button' in e ) // IE, Opera
                isRightButton = e.button == 2;

            if(isRightButton) {
                $('.question__box .layer').hide();
                $(this).find('.layer').show();

                var c = this.getElementsByTagName('div');
                var d = null;
                for (var i = 0; i < c.length; i++) {
                    if (c[i].className == 'layer') {
                        d = c[i];
                        break;
                    }
                }
                c[i].style.left = `${e.offsetX}px`;
                c[i].style.top = `${e.offsetY}px`;
            }
        });

        questionbox[i].addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }

    // 설문 만들기 > 달력 toggle
    $('.survey-create__box .inputbox.calendar .btn-calendar').on('click', function() {
        $(this).closest('.inputbox.calendar').find('.calendar__layer').toggle();
    });

    // 설문 만들기 > 첨부파일 정렬
    $('.btn-align-left').on('click', function() {
        $(this).closest('.alignbox').removeClass('center').removeClass('right').addClass('left');
    });

    $('.btn-align-center').on('click', function() {
        $(this).closest('.alignbox').removeClass('left').removeClass('right').addClass('center');
    });

    $('.btn-align-right').on('click', function() {
        $(this).closest('.alignbox').removeClass('center').removeClass('left').addClass('right');
    });

    // 설문 응답 > 문항 레이어 toggle
    $('.survey__header .pagination').on('click', function() {
        if( !$(this).hasClass('is-active') ) {
            $(this).addClass('is-active');
            $(this).siblings('.pagination__layer').show();
        } else {
            $(this).removeClass('is-active');
            $(this).siblings('.pagination__layer').hide();
        }
    });

    $('.survey__header .pagination__heading .m-btn-close').on('click', function() {
        $(this).closest('.right').find('.pagination').removeClass('is-active');
        $(this).closest('.right').find('.pagination__layer').hide();
    });


    $('.fcfs__content .btn-edit').on('click', function() {
        $('.fcfs__list .fcfs__content').show();
        $('.fcfs__list .fcfs__edit').hide();
        $(this).closest('.fcfs__content').hide();
        $(this).closest('.fcfs__content').siblings('.fcfs__edit').show();
    });

    $('.fcfs__edit .tr .hi-btn').on('click', function() {
        $(this).closest('.fcfs__edit').hide();
        $(this).closest('.fcfs__edit').siblings('.fcfs__content').show();
    });
});