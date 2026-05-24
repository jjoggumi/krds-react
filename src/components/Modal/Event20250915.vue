<!--
@File(Method):event250828.vue
@Description: 미술교과서 웹 팝업 레이어 요청
이벤트 기간 종료 후 호출부분은 삭제하지만 나중에 비슷한 이벤트에서 로직을 재활용할 수 있어 파일은 남겨둔다.
-->
<template>
  <dialog ref="dialog" class="dialog-layer20250915" title="2026년, 실과 교과서도 아이스크림!">
    <div class="dialog-pop-contents"  @click.prevent="onClick">
      <div class="dialog-pop-contents-base">
        <img
            src="https://download.i-scream.co.kr/s_images/promotion/promotionSupportClass2025/mainlayer250909_hiclass.png"
            alt="아이스크림 교과서 합격! (미술, 체육, 실과) 다른 교과는 심사결과가 9월 30일에 발표 될 예정입니다."
        />
        <div class="gif">
          <span class="tit">
            <img src="https://download.i-scream.co.kr/s_images/promotion/promotionSupportClass2025/mainlayer250909_hiclass_gif_tit.png" alt="" />
          </span>
          <span class="thumb">
            <img src="https://download.i-scream.co.kr/s_images/promotion/promotionSupportClass2025/mainlayer250909_hiclass_thumb.gif" alt="" />
          </span>
        </div>
      </div>
      <strong class="dialog-pop-title">
        <img src="https://download.i-scream.co.kr/s_images/promotion/promotionSupportClass2025/mainlayer250909_hiclass_tit.png" alt="" />
      </strong>
      <div class="trans-thumbs">
        <img
            src="https://download.i-scream.co.kr/s_images/promotion/promotionSupportClass2025/mainlayer250909_hiclass_thumbs1.png"
            class="trans-img1"
            alt=""
        />
        <img
            src="https://download.i-scream.co.kr/s_images/promotion/promotionSupportClass2025/mainlayer250909_hiclass_thumbs2.png"
            class="trans-img2"
            alt=""
        />
        <img
            src="https://download.i-scream.co.kr/s_images/promotion/promotionSupportClass2025/mainlayer250909_hiclass_thumbs3.png"
            class="trans-img3"
            alt=""
        />
      </div>
      <div class="dialog-pop-close">
        <button type="button" @click.stop="onLeftCloseClick">{{ leftButtonText }}</button>
        <button type="button" class="right close" @click.stop="closeDialog">닫기</button>
      </div>
    </div>
  </dialog>
</template>
<script>
export default {
  name: 'Event250915',
  mounted() {
    const dialog = this.$refs.dialog;
    try {
      console.log()
      if (this.shouldOpen()) {
        dialog.showModal();
        this.incrementStat('shows');
        this.logAnalytics('show');
      } else {
        dialog.close();
      }
    } catch (e) {
      console.log(e)
      dialog.close();
    }
  },
  methods: {
    eventNow() {
      return new Date();
    },
    // KST 기준 시간 범위
    campaignTimes() {
      return {
        //실제 이벤트 시간
        start: new Date('2025-09-15T08:00:00+09:00').getTime(),
        phase1End: new Date('2025-09-21T23:59:59+09:00').getTime(), // 더이상 보지 않기로 변경
        end: new Date('2025-09-28T23:00:00+09:00').getTime(),
      };
    },
    isInCampaign() {
      const now = this.eventNow().getTime();
      const { start, end } = this.campaignTimes();
      return now >= start && now <= end;
    },
    isPhaseOne() {
      const now = this.eventNow().getTime();
      const { start, phase1End } = this.campaignTimes();
      return now >= start && now <= phase1End;
    },
    todayKey() {
      const d = this.eventNow();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },
    storageGet(key, defaultValue = null) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? defaultValue : v;
      } catch (e) {
        return defaultValue;
      }
    },
    storageSet(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
    },
    storageJsonGet(key, defaultObj = null) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : defaultObj;
      } catch (e) {
        return defaultObj;
      }
    },
    storageJsonSet(key, obj) {
      try {
        localStorage.setItem(key, JSON.stringify(obj));
      } catch (e) {}
    },
    isTeacher() {
      const user = this.$store && this.$store.state && this.$store.state.user ? this.$store.state.user : {};
      return user && user.userType === 'TEACHER';
    },
    hasElementaryClazz() {
      const views = (this.$store && this.$store.state && Array.isArray(this.$store.state.clazzSubscribeViews)) ? this.$store.state.clazzSubscribeViews : [];
      return views.some(v => v && v.classStatus === 'ACTIVATE' && v.memberStatus === 'ACCEPT' && v.schoolType === 'ELEMENTARY');
    },
    hasElementarySchool() {
      const views = (this.$store && this.$store.state && Array.isArray(this.$store.state.schoolSubscribeViews)) ? this.$store.state.schoolSubscribeViews : [];
      return views.some(v => {
        if (v && v.schoolStatus === 'ACTIVATE' && v.joinType === 'SCHOOL') {
          const normalize = v.schoolName.normalize('NFC'); // 한글 정규화
          const hasWanted = /(초등학교|분교)/.test(normalize);
          const hasBanned = /(병설|유치원)/.test(normalize);
          return hasWanted && !hasBanned;
        }
        return false
      });
    },
    isHiddenToday() {
      const key = `${this.keyName}:hide:${this.todayKey()}`;
      return this.storageGet(key) === '1';
    },
    isHiddenCampaign() {
      return this.storageGet(`${this.keyName}:hide:campaign`) === '1';
    },
    shouldOpen() {
      return this.isInCampaign() && this.isTeacher() && (this.hasElementaryClazz() || this.hasElementarySchool()) && !this.isHiddenToday() && !this.isHiddenCampaign();
    },
    hideToday() {
      const key = `${this.keyName}:hide:${this.todayKey()}`;
      this.storageSet(key, '1');
    },
    hideCampaign() {
      this.storageSet(`${this.keyName}:hide:campaign`, '1');
    },
    closeDialog() {
      this.$refs.dialog && this.$refs.dialog.close();
    },
    onLeftCloseClick() {
      if (this.isPhaseOne()) {
        this.hideToday();
      } else {
        this.hideCampaign();
      }
      this.closeDialog();
    },
    incrementStat(type) {
      try {
        const key = `${this.keyName}:stats:${this.todayKey()}`;
        const data = this.storageJsonGet(key, { shows: 0, clicks: 0 });
        if (type === 'shows') data.shows += 1;
        if (type === 'clicks') data.clicks += 1;
        this.storageJsonSet(key, data);
      } catch (e) {}
    },
    logAnalytics(kind) {
      try {
        if (this.$store && typeof this.$store.dispatch === 'function') {
          this.$store.dispatch('triggerAnalyticsLogEvent', {
            code: `analytics.event250915.${kind}`,
            params: { kind }
          });
        }
      } catch (e) {}
    },
    onClick() {
      this.incrementStat('clicks');
      this.logAnalytics('click');
      window.open('https://www.i-scream.co.kr/eventForword.jsp?num=269', '_blank', 'noopener');
    }
  },
  computed: {
    keyName() {
      const user = this.$store && this.$store.state && this.$store.state.user ? this.$store.state.user : {};
      return `event250915:${user.currentId}`;
    },
    leftButtonText() {
      return this.isPhaseOne() ? '오늘 다시 보지 않기' : '더 이상 보지 않기';
    }
  }
};
</script>
<style scoped>
/* 기존 스타일 그대로 옮겨옴 */
:where(dialog *) {
  box-sizing: border-box;
  outline: 0;
}
.dialog-layer20250915 {
  width: 1120px;
  max-width: 96%;
  background: transparent;
  border: 0;
  outline: 0;
  padding: 0;
  margin: auto;
  box-sizing: border-box;
  overflow: visible;
  animation: layer20250915_fadeInUp 0.5s forwards;
}
.dialog-layer20250915::backdrop {
  background: rgba(0, 0, 0, 0.7);
}
.dialog-layer20250915 .dialog-pop-contents {
  cursor: pointer;
  position: relative;
}
.dialog-layer20250915 .dialog-pop-contents img {
  max-width: 100%;
  display: table;
  margin: 0 auto;
}
.dialog-layer20250915 .dialog-pop-contents .gif {
  position: absolute;
  width: min(280px, 25%);
  bottom: 16%;
  left: 6.3%;
}
.dialog-layer20250915 .dialog-pop-contents .gif .tit {
  display: block;
  padding: 0 32px;
  position: relative;
  z-index: 1;
  transform: translateY(50%);
}
.dialog-layer20250915 .dialog-pop-contents .gif .thumb {
  display: block;
  border-radius: 8px;
  border: 4px solid #3333ca;
  overflow: hidden;
}
.dialog-layer20250915 .dialog-pop-title {
  position: absolute;
  top: -8%;
  left: 0;
  right: 50%;
  padding: 0 20px;
  animation: layer20250915_fadeInUp 1s backwards;
  animation-delay: 0.5s;
}
.dialog-layer20250915 .dialog-pop-btn {
  position: absolute;
  width: 20%;
  bottom: 24%;
  right: 4%;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 0.24);
  transform: translate(0, 0);
  transition: transform 0.3s, box-shadow 0.3s;
}
.dialog-layer20250915 .dialog-pop-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 4px 0 rgba(0, 0, 0, 0.2);
}
.dialog-layer20250915 .dialog-pop-btn * {
  cursor: pointer;
}
.dialog-layer20250915 .dialog-pop-close {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}
.dialog-layer20250915 .dialog-pop-close .right {
  margin-left: auto;
}
.dialog-layer20250915 .dialog-pop-close button {
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
  color: #fff;
  font-size: min(4vw, 15px);
  font-weight: 500;
}
.dialog-layer20250915 .trans-thumbs {
  position: absolute;
  top: 23%;
  right: 5%;
  width: min(600px, 54%);
}
.dialog-layer20250915 .trans-thumbs img {
  position: absolute;
  opacity: 0;
  top: 0;
  right: 0;
  animation: layer20250915_transFade 6s infinite;
}
.dialog-layer20250915 .trans-thumbs .trans-img1 {
  animation-delay: unset;
}
.dialog-layer20250915 .trans-thumbs .trans-img2 {
  animation-delay: -2s;
}
.dialog-layer20250915 .trans-thumbs .trans-img3 {
  animation-delay: -4s;
}
@keyframes layer20250915_fadeInUp {
  0% {
    transform: translateY(10%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes layer20250915_transFade {
  0%,
  60% {
    opacity: 0;
    filter: blur(0);
    z-index: 0;
  }
  75%,
  95% {
    opacity: 1;
    filter: blur(0);
    z-index: 2;
  }
  100% {
    opacity: 0;
    filter: blur(4px);
    z-index: 1;
  }
}
</style>