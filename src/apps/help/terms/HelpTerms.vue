<!--
@File(Method): HelpTerms.vue
@Author: -
@Date Created: -
@Description: 이용약관
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 5년전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->

<template>
  <div class="right-cont-wrap">
    <div class="customer-terms-cont-wrap">
      <div class="tab-nav-wrap">
        <button :class="{
            on: tabIndex === 0
          }" @click="onClickTab(0)">이용약관</button>
        <button
          :class="{
            on: tabIndex === 1
          }"
          @click="onClickTab(1)"
        >개인정보취급방침</button>
      </div>
      <div class="terms-cont-wrap boundary-box">
        <div class="terms-cont-inner">
          <div class="terms-cont" :class="{
              on: tabIndex === 0
            }">
            <div class="title">제 1조 (목적)</div>
            <p>
              이 약관은 (주)아이스크림미디어(이하 '회사'라 함)의 브랜드
              이름(홈페이지 주소에서 제공하는 교육 정보서비스(이하 '서비스'라
              함)의 이용과 관련하여 회사와 회원 사이에 권리 의무 및 책임사항
              등을 규정함을 목적으로 합니다.
            </p>
          </div>
          <div class="terms-cont" :class="{
              on: tabIndex === 1
            }">
            <div class="title">제 21조 (목적2)</div>
            <p>
              이22 약관은 (주)아이스크림미디어(이하 '회사'라 함)의 브랜드
              이름(홈페이지 주소에서 제공하는 교육 정보서비스(이하 '서비스'라
              함)의 이용과 관련하여 회사와 회원 사이에 권리 의무 및 책임사항
              등을 규정함을 목적으로 합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "helpTerms",
  props: {
    isLogin: Boolean
  },
  data: () => ({
    tabIndex: 0
  }),
  methods: {
    onClickTab(i) {
      this.tabIndex = i;
    }
  },
  created() {
    if (!this.isLogin) {
      alert('권한이 없습니다.')
      this.$router.push('/', () => {})
    }
  },
};
</script>
<style scoped>
.customer-terms-cont-wrap .tab-nav-wrap {position:relative;margin:0 0 11px 0;font-size:0;}
.customer-terms-cont-wrap .tab-nav-wrap > * {display:inline-block;vertical-align:middle;}
.customer-terms-cont-wrap .tab-nav-wrap button {margin:0 32px 0 0;font-size:16px;transform: skew(0.2deg);font-weight: 600;color: #606164;}
.customer-terms-cont-wrap .tab-nav-wrap button.on {font-weight:bold;color:#3867c6;transform: skew(0.2deg);font-size: 18px;}
.customer-terms-cont-wrap .tab-nav-wrap:before {content:'';position:absolute;top:0;left:75px;width:2px;height:18px;background:rgba(0,0,0,0.1);}
.customer-terms-cont-wrap .terms-cont-wrap {height:454px;padding:29px 27px;}
.customer-terms-cont-wrap .terms-cont-inner {height:100%;overflow:auto;}
.customer-terms-cont-wrap .terms-cont-wrap .terms-cont {display:none;}
.customer-terms-cont-wrap .terms-cont-wrap .terms-cont.on {display:block;}
.customer-terms-cont-wrap .terms-cont-wrap .terms-cont .title {margin:0 0 14px 0;font-weight:bold;font-size: 16px;transform: skew(0.2deg);}
.customer-terms-cont-wrap .terms-cont-wrap .terms-cont p {line-height:1.43;transform: skew(0.2deg);color: #2e2e2e;}
.customer-terms-cont-wrap .terms-cont-wrap .terms-cont p + .title {margin-top:26px;}
</style>