<!--
@File(Method): worksheetApplyHeader.vue
@Description: 클래스 > 수업관리 > 학교양식 신청서 > 제출내역 탭 > 워크시트상단
@Modified: 2025-07-10 - #80796 학교양식신청서 결재 방식 수정
-->
<template>
  <div class="worksheet-header">
    <h1 class="title">{{ title }}</h1>
    <div class="left">

      <template v-if="isDetail">
        <div class="select-wrap">
          <!-- todo: 워크시트 2차 개발 건 -->
          <!--  <button
            class="btn-bg-w btn-download"
            @click="option.isShowDownloadPopup = !option.isShowDownloadPopup"
          >
            PDF 다운로드
          </button>-->
          <ul
            v-if="option.isShowDownloadPopup"
            class="select-list"
            v-click-outside="closeDownloadPopup"
          >
            <li class="item">
              <button
                type="button"
                @click="onClickPdfDownload"
              >
                신청서 PDF로 내려받기
              </button>
            </li>
            <!--<li class="item"><button type="button">전체파일 내려받기</button></li>-->
          </ul>
        </div>
        <HiButton outline color="default" size="md" bitrounded @click="onClickPrint" class="left-btn">
          <HiIcon name="ico-printer-thin" color="#444" size="18"></HiIcon>
          인쇄
        </HiButton>
        <HiButton outline color="default" size="md" bitrounded @click="onClickPdfDownload" class="left-btn">
          <HiIcon name="ico-document-pdf" color="#444" size="18"></HiIcon>
          다운로드
        </HiButton>
        <HiButton outline color="default" size="md" bitrounded @click="controlHitalkShareModal(true)" class="left-btn">
          <HiIcon name="ico-hitalkshare" color="#444" size="18"></HiIcon>
          하이톡 공유
        </HiButton>
      </template>

      <template v-if="isModify">
        <worksheet-apply-upload
          :files.sync="curClazzApply.model.files"
          :isUpload.sync="option.isUpload"
          :isReadonly="isReadonlyApply"
        />
        <button
          class="btn-bg-c"
          @click="worksheetApplyInfo.isOpen = !worksheetApplyInfo.isOpen"
        >
          신청서 정보 변경
        </button>
      </template>

    </div>
    <div class="right">



      <hc-select
        v-if="curClazzApply.isMemberRoleManager && !isApplyStatusTemp"
        :model.sync="curClazzApply.model.applyStatus"
        selectLabel="name"
        selectValue="code"
        defaultLabel="승인상태"
        :isFocusMode="false"
        :isUseAll="false"
        :item="$constants.CLASS_APPLY.applyStatus"
        :scrollbarType="1"
      />

      <span
          v-else-if="isDetail || isModifyMemberRoleMember  || isApplyStatusTemp"
          class="status"
          :class="[applyStatusClass]"
      >
        {{ applyStatusName }}
      </span>

      <worksheet-reject
        v-if="isDetail"
        :is-manager="curClazzApply.isMemberRoleManager"
        :model="curClazzApply.model"
        :form-mode="mode"
      />

      <template v-if="isUpdateApplyStatus && isShowSaveButton">
        <button
            class="btn-bg-c"
            @click="onClickStatusSave"
        >
          저장
        </button>
      </template>

      <button
        v-else-if="isShowSaveButton"
        class="btn-bg-c"
        :class="{
          dis: option.isUpload
        }"
        @click="onClickSave"
      >
        {{ saveButtonTitle }}
      </button>

      <button class="btn-close" @click="onClickClose"></button>
    </div>

    <template v-if="isModify || isDetail">
      <worksheet-apply-upload-list
        v-if="option.isUpload || curClazzApply.model.files.length > 0"
        :files.sync="curClazzApply.model.files"
        :isReadonly="isDetail || isReadonlyApply"
      />
    </template>

    <!-- 하이톡 공유하기 모달 -->
    <hitalk-share-modal
        v-if="hitalkShareIsOpen"
        :post="curClazzApply.model"
        :postType="postType"
        :curClassId="classId"
        :shareBtnType="shareBtnType"
        @controlHitalkShareModal="controlHitalkShareModal"
    >
    </hitalk-share-modal>

    <!-- 하이톡 공유하기 완료한 후 하이톡 창 오픈 -->
    <open-popup
        v-if="$store.state.openPopup.path"
        :key="`open-popup-${$store.state.openPopup.path}`"
        :path="$store.state.openPopup.path"
        :windowId="$store.state.openPopup.id"
        :type="$store.state.openPopup.type"
        :size="$store.state.openPopup.size"
        :params="$store.state.openPopup.params"
    />
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex'
import {mapFields} from 'vuex-map-fields'
import WorksheetApplyUpload from '@/components/Upload/WorksheetApply/WorksheetApplyUpload'
import WorksheetApplyUploadList from '@/components/Upload/WorksheetApply/WorksheetApplyUploadList'
import HcSelect from '@/components/Form/HcSelect'
import WorksheetReject from "@/components/Button/WorksheetReject";
import HitalkShareModal from "@/components/HitalkShare/HitalkShareModal";
import openPopup from "@/components/Popup/openPopup";
import {updateClazzApplyStatus, updateMedicationOrderStatus} from "@hiclass/core";
import {eventBus} from "@/main";

export default {
  name: "worksheet-apply-header",
  components: {WorksheetReject, HcSelect, WorksheetApplyUploadList, WorksheetApplyUpload, HitalkShareModal, openPopup},
  props: {
  },
  data() {
    return {
      option: {
        isUpload: false,
        isShowDownloadPopup: false
      },
      isUpdatingApplyStatus: false,
      prevRoute: null,
      shareBtnType: 'classApply',
      hitalkShareIsOpen: false,
      postType: 'CLASS_APPLY',
      isUpdateApplyStatus: false,
    }
  },
  watch: {
    async 'curClazzApply.model.applyStatus'(_, oldVal) {
      if (!this.isUpdateApplyStatus && oldVal) {
        this.isUpdateApplyStatus = true
      }
    }
  },
  computed: {
    ...mapState({
      user: 'user',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getApplyStatusNameByCode: 'getApplyStatusNameByCode',
    }),
    ...mapGetters('storeWorksheet', {
      clazzApplyComponentsByCode: 'clazzApplyComponentsByCode',
      curClazzApplyCode: 'curClazzApplyCode',
    }),
    ...mapFields({
      isDimLoading: 'isDimLoading'
    }),
    ...mapFields('storeWorksheet', {
      curClazzApply: 'curClazzApply',
      worksheetApplyInfo: 'worksheetApplyInfo',
    }),
    classGradeBan() {
      const classInfo = this.curClazzApply.classInfo
      const classGrade = classInfo.classGrade !== 'ANY'
        ? `${classInfo.classGrade || '?'}학년`
        : ''
      const classBan = `${classInfo.classBan || '?'}`
      return classGrade ? classGrade + ' ' + classBan : classBan
    },
    classId() {
      return this.curClazzApply.classInfo.currentId
    },
    isDetail() {
      return this.curClazzApplyCode === this.CONSTANTS.WORKSHEET_APPLY.DETAIL
    },
    isModify() {
      return this.curClazzApplyCode === this.CONSTANTS.WORKSHEET_APPLY.MODIFY
    },
    mode() {
      let mode = 'update'

      if (this.isDetail)
        mode = 'view'

      return mode
    },
    isCheckRejectReason() {
      return this.curClazzApply.model.applyStatus === 'REJECT'
    },
    isModifyMemberRoleManager() {
      return this.isModify && this.curClazzApply.isMemberRoleManager
    },
    isModifyMemberRoleMember() {
      return this.isModify && !this.curClazzApply.isMemberRoleManager
    },
    isReadonlyApply() {
      let isReadonlyApply = false
      const isDetailAndModify = this.isDetail || this.isModify

      if (isDetailAndModify && !this.curClazzApply.isMemberRoleManager) {
        switch (this.curClazzApply.model.applyStatus) {
          case this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.COMPLETE:
            isReadonlyApply = true
            break
        }
      }

      return isReadonlyApply
    },
    isApplyStatusTemp() {
      return this.curClazzApply.model.applyStatus === this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.TEMP
    },
    isShowSaveButton() {
      let isShowSaveButton = false
      const isDetailAndModify = this.isDetail || this.isModify

      if (isDetailAndModify) {

        // 상세, 수정 페이지에서 선생님 권한이라면 항상 보임
        if (this.curClazzApply.isMemberRoleManager) {
          isShowSaveButton = true

        } else {
          // 상세, 수정 페이지에서 회원 권한이라면 일부 보임
          switch (this.curClazzApply.model.applyStatus) {
            case this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.TEMP:
            case this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.UNIDENTIFIED:
            case this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.REJECT:
              isShowSaveButton = true
              break
          }

        }

      }

      return isShowSaveButton
    },
    title() {
      let title = ''
      switch (this.curClazzApplyCode) {
        case this.CONSTANTS.WORKSHEET_APPLY.CREATE:
          title = this.curClazzApply.model.id ? '신청서 수정하기' : '신청서 작성하기'
          break
        case this.CONSTANTS.WORKSHEET_APPLY.DETAIL:
          title = this.classGradeBan
          break
        case this.CONSTANTS.WORKSHEET_APPLY.MODIFY:
          title = this.classGradeBan
          break
      }
      return title
    },
    saveButtonTitle() {
      return this.isDetail ? '수정' : '저장'
    },
    applyStatusName() {
      let applyStatusName = '?'
      switch (this.curClazzApply.model.applyStatus) {
        case 'TEMP':
          applyStatusName = '미확인'
          break
        default:
          applyStatusName = this.getApplyStatusNameByCode({ code: this.curClazzApply.model.applyStatus })
      }
      return applyStatusName
    },
    applyStatusClass() {
      let applyStatusClass = ''
      switch (this.curClazzApply.model.applyStatus) {
        case this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.REJECT:
          applyStatusClass = 'txt-warning'
          break
        case this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.COMPLETE:
          applyStatusClass = 'txt-primary'
          break
        default:
          applyStatusClass = 'txt-gray'
      }
      return applyStatusClass
    }
  },
  beforeRouteEnter(to, from, next) {
    alert(from)
    next(vm => {
      vm.prevRoute = from
    })
  },
  methods: {
    ...mapActions('storeHitalk', {
      connectStompClient:'connectStompClient',
      disconnectStompClient: 'disconnectStompClient',
      callChatUserList: 'callChatUserList',
      callChatRooms: 'callChatRooms'
    }),
    ...mapActions({
      openClazzApplyRejectList: 'openClazzApplyRejectList',
      callClazzApplyConfirmPush: 'callClazzApplyConfirmPush',
    }),
    ...mapActions('storeWorksheet', {
      initCurClazzApply: 'initCurClazzApply',
    }),
    onClickClose() {
      if (this.isDetail) {
        this.goBack()

      } else {
        this.$hiClass.confirm('작성 중인 내용이 있습니다.<br>저장하지 않고 돌아가시겠습니까?')
          .then(() => {
            this.goBack()
          })
      }
    },
    onClickSave() {
      if (this.option.isUpload) {
        this.$hiClass.alert('업로드 중인 파일이 있습니다.<br>완료 후 저장해 주세요.', 'warning')
        return false
      }

      const buttonType = this.isModify ? this.CONSTANTS.BUTTON.SAVE : this.CONSTANTS.BUTTON.UPDATE
      this.$emit('is-click', buttonType)
    },
    async onClickStatusSave() {
      await this.updateApplyStatus()
      this.isUpdateApplyStatus = false
    },
    onClickPrint() {
      this.$emit('is-click', this.CONSTANTS.BUTTON.PRINT)
    },
    onClickPdfDownload() {
      this.isDimLoading = true
      this.$emit('is-click', this.CONSTANTS.BUTTON.PDF_DOWNLOAD)
      this.closeDownloadPopup()
    },
    async updateApplyStatus(isRejectPass = false) {
      try {
        if (!isRejectPass && this.curClazzApply.isMemberRoleManager && this.isCheckRejectReason) {
          this.checkRejectReason()
          return
        }

        await updateClazzApplyStatus(this.curClazzApply.model.id, this.curClazzApply.model.applyStatus)

        this.$toasted.clear()
        this.$toasted.show('저장되었습니다.')
        eventBus.$emit('refresh-worksheet')
      } catch (e) {
        console.log(e)
        this.$hiClass.alert(`상태 변경에 실패하였습니다. 다시 시도해주세요.`, "error")
      }
    },
    closeDownloadPopup() {
      this.option.isShowDownloadPopup = false
    },
    goBack() {
      if (this.prevRoute) {
        this.prevRoute
      } else {
        const routePath = `/main/clazzes/${this.classId}/form/applyList`
        this.$router.replace(routePath, () => {})
      }
    },
    async controlHitalkShareModal(flag) {
      if (flag) {
        await this.connectStompClient()
        await this.callChatUserList()
        await this.callChatRooms({ force: true })

        this.hitalkShareIsOpen = flag

      } else {
        await this.disconnectStompClient()
        this.hitalkShareIsOpen = flag
      }
    },   
    // #80796 학교양식신청서 결재 방식 수정 - 임의 토스트 추가  
    noti(){
      this.$toasted.clear();
      this.$toasted.show('저장되었습니다..', {
      duration: 2000,
      className: "type01",
    });
    },
    openClazzApplyRejectListPopup(mode) {
      const payload = {
        isOpen: true,
        isManager: this.curClazzApply.isMemberRoleManager,
        mode: mode,
        model: this.curClazzApply.model,
      }
      this.openClazzApplyRejectList(payload)
    },
    checkRejectReason() {
      // 담임 의견 추가 등록
      this.$log.debug(`this.isCheckRejectReason => `, this.isCheckRejectReason)

      const opts = {
        cancelButtonText: '그대로 저장',
        reverseButtons: true
      }
      this.$hiClass.confirm('담임 의견을 추가로 등록하시겠습니까?', null, opts)
          .then(() => {
            this.openClazzApplyRejectListPopup(this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.CREATE)
          })
          .catch(() => {
            this.updateApplyStatus(true)
          })
    },
  }
}
</script>

<style scoped>
.left-btn {
  background-color: transparent;
  margin-right: 8px;
}
</style>