<template>
  <HiModal v-if="modalItem !== null" type="type01" size="md" @close="closeModal(null)"  class="sensitive-terms-modal">
    <template #heading>
      {{ modalItem.title }}
      <div class="smr">{{ modalItem.description }}</div>
    </template>
    <template #content>
      <div class="txt-left">
        <HiAccordion
          ref="agreementAccordion"
          :animate="false"
          :defaultOpen="initialAgreements"
        >
          <HiAccordionItem
            v-for="(agreement, agreementIdx) of modalItem.agreements"
            :key="`agreement-${agreementIdx}`"
            :uid="`agreement-${agreementIdx}`"
          >
            <template #header>
              <div class="accordion__headerWrap">
                  <span class="check-wrap" @click.stop>
                    <input
                      type="checkbox"
                      :id="`agreement-${agreementIdx}-chk`"
                      v-model="agreement.isChecked"
                      @change="handleChangeAgreement(agreementIdx)"
                    />
                    <label :for="`agreement-${agreementIdx}-chk`">
                      <span>
                        <span v-if="agreement.required" class="txt-primary">[필수]</span>
                        {{ agreement.title }}
                      </span>
                    </label>
                  </span>
              </div>
            </template>
            <template #content>
              <ol>
                <li
                  v-for="(content, contentIdx) of agreement.contents"
                  :key="`agreement-${agreementIdx}-content-${contentIdx}`"
                >
                  {{ content }}
                </li>
              </ol>
            </template>
          </HiAccordionItem>
        </HiAccordion>

        <!-- 서명영역 : s -->
        <!-- <div class="esign-box-wrap mt-10" :class="{ hide: !option.isTips }">
          <Signature
            :key="componentKey"
            :option="option"
            @hide-tips="option.isTips = false"
          />
          <p v-if="option.isTips" class="txt-body-b3">이곳에 서명해주세요.</p>
        </div>  
        <div class="txt-right mt-10">
          <HiButton color="line-default" size="sm" @click="clearSignature">
            <i class="ico-reset"></i> 
            <HiIcon name="ico-refresh2" color="gray" size="20"></HiIcon>
            다시하기
          </HiButton> 
        </div>  -->
        <!-- 서명영역 : e --> 

        <p class="txt-body-b2 mt-05">
          {{ modalItem.caution }}
        </p>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="line-light-primary" size="lg" @click="closeModal(null)">취소</HiButton>
      <HiButton color="primary" size="lg" :disabled="!isAllChecked" @click="handleClickAgreeBtn">동의하기</HiButton>
    </template>
  </HiModal>
</template>

<script lang="js">
// import Signature from '@/components/Signature/Signature.vue'
import HiAccordion from '@/components/Accordion/HiAccordion.vue';
import HiAccordionItem from '@/components/Accordion/HiAccordionItem.vue';
import { updateUserConsentsAgreement } from '@hiclass/core';

export default {
  name: 'SensitiveAgreementModal',
  components: {
    // Signature,
    HiAccordionItem,
    HiAccordion },
  data() {
    return {
      // 서명 옵션
      option: {
        width: 454,
        height: 200,
        isTips: true
      },
      componentKey: 0,
      modalItem: null,
      openedAccordion: 0,
      initialAgreements: ['agreement-0']
    }
  },
  props: {
    consentType: {
      type: String,
      require: true
    }
  },
  computed: {
    isAllChecked() {
      return this.modalItem.agreements?.every(a => a.isChecked);
    }
  },
  methods: {
    closeModal(closeItem) {
      this.$emit('close', closeItem);
    },
    async getTerms() {
      try {
        const capitalizedType = this.consentType.charAt(0).toUpperCase() + this.consentType.slice(1);
        const fnName = `get${capitalizedType}`;
        const { data } = await this.$terms[fnName]();
        this.modalItem = {
          ...data,
          agreements: [
            ...data.agreements.map(a => ({
              ...a,
              contents: a.contents.map(item => item.replace(/^-\s*/, '').trim()),
              isChecked: false
            }))
          ]
        };
      } catch (err) {
        console.error(err);
        this.closeModal(null);
      }
    },
    async updateAgreement() {
      try {
        const { consentTimestamp } = await updateUserConsentsAgreement(this.consentType, { isAgreed: true });
        this.closeModal({
          consentType: this.consentType,
          isAgreed: true,
          consentTimestamp
        });
      } catch (err) {
        console.error(err);
      }
    },
    handleChangeAgreement(agreementIdx) {
      const checked = this.modalItem.agreements[agreementIdx].isChecked;
      const acc = this.$refs.agreementAccordion;
      if (checked) {
        acc.open(`agreement-${agreementIdx}`);
      }
    },
    handleClickAgreeBtn() {
      if (!this.isAllChecked) return;
      this.updateAgreement();
    },
    // 서명 초기화
    clearSignature() {
      this.option.isTips = true
      this.componentKey++
    },
    // 서명 저장
    saveSignature() {
      eventBus.$emit('save-signature')
      this.$emit('save')
      this.$emit('close')
    }
  },
  created() {
    this.getTerms();
  }
};
</script>

<style scoped lang="scss">
.hi-modal-common{
  ::v-deep{
    .modal__content{text-align: left;}
    .desc{font-size:14px; line-height: 1.6;}
  }
}

.esign-box-wrap{
  position: relative;
  p{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--gray-09);
  }
}

.sensitive-terms-modal {
  ::v-deep{
    .modal__layer{
      max-width: 520px;
      width: 100%;
      font-size: 15px;
      color: #1d1d1d;
    }
    .modal__content{text-align: left;}
    .desc{font-size:14px; line-height: 1.6;}
  }
  
  ::v-deep{
    .accordion__header{
      padding:0;
      .accordion__headerWrap{
        flex-grow: 1;
        .check-wrap{
          display: flex;
          width: 100%;
          label{
            padding: 19px 15px;
            width: 100%;
            > span{
              flex: 1;
              font-size: 15px;
              font-weight: 400;
              color: #1d1d1d;
              line-height: 1.5;
              white-space: nowrap;
              margin-left: 10px;
              >span{
                line-height: 1.5;
              }
            }
          }
        }
      }
      .accordion__arrow{
        min-width: 52px;
      }
    }
    .accordion__body {
      height: 143px;
      background: #f8f9fc;
      
      ol {
        margin: 0;
  
        > li {
          font-size: 14px;
          font-weight: 400;
          line-height: 1.5;
          color: #616161;
          margin: 0;
          &:not(:last-child) {
            margin-bottom: 6px;
          }
        }
      }
    }
  } 
}
</style>