<template>
  <button
    v-if="option.isShow"
    type="button"
    class="btn-bg-r"
    :class="{
      'btn-status-complete': model.applyStatus !== 'REJECT'
    }"
    @click="openClazzApplyRejectListPopup"
  >
    담임의견
  </button>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import {mapFields} from "vuex-map-fields";
import {eventBus} from "@/main";

export default {
  name: "worksheet-reject",
  props: {
    isManager: {
      type: Boolean,
      default() {
        return false
      }
    },
    model: {
      type: Object,
      required: true
    },
    formMode: {
      type: String,
      default() {
        return 'view'
      }
    }
  },
  data() {
    return {
      option: {
        isShow: false
      },
      resources: null,
      rejectMode: 'view',
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    ...mapFields({
      clazzApplyRejectList: 'clazzApplyRejectList'
    }),
  },
  watch: {
    'model.currentId'(val, oldVal) {
      if (oldVal === undefined && val) {
        this.searchResource()
      }
    }
  },
  created() {
    this.searchResource()
  },
  mounted() {
    eventBus.$on('refresh-apply-rejects', this.searchResource)
  },
  beforeDestroy() {
    eventBus.$off('refresh-apply-rejects', this.searchResource)
  },
  methods: {
    ...mapActions({
      openClazzApplyRejectList: 'openClazzApplyRejectList',
    }),
    openClazzApplyRejectListPopup() {
      switch (this.formMode) {
        case 'create':
          this.rejectMode = this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.CREATE
          break
        case 'update':
          this.rejectMode = this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.UPDATE
          break
        default:
          this.rejectMode = this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.LIST
      }

      const payload = {
        isOpen: true,
        isManager: this.isManager,
        mode: this.rejectMode,
        model: this.model,
      }
      this.openClazzApplyRejectList(payload)
    },
    // 담임의견 등록 여부 확인
    searchResource() {
      if (this.model.currentId) {
        const requestBody = {
          applyId: this.model.currentId
        }
        this.$hiClass.sheetRejects.readList(requestBody)
          .then(res => {
            this.resources = res.data
          })
          .then(() => {
            this.option.isShow = (this.resources._embedded
              ? this.resources._embedded.sheetRejects.length > 0
              : false
            )
          })
          .catch(err => {
            this.$log.warn(err)
          })
      }
    },

  }
}
</script>

<style scoped>
.btn-bg-r {
  background-color: #f9534b;
  color: #fff;
}
.btn-bg-r.dis {
  background: #dadde2;
  opacity: 0.5;
}
</style>