<template>
  <div class="m-wrap guardian-verification-page">
    <header class="m-header">
      <button v-if="showBackButton" class="m-btn-left hi-btn btn-link" @click="goBack">
        <i class="p-05 hi-ico  ico-size-24 ico-prev"></i>
      </button>
    </header>
    <div class="m-container">
      <section class="agreement-frame">
        <h2 class="agreement-hero">보호자 인증을 진행해주세요.</h2>
        <div class="txt-body-b1 font-bold">
          만 14세 미만의 회원은 서비스 이용을 위해 <br>
          보호자(법정대리인)의 본인 확인 및 동의가 필요합니다.  
          보호자 명의의 휴대폰으로 인증을 진행해 주세요.
        </div>      

        <div class="bottom-area">
          <HiButton color="noti" size="xl" block bitrounded :disabled="isRequestingGuardianVerification || isCheckingGuardianVerification" @click="requestGuardianVerification">법정대리인 인증</HiButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { postUserConsentsAgreement } from '@hiclass/core'
import nativeInterface from './nativeInterface'

export default {
  name: 'MobileGuardianVerification',
  data() {
    return {
      idToken: '',
      isGuardianVerificationCompleted: false,
      isRequestingGuardianVerification: false,
      isCheckingGuardianVerification: false
    }
  },
  computed: {
    showBackButton() {
      return this.$route.query.directAuth !== 'true'
    }
  },
  methods: {
    getPendingConsentsStorageKey() {
      return `mobileAgreementPendingConsents:${this.idToken || 'anonymous'}`
    },
    loadPendingConsents() {
      const savedConsents = sessionStorage.getItem(this.getPendingConsentsStorageKey())

      if (!savedConsents) {
        return []
      }

      try {
        return JSON.parse(savedConsents)
      } catch (error) {
        sessionStorage.removeItem(this.getPendingConsentsStorageKey())
        return []
      }
    },
    clearPendingConsents() {
      sessionStorage.removeItem(this.getPendingConsentsStorageKey())
    },
    getRequestConfig() {
      return this.idToken
        ? {
            headers: {
              Authorization: `Bearer ${this.idToken}`
            }
          }
        : undefined
    },
    goBack() {
      window.history.back()
    },
    async requestGuardianVerification() {
      if (this.isRequestingGuardianVerification || this.isCheckingGuardianVerification) {
        return
      }

      this.isRequestingGuardianVerification = true
      nativeInterface.sendGuardianVerificationRequired()
      this.$nextTick(() => {
        this.isRequestingGuardianVerification = false
      })
    },
    async handleGuardianVerificationResult() {
      if (this.isCheckingGuardianVerification) {
        return
      }

      this.isCheckingGuardianVerification = true

      try {
        const pendingConsents = this.loadPendingConsents().map(item => ({
          ...item,
          isAgreed: item.consentType === 'ageVerification' ? false : item.isAgreed
        }))

        if (pendingConsents.length === 0) {
          this.$hiClass.alert('동의 정보를 찾을 수 없습니다. 다시 시도해주세요.')
          return
        }

        await postUserConsentsAgreement({ consents: pendingConsents }, this.getRequestConfig())
        this.isGuardianVerificationCompleted = true
        this.clearPendingConsents()
        nativeInterface.sendAgreementCompleted()
      } catch (error) {
        this.$hiClass.alert('동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
      } finally {
        this.isCheckingGuardianVerification = false
      }
    }
  },
  created() {
    document.title = '연령 정보 확인'
    this.idToken = this.$route.query.idToken || ''
    window.guardianVerificationResult = () => {
      this.handleGuardianVerificationResult()
    }
  },
  destroyed() {
    if (window.guardianVerificationResult) {
      delete window.guardianVerificationResult
    }
  }
}
</script>

<style lang="scss" scoped>
.guardian-verification-page {
  min-height: 100vh;  
  padding-top: 52px;
  .m-container{
    padding: 28px 20px;    
  }
}

.m-header {
  border-bottom: 0;
}

.agreement-hero {
  font-size: 24px;
  font-weight: 600;
  line-height: 160%;
  margin-bottom:16px;
  color: #000;
}
.bottom-area {
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 28px;
  display: flex;
  justify-content: center;

  ::v-deep(.hi-btn){min-height:48px; height:48px; border-radius: 8px;font-weight:700;}

  :deep(.hi-btn.btn-noti) {
    -webkit-tap-highlight-color: transparent;
  }

  :deep(.hi-btn.btn-noti:hover:not(:disabled)),
  :deep(.hi-btn.btn-noti:focus:not(:disabled)),
  :deep(.hi-btn.btn-noti:active:not(:disabled)) {
    background-color: var(--noti);
    border-color: var(--noti);
    box-shadow: none;
  }
}
</style>
