<!--
@File(Method): HitalkOnboardingModal.vue
@Description: 하이톡 최초 진입 시, 소통 방식 설정 팝업 표시
-->
<template>
  <HiModal :modalLayerStyle="{ 'max-width': '560px', width: '100%' }" v-if="isVisible" type="type01" closeSkip class="hitalk hitalk-onboarding-modal" @close="close">
    <template v-slot:heading>
      시작하기
      <p class="subtitle">상담 시간 설정에서 언제든 변경할 수 있습니다.</p>
    </template>

    <template v-slot:content>
      <!-- 하이톡 (메시지) -->
      <div class="section">
        <div class="section-label">하이톡 (메시지)</div>
        <div class="option-cards">
          <div class="option-card" :class="{ selected: talkType === 'one' }" @click="talkType = 'one'">
            <span class="card-icon">
              <img class="onboard-icon" :src="talkType === 'one' ? icoShieldOn : icoShield" />
            </span>
            <strong class="card-title">일방향</strong>
            <p class="card-desc">(구성원은 수신만)</p>
          </div>
          <div class="option-card two" :class="{ selected: talkType === 'two' }" @click="talkType = 'two'">
            <span class="card-icon">
              <img class="onboard-icon" :src="talkType === 'two' ? icoChartExchangeOn : icoChartExchange" />
            </span>
            <strong class="card-title">양방향</strong>
            <p class="card-desc">(선생님 ⇄ 구성원)</p>
          </div>
        </div>
      </div>

      <!-- 하이콜 (전화) -->
      <div class="section">
        <div class="section-label">하이콜 (전화)</div>
        <div class="option-cards">
          <div class="option-card" :class="{ selected: callType === 'one' }" @click="callType = 'one'">
            <span class="card-icon">
              <img class="onboard-icon" :src="callType === 'one' ? icoShieldOn : icoShield" />
            </span>
            <strong class="card-title">일방향</strong>
            <p class="card-desc">(선생님만 발신 가능)</p>
          </div>
          <div class="option-card two" :class="{ selected: callType === 'two' }" @click="callType = 'two'">
            <span class="card-icon">
              <img class="onboard-icon" :src="callType === 'two' ? icoCallExchangeOn : icoCallExchange" />
            </span>
            <strong class="card-title">양방향</strong>
            <p class="card-desc">(선생님 ⇄ 구성원)</p>
          </div>
        </div>
      </div>

      <p class="notice-text">
        <HiIcon name="ico-warning-circle" color="primary" size="16" />
        상담 시간 설정에서 언제든 변경할 수 있습니다.
      </p>
    </template>

    <template v-slot:footer>
      <HiButton :color="hasTwoWay ? 'noti' : 'primary'" size="lg" :disabled="!talkType || !callType" @click="onFooterClick">{{
        hasTwoWay ? '상세 설정' : '선택 완료'
      }}</HiButton>
    </template>
  </HiModal>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
import icoShield from '@/assets/img/svg/ico-shield.svg';
import icoShieldOn from '@/assets/img/svg/ico-shield-on.svg';
import icoChartExchange from '@/assets/img/svg/ico-chart-exchange.svg';
import icoChartExchangeOn from '@/assets/img/svg/ico-chart-exchange-on.svg';
import icoCallExchange from '@/assets/img/svg/ico-call-exchange.svg';
import icoCallExchangeOn from '@/assets/img/svg/ico-call-exchange-on.svg';

export default {
  name: 'HitalkOnboardingModal',
  data() {
    return {
      isVisible: false,
      talkType: null,
      callType: null,
      icoShield,
      icoShieldOn,
      icoChartExchange,
      icoChartExchangeOn,
      icoCallExchange,
      icoCallExchangeOn,
    };
  },
  computed: {
    hasTwoWay() {
      return this.talkType === 'two' || this.callType === 'two';
    },
  },
  methods: {
    ...mapActions('storeHitalk', [
      'openTimeSettingFromOnboarding',
      'callUpdateTimeSetting',
      'callUserTime'
    ]),
    ...mapMutations('storeHitalk', [
      'clearTimeSettingInitData',
    ]),
    resetSelections() {
      this.talkType = null;
      this.callType = null;
    },
    open() {
      this.clearTimeSettingInitData();
      this.resetSelections();
      this.isVisible = true;
    },
    close() {
      this.isVisible = false;
      this.resetSelections();
    },
    async onFooterClick() {      
      if (this.hasTwoWay) {
        // 양방향 선택 시 상담 시간 상세 설정 팝업 열기
        await this.openTimeSettingFromOnboarding({
          talkType: this.talkType,
          callType: this.callType,
        });
        // this.$store.commit('storeHitalk/toggleTimeSetting');
      } else {
        const isUseChat = this.talkType === 'two';
        const isUseCall = this.callType === 'two';
        const userTime = await this.callUserTime({userId: localStorage.uuid, userType: 'TEACHER', memberRole: 'OWNER', isSetUserTime: false});
        if (userTime) {
          userTime.isUseChat = isUseChat;
          userTime.isUseCall = isUseCall;
          userTime.isUseSetting = true;
          userTime.isOverChat = true;
        }
      await this.callUpdateTimeSetting(userTime);
      }

      this.close();
      return;
    },
  }
};
</script>

<style lang="scss" scoped>
.hitalk-onboarding-modal {
  ::v-deep .modal__header {
    text-align: center;
    flex-direction: column;
    align-items: center;
  }
  .subtitle {
    font-size: 15px;
    font-weight: 400;
    line-height: 160%;
    color: var(--gray-09);
  }
  .section {
    margin-bottom: 20px;
    .section-label {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary);
      margin-bottom: 8px;
      text-align: left;
      line-height: 150%;
    }
    .option-cards {
      display: flex;
      gap: 8px;
      .option-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 12px 18px 12px;
        border: 1px solid var(--gray-06);
        border-radius: 8px;
        cursor: pointer;
        transition:
          border-color 0.15s,
          background 0.15s;
        background: var(--gray-01);
        &:hover {
          border-color: var(--primary);
          box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.12);
          background: #fff;
        }
        &.selected {
          border-color: var(--primary);
          background: var(--primary-03);
          box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.12);
        }
        &.two {
          &:hover {
            border-color: var(--noti);
            background: #fff;
          }
          &.selected {
            border-color: var(--noti);
            background: rgba(255, 106, 106, 0.12);
            box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.12);
          }
        }
        .card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-title {
          font-size: 18px;
          font-weight: 600;
          line-height: 116%;
          color: #222;
          margin-bottom: 4px;
        }
        .card-desc {
          font-size: 14px;
          text-align: center;
          font-weight: 400;
          line-height: 121%;
          color: var(--gray-09);
        }
      }
    }
  }
  .notice-text {
    display: flex;
    padding: 8px 20px;
    align-items: center;
    align-self: stretch;
    border-radius: 8px;
    background: var(--primary-03);
    font-size: 14px;
    color: var(--primary);
    font-weight: 400;
    line-height: 160%;
  }
  ::v-deep .modal__header {
    padding-top: 32px;
  }
  ::v-deep .modal__content {
    padding: 30px 40px 40px;
  }
}
</style>
