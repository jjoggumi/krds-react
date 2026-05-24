<template>
  <HiModal type="type01" size="sm" @close="$emit('close', false)">
    <template v-slot:heading>
      문자로 초대장을 보내시겠습니까?
    </template>
    <template v-slot:content>
      <div class="textbox txt-left">
        <strong class="txt-primary">초대 문자 내용</strong>
        <div class="desc">발신번호 : 1811-0910
          <br>
          <br>
          초대장<br>
          [WEB발신]<br>
          {{ clazzes.className }}(로)으로 초대합니다.<br>
          초대코드를 입력하여 바로 가입하세요!<br>
          초대코드 : {{ clazzes.classInviteCode }}<br>
          링크 : {{ inviteUrl }}
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton
          color="line-light-primary"
          size="lg"
          @click="send(false)"
          :disabled="isDimLoading"
      >
        전체 보내기
      </HiButton>
      <HiButton
          color="primary"
          size="lg"
          @click="send(true)"
          :disabled="!isExistsNonSubscribers || isDimLoading"
      >
        미가입자만 보내기
      </HiButton>
    </template>
  </HiModal>
</template>

<script>
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
import {mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";
const errorManager = useClassErrorManager();

export default {
  name: "confirm-sms-invite",
  data() {
    return {
      isExistsNonSubscribers: false
    }
  },
  props: {
    clazzes: {
      type: Object
    },
    regType: {
      type: String
    },
    sendTargets: {
      type: Array
    }
  },
  computed: {
    ...mapFields(['isDimLoading']),
    inviteUrl() {
      return `${process.env.VUE_APP_BASE_UI_URI}/mobile/invite/clazzInviteCard?classId=${this.clazzes.currentId}&inviteCode=${this.clazzes.classInviteCode}`
    }
  },
  mounted() {
    this.checkNonSubscribers()
  },
  methods: {
    ...mapActions('storeClazzTag', ['fetchTags']),
    async send(isSendNonSubscriber) {
      try {
        this.isDimLoading = true
        this.regType === 'BATCH' ?
            await this.sendBatch(isSendNonSubscriber) :
            await this.sendSingle(isSendNonSubscriber)
        this.$toasted.show('무료 문자로 초대장 발송이 완료되었습니다.')
        if (this.regType === 'BATCH') {
          await this.fetchTags(this.clazzes.currentId)
        }
      } catch (err) {
        errorManager.showErrorMsg('CLASS_INVITE', err)
      } finally {
        this.isDimLoading = false
        this.$emit('close', true)
      }
    },
    getMobileNumbers() {
      return this.sendTargets
          .flatMap(target => this.regType === 'BATCH' ? [target.mobile1, target.mobile2, target.mobile3] : [target.mobile1])
          .filter(mobile => mobile !== null && mobile.trim() !== '')
          .map(mobile => mobile.replaceAll('-', ''))
    },
    async checkNonSubscribers() {
      try {
        const mobileNumbers = this.getMobileNumbers()
        const res = await this.$axios.post(`/clazzes/${this.clazzes.currentId}/invite-cards/existsNonSubscribers`, { mobileNumbers })
        this.isExistsNonSubscribers = res.data
      } catch (err) {
        errorManager.showErrorMsg('CLASS_INVITE', err)
      }
    },
    async sendBatch(isSendNonSubscriber) {
      const sendTargets = this.sendTargets.map(target => {
        const mobileNumbers = [target.mobile1, target.mobile2, target.mobile3]
            .filter(mobile => mobile !== null && mobile.trim() !== '')
            .map(mobile => mobile.replaceAll('-', ''))

        return {
          tagName: target.tagName,
          studentName: target.studentName,
          studentNo: target.studentNo,
          mobileNumbers
        }
      })

      return await this.$axios.post(`/clazzes/${this.clazzes.currentId}/invite-cards`, {isSendNonSubscriber, sendTargets })
    },
    async sendSingle(isSendNonSubscriber) {
      const mobileNumbers = this.getMobileNumbers()
      return await this.$axios.post(`/clazzes/${this.clazzes.currentId}/invite-cards/sms`, {isSendNonSubscriber, mobileNumbers })
    }
  }
}
</script>

<style scoped lang="scss">
.hi-modal-common{
  ::v-deep .modal__content{
    padding:16px 30px 40px;
    .textbox{
      border-radius: 10px;
      padding:20px;
      strong{
        font-size:14px;
      }
      .desc{ 
        line-height: 1.5;
        font-size:14px;
        color:#616161;
        font-weight: 400;
        word-break: break-all;
      }
    }
  }
}
</style>