<template>
  <HiModal
    :isOpen="isOpen"
    @close="handleClose"
    v-if="isOpen"
    :modalLayerStyle="{ 'max-width': '480px', width: '100%' }"
    size="md"
    class="update-notice-modal"
  >
    <template v-slot:heading>
      <h2>업데이트 안내</h2>
    </template>    
    <template v-slot:content>
      <div class="popup-content">
        <!-- 팡파레 효과 -->
        <div v-if="showConfetti" class="modal-confetti-overlay">
          <div ref="lottieContainer" class="modal-confetti-animation"></div>
        </div>
        <div class="top-content">
          <span class="calendar">
            <img src="@/assets/img/svg/ico-calendar-week-active.svg" alt="캘린더" />
          </span>
          <h3>
            <span class="badge-free">무료</span>
            시간표 프로그램 출시
          </h3>
          <p class="popup-desc">학교 시간표를 효율적으로 관리할 수 있는<br>하이클래스의 무료 시간표 프로그램이 오픈되었습니다!</p>
        </div>
        
        <div class="popup-features">
          <h4>주요 기능</h4>
          <ul>
            <li>이용료, 도입료 무료</li>
            <li>시간표 자동 생성</li>
            <li>맞교환·연쇄교환 자동 추천</li>
            <li>간편하게 모바일로 변경 신청 및 승인</li>
            <li>교과별 시수표 요청 시 자동 취합</li>
            <li>수업 시수 누계 제공</li>
          </ul>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton class="action-btn btn btn-primary" size="md" @click="goSchoolTimetable">지금 이용하기</HiButton>
    </template>
  </HiModal>
</template>

<script>
import { nextTick } from 'vue';
import lottie from 'lottie-web';
import FanfareLottie from '@/assets/img/lottie/Fanfare.json';

export default {
  name: 'UpdateNoticeModal',
  props: {
    isOpen: Boolean,
    isMaster: Boolean
  },
  emits: ['close', 'goSchoolTimetable'],
  data() {
    return {
      showConfetti: true,
      lottieInstance: null,
      FanfareLottie
    }
  },
  watch: {
    isOpen: {
      handler: async function(newVal) {
        console.log('팡파레 watch 실행', newVal);
        if (newVal) {
          this.showConfetti = true;
          await nextTick();
          await nextTick(); // 한 번 더 기다림
          console.log('lottieContainer:', this.$refs.lottieContainer);
          if (this.$refs.lottieContainer) {
            // 기존 인스턴스가 있으면 먼저 제거
            if (this.lottieInstance) {
              this.lottieInstance.destroy();
            }
            
            this.lottieInstance = lottie.loadAnimation({
              container: this.$refs.lottieContainer,
              renderer: 'svg',
              loop: false,
              autoplay: true,
              animationData: FanfareLottie
            });
            console.log('lottieInstance:', this.lottieInstance);
            
            // 애니메이션 완료 후 정리
            this.lottieInstance.addEventListener('complete', () => {
              setTimeout(() => {
                this.showConfetti = false;
                if (this.lottieInstance) {
                  this.lottieInstance.destroy();
                  this.lottieInstance = null;
                }
              }, 500);
            });
          } else {
            console.error('lottieContainer ref를 찾을 수 없습니다');
          }
        } else {
          // 모달이 닫힐 때 정리
          if (this.lottieInstance) {
            this.lottieInstance.destroy();
            this.lottieInstance = null;
          }
          this.showConfetti = false;
        }
      },
      immediate: true
    }
  },
  methods: {
    handleClose() {
        this.$emit('close');
    },
    goSchoolTimetable() {
      if (this.isMaster) {
        this.$emit('goSchoolTimetable');
        this.$emit('close');
      } else {
        this.$hiClass.alert('교직원 관리 메뉴에서 관리자 권한 이용자만<br>접근할 수 있는 메뉴입니다.<br>교직원 관리에서 권한을 확인해주세요.');
        this.$emit('close');
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.update-notice-modal {
  ::v-deep .modal__layer{
    max-height: calc(100% - 120px);
    margin-top: 70px;
    border-radius: 12px;
    .modal__content{
      display: flex;
      flex-flow: column;
    }
  }  
  ::v-deep .modal__header {
    padding: 40px 32px 0 32px;
    .btn-close {
      width: 20px;
      height: 20px;
      background-color: var(--gray-09);
      mask-image: url("~@/assets/img/icon/icon_close_black.svg");
      mask-size: cover;
    }
    @keyframes popupIconBounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    h2 {
      font-size: 20px;
      color: var(--gray-10);
      text-align: center;
      font-weight: 700;
      line-height: 140%;
      margin-bottom: 16px;
    }
  }
  ::v-deep .modal__content { 
    padding: 0 30px;    
    .popup-content {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 4px;
      .modal-confetti-overlay {
        position: absolute;
        top: -50px;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 20px;
      }
      .modal-confetti-animation {
        width: 400px;
        height: 400px;
      }
      .confetti-lottie {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 200px;
        pointer-events: none;
        z-index: 10;
      }
      .top-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 20px;
        .calendar {
          display: inline-block;
          width: 82px;
          height: 82px;
          padding: 20px 20px 22px 20px;
          margin: 0 auto;
          border: 1px solid rgba(104, 71, 222, 0.20);
          background: rgba(104, 71, 222, 0.10);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 50px;
          }
        }
        h3 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: transparent;
          font-size: 22px;
          font-weight: 700;
          line-height: 137%;
          text-align: center;      
          text-shadow: 0 0 4px rgba(126, 71, 222, 0.12);
          background: linear-gradient(94deg, #1F54C2 0%, #8727DB 100%);
          background-clip: text;
          .badge-free {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px 12px;
            width: 45px;
            height: 26px;
            border-radius: 30px;
            background: #FF5C5C;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            line-height: 160%; 
          }
        }
        .popup-desc {
          font-size: 14px;
          color: var(--gray-10);
          font-weight: 500;
          line-height: 160%;
          text-align: center;
        }
      } 
      .popup-features {
        padding: 20px 30px;
        margin-bottom: 28px;
        border-radius: 12px;
        border: 1px solid rgba(104, 71, 222, 0.20);
        background: rgba(104, 71, 222, 0.10);
        h4 {
          font-size: 16px;
          color: var(--gray-10);
          margin-bottom: 10px;
          font-weight: 700;
          line-height: 150%;
          text-align: left;
        }
        ul {
          list-style: none;
          li {
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
            font-size: 15px;
            color: var(--gray-10);
            font-weight: 500;
            text-align: left;
            line-height: 160%;
            &::before {
              content: "";
              left: 0;
              top: 10px;
              width: 20px;
              height: 20px;
              background-image: url("~@/assets/img/svg/checkbox-checked.svg");
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
            }
            + li {
              margin-top: 8px;
            }
          }
        }
      }
    }
  }
  ::v-deep .modal__footer {
    padding: 0 32px 24px 32px;
    margin-top: 0;
    .action-btn {
      width: 100%;
      height: 44px;
      padding: 0 24px;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 400;
      line-height: 160%;
      cursor: pointer;
      transition: all 0.3s ease;
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}
</style>
