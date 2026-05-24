<template>
  <fragment>
    <div class="left-wrap">
      <div class="btn-wrap">
        <div class="btn-group">
          <!-- 하이클래스 안내문 -->
          <!-- <hc-manual-down class="btn-bg-w download icon" /> -->

          <!-- 알림장 전체 다운로드 -->
          <!-- <hc-all-note-down
            buttonClass="btn-bg-w download icon"
            :classId="items.clazz.currentId"
          >
            {{ $store.state.curClazzNote.name + ' 전체 다운로드' }}
          </hc-all-note-down> -->
          <div class="info-safe-wrap-2">
            <div class="words-setting" @click="openSafe">
              오늘의 안전수칙
              <i class="setting-blue"></i>
            </div>

            <div class="message-wrap">
              <template v-if="safeUseOn === false">
                <span class="message">안전 수칙 문구가 자동으로 랜덤하게 표기됩니다. 문구는 추가하거나 수정 하실 수 있습니다.</span>
              </template>

              <template v-else>
                <span class="message onMessage" v-if="safeMessage !== ''" @click="openSafeNoteEditor">{{ safeMessage }}</span>
                <span class="message noMessage" v-else @click="openSafeNoteEditor">등록된 문구가 없습니다.</span>
              </template>

              <i class="refresh" v-if="safeUseOn === true" @click="getSafeRandom"></i>
              <div class="hi-switch">
                <input type="checkbox" id="safe-use-on" v-model="safeUseOn">
                <label for="safe-use-on">
                    <span class="track"></span>
                </label>
              </div>
            </div>

            <div class="words-info-show" v-if="isWordsInfoShow === true">
              <div class="message-box">
                <span class="message">
                "오늘의 안전 수칙" 기능이 추가되었어요.<br/>
                버튼을 누르면 안전 수칙 문구가 랜덤으로 자동 표기 됩니다.
                  <!-- <br/>
                  <span class="warning">
                    주의! 최신 버전 앱에서만 해당 문구가 표시됩니다. (1.20.3 이상 업데이트 필요)
                  </span> -->
                </span>
                <i class="close" @click="wordsInfoShow"></i>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div class="right-wrap">
      <!-- prettier-ignore -->
      <div
        class="last-save-date"
        :class="{
          'is-over-post-content': isOverPostContent
        }"
      >
        입력 가능 글자 수: <span>{{ postContentCodeBytesWithCommas }}</span> / {{ $stringUtil.addCommas(edit.maxByte) }} byte
      </div>
      <div class="btn-wrap">
        <div class="btn-group">
          <button
            class="btn-bg-w2"
            :class="{ dis: isDisabledTemporaryButton }"
            :disabled="isDisabledTemporaryButton"
            @click="openConfirmModal('TEMPORARY')"
          >
            임시저장
          </button>
          <button
            class="btn-bg-c"
            :class="{ dis: isDisabledWriteButton }"
            :disabled="isDisabledWriteButton"
            @click="openConfirmModal('WRITE')"
          >
            {{ confirmButtonLabel }}
          </button>
        </div>
      </div>
    </div>
    <confirm-dialog 
      v-if="isLogout" 
      :title="confirmDialog.title" 
      :description="confirmDialog.description"
      :isOtherUse="true"
      :isAlert="true"
      @closeConfirmDialog="allLogout"
    />

    <safe 
      v-if="isSafeOpen"
      :mode="'NOTE'"
      :userIdFromNote="items.user.userID"
      @close="openSafe"
    />

    <safe-note-editor 
      v-if="isOpenSafeNoteEditor"
      :userIdFromNote="items.user.userID"
      :fromSafeMessage="safeMessage"
      :fromSafeCategorySelect="safeCategorySelect"
      @updateSafeMessage="updateSafeMessage"
      @close="openSafeNoteEditor"
    />
  </fragment>
</template>

<script>
import { eventBus } from '@/main'
import {mapFields} from "vuex-map-fields";
import {mapActions, mapState} from "vuex";

import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog'
import axios from "@/plugins/axios";
import Safe from "@/components/Safe/Safe"
import SafeNoteEditor from "@/components/Safe/SafeNoteEditor"

// const HcManualDown = () => ({
//   component: import('@/components/Form/HcManualDown'),
//   error: ErrorLoadFailAsyncComponent,
// })
// const HcAllNoteDown = () => ({
//   component: import('@/components/Form/HcAllNoteDown'),
//   error: ErrorLoadFailAsyncComponent,
// })

export default {
  name: 'note-board-footer',
  components: {
    ConfirmDialog,
    Safe,
    SafeNoteEditor
  },
  props: {
    option: {
      type: Object,
      required: true
    },
    items: {
      type: Object,
      required: true
    },
    model: {
      type: Object,
      required: true
    },
    postContentCode: {
      type: Object,
      required: true
    },
    isOverPostContent: {
      type: Boolean,
      required: true
    },
    isSendComplete: {
      type: Boolean,
      required: true
    },
    isReserve: {
      type: Boolean,
      required: true
    },
    isTemporary: {
      type: Boolean,
      required: true
    },
    isSave: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      confirmDialog : {
        title: '로그아웃 안내',
        description: '비밀번호 변경 또는 로그인 만료 등으로 인해\n로그아웃되었습니다.\n보안을 위해 <span style="color: #4778DE;">다시 로그인 해주세요.</span>'
      },
      safeUseOn: false,
      safeUpdateLoading: false,
      isWordsInfoShow: true,
      safeMessage: "",
      safeCategorySelect: {
        categoryId: ""
      },
      postOptions: [],
      currentId: "",
      isSafeOpen: false,
      isOpenSafeNoteEditor: false
    }
  },
  computed: {
    ...mapState({
      isLogout: 'isLogout',
      user: 'user'
    }),
    ...mapFields('storeEditor', {
      edit: 'edit'
    }),
    postContentCodeBytesWithCommas() {
      return this.$stringUtil.addCommas(this.postContentCode.bytes)
    },
    confirmButtonLabel() {
      let label = `${this.$store.state.curClazzNote.name} 보내기`

      if (this.isReserve) label = `${this.$store.state.curClazzNote.name} 예약하기`
      else if (this.isSendComplete) label = `${this.$store.state.curClazzNote.name} 수정하기`

      return label
    },
    /**
     * 올리기 버튼 비활성화
     */
    isDisabledWriteButton() {
      return this.isOverPostContent || !this.isSave
    },
    /**
     * 임시저장 버튼 비활성화
     */
    isDisabledTemporaryButton() {
      return !this.isTemporary || this.isOverPostContent || !this.isSave
    },
  },
  watch: {
    safeUseOn(v, o) {
      if(this.safeUpdateLoading === false) {
        localStorage.setItem("safeUseOn", JSON.stringify(v))
      }

      if(v === true && this.safeUpdateLoading === false) {
        this.getSafeRandom()
      }

      if(this.safeUpdateLoading === true) {
        this.safeUpdateLoading = false
      }

      if(v === true) {
        this.isWordsInfoShow = false
      }
    },
  },
  methods: {
    ...mapActions({
      isAllDeviceLogout: 'isAllDeviceLogout'
    }),
    async openConfirmModal(button) {
      const res = await this.isAllDeviceLogout(true)
      if(res) return false;

      const isOver = await this.isOverPostContentMaxByte()

      // 팝업 호출 전 본문 byte 체크
      if (isOver) {
        const editMaxByteWithCommas = this.$stringUtil.addCommas(
          this.edit.maxByte
        )
        alert(
          `${this.$store.state.curClazzNote.name}${this.$store.state.curClazzNote.suffix2} 최대 ${editMaxByteWithCommas} byte 까지 입력 가능 합니다.\n(한글 파일에서 복사-붙여넣기 할 경우, 실제 입력된 글자수보다 더 많이 입력된 것처럼 계산될 수 있습니다.)`

        )
        return false
      }

      this.option.modalComponent = 'NoteBoardConfirmModal'
      this.option.button = button

      this.model.pushUsed = true
      this.$nextTick(() => {
        // 알람보내기 팝업창 노출 시 에디터 포커스 아웃 시키기
        $('div.confirmModal')
          .attr('tabIndex', -1)
          .focus()
      })
    },
    isOverPostContentMaxByte() {
      return (new TextEncoder()).encode(this.postContentCode.html).length > this.edit.maxByte
    },
    /**
     * 문자열 바이트 계산 함수
     */
    getByteLength(s, b, i, c) {
      for (
        b = i = 0;
        (c = s.charCodeAt(i++));
        b += c >> 11 ? 4.5 : c >> 7 ? 2 : 1
      );
      return b
    },
    allLogout: function () {
      window.opener.location = '/logout'
      window.close()
    },
    wordsInfoShow() {
      this.isWordsInfoShow = !this.isWordsInfoShow
    },
    async getSafeRandom() {
      try {
        if(this.safeCategorySelect.categoryId === "") {
          const res = await axios({
            method: 'GET',
            url: `/safetyRoles/random?userId=${this.items.user.userID}`
          })

          this.safeMessage = res.data.message
        } else {
          const res = await axios({
            method: 'GET',
            url: `/safetyRoles/categories/${this.safeCategorySelect.categoryId}?userId=${this.items.user.userID}`
          })

          if(res.data._embedded) {
            const length = res.data._embedded.safeRoles.length
            const index = Math.floor(Math.random() * length)
            this.safeMessage = res.data._embedded.safeRoles[index].message
          } else {
            this.safeMessage = ""
            // this.$hiClass.alert('등록된 문구가 없습니다.', 'info')
          }
        }
      } catch(err) {
        this.$log.debug('safetyRoles random GET() error => ', err)
      }
    },
    initSafe() {
      if(this.currentId) {
        const obj = this.postOptions.find(v => v.name === "safetyRoles")
        if(!obj === false && obj.value !== "") {
          this.safeUpdateLoading = true
          const safetyRolesObj = this.postOptions.find(v => v.name === "safetyRoles")
          const categoryIdObj = this.postOptions.find(v => v.name === "categoryId")
          this.safeUseOn = true

          this.safeMessage = safetyRolesObj.value
          this.safeCategorySelect.categoryId = categoryIdObj.value
          
          if(this.safeCategorySelect.categoryId !== "") this.categoryCheck()
        } else {
          this.safeUseOn = false
        }
      } else {
        this.initRegSafe()
      }
    },
    initRegSafe() {
      const check = JSON.parse(localStorage.getItem("safeUseOn"))
      
      if(check === true) {
        this.safeUseOn = true
      } else {
        this.safeUseOn = false
      }
    },
    async categoryCheck() {
      try {
        const res = await axios({
          method: 'GET',
          url: `/safetyRoles/categories?userId=${this.items.user.userID}`
        })
       
        this.safeCategoryList = res.data._embedded.categories

        const obj = this.safeCategoryList.find(v => v.categoryId === this.safeCategorySelect.categoryId)
        if(!obj === true) {
          this.safeCategorySelect.categoryId = ""
        }
      } catch(err) {
        this.$log.debug('safetyRoles categories GET() error => ', err)
      }
    },
    initEventBus() {
      eventBus.$on('safe-set', (id, options) => {
        if(id !== '') {
          this.currentId = id
          this.postOptions = [...options]
        }
        this.initSafe()
      })
    },
    updateSafeMessage(item) {
      this.safeMessage = item.message
      this.safeCategorySelect.categoryId = item.categoryId
    },
    openSafe() {
      this.isSafeOpen = !this.isSafeOpen
    },
    openSafeNoteEditor() {
      this.isOpenSafeNoteEditor = !this.isOpenSafeNoteEditor
    }
  },
  mounted() {
    this.initEventBus()
    // console.log("isUpdate", this.isUpdate)

    // if(!this.model.currentId === false) {
    //   this.currentId = this.model.currentId
    //   this.postOptions = this.model.postOptions
    //   this.initSafe()
    // } else if(!this.isUpdate === true) {
    //   this.initSafe()
    // }
  },
}
</script>

<style scoped></style>
