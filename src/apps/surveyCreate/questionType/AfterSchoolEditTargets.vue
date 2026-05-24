<template>
  <div class="option__item">
    <strong
      class="option__heading"
      :class="['required']"
    >
      수업대상
    </strong>

    <div class="option">
      <hi-select-box
        :value.sync="selectSchoolType"
        :default-value="CONSTANTS.SCHOOL_TYPE.ELEMENTARY"
        :items="schoolTypeItems"
        :disabled="disabled"
      />

      <span class="text-refer">*신청자에게 수업 대상에 해당하는 과목만 노출됩니다.</span>
      <div class="group-checkbox">
        <hi-check-box
          v-for="gradeNumber of gradeCount[selectSchoolType]"
          :key="`class-grade-model-${gradeNumber}`"
          :model.sync="classGradeModel"
          :item="{
            title: `${gradeNumber}학년`,
            value: `${gradeNumber}`
          }"
          :disabled="disabled"
        />

        <div
          v-if="gradeCount[selectSchoolType] > 0"
          class="checkbox brackets"
        >
          <input
            type="checkbox"
            :id="`${componentUUID}-class-grade-model-all`"
            :name="`${componentUUID}-class-grade-model-all`"
            :checked="isCheckedClassGradeModelAll"
            :disabled="disabled"
            @change="toggleClassGradeModelAll"
          >
          <label :for="`${componentUUID}-class-grade-model-all`">
            <span>전체</span>
          </label>
        </div>

      </div>
    </div>
  </div>

</template>

<script>
import {mapGetters} from "vuex";
import HiSelectBox from "@/components/Form/HiSelectBox.vue";
import HiCheckBox from "@/components/Form/HiCheckBox.vue";
import {v4 as uuidv4} from "uuid";

export default {
  name: "survey-create-question-type-after-school-edit-targets",
  components: {HiCheckBox, HiSelectBox},
  props: {
    propAfterSchoolTargets: {
      type: Array
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      schoolTypeItems: [],

      /**
       * afterSchoolTargets: [
       * {
       *   "schoolType" : "ELEMENTARY",
       *   "classGrade" : "E1"
       * },
       * {
       *   "schoolType" : "ELEMENTARY",
       *   "classGrade" : "E2"
       * },
       * ...
       * ]
       */
      selectSchoolType: null,
      classGradeModel: [],

      gradeCount: {
        KINDERGARTEN: 0,
        ELEMENTARY: 6,
        MIDDLE: 3,
        HIGH: 3,
        SPECIAL: 6,
        UNIVERSITY: 4,
        NONE: 0,
      },

      componentUUID: null
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isCheckedClassGradeModelAll() {
      return this.classGradeModel.length === this.gradeCount[this.selectSchoolType]
    },
  },
  watch: {
    selectSchoolType() {
      this.classGradeModel.splice(0)
    }
  },
  beforeMount() {
    this.initAfterSchoolTargets()
    this.componentUUID = uuidv4()
  },
  mounted() {},
  methods: {
    initAfterSchoolTargets() {
      this.schoolTypeItems = this.$constants.SCHOOL_TYPE.all
        .filter(item => item.schoolType !== 'NONE')
        .map(item => {
          item.value = item.schoolType
          item.title = item.typeName
          return item
        })

      if (Array.isArray(this.propAfterSchoolTargets) && this.propAfterSchoolTargets.length > 0) {
        this.selectSchoolType = this.propAfterSchoolTargets[0].schoolType
      }

      const classGradeModel = []

      this.propAfterSchoolTargets.forEach(t => {
        /**
         * get code
         */
        switch (this.selectSchoolType) {
          case this.CONSTANTS.SCHOOL_TYPE.ELEMENTARY:
          case this.CONSTANTS.SCHOOL_TYPE.MIDDLE:
          case this.CONSTANTS.SCHOOL_TYPE.HIGH:
          case this.CONSTANTS.SCHOOL_TYPE.UNIVERSITY:
          case this.CONSTANTS.SCHOOL_TYPE.SPECIAL: {
            const gradeNumber = t.classGrade.substring(1, t.classGrade.length)
            classGradeModel.push(gradeNumber)
            break
          }
          /**
           * case this.CONSTANTS.SCHOOL_TYPE.KINDERGARTEN:
           * case this.CONSTANTS.SCHOOL_TYPE.NONE:
           */
          default:
        }
      })

      // selectSchoolType 초기화 이후 set
      this.$nextTick(() => {
        if (classGradeModel.length > 0) {
          this.classGradeModel.push(...classGradeModel)
        }
      })
    },

    /**
     * 저장 요청 시 필요한 데이터 셋 생성
     */
    getAfterSchoolTargets() {
      const classGradeModel = _.cloneDeep(this.classGradeModel)
      classGradeModel.sort()

      const classGradeCodes = []
      /**
       * set code
       */
      switch (this.selectSchoolType) {
        case this.CONSTANTS.SCHOOL_TYPE.KINDERGARTEN:
        case this.CONSTANTS.SCHOOL_TYPE.NONE: {
          const codes = [ this.CONSTANTS.CLASS_GRADE.NONE ]
          classGradeCodes.push(...codes)
          break
        }
        case this.CONSTANTS.SCHOOL_TYPE.SPECIAL: {
          const codes = classGradeModel.map(g => {
            const schoolType = this.CONSTANTS.SCHOOL_TYPE.ELEMENTARY
            return schoolType.substring(0, 1) + g
          })
          classGradeCodes.push(...codes)
          break
        }
        /**
         * case this.CONSTANTS.SCHOOL_TYPE.ELEMENTARY:
         * case this.CONSTANTS.SCHOOL_TYPE.MIDDLE:
         * case this.CONSTANTS.SCHOOL_TYPE.HIGH:
         * case this.CONSTANTS.SCHOOL_TYPE.UNIVERSITY:
         */
        default: {
          const codes = classGradeModel.map(g => {
            const schoolType = this.selectSchoolType
            return schoolType.substring(0, 1) + g
          })
          classGradeCodes.push(...codes)
        }
      }

      const rtnAfterSchoolTargets = []

      classGradeCodes.forEach(classGrade => {
        const target = this.propAfterSchoolTargets.find(target => {
          return target.targetId
            && target.schoolType === this.selectSchoolType
            && target.classGrade === classGrade
        })
        const targetId = target ? target.targetId : null

        const obj = {}
        obj.targetId = targetId
        obj.schoolType = this.selectSchoolType
        obj.classGrade = classGrade
        rtnAfterSchoolTargets.push(obj)
      })

      return rtnAfterSchoolTargets
    },
    toggleClassGradeModelAll(event) {
      const checked = event.target.checked
      if (checked) {
        this.classGradeModel.splice(0)
        for (let i = 0; i < this.gradeCount[this.selectSchoolType]; i++) {
          this.classGradeModel.push(i + 1)
        }

      } else {
        this.classGradeModel.splice(0)
      }
    }
  }
}
</script>

<style scoped>

</style>