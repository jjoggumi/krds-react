<template>
  <div>

    <div class="option__item">
      <strong
        class="option__heading"
        :class="['required']"
      >
        수업요일
      </strong>
      <div class="option">
        <div class="group-checkbox">
          <hi-check-box
            v-for="weekNumber of 5"
            :key="`${componentUUID}-day-of-week-model-${weekNumber}`"
            :model.sync="model.afterSchoolTimetables.dayOfWeek"
            :item="{
              title: dayOfWeekTitle[weekNumber],
              value: weekNumber
            }"
            :disabled="model.isWeekTime || disabled"
          />
          <div class="checkbox brackets">
            <input
              type="checkbox"
              :id="`${componentUUID}-day-of-week-model-choose`"
              :name="`${componentUUID}-day-of-week-model-choose`"
              :disabled="disabled"
              v-model="model.isWeekTime"
            >
            <label :for="`${componentUUID}-day-of-week-model-choose`">
              <span>요일별 시간 선택</span>
            </label>
          </div>
        </div>

        <div
          v-if="model.isWeekTime"
          class="group-timecheckbox"
        >
          <div
            v-for="weekNumber of 5"
            :key="`${componentUUID}-day-of-week-time-check-box-${weekNumber}`"
            class="timecheckbox"
          >
            <hi-check-box
              :model.sync="model.afterSchoolTimetables.dayOfWeek"
              :item="{
                title: dayOfWeekTitle[weekNumber],
                value: weekNumber
              }"
              :disabled="disabled"
            />

            <hi-date-picker
              type="time"
              placeholder="시간 선택"
              format="HH:mm"
              value-type="format"
              :class-name="['hi-timepicker']"
              :range="true"
              :minute-step="5"
              :disabled="disabled"
              v-model="model.afterSchoolTimetables[weekNumber].timeStartEnd"
              @change="model.afterSchoolTimetables[weekNumber].timeStartEnd = $event"
            />
          </div>

        </div>
      </div>
    </div>

    <div
      v-if="!model.isWeekTime"
      class="option__item"
    >
      <strong
        class="option__heading"
        :class="['required']"
      >
        수업시간
      </strong>
      <div class="option">

        <hi-date-picker
          type="time"
          placeholder="시간 선택"
          format="HH:mm"
          value-type="format"
          :class-name="['hi-timepicker']"
          :range="true"
          :minute-step="5"
          :disabled="disabled"
          v-model="model.afterSchoolTimetables.common.timeStartEnd"
          @change="model.afterSchoolTimetables.common.timeStartEnd = $event"
        />

      </div>
    </div>

  </div>

</template>

<script>
import {mapState} from "vuex";
import { v4 as uuidv4 } from 'uuid'

import HiCheckBox from "@/components/Form/HiCheckBox.vue";
import HiDatePicker from "@/components/DatePicker/HiDatePicker.vue";

export default {
  name: "survey-create-question-type-after-school-edit-timetables",
  components: {
    HiDatePicker,
    HiCheckBox
  },
  props: {
    propAfterSchoolTimetables: {
      type: Array
    },
    propIsWeekTime: {
      type: Boolean
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      model: {
        isWeekTime: false,

        afterSchoolTimetables: {
          dayOfWeek: [],

          common: {
            timeStartEnd: ['13:00', '17:00'],
          },
          1: {
            timeStartEnd: ['13:00', '17:00'],
          },
          2: {
            timeStartEnd: ['13:00', '17:00'],
          },
          3: {
            timeStartEnd: ['13:00', '17:00'],
          },
          4: {
            timeStartEnd: ['13:00', '17:00'],
          },
          5: {
            timeStartEnd: ['13:00', '17:00'],
          },
          6: {
            timeStartEnd: ['13:00', '17:00'],
          },
          7: {
            timeStartEnd: ['13:00', '17:00'],
          },
        },
      },

      dayOfWeekTitle: {
        1: '월',
        2: '화',
        3: '수',
        4: '목',
        5: '금',
        6: '토',
        7: '일'
      },

      componentUUID: null
    }
  },
  beforeMount() {
    this.model.isWeekTime = this.propIsWeekTime
    this.initModelAfterSchoolTimetables()
    this.componentUUID = uuidv4()
  },
  watch: {
    'model.isWeekTime'(val) {
      this.$emit('update:propIsWeekTime', val)
    }
  },
  methods: {
    initModelAfterSchoolTimetables() {
      let timeStart = null
      let timeEnd = null

      if (this.propAfterSchoolTimetables.length > 0) {
        this.propAfterSchoolTimetables.forEach(t => {
          const dayOfWeek = t.dayOfWeek
          this.model.afterSchoolTimetables.dayOfWeek.push(dayOfWeek)

          if (!this.model.isWeekTime) {
            if (!timeStart) {
              timeStart = t['timeStart']
            }
            if (!timeEnd) {
              timeEnd = t['timeEnd']
            }
            if (t['timeStart'] !== timeStart || t['timeEnd'] !== timeEnd) {
              this.model.isWeekTime = true
            }
          }

          this.model.afterSchoolTimetables[dayOfWeek].timeStartEnd.splice(0)
          this.model.afterSchoolTimetables[dayOfWeek].timeStartEnd.push(t['timeStart'])
          this.model.afterSchoolTimetables[dayOfWeek].timeStartEnd.push(t['timeEnd'])
        })

        if (!this.model.isWeekTime) {
          this.model.afterSchoolTimetables['common'].timeStartEnd.splice(0)
          this.model.afterSchoolTimetables['common'].timeStartEnd.push(timeStart)
          this.model.afterSchoolTimetables['common'].timeStartEnd.push(timeEnd)
        }
      }
    },
    /**
     * 저장 요청 시 필요한 데이터 셋 생성
     */
    getAfterSchoolTimetables() {
      const dayOfWeeks = _.cloneDeep(this.model.afterSchoolTimetables.dayOfWeek)
      dayOfWeeks.sort()

      const rtnAfterSchoolTimetables = []

      dayOfWeeks.forEach(dayOfWeek => {
        const timeIndex = this.model.isWeekTime ? dayOfWeek : 'common'
        const timeStart = this.model.afterSchoolTimetables[timeIndex].timeStartEnd[0]
        const timeEnd = this.model.afterSchoolTimetables[timeIndex].timeStartEnd[1]
        const timetable = this.propAfterSchoolTimetables.find(t => {
          return t['timetableId']
            && t['dayOfWeek'] === dayOfWeek
            && t['timeStart'] === timeStart
            && t['timeEnd'] === timeEnd
        })
        const timetableId = timetable ? timetable['timetableId'] : null

        const obj = {}
        obj.timetableId = timetableId
        obj.dayOfWeek = dayOfWeek
        obj.timeStart = timeStart
        obj.timeEnd = timeEnd

        rtnAfterSchoolTimetables.push(obj)
      })

      return rtnAfterSchoolTimetables
    },

  }
}
</script>

<style scoped>

</style>