// input text border color
$('.input-box-wrap input').on('focus', function(){
    $(this).parent().addClass('focus');
});
$('.input-box-wrap input').on('blur', function(){
    $(this).parent().removeClass('focus');
});

$('.search-wrap.round-box input').on('focus', function(){
    $(this).parent().parent().addClass('focus');
});
$('.search-wrap.round-box input').on('blur', function(){
    $(this).parent().parent().removeClass('focus');
});

$('.comment-wrap textarea').on('focus', function(){
    $(this).parent().parent().addClass('focus');
});
$('.comment-wrap textarea').on('blur', function(){
    $(this).parent().parent().removeClass('focus');
});




// 다른곳 클릭하면 닫히게
$(document).mouseup(function (e) {
    
    // 공지 박스 더보기(점3개)
    var container1 = $('.school-class-cont-item .more-popup-wrap.on');
    if (!container1.is(e.target) && container1.has(e.target).length === 0){
        container1.prev().removeClass('on');
        container1.removeClass('on');
    }		
    
    // 리스트박스
    var container2 = $('.custom-select-box-wrap.selected');
    if (!container2.is(e.target) && container2.has(e.target).length === 0){
        container2.removeClass('selected');
    }	
    
    // xx명 읽음 팝업
    var container3 = $('.read-count-wrap .reading-check-list-wrap.on');
    if (!container3.is(e.target) && container3.has(e.target).length === 0){
        container3.removeClass('on');
    }		
    
    // 학생 계정만들기 토스트 팝업    
    var container5 = $('.create-student-account-wrap .help-wrap');
    if (!container5.is(e.target) && container5.has(e.target).length === 0){
        container5.find('button').removeClass('on');
    }		
    
    // 선생님 권한 세팅   
    var container6 = $('.category-class-teacher .authority-setting-popup-wrap');
    if (!container6.is(e.target) && container6.has(e.target).length === 0){
        container6.hide();
    }		
    
    // 알림장 전체보기 달력
    var container7 = $('.note-calendar-popup');
    if (!container7.is(e.target) && container7.has(e.target).length === 0){
        container7.hide();
    }	
    
    // 자주 쓰는 문구
    var container8 = $('.often-use-phrases-popup');
    if (!container8.is(e.target) && container8.has(e.target).length === 0){
        container8.hide();
    }	
    
    // 이모티콘 팝업
    var container9 = $('.emoticon-select-popup');
    if (!container9.is(e.target) && container9.has(e.target).length === 0){
        container9.hide();
    }    
    
    // 헤더 알림 팝업
    var container10 = $('.alarm-popup-wrap');
    var container10_p = container10.parent();      
    if (!container10_p.is(e.target) && container10_p.has(e.target).length === 0){
        container10_p.removeClass('on');
        
    }
    
    // 헤더 검색결과 팝업
    var container11 = $('.search-result-popup-wrap');
    if (!container11.is(e.target) && container11.has(e.target).length === 0){
        container11.hide();        
    }	    
    
    // 헤더 마이페이지 팝업
    var container12 = $('.mypage-popup-wrap');
    var container12_p = container12.parent();   
    if (!container12_p.is(e.target) && container12_p.has(e.target).length === 0){
       container12_p.removeClass('on');   
    }	    
    
    // 공유 팝업
    var container13 = $('.share-popup-wrap').parent();
    if (!container13.is(e.target) && container13.has(e.target).length === 0){
        container13.removeClass('on');      
    }	   
    
    // 팝업창의 팝업달력
    var container14 = $('.modal .popup-calendar-wrap');
    if (!container14.is(e.target) && container14.has(e.target).length === 0){
        container14.hide();        
    }		
    
});


// border-selectbox
$('.border-selectbox-wrap .selected-option').on('click', function(e){
    if(!($(this).parents('.border-selectbox-wrap').hasClass('dis'))){
        $(this).parent().toggleClass('selected');
    }
});
$('.border-selectbox-wrap .option-list-wrap li').on('click', function(e){     
    var select_option = $(this).find('.option-item').text();
    
    if(!($(this).parents('.border-selectbox-wrap').hasClass('dis'))){
        $(this).addClass('selected').siblings().removeClass('selected');
        $(this).parents('.border-selectbox-wrap').removeClass('selected').find('.option-val').text(select_option).removeClass('placeholder');
    }
});

// modal close btn
$('.modal .modal-close-btn').not('.dis').on('click', function(){
    $(this).parents('.modal').hide();    
    $('body').removeClass('hidden');
});

// main popup close btn
$('.layer .modal-close-btn').not('.dis').on('click', function(){
    $(this).parents('.layer').hide();    
    $('body').removeClass('hidden');
});

// check all
var check_group_data;
function checkboxAll() {
    $('.check-all').click(function(){
        check_group_data = $(this).data('check-group');

        $('input[type=checkbox][data-check-group-item=' + check_group_data + ']').not('.dis').prop('checked', this.checked);

        var check_count_text = $('input[type=checkbox][data-check-group-item=' + check_group_data + ']').not('.dis').length;
        if ($(this).prop('checked')){
            $('[data-check-count=' + check_group_data + ']').find('em').text(check_count_text);
        }else {
            $('[data-check-count=' + check_group_data + ']').find('em').text('0');
        }

    });
}

function checkboxEach() {
    $('input[type=checkbox]').on('click', function(){
        var groupItem = $(this).data('check-group-item');

        if(!(groupItem == undefined)){
            var a = $(this).prop('checked');
            var b = $('.' + groupItem + ' > li').not('.dis').length;
            var count = 0;

            if (a == false){
                $('input[type=checkbox][data-check-group=' + groupItem + ']').prop('checked', false);
            }

            $('input[type=checkbox][data-check-group-item=' + groupItem + ']').each(function(){

                var c = $(this).prop('checked');

                if (c == true){
                    count++;
                }

                $('[data-check-count=' + groupItem + ']').find('em').text(count);

                if (count == b){
                    $('input[type=checkbox][data-check-group=' + groupItem + ']').not('.dis').prop('checked', true);
                }
            });
        }
    });
}
checkboxAll();
checkboxEach();

// 파일 추가 슬라이드
if($('.attaching-file-list-wrap').length){
    $('.attaching-file-list-wrap .slide').slick({
        speed: 300,
        draggable: false,
        variableWidth: true,
        cssEase: 'linear',
        infinite: false,
    });
}


// 더보기 점3개 버튼
$('.dot-more-btn-wrap .more-btn').on('click', function(){
    $(this).next().toggleClass('on');
    $(this).toggleClass('on');
    popup_position($(this).next());
});

// 스크랩 버튼
$('.scrap-btn').on('click', function(){
    $(this).toggleClass('on');
});

// 좋아요 버튼
$('.up-btn').on('click', function(){  
    $(this).toggleClass('on')
});

// 좋아요 버튼
$('.share-btn').on('click', function(){  
    $(this).parent().toggleClass('on')
});

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

// 알림장 보는방식
$('.select-album-view-style-wrap button').on('click', function(){
    var _class = $(this).attr('class');

    $(this).addClass('on').siblings().removeClass('on');

    if (_class == 'style-list') {
        $('.school-class-cont-item').show();
        $('.album-style-all-wrap').hide();
    }else if (_class == 'style-all') {
        $('.school-class-cont-item').hide();
        $('.album-style-all-wrap').show();
    }
})

// xx명 읽음 팝업
$('.read-count-wrap .open-list-btn').on('click', function(){
    $(this).next().toggleClass('on');
    
    popup_position($(this).next());
});

// 팝업 위치 조정
var origial_top;
var origial_btm;
var ele_css_top_o = parseInt($('.dot-more-btn-wrap .more-popup-wrap').css('top'));

function popup_position(popup){
    var doc_height = $(window).height();
    var scroll_top = $('html, body').scrollTop();
    var offset_top = popup.offset().top;
    var ele_height = popup.height();
    
    console.log('a = ' + doc_height);
    console.log('b = ' + scroll_top);
    console.log('c = ' + offset_top);
    console.log('d = ' + ele_height);
    console.log('-----------------');
    
    if(doc_height + scroll_top < offset_top + ele_height){
        popup.css('top', -ele_height + 'px');
    }else if (scroll_top + ele_height - 100 > offset_top){
        popup.css('top', ele_css_top_o + 'px');
    }    
}


// 첨부 파일 보기
$('.attached-file').on('click', function(){
    $('.view-attached-file-modal').show();
    $('body').addClass('hidden');
});

// 확인 요청 보내기 알림
$('.reading-check-list-wrap .send-alarm-wrap button').on('click', function(){
    openModal($('.send-reading-check-alarm-modal'));
})

// 댓글쓰는 중 첨부파일 삭제
$('.attach-file-wrap .delete-btn').on('click', function(){
    $(this).parent().parent().remove();
})

// 글 추가시 첨부파일 삭제
$('.create-contents-modal .upload-file-wrap .attaching-img button').on('click', function(){
    $(this).parent().parent().remove();
})


// 구독하기 버튼
$('.school-class-title-wrap .right-btn-wrap .subscribe-btn a').on('click', function(){
    if($(this).hasClass('on')){
        $(this).removeClass('on');
        $(this).find('span').text('구독하기');
    }else {
        $(this).addClass('on');
        $(this).find('span').text('구독중');                
    }  

    $(this).toggleClass('btn-bg-w-nb btn-bg-y');
})

// 댓글 상세 더 보기
$('.more-hidden-wrap .more-show-btn').on('click', function(){
    $(this).parent().find('.hidden-cont').show();
    $(this).hide();
})

// 댓글 더보기
$('.more-show-comment-btn-wrap button').on('click', function(){            
    $(this).parent().prev().find('>li').addClass('on');
    $(this).parent().hide();
})


// 입력시 x버튼 나오는 인풋박스
$('.search-box-wrap input').on('keyup focus',function(){
    var input_wrap = $(this).parent();
    var input_text = $(this).val();
    if ($(this).parent().find('.input-text-delete-btn').length){
        if(input_text == ''){
            input_wrap.find('.input-text-delete-btn').hide();
            $(this).parent().removeClass('delete-on');
        }else {
            input_wrap.find('.input-text-delete-btn').show();
            $(this).parent().addClass('delete-on');
        }
    }
});

$('.search-box-wrap input').each(function(index, item){
    if($(this).val() !== ''){
        if ($(this).parent().find('.input-text-delete-btn').length){
            $(this).parent().addClass('delete-on');
            $(this).parent().find('.input-text-delete-btn').show();
        }
    }
});

$('.search-box-wrap .input-text-delete-btn').on('click', function(){
    $(this).hide().parent().find('input').val('');
    $(this).parent().find('input').focus();
    $(this).parent().removeClass('delete-on');
});

// 이모티콘
$('.add-emoticon-wrap .add-emoticon-btn').on('click', function(){
    $(this).next().show();
})
$('.add-emoticon-wrap .select-tab-wrap ul li').on('click', function(){
    var _index = $(this).index();
    $(this).addClass('on').siblings().removeClass('on');
    
    $(this).parents('.emoticon-select-popup').find('.emoticon-item').eq(_index).addClass('on').siblings().removeClass('on');
})
$('.add-emoticon-wrap .emoticon-on-icon').on('click', function(){
    $(this).parents('.emoticon-select-popup').hide();
})

// 구성원 목록 정렬
$('.member-management-wrap .sort-btn').on('click', function(){
    $(this).toggleClass('on');
})

// 헤더 알림 팝업
$('.header-badge-wrap .badge-alarm').on('click', function(){ 
    $(this).parent().toggleClass('on');
    $(this).removeClass('on');        
})

// 검색 결과 팝업
$('.header-search-wrap').on('click', function(){
    $('.search-result-popup-wrap').show();    
})

// 헤더 마이페이지 팝업
$('.header-badge-wrap .badge-mypage').on('click', function(){
    $(this).parent().toggleClass('on'); 
})

// 커스텀 스크롤
if($('.scrollbar-outer').length){
    $('.scrollbar-outer').scrollbar();
}

// 우측 메뉴
$('.right-menu-cont-wrap .open-btn-wrap button').on('click',function(){
    $('.right-menu-cont-wrap').toggleClass('on');
    $('.right-menu-popup').toggleClass('on');
})

// 배너
if($('.banner-slide-wrap').length){
    
    $('.banner-slide-wrap').on('init', function() {
        $('.banner-slide-wrap .slide').css('visibility', 'visible');
    });      
    
    $('.banner-slide-wrap').slick({
        autoplay: true,
        slidesToShow: 1,
        infinite: true,
        speed: 500,
        adaptiveHeight: false,
        cssEase: 'linear',
        dots: false,
        prevArrow: false,
        nextArrow: false
    });
}

// floating-btn-list-wrap        
$('.floating-btn-list-wrap ul li button').on('click', function(){
    $(this).toggleClass('on');
})    

$('.floating-btn-list-wrap ul li button.floating-share').on('click', function(){
    $(this).parent().toggleClass('on');
})


// Modal position
function openModal(modal){
    modal.show();
    
    $("body").addClass("hidden");    
    
    var m_width = modal.find('.modal-cont-wrap').width() / 2;
    var m_height = modal.find('.modal-cont-wrap').height() / 2;
    
    modal.find('.modal-cont-wrap').css({
        'margin-top' : -m_height + 'px',
        'margin-left' : -m_width + 'px'
    })
}

// scroll Top
$('.page-scrollTop-btn button').on('click', function(){
    $('html,body').animate({
       scrollTop : 0
    }, 300)
})


// Mac 체크
$(document).ready(function() {
    if (navigator.userAgent.indexOf('Mac OS X') != -1) {
//        alert('mac');
        $('body').addClass('mac');
    } else {
//        alert('windows');
    }
});
   

// 댓글입력
$('.comment-wrap .text-input-area').on('click', function(){
    $(this).parent().parent().addClass('focus');
})
$('.comment-wrap .text-input-area').on('blur', function(){
    $(this).parent().parent().removeClass('focus');
    var element = $(this);
    if (!element.text().trim().length) {
        element.empty();
    }
})

// 하이톡 채팅 영역
if ($('.hitalk-modal .chatting-list-wrap').length > 0) {

    // 채팅 입력영역 자동 높이 조절
    var chatListWrap = document.getElementsByClassName('chatting-list-wrap')[0];
    var chatInputWrap = document.getElementsByClassName('chatting-input-wrap')[0];
    var chatTopWrapH =  document.getElementsByClassName('chatting-top-wrap')[0].clientHeight;
    var textH = 25;
    var maxRows = textH * 10;

    var chatArea = {
        init: function () {
            /* textarea max height value */
            document.getElementsByClassName('textarea-wrap')[0].style.maxHeight = maxRows + 'px';

            chatArea.addResizingEventListener();
        },
        addResizingEventListener: function () {
            setTimeout(function () {
                chatListWrap.style.height = document.getElementsByClassName('tab-nav-wrap')[0].clientHeight - (chatInputWrap.clientHeight + chatTopWrapH) + 'px'; 
            }, 0);
            
            chatArea.detectScrollToBottom(); // 스크롤이 최하단에 위치해있는 동시에 textarea 리사이징이 될 때 스크롤 하단으로 이동
        }, scrollToBottom: function() {
            var messageArea = chatListWrap.getElementsByClassName('scroll-scrolly_visible')[0];
            
            messageArea.scrollTop = messageArea.scrollHeight;
        }, detectScrollToBottom : function() {
            if (!$('.chatting-list-wrap .scroll-scrolly_visible').length > 0) return;
            var messageArea = chatListWrap.getElementsByClassName('scroll-scrolly_visible')[0];
            var scrollBottom = messageArea.scrollHeight - messageArea.clientHeight;
            var currentScroll = messageArea.scrollTop;

            setTimeout(function () {
                if (currentScroll >= scrollBottom - textH) {
                    chatArea.scrollToBottom();
                }
            }, 300);
        }
    }

    chatArea.init();
    
    var textarea = document.getElementsByClassName('text-input-area')[0];
    
    textarea.addEventListener('keyup', function () {
        chatArea.addResizingEventListener();
    });
    
    textarea.addEventListener('keydown', function () {
        chatArea.addResizingEventListener();
    });

    // 이모티콘 추가 및 제거 했을 때 채팅창 높이 조절
    $(document).on('click', '.emoticon-item li', function(){
        $('.emoticon-select-popup').hide();
        
        if( $('.chatting-input-wrap .attach-file-wrap').length ) return;
        $('.input-box-wrap').append('<div class="attach-file-wrap"><div class="attaching-img"><div class="img-wrap"><img src="https://image.hiclass.net/7e40/8540/9b40/a740/1c0b1832-f5ae-4b88-85d3-dc3e5213e60d.png" alt=""></div><button class="delete-btn"></button></div></div>');
        chatArea.addResizingEventListener();
    });
    $(document).on('click', '.attach-file-wrap .delete-btn', chatArea.addResizingEventListener);
    
    // 보내기 버튼 클릭 했을 때 채팅창 높이 조절
    $(document).on('click', '.send-btn-wrap button', function () {
        textarea.innerText = '';
        chatArea.addResizingEventListener();
        chatArea.scrollToBottom();
    });
    
    // chatting-list-wrap 높이값 리사이징
    window.addEventListener('resize', function(){
        chatArea.addResizingEventListener();
    });
    //.채팅 입력영역 자동 높이 조절

    // scroll bottom 버튼
    function pageScrollBottom() {
        $('.chatting-input-wrap').append('<button type="button" class="btn-scrollBottom" style="display: none"></button>');

        var $btn = $('.btn-scrollBottom');

        $btn.on('click', function () {
            chatArea.scrollToBottom();
        });

        $('.chatting-list-wrap .scrollbar-outer').scrollbar({
            'onScroll': function(y){
                if(y.scroll >= y.maxScroll - (textH * 2)) {
                    $('.btn-scrollBottom').fadeOut();
                } else {
                    $('.btn-scrollBottom').fadeIn();
                }
            }
        });
     }
    pageScrollBottom();

    // 하이톡 대화 입력시 전송 버튼 활성화
    $('.send-btn-wrap button').addClass('dis');
    textarea.addEventListener('keyup', function () {
        if( textarea.textContent === '' ) {
            $('.send-btn-wrap button').addClass('dis');
        } else {
            $('.send-btn-wrap button').removeClass('dis');
        }
    });

    // 메세지 영역 우클릭시 더보기 메뉴 show & hide
    var message = document.querySelectorAll('.chatting-bubble-wrap');

    for(var msgIdx = 0; msgIdx < message.length; msgIdx++) {
        message[msgIdx].addEventListener('mousedown', function(e) {
            var isRightButton;
            e = e || window.event;

            if('which' in e) // Webkit, Firefox
                isRightButton = e.which == 3;
            else if ('button' in e ) // IE, Opera
                isRightButton = e.button == 2;

            $('.more-popup-wrap').removeClass('on');
            
            if(isRightButton) {
                $(this).find('.more-popup-wrap').addClass('on');
            }
        });
        message[msgIdx].addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        var removeEl = message[msgIdx].querySelector('.more-btn');
        if( removeEl ) message[msgIdx].querySelector('.more-btn').remove();
    }
}

// 하이톡 대화상대 타이틀 toggle button 
$(document).on('click', '.opponent-list-wrap .btn-toggle', function(){
    if( !$(this).hasClass('on') ){
        $(this).addClass('on');
        $(this).closest('li').find('.list-cont-wrap').slideDown(200);   
    } else {
        $(this).removeClass('on');
        $(this).closest('li').find('.list-cont-wrap').slideUp(200);
    }
});


