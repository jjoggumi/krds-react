<template>
  <modal-layout
    ref="modalLayout"
    :modal-name="'clazzApplyRejectList'"
    :key="componentKey"
    :class-list="{
      modal: ['common-modal', 'return-list-modal'],
      modalContWrap: [],
      modalCont: ['boundary-box'],
    }"
    @modal-close="onClickCancel"
  >
    <template v-slot:modalContInner>
      <div class="modal-cont-inner">
        <!-- mode: CREATE / LIST / UPDATE -->
        <div class="modal-title-wrap">
          <div class="title">{{ modalTitle }}</div>
        </div>

        <!-- mode: CREATE / UPDATE -->
        <div
          v-if="isManager && (isCreateMode || isUpdateMode)"
          class="textarea-wrap"
        >
          <textarea
            ref="modelContent"
            placeholder="의견을 작성해주세요."
            maxlength="250"
            v-model="model.content"
          ></textarea>
          <div class="count">
            <span>{{ model.content ? model.content.length : 0 }}</span>/<span>250</span>
          </div>
        </div>

        <div
          v-if="sheetRejects.length"
          class="return-box-list"
        >
          <div
            v-for="(sheetReject, index) of sheetRejects"
            :key="sheetReject.rejectSeq"
            class="item"
            :class="{
              'on': sheetReject.rejectSeq === updateModel.rejectSeq
            }"
          >
            <p class="info">
              <span>
                {{
                  sheetReject.insertedTimestamp
                    ? $moment(sheetReject.insertedTimestamp).format('YYYY.MM.DD HH:mm')
                    : '?'
                }}
              </span>
              <span>{{ sheetReject.userName + getUserNameSuffix(sheetReject) }}</span>
              <span v-if="sheetReject.isUpdated">({{ $t('message.updated') }})</span>
            </p>
            <p class="text">{{ sheetReject.content }}</p>
            <div class="right-wrap">
              <button
                v-if="isShowUpdateButton(sheetReject, index)"
                class="btn-bg-c"
                @click.stop="onClickUpdate(sheetReject)"
              >
                {{ $t('button.update') }}
              </button>
            </div>
          </div>
        </div>

        <!-- mode: CREATE / UPDATE -->
        <div
          v-if="isManager && (isCreateMode || isUpdateMode)"
          class="btn-wrap"
        >
          <button
            class="btn-bg-w"
            @click="onClickCancel"
          >
            {{ $t('button.cancel')}}
          </button>
          <button
            class="btn-bg-c"
            :class="{
              dis: !model.content
            }"
            :disabled="!model.content"
            @click="onClickSave"
          >
            {{ $t('button.save')}}
          </button>
        </div>

        <!-- mode: LIST -->
        <div
          v-else
          class="btn-wrap"
        >
          <button
            class="btn-bg-c"
            @click="close"
          >
            {{ $t('button.ok')}}
          </button>
        </div>

      </div>
    </template>
  </modal-layout>
</template>

<script>
import {mapFields} from "vuex-map-fields";
import ModalLayout from "@/components/Modal/ModalLayout";
import {mapGetters} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "clazz-apply-reject-list",
  components: {ModalLayout},
  data() {
    return {
      componentKey: 0,
      model: {
        clazzApplyId: null,
        content: null
      },
      updateModel: {},
      resources: null,
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapFields({
      clazzApplyRejectList: 'clazzApplyRejectList'
    }),
    isCreateMode() {
      return this.mode === this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.CREATE
    },
    isListMode() {
      return this.mode === this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.LIST
    },
    isUpdateMode() {
      return this.mode === this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.UPDATE
    },
    isManager() {
      return this.clazzApplyRejectList.isManager
    },
    mode() {
      return this.clazzApplyRejectList.mode
    },
    modalTitle() {
      let modalTitle = '담임의견'
      if (this.isCreateMode)
        modalTitle += ' ' + this.$t('register')
      else if (this.isUpdateMode)
        modalTitle += ' ' + this.$t('update')

      return modalTitle
    },
    sheetRejects() {
      return this.resources && this.resources._embedded && this.resources._embedded.sheetRejects
        ? this.resources._embedded.sheetRejects
        : []
    },
  },

  watch: {
    'model.content'(val, oldVal) {
      if (oldVal && !val) {
        this.clazzApplyRejectList.mode = this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.CREATE
        this.updateModel = {}
      }
    }
  },

  created() {
    this.initComponentModel()
    this.searchResource()
  },
  beforeDestroy() {
    this.initStoreModel()
  },
  methods: {
    isShowUpdateButton(sheetReject, index) {
      return this.isManager && (this.isCreateMode || this.isUpdateMode) && index === 0
        && !this.updateModel.rejectSeq
    },
    close() {
      this.clazzApplyRejectList.isOpen = false
    },
    updateParents() {
      eventBus.$emit('clazz-application-form-updateProc')
      eventBus.$emit('worksheet-apply-saveProc')
      eventBus.$emit('refresh-apply-rejects')
    },
    initStoreModel() {
      this.clazzApplyRejectList.mode = null
      this.clazzApplyRejectList.clazzApplyId = null
    },
    initComponentModel() {
      this.model.clazzApplyId = this.clazzApplyRejectList.clazzApplyId
    },

    getUserNameSuffix(sheetReject) {
      return sheetReject.userType === this.CONSTANTS.USER_TYPE.TEACHER
        ? ' ' + this.$t('userType.teacher')
        : ''
    },

    createResource() {
      /* todo: loading check */
      this.$hiClass.sheetRejects.create(this.model)
        .then(res => {
          this.$set(this, 'model', res.data)
        })
        .then(() => {
          this.$hiClass.alert('담임 의견 저장되었습니다.', 'success')
            .then(() => {
              this.updateParents()
              this.close()
            })
        })
        .catch(err => {
          this.$hiClass.alert(err)
        })
    },

    updateResource() {
      /* todo: loading check */
      const requestBody = {
        rejectSeq: this.updateModel.rejectSeq,
        content: this.model.content
      }
      this.$hiClass.sheetRejects.update(requestBody)
        .then(() => {
          this.$hiClass.alert('담임 의견 수정되었습니다.', 'success')
            .then(() => {
              this.updateParents()
              this.close()
            })
        })
        .catch(err => {
          this.$hiClass.alert(err)
        })
    },

    searchResource() {
      const requestBody = {
        applyId: this.clazzApplyRejectList.clazzApplyId
      }
      this.$hiClass.sheetRejects.readList(requestBody)
        .then(res => {
          this.resources = res.data
        })
        .finally(() => {
          this.$refs.modalLayout.initModalPosition()
          this.componentKey++
        })
    },

    onClickSave() {
      this.isCreateMode ? this.createResource() : this.updateResource()
    },

    onClickCancel() {
      if (this.isManager && (this.isCreateMode || this.isUpdateMode)) {
        this.updateParents()
      }
      this.close()
    },

    onClickUpdate(sheetReject) {
      this.clazzApplyRejectList.mode = this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.UPDATE
      this.model.content = sheetReject.content
      this.updateModel = sheetReject
      this.$refs.modelContent.focus()
    },

  }
}
</script>

<style lang="scss" scoped>
.return-list-modal {
  z-index: 10000;
  ::v-deep .modal-cont-wrap {
    .boundary-box {
      width: 510px;
    }
  }
  .return-box-list {
    overflow-y: auto;
    max-height: 300px;
    margin: 0 30px 20px;
    .item {
      position: relative;
      background-color: #f1f4fc;
      padding: 20px;
      border-radius: 4px;
      &:not(:first-of-type) {
        margin-top: 10px;
      }
      &.on {
        background-color: #d9ddeb;
        .text {
          color: #232323;
        }
      }
    }
    .info {
      font-size: 0;
      text-align: left;
      padding-right: 30px;
      span {
        color: #232323;
        font-size: 16px;
        margin-right: 5px;
      }
    }
    .text {
      color: #888;
      font-size: 16px;
      text-align: left;
      line-height: 1.4;
      white-space: pre-line;
      margin-top: 10px;
    }
    .right-wrap {
      position: absolute;
      right: 10px;
      top: 10px;
      &[class*="btn-bg"] {
        font-size: 13px;
        padding: 5px;
        border-radius: 5px;
      }
    }
  }
  &.common-modal {
    .textarea-wrap {
      margin-bottom: 20px;
      textarea {
        height: 100px;
      }
      .count {
        font-size: 12px;
        text-align: right;
        margin: 10px;
      }
    } 
  }
}
</style>