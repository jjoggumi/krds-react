<!--
@File(Method): FieldStudy.vue
@Author: -
@Date Created: -
@Description: 
@Modified: 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가
-->
<template>
  <ul class="application-form-list">
    <li>
      <div class="title">학교</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ clazz.school.schoolName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap readonly">
            <input
                type="text"
                disabled="disabled"
                name="학교"
                v-model="clazz.school.schoolName"
            />
          </div>
        </div>
      </div>
    </li>
    <!-- #71977 학반(태그) 추가 -->
    <li class="half">
      <div class="title">학년</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ getClassGradeName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <hc-select
            v-if="clazz.classGradeCode === 'NONE' && clazz.classSchoolType !== 'KINDERGARTEN'"
            :model.sync="model.classGrade"
            selectLabel="gradeName"
            selectValue="classGradeCode"
            defaultLabel="- 선택 -"
            :isFocusMode="false"
            :item="getClassGrades"
          />
          <div v-else class="input-box-wrap readonly">
            <input
                type="text"
                disabled="disabled"
                name="학년"
                :value="getClassGradeName"
            />
          </div>
        </div>
      </div>
    </li>
    <li class="half">
      <div class="title">클래스</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ clazz.classBan }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap readonly">
            <input
                type="text"
                disabled="disabled"
                name="학반"
                v-model="clazz.classBan"
            />
          </div>
        </div>
      </div>
    </li>
    <li>
      <div class="title">학생이름</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.studentName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="학생이름"
                maxlength="50"
                v-model="model.studentName"
            />
          </div>
        </div>
      </div>
    </li>

    <li class="half">
      <div class="title">보호자명</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.parentName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="보호자명"
                maxlength="50"
                v-model="model.parentName"
            />
          </div>
        </div>
      </div>
    </li>

    <li class="half">
      <div class="title">보호자 연락처</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <!-- prettier-ignore -->
          <span :class="{ 'ft-orange': option.wrongFormat.parentPhone }">{{ $stringUtil.phoneFormatter(model.parentPhone, null) }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="보호자 연락처"
                maxlength="11"
                v-model="model.parentPhone"
            />
          </div>
        </div>
      </div>
    </li>

    <li>
      <div class="title">보호자 관계</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ formParentType }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <input
              type="hidden"
              name="보호자 관계"
              v-model="model.parentType"
          />
          <hc-select
              :model.sync="model.parentType"
              selectLabel="name"
              selectValue="code"
              defaultLabel="-  선택  -"
              :isFocusMode="false"
              :item="$constants.CLASS_APPLY.parentType"
          />
          <div v-if="model.parentType === 'ETC'" class="input-box-wrap etc-wrap">
            <input
                type="text"
                name="보호자 관계"
                placeholder="직접입력"
                maxlength="20"
                v-model="model.parentTypeName"
            />
          </div>
        </div>
      </div>
    </li>

    <li class="half">
      <div class="title">인솔자명</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.leaderName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="인솔자명"
                maxlength="50"
                v-model="model.leaderName"
            />
          </div>
        </div>
      </div>
    </li>

    <li class="half">
      <div class="title">인솔자 연락처</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <!-- prettier-ignore -->
          <span :class="{ 'ft-orange': option.wrongFormat.leaderPhone }">{{ $stringUtil.phoneFormatter(model.leaderPhone, null) }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="인솔자 연락처"
                maxlength="11"
                v-model="model.leaderPhone"
            />
          </div>
        </div>
      </div>
    </li>

    <li>
      <div class="title">인솔자 관계</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ formLeaderType }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <input
              type="hidden"
              name="인솔자 관계"
              v-model="model.leaderType"
          />
          <hc-select
              :model.sync="model.leaderType"
              selectLabel="name"
              selectValue="code"
              defaultLabel="-  선택  -"
              :isFocusMode="false"
              :item="$constants.CLASS_APPLY.leaderType"
          />
          <div v-if="model.leaderType === 'ETC'" class="input-box-wrap etc-wrap">
            <input
                type="text"
                name="인솔자 관계"
                placeholder="직접입력"
                maxlength="20"
                v-model="model.leaderTypeName"
            />
          </div>
        </div>
      </div>
    </li>

    <li class="dayh">
      <div class="title-dayh">
        <div class="title__cate">
          <span>신청기간</span>
        </div>
        <div class="title__cate-sub">
          <div class="title__cate-sub-wrap">
            <div class="title__cate-sub-wrap__title">
              1일
            </div>
            <div v-if="isModeView" class="title__cate-sub-wrap__text">
              <span v-if="model.timestampStart !== null">{{ timestampStr }}</span>
              <span v-else>-</span>
            </div>
            <div v-else class="title__cate-sub-wrap__input">
              <div class="input-box-wrap period-wrap">
                <date-picker
                    name="신청기간(시작일)"
                    valueType="timestamp"
                    v-model="model.timestampStart"
                    style="width: inherit"
                    placeholder="시작일 선택"
                    :editable="false"
                ></date-picker>
              </div>
              <span class="wave">~</span>
              <div class="input-box-wrap period-wrap">
                <date-picker
                    name="신청기간(종료일)"
                    valueType="timestamp"
                    :disabled-date="disabledBeforeApplyStartDayAndAfterAWeek"
                    v-model="model.timestampEnd"
                    style="width: inherit"
                    placeholder="종료일 선택"
                    :editable="false"
                ></date-picker>
              </div>
              <span class="period">( {{ computedApplyDays }} )일간</span>
            </div>
          </div>

          <div class="title__cate-sub-wrap">
            <div class="title__cate-sub-wrap__title">
              반일
            </div>
            <div v-if="isModeView" class="title__cate-sub-wrap__text">
              <span v-if="model.halfDayStart !== null">{{ halfDayStr }})</span>
              <span v-else>-</span>
            </div>
            <div v-else class="title__cate-sub-wrap__input">
              <div class="title__cate-sub-wrap__input-wrap">
                <div class="input-box-wrap period-wrap">
                  <date-picker
                      name="신청기간(반일신청일)"
                      valueType="timestamp"
                      v-model="model.halfDayStart"
                      style="width: inherit"
                      @change="selectHalfDayStart"
                      placeholder="반일 날짜 선택"
                      :editable="false"
                  ></date-picker>
                </div>
                <div class="text-box-wrap">
                  <hi-date-picker
                      type="time"
                      placeholder="시작시간~종료시간"
                      format="HH:mm"
                      value-type="format"
                      :class-name="['hi-timepicker']"
                      :range="true"
                      :minute-step="5"
                      :clearable="true"
                      :disabled="model.halfDayStart === null"
                      v-model="timeStartEnd"
                      @change="selectTimeStartEnd($event)"
                  />
                </div>
              </div>
              <div class="title__cate-sub-wrap__input-wrap">
                <div class="text-box-wrap">
                  <div class="input-box-wrap">
                    <input
                        type="text"
                        name="반일신청시간"
                        placeholder="반일 신청 시간을 직접 입력해주세요 (예시: 4시간, 1/2일)"
                        v-model="model.halfDayHours"
                        maxlength="20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>

    <li>
      <div class="title">학습형태</div>
      <div class="text">
        <div class="checkbox-wrap">
          <template v-for="(item, index) of studyTypes">
            <input
                :key="`input-formck${index}-${item.code}`"
                type="radio"
                :id="`formck${index}-${model.currentId}`"
                :name="`formck${index}-${model.currentId}`"
                :class="{ dis: option.isPrint ? false : isModeView }"
                :value="item.code"
                :disabled="isModeView"
                v-model="model.studyType"
            >
            <label :key="`label-formck${index}-${item.code}`" :for="`formck${index}-${model.currentId}`">
              <span>{{ item.name }}</span>
            </label>
          </template>
        </div>
      </div>
    </li>

    <template v-for="item of option.commonInputItems">
      <li :key="item.value">
        <div class="title">{{ item.title }}</div>
        <div class="text">
          <div v-if="isModeView" class="text-box-wrap">
            <span>{{ model[item.value] }}</span>
          </div>
          <div v-else class="modify-box-wrap">
            <div class="input-box-wrap">
              <template v-if="item.type === 'textarea'">
                <div class="textarea-wrap">
                  <textarea
                      :name="item.title"
                      placeholder="내용을 입력해주세요"
                      v-model="model[item.value]"
                      maxlength="250"
                  ></textarea>
                </div>
              </template>
              <template v-else>
                <input
                    type="text"
                    :name="item.title"
                    v-model="model[item.value]"
                    maxlength="30"
                />
              </template>
            </div>
          </div>
        </div>
      </li>
    </template>


    <clazz-application-form-upload
        title="증빙서류"
        key="clazz-application-form-upload"
        :files.sync="model.files"
        :param="{
          size: $store.state.upload.help.size,
          limit: $store.state.upload.help.limit
        }"
        :readonly="isModeView"
        :unusedFiles="unusedFiles"
        :formName="formName"
        @fileUploadAct="fileUploadAct"
    ></clazz-application-form-upload>
  </ul>
</template>

<script>
import ClazzApplicationFormUpload from '@/components/Upload/Clazzes/ClazzApplicationFormUpload'
import HcSelect from '@/components/Form/HcSelect'
import HiDatePicker from "@/components/DatePicker/HiDatePicker.vue";
import DatePicker from 'vue2-datepicker'
import {mapState} from "vuex";

export default {
  name: "field-study",
  components: {
    ClazzApplicationFormUpload,
    HcSelect,
    HiDatePicker,
    DatePicker
  },
  data() {
    return {
      studyTypes: [
        { code: 'TRAVEL', name: '가족여행' },
        { code: 'VISITING', name: '친인척방문' },
        { code: 'TOUR', name: '견학활동' },
        { code: 'EXPERIENCE', name: '체험활동' },
        { code: 'HOME', name: '가정학습' },
      ]
    }
  },
  props: {
    isModeView: {
      type: Boolean,
    },
    clazz: {
      type: Object,
    },
    model: {
      type: Object,
    },
    timeStartEnd: {
      type: Array
    },
    option: {
      type: Object,
    },
    formParentType: {
      type: String,
    },
    formLeaderType: {
      type: String,
    },
    unusedFiles: {
      type: Array,
    },
    formName: {
      type: String,
    },
    computedApplyDays: {
      type: Number,
    },
  },
  computed: {
    ...mapState(['classSchoolGradeType']),
    timestampStr() {
      const start = this.$moment(this.model.timestampStart).format('YYYY-MM-DD') || ''
      const end = this.$moment(this.model.timestampEnd).format('YYYY-MM-DD') || ''
      const applyDays = `(${this.model.applyDays || 0}일간)`
      return `${start} ~ ${end} ${applyDays}`
    },
    halfDayStr() {
      const startDay = this.$moment(this.model.halfDayStart).format('YYYY-MM-DD') || ''
      const startTime = this.$moment(this.model.halfDayStart).format('HH:mm') || ''
      const endTime = this.$moment(this.model.halfDayEnd).format('HH:mm') || ''
      return `${startDay}  ${startTime} ~ ${endTime} (${this.model.halfDayHours})`
    },
    isEtcClassSchoolType() {
      return !['KINDERGARTEN', 'ELEMENTARY', 'MIDDLE', 'HIGH', 'UNIVERSITY'].includes(this.clazz.classSchoolType)
    },
    getClassGrades() {
      const classSchoolType = this.isEtcClassSchoolType ? 'ELEMENTARY' : this.clazz.classSchoolType
      return this.classSchoolGradeType[classSchoolType].filter(g => g.classGradeCode !== 'NONE')
    },
    getClassGradeName() {
      const classSchoolType = this.isEtcClassSchoolType ? 'ELEMENTARY' : this.clazz.classSchoolType
      if (classSchoolType === 'KINDERGARTEN' && this.model.classGrade === 'NONE') return '학년 무관'
      return (this.classSchoolGradeType[classSchoolType].find(g => g.classGradeCode === this.model.classGrade) || {}).gradeName
    }
  },
  mounted() {
    if (this.model.halfDayStart) {
      this.$emit('updateTimeStartEnd', [
        this.$moment(this.model.halfDayStart).format('HH:mm'),
        this.$moment(this.model.halfDayEnd).format('HH:mm')
      ])
    }
  },
  methods: {
    fileUploadAct() {
      this.$emit('fileUploadAct')
    },
    disabledBeforeApplyStartDayAndAfterAWeek(date) {
      const applyStartDay = this.model.timestampStart
      return date < applyStartDay
    },
    selectHalfDayStart(e) {
      this.model.halfDayStart = e
      this.model.halfDayEnd = e
      if (this.model.halfDayStart && this.timeStartEnd[0]) {
        this.getHalfYmd()
      } else {
        this.$emit('updateTimeStartEnd', [null, null])
      }
    },
    selectTimeStartEnd(e) {
      this.$emit('updateTimeStartEnd', e)
      if (this.model.halfDayStart && this.timeStartEnd[0]) {
        const chkArr1 = this.timeStartEnd[0].split(":")
        const chkArr2 = this.timeStartEnd[1].split(":")
        const chkMinute1 = (Number(chkArr1[0]) * 60) + Number(chkArr1[1])
        const chkMinute2 = (Number(chkArr2[0]) * 60) + Number(chkArr2[1])

        if ((chkMinute2-chkMinute1) > 240) {
          this.$hiClass.alert('최대 4시간까지 시간설정이 가능합니다.')
          this.$emit('updateTimeStartEnd', [null, null])
          return
        }

        this.getHalfYmd()
      }
    },
    getHalfYmd() {
      const startHi = this.timeStartEnd[0]
      const [startH, startM] = startHi.split(':').map(Number)
      this.model.halfDayStart = this.$moment(this.model.halfDayStart).set({ hour: startH, minute: startM }).valueOf()

      const endHi = this.timeStartEnd[1]
      const [endH, endM] = endHi.split(':').map(Number)
      this.model.halfDayEnd = this.$moment(this.model.halfDayStart).set({ hour: endH, minute: endM }).valueOf()
    }
  }
}
</script>

<style scoped>

</style>