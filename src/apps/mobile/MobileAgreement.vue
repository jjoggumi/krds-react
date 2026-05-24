<template>
  <div class="m-wrap agreement-page">
    <div v-if="isAgreementReady" class="m-container">
      <section class="agreement-frame">
        <h2 class="agreement-hero">서비스 이용을 위해
          <br/>변경된 약관에 동의해주세요.</h2>
        <div class="mt-15 mb-15">
          <input id="agree-all" type="checkbox" class="sq-type" v-model="agreeAll" @change="toggleAll" />
          <label class="chk-all" for="agree-all">
            <span>전체 동의</span>
          </label>
        </div>
        <div class="divider"></div>

        <ul class="terms-list">
          <li
            v-for="item in agreementItems"
            :key="item.key"
            :class="['term-item', item.required ? 'required' : 'optional']"
          >
            <div>
              <input
                :id="`agree-${item.key.replace(/\//g, '-')}`"
                v-model="item.checked"
                type="checkbox"
                class="sq-type"
              />
              <label :for="`agree-${item.key.replace(/\//g, '-')}`">
                <span :class="['term-label', { 'without-prefix': item.showLabel === false && !item.required }]">
                  <strong v-if="item.required || item.showLabel !== false" class="term-prefix">{{ item.required ? '(필수)' : '(선택)' }}</strong>
                  {{ item.name }}
                </span>
              </label>
            </div>
            <button v-if="item.selectType" class="view-btn" @click.prevent="openView(item.key)">보기</button>
          </li>
        </ul>

        <div class="bottom-area">
          <HiButton color="primary" size="xl" block bitrounded :disabled="!canAccept" @click="submitAgreement">{{ submitButtonText }}</HiButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import HiButton from '@/components/Button/HiButton.vue';
import jwtDecode from 'jwt-decode';
import { getUserConsentsInfo, postUserConsentsAgreement } from '@hiclass/core';
import nativeInterface from './nativeInterface';

export default {
  name: 'MobileAgreement',
  data() {
    return {
      agreementItems: [],
      agreeAll: false,
      idToken: '',
      isAgreementReady: false,
      isLoadingAgreementItems: false,
      isSubmittingAgreement: false
    }
  },
  computed: {
    canAccept() {
      const requiredItems = this.agreementItems.filter(item => item.required)

      return !this.isLoadingAgreementItems &&
        !this.isSubmittingAgreement &&
        (requiredItems.length === 0 || requiredItems
        .every(item => item.checked))
    },
    submitButtonText() {
      return this.agreementItems.some(item => item.required) ? '동의 완료' : '완료'
    }
  },
  watch: {
    agreementItems: {
      deep: true,
      handler() {
        this.updateAgreeAll()
      }
    }
  },
  created() {
    document.title = '약관 동의'
    this.idToken = this.$route.query.idToken || ''
    this.loadAgreementItems()
  },
  methods: {
    getAgreementStateStorageKey() {
      return `mobileAgreementState:${this.idToken || 'anonymous'}`
    },
    getPendingConsentsStorageKey() {
      return `mobileAgreementPendingConsents:${this.idToken || 'anonymous'}`
    },
    consumeSavedAgreementState() {
      const savedState = sessionStorage.getItem(this.getAgreementStateStorageKey())

      if (!savedState) {
        return {}
      }

      try {
        const parsedState = JSON.parse(savedState)
        sessionStorage.removeItem(this.getAgreementStateStorageKey())
        return parsedState
      } catch (error) {
        sessionStorage.removeItem(this.getAgreementStateStorageKey())
        return {}
      }
    },
    persistAgreementStateForReturn() {
      const checkedByKey = this.agreementItems.reduce((result, item) => {
        result[item.key] = item.checked
        return result
      }, {})

      sessionStorage.setItem(this.getAgreementStateStorageKey(), JSON.stringify(checkedByKey))
    },
    clearAgreementState() {
      sessionStorage.removeItem(this.getAgreementStateStorageKey())
    },
    savePendingConsents(consents) {
      sessionStorage.setItem(this.getPendingConsentsStorageKey(), JSON.stringify(consents))
    },
    updatePendingConsents() {
      const consents = this.agreementItems.map(item => ({
        consentType: item.consentType,
        isAgreed: item.checked
      }))

      this.savePendingConsents(consents)
    },
    clearPendingConsents() {
      sessionStorage.removeItem(this.getPendingConsentsStorageKey())
    },
    isDirectAuthTestMode() {
      return this.$route.query.testDirectAuth === 'true'
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
    getTokenPayload() {
      if (!this.idToken) {
        return null
      }

      try {
        return jwtDecode(this.idToken)
      } catch (error) {
        return null
      }
    },
    isStudentUser() {
      const payload = this.getTokenPayload()
      const authorities = payload?.authorities

      if (Array.isArray(authorities)) {
        return authorities.includes('ROLE_STUDENT')
      }

      return authorities === 'ROLE_STUDENT'
    },
    shouldDirectGuardianVerification(items) {
      if (this.isDirectAuthTestMode()) {
        return true
      }

      return this.isStudentUser() &&
        items.length === 1 &&
        items[0]?.consentType === 'ageVerification'
    },
    moveToGuardianVerification(isDirect = false) {
      const query = {
        idToken: this.idToken
      }

      if (isDirect || this.isDirectAuthTestMode()) {
        query.directAuth = 'true'
      }

      const navigate = isDirect || this.isDirectAuthTestMode() ? 'replace' : 'push'

      if (this.agreementItems.length > 0) {
        this.updatePendingConsents()
      }

      if (navigate === 'push') {
        this.persistAgreementStateForReturn()
      }

      this.$router[navigate]({
        path: '/mobile/guardian-verification',
        query
      })
    },
    getRouteKey(item) {
      if (item.consentType === 'ageVerification') {
        return 'isOver14'
      }

      return {
        serviceRecord: 'service',
        terms: 'service',
        collectionPersonalInfo: 'privacy',
        privacyPolicy: 'privacy',
        collectionPersonalInfoPreview: 'privacy/preview',
        allergyRecord: 'sensitive/allergy',
        medicationRecord: 'sensitive/healthy'
      }[item.selectType] || {
        serviceRecord: 'service',
        collectionPersonalInfo: 'privacy',
        privacyPolicy: 'privacy',
        allergyRecord: 'sensitive/allergy',
        medicationRecord: 'sensitive/healthy'
      }[item.consentType] || item.consentType
    },
    toggleAll() {
      if (this.isLoadingAgreementItems || this.isSubmittingAgreement) {
        return
      }

      this.agreementItems = this.agreementItems.map(item => ({
        ...item,
        checked: this.agreeAll
      }))
    },
    async loadAgreementItems() {
      if (this.isLoadingAgreementItems) {
        return
      }

      this.isLoadingAgreementItems = true

      try {
        const res = await getUserConsentsInfo(this.getRequestConfig())
        const items = res._embedded?.consents || []

        if (this.shouldDirectGuardianVerification(items)) {
          this.savePendingConsents(items.map(item => ({
            consentType: item.consentType,
            isAgreed: false
          })))
          this.moveToGuardianVerification(true)
          return
        }

        const savedAgreementState = this.consumeSavedAgreementState()

        this.agreementItems = items.map(item => ({
          ...item,
          name: item.title,
          checked: savedAgreementState[this.getRouteKey(item)] ?? false,
          key: this.getRouteKey(item),
          showLabel: item.consentType === 'ageVerification' ? false : undefined
        }))
        this.updateAgreeAll()
        this.isAgreementReady = true
      } catch (error) {
        this.$hiClass.alert('약관 정보를 불러오지 못했습니다. 다시 시도해주세요.')
        this.isAgreementReady = true
      } finally {
        this.isLoadingAgreementItems = false
      }
    },
    openView(key) {
      if (this.isLoadingAgreementItems || this.isSubmittingAgreement) {
        return
      }

      const item = this.agreementItems.find(agreementItem => agreementItem.key === key)
      this.persistAgreementStateForReturn()

      this.$router.push({
        path: `/mobile/terms/${key}`,
        query: {
          idToken: this.idToken,
          layerType: item?.selectType || '',
          modalClass: 'sensitive-info-modal'
        }
      })
    },
    async submitAgreement() {
      if (this.isLoadingAgreementItems || this.isSubmittingAgreement || !this.canAccept) {
        return
      }

      const isOver14Item = this.agreementItems.find(item => item.key === 'isOver14')

      if (isOver14Item && !isOver14Item.checked) {
        this.moveToGuardianVerification()
        return
      }

      this.isSubmittingAgreement = true

      try {
        const consents = this.agreementItems.map(item => ({
          consentType: item.consentType,
          isAgreed: item.checked
        }))

        await postUserConsentsAgreement({ consents }, this.getRequestConfig())
        this.clearAgreementState()
        this.clearPendingConsents()
        this.sendAgreementCompleted()
      } catch (error) {
        this.$hiClass.alert('동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
      } finally {
        this.isSubmittingAgreement = false
      }
    },
    sendAgreementCompleted() {
      nativeInterface.sendAgreementCompleted()
    },
    updateAgreeAll() {
      this.agreeAll = this.agreementItems.length > 0 && this.agreementItems.every(item => item.checked)
    }
  }
}
</script>

<style lang="scss" scoped>
.agreement-page {
  min-height: 100vh;  
  padding-top: 52px;
  .m-container{
    padding: 28px 20px;    
  }
}

.agreement-hero {
  font-size: 24px;
  font-weight: 600;
  line-height: 160%;
  margin-bottom:32px;
  color: #000;
}
.chk-all {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 14px;
  span{
    margin: 0;
    color: var(--gray-10, #1D1D1D);
    font-size: 15px;
    font-weight: 600;
    line-height: 150%; 
  }
}
.divider {
  height: 1px;
  background: #e9e9e9;
  margin: 14px 0;
}
.terms-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.term-item {
  display: flex;
  align-items: start;
  justify-content: space-between;
  padding: 8px 0;
  > div {
    display: flex;
    align-items: center;
  }
  input {
    flex: 0 0 auto;
  }
  label{
    display: flex;
    // align-items: center;
  }
}
.term-item .term-label {
  margin-left: 8px;
  margin-right: 8px;
  font-size: 15px;
  font-weight: 400;
  line-height: 150%;
  display: inline-flex;
  //align-items: center;
  gap: 6px;
  vertical-align: middle;
}
.term-item .term-label .term-prefix {
  flex: 0 0 auto;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--gray-09, #616161);
}
.term-item .term-label.without-prefix {
  gap: 0;
}
.term-item.required input[type="checkbox"] {
  accent-color: #2f7ef6;
}
.agreement-frame { position: relative; }
.view-btn {
  background: transparent;
  border: none;
  color: #616161;
  font-size: 15px;
  font-weight: 600;
  text-decoration: underline;
  margin-top: 2px;
}
.bottom-area {
  z-index: 30;
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 28px;
  display: flex;
  justify-content: center;
  ::v-deep(.hi-btn){min-height:48px; height:48px; border-radius: 8px;font-weight:700;}
}
</style>
