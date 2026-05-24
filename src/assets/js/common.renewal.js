// CLICK EVENT
window.addEventListener('load', function() {

    setTimeout(function() {
        // TOGGLE BUTTONS
        $('.btn-bookmark, .btn-subscribe, .btn-scrap, .btn-likeit, .btn-secret, .btn-emoticon').on('click', function() {
            $(this).toggleClass('is-active');
        });

        // SELECTBOX
        $('.hi-selectbox .selected').on('click', function(){
            $(this).closest('.hi-selectbox').toggleClass('is-opened');
        });

        $('.hi-selectbox .option').on('click', function(){
            var option = $(this).text();
            
            if(!($(this).closest('.hi-selectbox').hasClass('is-disabled'))){
                $(this).addClass('is-selected').siblings().removeClass('is-selected');
                $(this).closest('.hi-selectbox').removeClass('is-opened').find('.selected').text(option);
            }
        });

        // MODAL CLOSE
        $('.modal .modal-close-btn').not('.dis').on('click', function(){
            $(this).parents('.modal').hide();    
            $('body').removeClass('hidden');
            $('body').css('overflow', '');
        });

        // main popup close btn
        $('.layer .modal-close-btn').not('.dis').on('click', function(){
            $(this).parents('.layer').hide();    
            $('body').removeClass('hidden');
        });

        // CALEDAR
        // 달력 선택
        $('.calendar-table-wrap table td:not(".empty")').on('click', function(){
            $(this).parents('table').find('td').removeClass('selected');
            $(this).addClass('selected');
        });

        // 달력 월 선택 팝업
        $('.calendar-wrap > .calendar-title-wrap .ym-wrap').on('click', function(){
            $('.calendar-select-month-wrap').show();
        })        
        $('.calendar-select-month-wrap .month-wrap td').on('click', function(){
            $('.calendar-select-month-wrap').hide();
        }); 

        // TOP BUTTON
        $('.page-scrollTop-btn button').on('click', function(){
            $('html,body').animate({
            scrollTop : 0
            }, 300)
        });

        // count text
        $('.count-textarea').keyup(function (){
            var max = parseInt($(this).attr('maxlength'));
            var content = $(this).val();
            $(this).next('.count-word').find('.count').html(content.length);
            
            if(content.length >= 1 ) {
                $(this).next('.count-word').find('.count').addClass('is-active');
            } else {
                $(this).next('.count-word').find('.count').removeClass('is-active');
            }

            if(content.length > max) {
                $(this).val($(this).val().substr(0, max));
                return false;
            }
        });
    }, 100);
});

// MODAL POPUP
function openModal(modal){
    modal.show();
    
    $("body").addClass("hidden");    
    
    var m_width = modal.find('.modal-cont-wrap').width() / 2;
    var m_height = modal.find('.modal-cont-wrap').height() / 2;
    
    modal.find('.modal-cont-wrap').css({
        'margin-top' : -m_height + 'px',
        'margin-left' : -m_width + 'px'
    });
}

function openNewModal(modal) {
    modal.show();
    $('body').css('overflow', 'hidden');
}

function closeNewModal(modal) {
    modal.hide();
    $('body').css('overflow', '');
}

// MODAL POPUP > TAB
var tab = document.querySelectorAll('.modal__tab button');
var content = document.querySelectorAll('.modal__content');
var activeNum = 0;

for(var i = 0; i < tab.length; i++) {
    (function(idx) {
        tab[idx].onclick = function() {
            activeNum = idx;
            tabFunc();
        }
    })(i);
}

function tabFunc() {
    for(var i = 0; i < tab.length; i++) {
        if(activeNum == i) {
            tab[i].classList.add('is-active');
            content[i].style.display = 'block';
        } else {
            tab[i].classList.remove('is-active');
            content[i].style.display = 'none';
        }
    }
}

var button = document.querySelectorAll('.area-hitalk-share-select button');
var buttonActivedNum = 0;

for(var i = 0; i < button.length; i++) {
    (function(idx) {
        button[idx].onclick = function() {
            buttonActivedNum = idx;
            buttonFunc();
        }
    })(i);
}

function buttonFunc() {
    for(var i = 0; i < button.length; i++) {
        if(buttonActivedNum == i) {
            button[i].classList.add('is-active');
        } else {
            button[i].classList.remove('is-active');
        }
    }
}

// SEARCHBOX
window.addEventListener('load', function() {
    if ( !$('.hi-searchbox').length > 0 ) return;
    
    const searchboxElements = document.querySelectorAll('.hi-searchbox');
    
    searchboxElements.forEach(searchBoxElement => {
        const searchBoxInput = searchBoxElement.querySelector('input');
        const searchBoxDelete = searchBoxElement.querySelector('.btn-delete');
        
        searchBoxInput.addEventListener('keyup', function () {
            if( searchBoxInput.value === '' ) {
                searchBoxDelete.style.display = 'none';
            } else {
                searchBoxDelete.style.display = 'block';
            }
        });

        searchBoxDelete.addEventListener('click', function() {
            this.style.display = 'none';
            searchBoxInput.value = '';
        });
    });
});

// KEBAB MENU
window.addEventListener('load', function() {
    if ( !$('.hi-kebabmenu').length > 0 ) return;
    const kebabMenuElements = document.querySelectorAll('.hi-kebabmenu');

    kebabMenuElements.forEach(kebabMenuElement => {
        const kebabMenuBtn = kebabMenuElement.querySelector('.btn-kebab');
        const kebabMenuOptions = kebabMenuElement.querySelectorAll('.kebabmenu__layer button');
        
        kebabMenuBtn.addEventListener('click', function(e) {
            const targetElement = e.target;
            const isBtnElement = targetElement.classList.contains('is-active');

            if( !isBtnElement ) {
                showKebabMenuLayer(targetElement);
            } else {
                hideKebabMenuLayer(targetElement);
            }
        });

        kebabMenuOptions.forEach(kebabMenuOption => {
            kebabMenuOption.addEventListener('click', function(e) {
                hideKebabMenuLayer(e.target);
            });
        });
    });

    function showKebabMenuLayer(btnOpenElement) {
        const kekbabMenu = btnOpenElement.closest('.hi-kebabmenu');
        const kebabMenuBtn = btnOpenElement;
        const kebabMenuLayer = kekbabMenu.querySelector('.kebabmenu__layer');
        
        kebabMenuBtn.classList.add('is-active');
        kebabMenuLayer.style.display = 'block';
    }

    function hideKebabMenuLayer(btnhideElement) {
        const kekbabMenu = btnhideElement.closest('.hi-kebabmenu');
        const kebabMenuBtn = kekbabMenu.querySelector('.btn-kebab');
        const kebabMenuLayer = kekbabMenu.querySelector('.kebabmenu__layer');

        kebabMenuBtn.classList.remove('is-active');
        kebabMenuLayer.style.display = 'none';
    }

});

// COMMENT
window.addEventListener('load', function() {
    if ( !$('.hi-comment').length > 0 ) return;

    var $editComment = $('.hi-comment .comment__edit');
    var $replyList = $('.hi-comment .reply__list');
    var $editReply = $('.hi-comment .reply__edit');

    $replyList.hide();
    $editComment.hide();
    $editReply.hide();

    // 첨부 파일 삭제
    $('.hi-comment .btn-delete').on('click', function() {
        $(this).closest('div').remove();
    });

    // 댓글 펼쳐보기
    $('.hi-comment .btn-view-all').on('click', function() {
        $(this).hide();
        $('.comment__item').show();
    });

    // 답글 더보기
    $('.hi-comment .btn-reply:eq(-1)').on('click', function () {
        $replyList.show();
    });

    // 댓글 수정하기 에디터
    $('.hi-comment .hi-kebabmenu .btn-edit').on('click', function(){
        var $comment = $(this).closest('.comment__content');
        var $editComment = $comment.siblings('.comment__edit');
        
        $comment.hide();
        $editComment.show();
        autosizeTextareaComment();
    });

    // 댓글 수정하기 취소 
    $('.hi-comment .group-btn-add button').on('click', function() {
        var $comment = $(this).closest('.comment__item').find('.comment__content');
        var $editComment = $(this).closest('.comment__item').find('.comment__edit');

        $comment.show();
        $editComment.hide();
    })

    // 답글 수정하기 에디터
    $('.hi-comment .reply__list .hi-kebabmenu .btn-edit').on('click', function(){
        var $comment = $(this).closest('.reply__content');
        var $editComment = $comment.siblings('.reply__edit');
        
        $comment.hide();
        $editComment.show();
        autosizeTextareaComment();
    });

    // 답글 수정하기 취소 
    $('.hi-comment .reply__list .group-btn-add button').on('click', function() {
        var $comment = $(this).closest('.reply__item').find('.reply__content');
        var $editComment = $comment.siblings('.reply__edit');

        $comment.show();
        $editComment.hide();
    });

    // 이모티콘 팝업
    $('.hi-comment .btn-emoticon').on('click', function() {
        var isActive = $(this).hasClass('is-active');
        
        if( !isActive ) {
            $(this).siblings('.emoticon-select-popup').show();
        } else {
            $(this).siblings('.emoticon-select-popup').hide();
        }
    });
    
    $('.emoticon-select-popup .select-tab-wrap ul li').on('click', function(){
        var idx = $(this).index();
        $(this).addClass('on').siblings().removeClass('on');
        $(this).parents('.emoticon-select-popup').find('.emoticon-item').eq(idx).addClass('on').siblings().removeClass('on');
    });

    if($('.scrollbar-outer').length){
        $('.scrollbar-outer').scrollbar();
    }

    // textarea 자동 리사이징
    function autosizeTextareaComment() {
        $('.hi-comment .comment__editor textarea').each(function() {
            $(this).height(0).height( $(this).prop('scrollHeight') + 24 );
        });
    }

    $('.hi-comment .comment__editor textarea').on('keydown keyup keypress', function() {
        autosizeTextareaComment();
    });
});

// (CLASS & SCHOOL PAGE) FIXED ELEMENT 2022-08-01
window.addEventListener('load', function() {

    function fixedBoardEl(el) {
        if ( !$('.cont-box-top-inner').length > 0 ) return;
        var target = el;
        var st = document.documentElement.scrollTop;
        
        // board__filter-fixed 영역 있을 경우
        if ( $('.board__filter-fixed').length > 0 ) {
            var fixedFilter = document.querySelector('.board__filter-fixed');
            var fixedFilterHeight = fixedFilter.clientHeight + 20;
            var fixedFilterTop = window.pageYOffset + fixedFilter.getBoundingClientRect().top - fixedFilterHeight;
            if( st > fixedFilterTop ) {
                target.classList.add('is-fixed');
                $('.quick-banner').animate({ top: st - (90 - 20 + fixedFilterHeight) }, 0);
                $('.quick-banner').css({
                    margin: '0'
                });
                
            } else {
                target.classList.remove('is-fixed');
                $('.quick-banner').css({
                    top: '',
                    margin: ''
                });
            }

        // board__filter-fixed 영역 없을 경우
        } else {
            var content = document.querySelector('.column-content');
            var contentTop = window.pageYOffset + content.getBoundingClientRect().top - 56;

            if( st > contentTop) {
                target.classList.add('is-fixed-nofilter');
                $('.quick-banner').animate({ top: st - contentTop + 40}, 0);
                $('.quick-banner').css({
                    margin: '0'
                });
                
            } else {
                target.classList.remove('is-fixed-nofilter');
                $('.quick-banner').css({
                    top: '',
                    margin: ''
                });
            }
        }
    }

    function scrollupFilter() {
        if( !$('.board__filter-fixed').length > 0 ) return;
        
        var didScroll; 
        var lastScrollTop = 0; 

        window.addEventListener('scroll', function(){
            didScroll = true; 
        }); 

        setInterval(function() { 
            if (didScroll) { 
                hasScrolled(); 
                didScroll = false; 
            }
        }, 10); 

        function hasScrolled() { 
            var st = $(this).scrollTop();
            var filterInner = document.querySelector('.filter-fixed__area');
            var delta = 1; // 동작의 구현이 시작되는 위치 
            
            if(Math.abs(lastScrollTop - st) <= delta) return;

            if( lastScrollTop > delta && st > lastScrollTop) { 
                // Scroll Down 
                filterInner.classList.remove('is-scrollup');
            } else { 
                // Scroll Up 
                filterInner.classList.add('is-scrollup');
            }
            lastScrollTop = st;
        }
    }
    
    window.addEventListener('scroll', function() {
        fixedBoardEl(document.querySelector('.column-lnb'));

        if ( !$('.column-aside').length > 0 ) return;
        fixedBoardEl(document.querySelector('.column-aside'));

        if ( !$('.board__filter-fixed').length > 0 ) return;
        fixedBoardEl(document.querySelector('.board__filter-fixed'));
    });
    
    scrollupFilter();
});

// HEADER
window.addEventListener('load', function() {
    setTimeout(function() {

        if ( !$('#header-cont-wrap').length > 0 ) return;

        var headerSearchBtn = document.querySelector('.badge-search');
        var headerSearchPopup = document.querySelector('.header-search-layer');
        var headerSearchDim = headerSearchPopup.querySelector('.dim');
        
        var headerAlarmBtn =  document.querySelector('.badge-alarm');
        var headreAlarmPopup = document.querySelector('.alarm-popup-wrap');

        function showSearchPopup() {
            headerSearchPopup.style.display = 'block';
            headerSearchPopup.classList.add('show');
            headerSearchBtn.classList.add('on');
            document.body.style.overflow = 'hidden';
        }

        function hideSearchPopup() {
            headerSearchPopup.classList.remove('show');
            setTimeout(function(){
                headerSearchBtn.classList.remove('on');
                document.body.style.overflow = '';
                headerSearchPopup.style.display = 'none';
            }, 100);
        }

        headerSearchBtn.addEventListener('click', function(e) {
            if( !e.currentTarget.classList.contains('on') ) {
                showSearchPopup();
            } else {
                hideSearchPopup();
            }
        });

        headerSearchDim.addEventListener('click', function() {
            hideSearchPopup();
        });

        function showAlarmPopup() {
            headreAlarmPopup.style.display = 'block';
            headreAlarmPopup.classList.add('show');
            headerAlarmBtn.parentNode.classList.add('on');
        }

        function hideAlarmPopup() {
            headreAlarmPopup.classList.remove('show');
            setTimeout(function(){
                headerAlarmBtn.parentNode.classList.remove('on');
                headreAlarmPopup.style.display = 'none';
            }, 100);
        }

        headerAlarmBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            if (!e.currentTarget.parentNode.classList.contains('on')) {
                hideSearchPopup();
                showAlarmPopup();
            } else {
                hideAlarmPopup();
            }     
        });

        document.body.addEventListener('click', function(e) {
            if (!$('.alarm-popup-wrap.show').is(e.target) && !$('.alarm-popup-wrap.show').has(e.target).length) {
                hideAlarmPopup();
            }
        });

        // scroll
        function floatingHeader() {
            var didScroll; 
            var lastScrollTop = 0; 

            window.addEventListener('scroll', function(){
                didScroll = true; 
            }); 

            setInterval(function() { 
                if (didScroll) { 
                    hasScrolled(); 
                    didScroll = false; 
                }
            }, 10); 

            function hasScrolled() { 
                var st = $(this).scrollTop();
                var renewalHeaderWrap = document.querySelector('.renew-header-cont-wrap');
                var delta = 1; // 동작의 구현이 시작되는 위치 
                
                if(Math.abs(lastScrollTop - st) <= delta) return;

                if( lastScrollTop > delta && st > lastScrollTop) { 
                    // Scroll Down 
                    renewalHeaderWrap.classList.add('scroll-down');
                } else { 
                    // Scroll Up 
                    renewalHeaderWrap.classList.remove('scroll-down');
                }
                lastScrollTop = st;
            }
        }
        floatingHeader();
    }, 10);
});

// BODY CLICK > HIDE ELEMENT
document.addEventListener('click', function (e) {
    const kebabMenuElements = document.querySelectorAll('.hi-kebabmenu');
    var targetElement = e.target;
    var isActive = targetElement.classList.contains('is-active') || targetElement.closest('.is-active');

    if ( isActive ) return;

    kebabMenuElements.forEach(kebabMenuElement => {
        const kebabMenuBtn = kebabMenuElement.querySelector('.btn-kebab');
        const kebabMenuLayer = kebabMenuElement.querySelector('.kebabmenu__layer');
        
        kebabMenuBtn.classList.remove('is-active');
        kebabMenuLayer.style.display = 'none';
    });
});
