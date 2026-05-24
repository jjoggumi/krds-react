<template>
  <HiModal
    type="type01"
    size="md"
    @close="$emit('close')"
    :modalLayerStyle="{ 'max-width': '518px', width: '100%' }"
  >
    <template v-slot:heading>
      <slot name="title">
        서명하기
      </slot>
    </template>
    <template v-slot:content>
      <div class="txt-body-b3">
        <slot name="desc-before"></slot> 
      </div>
      <div class="esign-box-wrap mt-10" :class="{ hide: !option.isTips }">
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
      </div>   
      <div class="txt-body-b3">
        <slot name="desc-after">
          제출한 내용을 확인하였으며,<br>본 전자서명은 자필 서명과 동일한 효력을 가집니다.
        </slot>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="line-default" size="lg" @click="$emit('close')">취소</HiButton>
      <HiButton color="primary" size="lg" :disabled="option.isTips" @click="saveSignature">동의하고 서명하기</HiButton>
    </template>
  </HiModal>
</template>

<script>
import Signature from '@/components/Signature/Signature.vue'
import { eventBus } from '@/main'

export default {
  name: 'SignatureModal',
  components: {
    Signature
  },
  props: {},
  data() {
    return {
      option: {
        width: 454,
        height: 200,
        isTips: true
      },
      componentKey: 0
    }
  },
  watch: {},
  methods: {
    clearSignature() {
      this.option.isTips = true
      this.componentKey++
    },
    saveSignature() {
      eventBus.$emit('save-signature')
      this.$emit('save')
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.hi-modal-common{
  ::v-deep{
    h2.heading{
      text-align: left;
    }
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
</style>
