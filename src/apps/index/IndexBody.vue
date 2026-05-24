<template>
  <div class="l-container-index">
    <!-- section : 인트로 및 로그인 -->
    <!-- electron intro -->
    <section class="electron-intro-wrap" @mousemove="setBackgroundAnimation">
      <div class="electron-intro">
        <h2 class="electron-heading">
          <span>{{ $t('index.section.intro.title.text1') }} {{ $t('index.section.intro.title.text2') }}</span>
        </h2>

        <ul class="electron-list">
          <li>
            <a href="javascript:void(0);" @click="startButtonClick('teacher/v2')">
              <strong>{{ $t('teacher') }}</strong>
              <p v-html="$t('index.section.intro-electron.teacher.description')"></p>
            </a>
          </li>
          <li>
            <a href="javascript:void(0);" @click="startButtonClick('parents')">
              <strong>{{ $t('parents') }}</strong>
              <p v-html="$t('index.section.intro-electron.parents.description')"></p>
            </a>
          </li>
          <li>
            <a href="javascript:void(0);" @click="startButtonClick('student')">
              <strong>{{ $t('student') }}</strong>
              <p v-html="$t('index.section.intro-electron.student.description')"></p>
            </a>
          </li>
        </ul>
        <div class="electron-join">
          아직 하이클래스의 회원이 아니시라면? <a href="javascript:void(0);" @click="onClickJoinOnElectron">회원가입</a>
        </div>
      </div>
    </section>
    <section class="section-index-intro is-active" @mousemove="setBackgroundAnimation">
      <div class="section-index__inner">
        <div class="index-intro__heading">
          <h2 class="heading">
            <span>{{ $t('index.section.intro.title.text1') }}</span>
          </h2>
          <h2 class="heading">
            <span>{{ $t('index.section.intro.title.text2') }}</span>
          </h2>
        </div>
        <div class="index-intro__bg">
          <span class="bg-lg"></span>
          <span class="bg-line-lg"></span>
          <span class="bg-sm"></span>
        </div>

        <div class="index-login__list">
          <div class="index-login__item">
            <a href="javascript:void(0);" class="index-login__inner" @click="startButtonClick('teacher/v2')">
              <div class="index-login__text">
                <strong class="heading">{{ $t('teacher') }}</strong>
                <span class="icon-arrow"
                  ><span>{{ $t('index.section.intro.teacher.doLogin') }}</span></span
                >
                <p class="desc" v-html="$t('index.section.intro.teacher.description')"></p>
              </div>
              <div class="group-object">
                <span class="object-teacher"></span>
                <span class="object-teacher-eyes"></span>
                <span class="object-teacher-smile"></span>
                <span class="object-teacher-light"></span>
              </div>
            </a>
          </div>
          <div class="index-login__item">
            <a href="javascript:void(0);" class="index-login__inner" @click="startButtonClick('parents')">
              <div class="index-login__text">
                <strong class="heading">{{ $t('parents') }}</strong>
                <span class="icon-arrow"
                  ><span>{{ $t('index.section.intro.parents.doLogin') }}</span></span
                >
                <p class="desc" v-html="$t('index.section.intro.parents.description')"></p>
              </div>
              <div class="group-object">
                <span class="object-parents"></span>
                <span class="object-parents-smile"></span>
                <span class="object-parents-eyes"></span>
                <span class="object-parents-toss"></span>
                <span class="object-parents-up"></span>
                <span class="object-parents-bar"></span>
              </div>
            </a>
          </div>
          <div class="index-login__item">
            <a href="javascript:void(0);" class="index-login__inner" @click="startButtonClick('student')">
              <div class="index-login__text">
                <strong class="heading">{{ $t('student') }}</strong>
                <span class="icon-arrow"
                  ><span>{{ $t('index.section.intro.student.doLogin') }}</span></span
                >
                <p class="desc">{{ $t('index.section.intro.student.description') }}</p>
              </div>
              <div class="group-object">
                <span class="object-student"></span>
                <span class="object-student-bg"></span>
                <span class="object-student-toss"></span>
                <span class="object-student-up"></span>
                <span class="object-student-smile"></span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <button class="btn-scrolldown" @click="scrollDown"><span></span></button>
    </section>

    <!-- section : 하이톡 / 하이콜 -->
    <section class="section-index-hitalk">
      <div class="section-index__inner">
        <div class="section-index__text">
          <strong class="category"><span>하이톡 / 하이콜</span></strong>
          <h2 class="heading"><span>개인 전화번호 공개 없이</span></h2>
          <h2 class="heading"><span>무료문자, 무료통화</span></h2>
          <p class="desc">우리반, 우리학교, 우리소통은 여기서 <br />무료 채팅부터 무료 전화까지 <br />하이톡으로 간편하게 사용하세요.</p>
        </div>
        <div class="index-image__animation">
          <span class="object-cursor"></span>
          <div class="group-layer">
            <span class="object-popup"></span>
            <span class="object-hicall01"></span>
            <span class="object-hicall02"></span>
          </div>
          <div class="group-object-chat">
            <span class="object-chat01"></span>
            <span class="object-chat02"></span>
            <span class="object-chat03"></span>
            <span class="object-chat04"></span>
            <span class="object-chat05"></span>
            <span class="object-chat06"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- section : HiClass -->
    <section class="section-index-hiclass">
      <div class="section-index__inner">
        <div class="index-hiclass__bg">
          <span class="bg-lg"></span>
          <span class="bg-dot-lg"></span>
          <span class="bg-sm"></span>
        </div>

        <Slick class="slider-for index-text__slide" :options="textSlickOptions" ref="textSlide">
          <div class="slide slide-note" data-slidernav="알림장">
            <div class="section-index__text">
              <strong class="category"><span>알림장</span></strong>
              <h2 class="heading"><span>학교에서 가정으로</span></h2>
              <h2 class="heading"><span>바로 보내는 학급공지</span></h2>
              <p class="desc">내일의 준비물도, 긴급 공지 사항도 <br />푸시 알림으로 빠르게 확인할 수 있어요</p>
            </div>
          </div>
          <div class="slide slide-album" data-slidernav="앨범">
            <div class="section-index__text">
              <strong class="category"><span>앨범</span></strong>
              <h2 class="heading"><span>사진으로 살펴보는</span></h2>
              <h2 class="heading"><span>우리 아이 학교 생활</span></h2>
              <p class="desc">우리 반의 활동 기록을 모아볼 수 있고 <br />온라인 과제 전시회를 열 수도 있어요</p>
            </div>
          </div>
          <div class="slide slide-homework" data-slidernav="과제제출">
            <div class="section-index__text">
              <strong class="category"><span>과제제출</span></strong>
              <h2 class="heading"><span>제출부터 피드백까지</span></h2>
              <h2 class="heading"><span>손쉬운 과제 제출 방법</span></h2>
              <p class="desc">사진 및 파일을 첨부하여 과제를 제출하고 <br />선생님 피드백을 반영하여 수정 후 다시 제출할 수도 있어요</p>
            </div>
          </div>
          <div class="slide slide-meal" data-slidernav="급식">
            <div class="section-index__text">
              <strong class="category"><span>급식</span></strong>
              <h2 class="heading"><span>매일 아침 알려주는</span></h2>
              <h2 class="heading"><span>오늘의 급식 정보</span></h2>
              <p class="desc">오늘 급식은 뭐가 나오는지 조심해야 할 성분은 없는지 <br />빠르고 간편하게 확인할 수 있어요</p>
            </div>
          </div>
          <div class="slide slide-form" data-slidernav="결석사유서">
            <div class="section-index__text">
              <strong class="category"><span>결석사유서</span></strong>
              <h2 class="heading"><span>수기 작성 필요없이 </span></h2>
              <h2 class="heading"><span>온라인 신청서 작성하기</span></h2>
              <p class="desc">결석사유서, 체험학습 신청서, 체험학습 보고서 등 <br />우리학교 양식 그대로 간편하게 제출하세요</p>
            </div>
          </div>
          <div class="slide slide-survey" data-slidernav="설문">
            <div class="section-index__text">
              <strong class="category"><span>설문</span></strong>
              <h2 class="heading"><span>발행부터 수합, 통계까지 </span></h2>
              <h2 class="heading"><span>온라인으로 한 번에</span></h2>
              <p class="desc">방과후 수업, 학부모 상담 일정 등 <br />실시간으로 신청하고 확인할 수 있어요</p>
            </div>
          </div>
          <div class="slide slide-eletter" data-slidernav="가정통신문">
            <div class="section-index__text">
              <strong class="category"><span>가정통신문</span></strong>
              <h2 class="heading"><span>언제 어디서든</span></h2>
              <h2 class="heading"><span>학교소식 살펴보기</span></h2>
              <p class="desc">학교 가정통신문, 알림장 등 <br />놓치지 않고 자동으로 받아볼 수 있어요</p>
            </div>
          </div>
          <div class="slide slide-event" data-slidernav="이벤트">
            <div class="section-index__text">
              <strong class="category"><span>이벤트</span></strong>
              <h2 class="heading"><span>매월 찾아오는 </span></h2>
              <h2 class="heading"><span>다채로운 이벤트</span></h2>
              <p class="desc">오직 하이클래스에서 즐길 수 있는 <br />특별한 이벤트에 참여할 수 있어요</p>
            </div>
          </div>
          <div class="slide slide-lang" data-slidernav="다국어지원">
            <div class="section-index__text">
              <strong class="category"><span>다국어지원</span></strong>
              <h2 class="heading"><span>원활한 소통을 위한 </span></h2>
              <h2 class="heading"><span>다국어 번역 기능</span></h2>
              <p class="desc">다문화 가정, 외국인 학교 등에 꼭 필요한 <br />11개 다국어 번역 기능을 사용해보세요</p>
            </div>
          </div>
          <div class="slide slide-calendar" data-slidernav="학사일정">
            <div class="section-index__text">
              <strong class="category"><span>학사일정</span></strong>
              <h2 class="heading"><span>중요한 일정 놓치지 않도록</span></h2>
              <h2 class="heading"><span>한 눈에 보는 학사캘린더</span></h2>
              <p class="desc">학부모 상담주간, 개교기념일 등 <br />주요일정을 일자별로 한 눈에 볼 수 있어요</p>
            </div>
          </div>
        </Slick>

        <Slick class="slider-nav index-image__slide" :options="imageSlickOptions" ref="imageSlide">
          <div class="slide slide-note">
            <div class="image"><img src="@/assets/img/index/img_hiclass01.png" alt="알림장" /></div>
            <div class="group-object">
              <svg class="circle" width="50" height="50" viewBox="0 0 168 168" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M163 84C163 127.63 127.63 163 84 163C40.3695 163 5 127.63 5 84C5 40.3695 40.3695 5 84 5C127.63 5 163 40.3695 163 84Z" />
              </svg>
            </div>
          </div>
          <div class="slide slide-album">
            <div class="image"><img src="@/assets/img/index/img_hiclass02.png" alt="앨범" /></div>
            <div class="group-object">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span
              ><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="slide slide-homework">
            <div class="image"><img src="@/assets/img/index/img_hiclass03.png" alt="과제제출" /></div>
            <div class="group-object">
              <div class="hide"></div>
              <div class="stamp"></div>
            </div>
          </div>
          <div class="slide slide-meal">
            <div class="image"><img src="@/assets/img/index/img_hiclass04.png" alt="급식" /></div>
            <div class="group-object">
              <div class="cursor"></div>
              <div class="hide"></div>
              <div class="arrow"></div>
            </div>
          </div>
          <div class="slide slide-form">
            <div class="image"><img src="@/assets/img/index/img_hiclass05.png" alt="결석사유서" /></div>
            <div class="group-object">
              <div class="group01">
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span
                ><span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="group02">
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span
                ><span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div class="slide slide-survey">
            <div class="image"><img src="@/assets/img/index/img_hiclass07_1.png" alt="설문" /></div>
            <div class="group-object">
              <div class="option"></div>
              <div class="radio"></div>
            </div>
          </div>
          <div class="slide slide-eletter">
            <div class="image"><img src="@/assets/img/index/img_hiclass08_2.png" alt="가정통신문" /></div>
            <div class="group-object">
              <div class="cursor"></div>
              <div class="push"></div>
              <div class="eletter"></div>
            </div>
          </div>
          <div class="slide slide-event">
            <div class="image"><img src="@/assets/img/index/img_hiclass09_2.png" alt="이벤트" /></div>
            <div class="group-object">
              <div class="option"></div>
              <div class="button"></div>
            </div>
          </div>
          <div class="slide slide-lang">
            <div class="image"><img src="@/assets/img/index/img_hiclass10_2.png" alt="다국어지원" /></div>
            <div class="group-object">
              <div class="cursor"></div>
              <div class="translate"></div>
            </div>
          </div>
          <div class="slide slide-calendar">
            <div class="image"><img src="@/assets/img/index/img_hiclass11.png" alt="학사일정" /></div>
            <div class="group-object">
              <div class="schedule01"></div>
              <div class="schedule02"></div>
              <div class="schedule03"></div>
            </div>
          </div>
        </Slick>
      </div>
    </section>

    <!-- section : 학교양식 신청서 -->
    <section class="section-index-form">
      <div class="section-index__inner">
        <div class="section-index__text">
          <strong class="category"><span>학교양식 신청서</span></strong>
          <h2 class="heading"><span>가정에서 선생님께</span></h2>
          <h2 class="heading"><span>우리학교 양식 그대로</span></h2>
          <p class="desc">
            결석사유서, 체험학습 신청서 등<br />가정에서 학교로 보내는 각종 학교양식 신청서<br />온라인으로 손쉽게 작성하고 양식 그대로 출력하세요.
          </p>
        </div>
        <div class="index-image__animation">
          <div class="group-object">
            <span class="object-stamp"></span>
            <span class="object-sign">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
                <path
                  class="sign1"
                  d="M 20 80 Q 0 200 100 60 C 60 200 80 120 160 40"
                  stroke="#555"
                  fill="none"
                  stroke-width="6"
                  stroke-linecap="round"
                />
                <path
                  class="sign2"
                  d="M 160 40 C 180 40 120 140 140 140 Q 160 140 280 20"
                  stroke="#555"
                  fill="none"
                  stroke-width="6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="object-hwp"></span>
            <span class="object-excel"></span>
            <span class="object-pdf"></span>
            <span class="object-circle01"></span>
            <span class="object-circle02"></span>
            <span class="object-circle03"></span>
            <span class="object-curve"></span>
          </div>
          <div class="group-text">
            <p>제주도</p>
            <p>제주도<span class="space"></span>도착<span class="space"></span>후<span class="space"></span>가족들과</p>
            <p>함께<span class="space"></span>숙소에<span class="space"></span>먼저<span class="space"></span>이동</p>
          </div>
        </div>
      </div>
    </section>

    <!-- section : 학교알리미 -->
    <section class="section-index-eletter">
      <div class="section-index__inner">
        <div class="section-index__text">
          <strong class="category"><span>학교알리미</span></strong>
          <h2 class="heading"><span>스마트한 </span></h2>
          <h2 class="heading"><span>학교 운영의 시작 </span></h2>
          <p class="desc">
            설문, 방과후 신청, 학부모 상담 등 학교에서 가정으로 보내는 종이없는 가정통신문<br />온라인으로 배포, 취합, 통계까지 손쉽게 관리하세요.
          </p>
        </div>
        <div class="section-eletter__list">
          <div class="section-eletter__item">
            <strong class="heading">전자서명</strong>
            <p class="desc">가정통신문에 필요한 서명을 <br />온라인으로 받을 수 있어요</p>
          </div>
          <div class="section-eletter__item">
            <strong class="heading">미회신 자동알림</strong>
            <p class="desc">설문을 회신하지 않는 경우 <br />자동으로 알림을 발송해요</p>
          </div>
          <div class="section-eletter__item">
            <strong class="heading">설문조사</strong>
            <p class="desc">방과후 수업, 상담 등 <br />자주쓰는 설문 샘플을 제공해요</p>
          </div>
          <div class="section-eletter__item">
            <strong class="heading">설문회수,수합</strong>
            <p class="desc">설문 회수 부터 통계까지 <br />한번에 확인이 가능해요</p>
          </div>
        </div>
        <button class="btn-eletter" @click="startButtonClickByAlarmPlus"><span>학교 관리자 신청하기</span></button>
      </div>
    </section>

    <!-- section : 교육청 맞춤 유료 플랜 -->
    <section class="section-index-price-plan">
      <div class="section-index__inner">
        <div class="section-index__text">
          <h2 class="heading"><span>도입 및 이용료 안내</span></h2>
          <p class="desc">우리 학교에 맞는 하이클래스 플랜을 선택하세요.</p>
        </div>
        <div class="section-price-plan-list">
          <div class="section-price-plan-item">
            <strong class="heading"> [누구나 무료]<br>교사 개인 또는 개별 학교</strong>
            <ul class="desc">
              <li>도입 및 사용료 무료</li>
              <li>회원가입 후 알림장, 가정통신문 ,설문 등 필요한 기능만 자유롭게 이용</li>
            </ul>
          </div>
          <div class="section-price-plan-item">
            <strong class="heading">[별도문의]<br>교육청 산하 시스템 도입</strong>
            <ul class="desc">
              <li>연간 라이선스 구매</li>
              <li>가정통신문 ,설문, 신청, 학급 운영, 보안 등 학교 행정에 맞춤형 커스터마이징 플랜</li>
            </ul>
          </div>
        </div>
        <a href="/price#price-plan" class="btn-price-plan">더 알아보기</a>
      </div>
    </section>

    <!-- section : 리뷰 -->
    <section class="section-index-review">
      <div class="section-index__inner">
        <div class="index-review__heading">
          <h2 class="heading">많은 선생님이 하이클래스를 선택해주신 이유</h2>
          <p class="desc">전국 초등학교 99%가 이용하는 <br />온라인 수업 플랫폼!<br />편리하고 똑똑한 수업도구를 지금 바로 이용해보세요.</p>
        </div>

        <div class="index-review__list">
          <div v-if="isShowMasonry" class="index-review__inner">
            <masonry :gutter="15" :cols="2">
              <div class="index-review__item"></div>

              <div v-for="(reviewItem, index) of reviewItems" class="index-review__item" :key="`reviewItem-masonry-${index}`">
                <strong class="heading">{{ reviewItem.heading }}</strong>
                <p class="text">{{ reviewItem.text }}</p>
                <span class="name">{{ reviewItem.name }}</span>
              </div>
            </masonry>
          </div>

          <div v-else class="index-review__inner">
            <div class="index-review__item"></div>

            <div v-for="(reviewItem, index) of reviewItems" class="index-review__item" :key="`reviewItem-${index}`">
              <strong class="heading">{{ reviewItem.heading }}</strong>
              <p class="text">{{ reviewItem.text }}</p>
              <span class="name">{{ reviewItem.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <GlobalEvents @scroll="showSection('.section-index-hiclass .section-index__text')" />
  </div>
</template>

<script>
import { loadScript } from 'vue-plugin-load-script';
import { mapGetters } from 'vuex';
import Slick from 'vue-slick';

import masonry from 'masonry-layout';
import VueMasonry from 'vue-masonry-css';
import Vue from 'vue';

import { useElectronController } from '@/apps/hitalk/utils';

Vue.prototype.$masonry = masonry;
Vue.use(VueMasonry);

const electronController = useElectronController();

export default {
  name: 'index-body',
  components: {
    Slick,
  },
  data() {
    return {
      aa: true,
      isShowMasonry: false,
      slickItemClass: {
        slickDotsFirstItem: {
          isActive: false,
          class: 'slick-active',
        },
        slickNote: {
          isActive: false,
          class: 'slick-active',
        },
      },
      customPagingArray: ['알림장', '앨범', '과제제출', '급식', '결석사유서', '설문', '가정통신문', '이벤트', '다국어지원', '학사일정'],
      imageSlickOptions: {
        slidesToShow: 1,
        slideToScroll: 1,
        asNavFor: '.slider-for',
        arrows: false,
        centerMode: false,
        focusOnSelect: true,
        cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
      },
      textSlickOptions: {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: '.slider-nav',
        dots: true,
        autoplay: false,
        autoplaySpeed: 5000,
        cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
        customPaging: (slider, i) => {
          return '<a>' + this.customPagingArray[i] + '</a>';
        },
      },
      reviewItems: [
        {
          heading: '답답하고 불편했던 소통의 애매함을 날려준 하이클래스',
          text: '번호 공개없이 자유로운 메시지와 전화가 가능한 점, 결석사유서 파일도 차곡차곡 기록으로 남겨놓은점, 편리한 사진파일 업로드 등으로 정말 신뢰를 쌓았습니다. 감사합니다.',
          name: '김*린 선생님',
        },
        {
          heading: '결석사유서와 체험학습 제출까지 업그레이드 되는 모습은 감동!',
          text: '하이클래스 덕분에 올 한해 학부모님, 아이들과 소통을 매우 편리하게 할 수 있었습니다. 정말 정말 감사드려요.',
          name: '김*영 선생님',
        },
        {
          heading: '올 한해는 하이클래스로 아이들과 추억들을 많이 쌓았네요.',
          text: '앨범으로 반에서의 재밌는 모습을 다같이 공유하고, 특히 과제게시판으로 아이들의 과제를 실시간으로 검토해주어 원격 상황에서도 가까이 있는 듯한 수업을 할 수 있었어요.',
          name: '조*아 선생님',
        },
        {
          heading: '아이들도 쉽게 사용이 가능한 것이 참 좋았어요.',
          text: '학생들도 가계정으로 가입시켜 학급 홈페이지처럼 사용할 수 있고, 앨범에 아이들 활동사진이 원활하게 잘 올라가서 아이들도 쉽게 사용이 가능한게 참 좋았어요.',
          name: '최*영 선생님',
        },
        {
          heading: '하이클래스 덕분에 한결 편한 한 해를 보냈어요!',
          text: '단체 메시지를 보낼 수 있는 것, 수신확인이 바로 가능한 것, 확인 안 한 학부모님에게만 푸쉬 알림을 따로 보내는것, 모두 편했어요. 하이클래스 고마워요!',
          name: '김*정 선생님',
        },
        {
          heading: '하이클래스가 없었다면 어떻게 일년을 보냈을까 싶어요.',
          text: '항상 선생님들의 고충에 귀 기울여주시고, 바로 기능 개선으로 피드백 주시니 이용할 수 밖에 없네요. 교사가 학교 본연의 교육에 집중 할 수 있도록 앞으로도 잘 부탁드립니다.',
          name: '안*숙 선생님',
        },
        {
          heading: '하이콜, 하이톡으로 학부모님들과 원활한 소통이 가능했어요.',
          text: '하이콜, 하이톡 뿐만 아니라 알림장에 굵은 글씨, 글씨색 바꾸기, 알림장을 읽지 않은 학부모님께 알림을 보낼 수도 있어서 여러모로 유익하게 사용하고 있어요.',
          name: '박*현 선생님',
        },
        {
          heading: '하이클래스 덕분에 부모님들과의 소통이 원활하게 이루어졌어요.',
          text: '알림장, 급한 안내도 공지로 편하게 할 수 있었고, 원격수업에서 과제 확인, 출석부 기능으로 편리하고 안전한 소통의 장이 되었습니다.',
          name: '양*주 선생님',
        },
      ],
    };
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
  },
  mounted() {
    sessionStorage.removeItem('routeAlarmPlus');

    this.$log.warn(this.$options.name, 'mounted!');

    this.$nextTick(() => {
      this.checkMasonry();

      loadScript(`/files/js/init-index.js`)
        .then(() => {
          this.$log.debug(this.$options.name, 'loadScript!');
          setTimeout(() => {
            this.$scrollTo('body');
          }, 50);
        })
        .catch(() => {
          this.$log.error(this.$options.name, 'loadScript error!');
          this.$router.go(1);
        });
    });

    window.addEventListener('resize', () => this.checkMasonry());
  },
  beforeDestroy() {
    window.removeEventListener('resize', () => this.checkMasonry());
  },
  methods: {
    startButtonClickByAlarmPlus() {
      this.$hiClass.alert('로그인 후 이용 가능합니다.', 'info').then(() => {
        sessionStorage.setItem('routeAlarmPlus', 'true');
        this.startButtonClick('teacher/v2');
      });
    },
    startButtonClick(loginUserType) {
      electronController.clearLocalStorageAndCookie();
      let path = '/login/' + loginUserType;
      this.$router.push(path, () => {});
    },

    showSection(target) {
      const section = $(target);

      var winH = $(window).height();
      var scrollPos = $('html').scrollTop() || $('body').scrollTop();

      if (section.closest('section').hasClass('is-active')) return;

      if (section.offset().top - winH <= scrollPos && section.offset().top + section.height() > scrollPos) {
        section.closest('section').addClass('is-active');

        if (section.closest('section').hasClass('section-index-hiclass')) {
          this.textSlickOptions.autoplay = true;
          this.$refs.textSlide.reSlick();

          this.$nextTick(() => {
            $('.slick-dots li:eq(0)').removeClass('slick-active');
            $('.slide-note').parents('.slick-slide').removeClass('slick-active');
            setTimeout(function () {
              $('.slide-note').parents('.slick-slide').addClass('slick-active');
              $('.slick-dots li:eq(0)').addClass('slick-active');
            }, 100);
          });
        }
      }
    },
    checkMasonry() {
      this.$nextTick(() => {
        const body = document.querySelector('body');
        this.isShowMasonry = body.clientWidth >= 1240;
      });
    },
    setBackgroundAnimation(e) {
      var nodes = document.querySelectorAll('.section-index-intro .index-intro__bg span');

      Array.prototype.forEach.call(nodes, function (elem) {
        var elemH = elem.clientHeight;
        var random = Math.floor(Math.random() * 50) + 50;
        var mouseXpos = e.clientX;
        var mouseYpos = e.clientY;

        var calcY = (elemH / 2 - mouseXpos) / random;
        var calcX = (elemH / 2 - mouseYpos) / random;

        elem.style.transform = 'perspective(' + elemH + 'px) rotateX(' + calcX + 'deg) rotateY(' + calcY + 'deg)';
      });
    },
    scrollDown() {
      $('html,body').animate(
        {
          scrollTop: $('.section-index-hitalk').offset().top - 80,
        },
        'slow'
      );
    },
    onClickJoinOnElectron() {
      electronController.openExternal('https://www.hiclass.net');
    },
    goToAnchor() {
      this.$router.push({ path: '/price', hash: '#price-plan' }).then(() => {
        this.$nextTick(() => {
          const el = document.querySelector('#price-plan');
        });
      });
    },
  },
};
</script>

<style scoped>
</style>