<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="safeNoteEditorModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
        <div class="modal-cont-inner" 
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco">
          <div class="safe-editor-save-modal">

            <div class="container">
              <div class="title-wrap">
                <h2>오늘의 안전 수칙</h2>
              </div>

              <div class="content-wrap">
                <div class="select">
                  <div class="hi-selectbox"
                    :class="{
                      ' is-opened' : openSelectSafeCategory
                    }"
                    v-click-outside="closeSelectBox"
                  >
                    <button class="selected" @click="[openSelectSafeCategory = !openSelectSafeCategory]">{{ safeCategorySelect.categoryName }}</button>
                    <div class="option__layer">
                      <button class="option"
                        v-for="(safeCategory, idx) in safeCategoryList" :key="`safeCategory-${idx}`"
                        @click="selectSafeCategory(safeCategory)"
                      >
                        {{ safeCategory.categoryName }}
                      </button>
                    </div>
                  </div>
                  <button class="refresh-btn" @click="getSafeRandom">
                    다른문구
                    <i class="refresh"></i>
                  </button>
                </div>
                <div class="input">
                  <textarea v-model="safeMessage" @input="onChangeSafeMessage" maxlength="500" placeholder="등록된 문구가 없습니다."></textarea>
                </div>
              </div>

              <div class="btn-wrap">
                <button :class="{ dis: disabledWords}" :disabled="disabledWords"
                  @click="updateSafeMessage"
                >저장</button>
              </div>

              <div class="modal-close-btn" @click="close"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";

export default {
  name: "safe-note-editor",
  props: {
    userIdFromNote: String,
    fromSafeMessage: String,
    fromSafeCategorySelect: Object
  },
  data() {
    return {
      userId: "",
      safeCategoryList: [],
      safeMessage: "",
      safeCategorySelect: {
        categoryId: "",
        categoryType: "default",
        categoryName: "전체 카테고리"
      },
      openSelectSafeCategory: false,
      vcoConfig: {
        handler: this.handler,
        events: ['click'],
        // Note: The default value is true, but in case you want to activate / deactivate
        //       this directive dynamically use this attribute.
        isActive: true
      },
    }
  },
  computed: {
    disabledWords() {
      return !(this.safeMessage.trim().length > 0 && this.safeMessage !== this.fromSafeMessage)
    },
  },
  mounted() {
    this.userId = this.userIdFromNote
    this.initSafe()
  },
  methods: {
    initSafe() {
      this.getSafeCategoryList(this.fromSafeCategorySelect.categoryId)
      this.safeMessage = this.fromSafeMessage
      // this.getSafeRandom()
    },
    async getSafeCategoryList(categoryId = null) {
      try {
        const res = await axios({
          method: 'GET',
          url: `/safetyRoles/categories?userId=${this.userId}`
        })

        this.safeCategoryList = [
          {
            categoryId: "",
            categoryType: "default",
            categoryName: "전체 카테고리"
          },
          ...res.data._embedded.categories
        ]

        if(categoryId !== null) {
          const obj = this.safeCategoryList.find(v => v.categoryId === categoryId)
          this.safeCategorySelect = obj 
        }
      } catch(err) {
        this.$log.debug('safetyRoles categories GET() error => ', err)
      }
    },
    selectSafeCategory(item) {
      this.safeCategorySelect = item
      this.openSelectSafeCategory = false
      this.getSafeRandom()
    },
    async getSafeRandom() {
      try {
        if(this.safeCategorySelect.categoryId === "") {
          const res = await axios({
            method: 'GET',
            url: `/safetyRoles/random?userId=${this.userId}`
          })

          this.safeMessage = res.data.message
        } else {
          const res = await axios({
            method: 'GET',
            url: `/safetyRoles/categories/${this.safeCategorySelect.categoryId}?userId=${this.userId}`
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
    updateSafeMessage() {
      const opts = {
        cancelButtonText: '취소',
        reverseButtons: true
      }
      
      this.$hiClass.confirm('변경사항을 저장하시겠어요?', null, opts)
        .then(async() => {
          const obj = {
            categoryId: this.safeCategorySelect.categoryId,
            message: this.safeMessage
          }
          this.$emit("updateSafeMessage", obj)
          this.$emit("close")
        })
        .catch(() => {
          // this.$emit("close")
        })
    },
    close() {
      if(this.disabledWords === false) {
        const opts = {
          cancelButtonText: '취소',
          reverseButtons: true,
        }
      
        this.$hiClass.confirm('변경사항을 저장하시겠어요?', null, opts)
          .then(async() => {
            const obj = {
              categoryId: this.safeCategorySelect.categoryId,
              message: this.safeMessage
            }
            this.$emit("updateSafeMessage", obj)
            this.$emit("close")
          })
          .catch(() => {
            this.$emit("close")
          })
      } else {
        this.$emit("close")
      }
    },
    onChangeSafeMessage(event) {
      this.safeMessage = event.target.value
    },
    onVco() {
      // Modal in new Modal 대응
      const hiModalCommons = document.getElementsByClassName('hi-modal-common')
      if (hiModalCommons && hiModalCommons.length > 0)
          return false

      const modals = document.getElementsByClassName('modal')
      const sweetAlerts = document.querySelectorAll('.swal2-container')
      if (modals.length < 2 && sweetAlerts.length < 1)
          this.vcoConfig.isActive = true
    },
    offVco() {
      this.vcoConfig.isActive = false
    },
    handler(e) {
      this.$log.debug(
          `handler this.vcoConfig.isActive attendance => `,
          this.vcoConfig.isActive
      )

      if(this.vcoConfig.isActive === true) {
        this.close()
      }
    },
    closeSelectBox() {
      this.openSelectSafeCategory = false
    }
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 20px;
  z-index: 9999;
}
</style>