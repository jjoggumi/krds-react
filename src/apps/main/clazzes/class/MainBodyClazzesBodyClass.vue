<template>
  <div
    v-if="clazzes.currentId && isManager"
    :clazzes="clazzes"
  >
    <div class="page-sub-heading">
      <h3 class="heading">수업관리 설정</h3>
    </div>
    
    <div class="admin-option__box setting">
      <div class="box">
        <div class="heading-sub">
          <strong>설정</strong>
        </div>

        <div class="admin-option setting">
          <!-- 학교양식 신청서 -->
          <div class="admin-option__item" :class="{'is-active': clazzes.applyUsed}">
            <div class="option__heading setting">
              <strong>학교양식 신청서</strong>
              <p class="desc ft-blue">체험학습, 결석, 투약 등의 온라인 양식 발송 및 수합 기능</p>
            </div>
            <div class="option">
              <hi-switch
                :model.sync="clazzes.applyUsed"
                :disabled="!isClassActivated"
              />
            </div>
          </div>
        </div>

        <div class="admin-option setting">
          <div class="admin-option__item" :class="{'is-active': curClassItem.attendanceUsed}">
            <div class="option__heading setting">
              <strong>출결 알리기</strong>
              <p class="desc ft-blue">결석, 조퇴, 지각, 외출 등 출결 관리 기능</p>
            </div>
            <div class="option">
              <hi-switch
                  :model.sync="tempAttendanceUsed"
                  :disabled="!isClassActivated"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<script>

import HiSwitch from "@/components/Form/HiSwitch.vue";
import {mapMutations, mapState, mapActions} from "vuex";
import {eventBus} from "@/main";

export default {
  name: 'main-body-clazzes-body-class',
  components: {HiSwitch},
  props: {
    clazzes: {
      type: Object,
      required: true
    },
    isManager: {
      type: Boolean
    },
    isClassActivated: {
      type: Boolean
    },
  },
  data() {
    return {
      tempAttendanceUsed: true
    }
  },
  computed: {
    ...mapState({
      isLoading: 'isLoading',
      curClassItem: 'curClassItem'
    })
  },
  watch: {
    'clazzes.applyUsed'() {
      this.updateClazzes('applyUsed')
    },
    tempAttendanceUsed (newVal) {
      if (newVal) {
        this.openModal()
      } else {
        this.curClassItem.attendanceUsed = newVal
        this.updateClazzes('attendanceUsed')
      }
    },
  },
  beforeMount() {
    this.checkClassMenuEntryPermission({
      isManager: this.isManager
    })
  },
  mounted() {
    eventBus.$on('set-temp-attendance-used', attendanceUsed => this.setTempAttendanceUsed(attendanceUsed))
    this.setTempAttendanceUsed(this.curClassItem.attendanceUsed)
    this.reloadClassInfo()
  },
  beforeDestroy() {
    eventBus.$off('set-temp-attendance-used')
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading'
    }),
    ...mapMutations('storeClazzes', {
      setIsShowAttendanceConfirmUseModal1: 'setIsShowAttendanceConfirmUseModal1',
      setIsShowAttendanceConfirmUseModal2: 'setIsShowAttendanceConfirmUseModal2',
    }),
    ...mapActions('storeBoard', {
      checkClassMenuEntryPermission: 'checkClassMenuEntryPermission',
    }),
    async reloadClassInfo() {
      /**
       * 클래스 세팅이 외부 요인으로 변경되었을 경우 갱신함
       * @type {*}
       */
      const clazz = await (
        this.$hiClass.clazzes.read(this.clazzes)
          .then(res => res.data || {})
      )
      for (const [key, value] of Object.entries(clazz))
        this.clazzes[key] = value
    },
    updateClazzes(settingKey) {
      if (!this.isLoading) {
        this.setIsLoading(true)

        if (!this.isClassActivated) {
          this.$hiClass.alert('비공개된 클래스입니다.<br>설정을 변경할 수 없습니다.', 'warning')
          this.setIsLoading(false)
          return false
        }
        if (!this.isManager) {
          this.$hiClass.alert('설정 변경 권한이 없습니다.', 'warning')
          this.setIsLoading(false)
          return false
        }

        const params = {}
        params[settingKey] = this.clazzes[settingKey]

        /**
         * 데이터 변경이 종료된 후 PATCH
         */
        this.$nextTick(() => {
          this.$hiClass.clazzes.update(params, `/clazzes/${this.clazzes.currentId}`)
            .then(() => {
              localStorage.setItem('isChangedClassSettings', 'true')
            })
            .catch(error => {
              this.$log.debug(error)
            })
            .finally(() => {
              this.setIsLoading(false)
            })
        })
      }
    },
    async openModal() {
      let hasStudentList = false

      const res = await this.$axios({
        methods: 'GET',
        url: `/clazzStudents/clazz/${this.clazzes.currentId}/exists`
      })

      hasStudentList = res.data.exists
      if (hasStudentList) {
        this.setIsShowAttendanceConfirmUseModal1(true)
      } else {
        this.setIsShowAttendanceConfirmUseModal2(true)
      }
    },
    setTempAttendanceUsed(attendanceUsed) {
      this.tempAttendanceUsed = attendanceUsed
    }
  }
}
</script>

<style scoped></style>
