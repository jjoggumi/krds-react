<template>
  <div class="privacy-info-box boundary-box">
    <div class="left-wrap">
      <div class="box-title txt-heading-h2">민감정보 수집 및 <br>이용 동의 (선택)</div>
    </div>
    <div class="right-wrap">
      <div v-for="(sensitive, idx) in sensitives" :key="sensitive.consentType" class="relative" :class="{'mb-25': idx !== sensitives.length - 1}">
        <div v-if="sensitive.isAgreed !== null" class="agree-date txt-gray">
          {{ `${sensitive.isAgreed ? '동의' : '철회'} (${$moment(sensitive.consentTimestamp).format('YYYY.MM.DD HH:mm')})` }}
        </div>
        <input
          type="checkbox"
          v-model="sensitive.isAgreed"
          :id="sensitive.consentType"
          @click="onClickIsAgree($event, sensitive.consentType)"
        />
        <label :for="sensitive.consentType" class="d-flex">
          <span>
            <div class="txt-body-b2">{{ `${sensitive.title} 동의` }}</div>
            <div class="txt-body-b3 txt-gray">
              {{ sensitive.description }}
            </div>
          </span>
        </label>
      </div>        
    </div>

    <SensitiveAgreementModal v-if="agreementModal.isOpen" @close="onCloseAgreementModal" :consent-type="agreementModal.consentType" />
  </div>
</template>

<script>
import { getUserConsentsSensitives, updateUserConsentsAgreement } from '@hiclass/core';
import SensitiveAgreementModal from '@/components/Terms/SensitiveAgreementModal.vue';

const DEFAULT_WITHDRAWAL_MESSAGE = '미 동의시 서비스 이용이 제한됩니다.<br>동의를 철회하시겠습니까?';
const WITHDRAWAL_MESSAGE_BY_TYPE = {
  'sensitiveInfoThirdParty': '미 동의시 투약의뢰서 제출 및 관련 서비스 이용이 제한됩니다.<br>동의를 철회하시겠습니까?’',
  'sensitiveInfoUse': '미 동의시 알레르기 맞춤 안내 서비스 이용이 제한됩니다.<br>동의를 철회하시겠습니까?'
}

export default {
  name: "MainBodyMypageInfoBodySensitiveAgree",
  components: { SensitiveAgreementModal },
  data() {
    return {
      sensitives: [],
      checkedMap: {
        medication: false,
        thirdParty: false,
        allergy: false
      },
      agreementModal: {
        isOpen: false,
        consentType: null
      }
    }
  },
  methods: {
    async getSensitives() {
      try {
        const { consents } = await getUserConsentsSensitives();
        this.sensitives = consents
      } catch (err) {
        console.error(err);
      }
    },
    // 약관 동의 모달 열기
    async onClickIsAgree(e, consentType) {
      e.preventDefault();
      const checked = e && e.target ? e.target.checked : false;
      if (checked) {
        this.agreementModal.consentType = consentType;
        this.agreementModal.isOpen = true
      } else {
        const { isConfirmed } = await this.$hiClass.confirm(WITHDRAWAL_MESSAGE_BY_TYPE[consentType] || DEFAULT_WITHDRAWAL_MESSAGE);
        if (!isConfirmed) return;
        await this.updateAgreement(consentType);
      }
    },
    // 약관 동의 모달 닫기
    onCloseAgreementModal(closeItem) {
      if (closeItem === null) {
        this.agreementModal.isOpen = false;
        this.agreementModal.consentType = null;
        return;
      }

      const { isAgreed, consentTimestamp, consentType } = closeItem;

      if (isAgreed) {
        const consentTitle = this.sensitives.find(s => s.consentType === consentType).title;
        this.$toasted.show(`${this.$moment().format('YYYY.MM.DD HH:mm')} ${consentTitle}에 동의하셨습니다.`);
      }

      this.sensitives.forEach(s => {
        if (s.consentType === consentType) {
          s.isAgreed = isAgreed
          s.consentTimestamp = consentTimestamp ?? s.consentTimestamp
        }
      });

      this.agreementModal.isOpen = false;
      this.agreementModal.consentType = null;
    },
    async updateAgreement(consentType) {
      try {
        const { consentTimestamp } = await updateUserConsentsAgreement(consentType, { isAgreed: false });
        this.sensitives.map(s => {
          if (s.consentType === consentType) {
            s.isAgreed = false
            s.consentTimestamp = consentTimestamp
          }
        })
        const consentTitle = this.sensitives.find(s => s.consentType === consentType).title;
        this.$toasted.show(`${this.$moment(consentTimestamp).format('YYYY.MM.DD HH:mm')} ${consentTitle}에 미 동의하셨습니다.`);
      } catch (err) {
        console.error(err);
      }
    },

    // 모달 내 약관 체크박스 변경 시 아코디언 열림 상태 조정
    // - medication 체크 시: 3자 미동의면 thirdParty 아코디언 열기 / 이미 동의면 모두 닫기
    // - medication 언체크 시: 둘 다 미동의면 medication 아코디언 복귀
    // - thirdParty 체크 시: thirdParty 아코디언 닫기
    // - thirdParty 언체크 시: 둘 다 미동의면 medication 아코디언 복귀
    handleTermsCheck(key) {
      const acc = this.$refs.termsAccordion;
      const checked = this.checkedMap[key];
      if (key === 'medication') {
        if (checked) {
          acc.close('medication');
          if (!this.checkedMap.thirdParty) acc.open('thirdParty');
        } else {
          if (!this.checkedMap.thirdParty) { acc.closeAll(); acc.open('medication'); }
        }
      } else {
        if (checked) {
          acc.close('thirdParty');
        } else {
          if (!this.checkedMap.medication) { acc.closeAll(); acc.open('medication'); }
        }
      }
    }
  },
  created() {
    this.getSensitives();
  }
};
</script>
<style lang="scss" scoped>
.agree-date{
  position: absolute;
  font-size: var(--b2-size);
  right: 0;
  & ~ label > span{
    margin-top: -1px;
  }
}
</style>