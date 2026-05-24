<!--
@File(Method): GuidePopup.vue
@Author: -
@Date Created: -
@Description: 가이드 팝업
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 3년전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->
<template>
  <div class="hy-guide-popup-wrap">
    <div class="hy-guide-box">
      <div class="hy-guide-tit">
        <img src="@/assets/img/guide/tit-guide.png" alt="친절한 하이씨가 알려드립니다. 영상으로 쉽게 배우는 하이클래스 따라하기.">
      </div>
      <div class="hy-guide-nav">
        <div class="guide-chat-hi">
          <span>하이씨</span>
          <p>아래의 메뉴를 선택하세요.</p>
        </div>
        <div class="hi-guide-tab">
          <ul>
            <li class="tab-guide01" :class="{ on : option.selectedItem === '01'}"><a href="javascript:" @click="setGuide('01')">가입하기</a></li>
            <li class="tab-guide02" :class="{ on : option.selectedItem === '02'}"><a href="javascript:" @click="setGuide('02')">초대하기</a></li>
            <li class="tab-guide03" :class="{ on : option.selectedItem === '03'}"><a href="javascript:" @click="setGuide('03')">알림장 이용하기</a></li>
          </ul>
          <ul>
            <li class="tab-guide04" :class="{ on : option.selectedItem === '04'}"><a href="javascript:" @click="setGuide('04')">하이톡</a></li>
            <li class="tab-guide05" :class="{ on : option.selectedItem === '05'}"><a href="javascript:" @click="setGuide('05')">하이콜</a></li>
            <li class="tab-guide06" :class="{ on : option.selectedItem === '06'}"><a href="javascript:" @click="setGuide('06')">가정통신문</a></li>
            <li class="tab-guide07"><a href="javascript:" @click="moveFaq">기타</a></li>
          </ul>
        </div>
      </div>
      <div class="hy-guide-con">
        <template v-if="guideItem[option.selectedItem].isEmpty">
          <div class="guide-video-box-empty">
            <span>하이씨</span>
            <p>{{guideItem[option.selectedItem].question}} 따라하기 영상은 <br>3월 중순 이후 오픈 될 예정입니다.<br>조금만 더 기다려 주세요.^^</p>
          </div>
        </template>
        <template v-else>
          <div class="guide-chat-user">
            <span>사용자</span>
            <p>{{guideItem[option.selectedItem].question}}</p>
          </div>
          <template v-for="item in guideItem[option.selectedItem].item">
            <template v-if='item.isEmpty'>
              <div class="guide-video-box-empty" :key="`${item.idx}_empty2`">
                <span>하이씨</span>
                <p v-html="item.emptyMsg"></p>
              </div>
            </template>
            <template v-else>
              <div class="guide-chat-hi" :key="`${item.idx}_answer`">
                <span>하이씨</span>
                <p v-html="item.answer"></p>
              </div>
              <div class="guide-video-box" :key="`${item.idx}_video`">
                <div>
                  <div class="cover-video" @click="setPlay(item.idx)">
                    <div class="video-icon02"><span>재생</span></div>
                  </div>
                  <div class="img">
                    <img :src="item.image" alt="하이클래스">
                  </div>
                </div>
              </div>
            </template>
          </template>
        </template>
      </div>
    </div>
    <div class="popup-close-btn" @click="closePopup">close</div>
</div>
</template>

<script>

export default {
  name: 'GuidePopup',
  components: { 
    
  },
  data() {
    return {
      option: {
        selectedItem: '01'
      },
      guideItem: {
        '01': {
          'isEmpty': false,
          'question': '가입하기',
          'item': [
            {
              'idx': '01_1',
              'answer': '하이클래스, 1분 안에 쉽~게 가입하기',
              'image': require('../../assets/img/guide/step-thum01.png')
            }
          ]
        },
        '02': {
          'isEmpty': false,
          'question': '초대하기',
          'item': [
            {
              'idx': '02_1',
              'answer': '학부모 쉽게 초대하기',
              'image': require('../../assets/img/guide/step-thum02.png')
            },
            // {
            //   'idx': '02_2',
            //   'answer': '학부모가 나의 클래스에 입장하는 과정 쉽게 알아보기',
            //   'image': ''
            // },
            {
              'idx': '02_3',
              'answer': 'SNS 계정이 없는 학생을 위한 임시 계정 쉽게 발급하기',
              'image': require('../../assets/img/guide/step-thum03.png')
            }
          ]
        },
        '03': {
          'isEmpty': false,
          'question': '알림장 이용하기',
          'item': [
            {
              'idx': '03_1',
              'answer': '새로운 하이클래스 알림장, 쉽게 따라하기',
              'image': require('../../assets/img/guide/step-thum03_1.jpg')
              // 'image': 'https://image.hiclass.net/7e40/8140/8320/774eaebb-00ee-46c2-9b25-82a9d16742c3.JPG?width=360&height=180'
            },
            {
              'idx': '03_2',
              'answer': '앨범 안 쓰고 싶을땐 알림장만 쉽게 이용하기',
              'image': require('../../assets/img/guide/step-thum04.png')
            }
          ]
        },
        '04': {
          'isEmpty': false,
          'question': '하이톡',
          'item': [
            {
              'idx': '04_1',
              'answer': '똑똑한 소통을 위한 하이톡 쉽게 사용하기 (모바일)',
              'image': require('../../assets/img/guide/step-thum05.png')
            },
            {
              'idx': '04_2',
              'answer': '똑똑한 소통을 위한 하이톡 쉽게 사용하기 (PC)',
              'image': '',
              'isEmpty': true,
              'emptyMsg': '하이톡 pc버전<br /> 서비스 및 따라하기 영상은<br /> 추후 오픈 예정입니다. '
            }
          ]
        },
        '05': {
          'isEmpty': false,
          'question': '하이콜',
          'item': [
            {
              'idx': '05_1',
              'answer': '번호 공개 없이 사생활 보호하는 하이콜, 쉽게 이용하기 (모바일)',
              'image': require('../../assets/img/guide/step-thum05_1.jpg')
              // 'image': 'https://image.hiclass.net/7e40/8140/aaa0/d3511cfa-fc8e-4afd-b8f2-3595b7d992da.JPG?width=360&height=180'
            }
          ]
        },
        '06': {
          'isEmpty': true,
          'question': '가정통신문',
          'item': [
            {
              'idx': '06_1',
              'answer': '우리 학교 가정통신문 신청하기',
              'image': ''
            },
            {
              'idx': '06_2',
              'answer': '학부모 상담 주간, 온라인으로 쉽게 예약 하기',
              'image': ''
            }
          ]
        }
      }
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    setGuide(type) {
      this.option.selectedItem = type
    },
    setPlay(idx) {
      window.open(`/popup/GuidePopupVideo?idx=${idx}`, 'hi-guide-video', 'width=1310, height=730, scrollbars= 0, resizable=1')
      //this.$refs.guideVideo[0].play()
    },
    moveFaq() {
      window.open('/help/faq', 'hi-faq')
    },
    closePopup() {
      window.close()
    }
  }
}
</script>
<style scoped lang="scss">
.hy-guide-popup-wrap{
    width:640px;
    height:886px;
    background:url('../../assets/img/guide/bg-guide-pop.png') no-repeat;
    z-index: 100;
    padding:20px 29px 29px 31px;    
    position:relative;
}
.hy-guide-box{
    width: 100%;
    height: 100%;
}
.hy-guide-nav {
    padding:20px;
}
.guide-chat-hi{
    overflow: hidden;
    width: 100%;
    min-height: 60px;
    padding: 8px 20px 8px 70px;
    position: relative;
  .guide-chat-hi > span{
      position:absolute;
      left: 0;
      display: inline-block;
      width: 56px;
      height: 56px;
      font-size:0;
      background:#fff url(../../assets/img/guide/ico-guide.png) no-repeat -2px -398px;
      border-radius: 100%;
      border: 3px solid #a2afd2;
  }
  > p{
      position: relative;
      display: inline-block;
      transform: skew(0.2deg);
      padding: 16px;
      background: #dee4f5;
      font-size: 18px;
      font-weight: bold;
      color: #283f92;
      border-radius: 6px;
      word-break: break-all;
  }
  > p:after {
      right: 100%;
      top: 50%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(222, 228, 245, 0);
      border-right-color: #dee4f5;
      border-width: 8px;
      margin-top: -8px;
  }
}
.hi-guide-tab {
    margin-top: 4px;
  ul{
    overflow: hidden;
    li {
      float:left;
    }
    li a{
      width: 125px;
      height: 48px;
      line-height: 48px;
      color: #fff;
      font-size: 17px;
      letter-spacing: -1px;
      font-weight: bold;
      text-align: center;
      display: block;
      float: left;
      background: #3263b0;
      box-shadow: 0 3px #223b81;
      border-radius: 8px;
      margin: 0 8px 12px 0;
      transition: 0.2s ease;
    }
    li.on a,
    li a:hover{
      background: #153a73;
      box-shadow: 0 3px #0a1944;
    }
    li a:before{
      content: '';
      display: inline-block;
      width: 20px;
      height: 20px;
      background-image: url(../../assets/img/guide/ico-guide.png);
      background-repeat: no-repeat;
      margin: 0 8px 0 0;
      vertical-align: middle;
    }
  }
}
.tab-guide01 a:before{
    background-position: 0 0!important;
}
.tab-guide02 a:before{
    background-position: 0 -41px!important;
}
.tab-guide03 a{
    width: 257px!important;
}
.tab-guide03 a:before{
    height: 24px!important;
    background-position: 0 -91px!important;
}
.tab-guide04 a:before{
    background-position: 0 -152px!important;
}
.tab-guide05 a:before{
    background-position: 0 -209px!important;
}
.tab-guide06 a:before{
    background-position: 0 -259px!important;
}
.tab-guide07 a:before{
    background-position: 0 -322px!important;
}
.hy-guide-con{
    overflow-y: scroll;
    height: 494px;
    padding: 0 20px 10px;
    width: 100%;
}
.guide-chat-user{
  overflow: hidden;
  text-align: right;
  width: 100%;
  min-height: 60px;
  padding:10px 70px 10px 20px;
  position: relative;
  > span{
    position: absolute;
    right: 0;
    display: inline-block;
    width: 56px;
    height: 56px;
    font-size: 0;
    background: #fff url(../../assets/img/guide/ico-guide.png) no-repeat -3px -518px;
    border-radius: 100%;
    border: 3px solid #caccd1;
  }
  > p{
    position: relative;
    display: inline-block;
    transform: skew(0.2deg);
    padding: 16px;
    background: #e7e7e7;
    font-size: 18px;
    font-weight: bold;
    color: #1d1d1d;
    border-radius: 6px;
    word-break: break-all;
  }
  > p:after {
    left: 100%;
    top: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(222, 228, 245, 0);
    border-left-color: #e7e7e7;
    border-width: 8px;
    margin-top: -8px;
  }
}
.guide-video-box{
  width: 100%;
  margin: 10px 0 20px;
  position:relative;
  > div {
    width: 360px;
    height: 180px;
    position:relative;
    border-radius: 8px;
    margin-left:71px;
  }
  > div.img{
    border-radius: 8px;
  }
  .cover-video{
    border-radius: 8px;
  }
  .cover-video .video-icon02 {
    top: 65px;
    border-radius: 8px;
  }
}
.guide-video-box-empty{
    width: 360px;
    height: 160px;
    background: rgba(0,0,0,0.4);
    padding: 20px 0 0 20px;
    margin: 20px 0;
    border-radius: 8px;
    margin-left:71px;
  > span{
      font-size: 0;
      background: url(../../assets/img/guide/ico-guide.png) no-repeat -124px 0;
      width: 88px;
      height: 110px;
      float: left;
      margin: 8px 8px 0 0;
  }
  > p{
      position: relative;
      display: inline-block;
      transform: skew(0.2deg);
      padding: 8px;
      background: #fff;
      font-size: 15px;
      line-height: 130%;
      font-weight: bold;
      color: #1d1d1d;
      border-radius: 6px;
      word-break: break-all;
  }
  > p:after {
      right: 100%;
      top: 50%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(222, 228, 245, 0);
      border-right-color: #fff;
      border-width: 8px;
      margin-top: -8px;
  }
}
.hy-guide-popup-wrap .popup-close-btn {
    position: absolute;
    top: 18px;
    right: 16px;
    width: 24px;
    height: 24px;
    background: url(../../assets/img/icon_modal_close_24.png) no-repeat -2px -2px;
    cursor: pointer;
    z-index: 1000;
    font-size: 0;
}
.hy-guide-popup-wrap .popup-close-btn:hover {
    background: url(../../assets/img/icon_modal_close_24.png) no-repeat -26px -2px;
}
</style>