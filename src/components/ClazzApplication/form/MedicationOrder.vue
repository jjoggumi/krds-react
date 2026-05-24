<template>
  <ul class="application-form-list">
    <li>
      <div class="title">클래스</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ clazz.className }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap readonly2">
            <input type="text" disabled="disabled" name="클래스" :value="clazz.className"/>
          </div>
        </div>
      </div>
    </li>
    <li>
      <div class="title">이름 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.studentName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input type="text" name="이름" placeholder="이름" maxlength="50" v-model="model.studentName"/>
          </div>
        </div>
      </div>
    </li>
    <li class="half">
      <div class="title">보호자명 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.parentName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input type="text" name="보호자명" placeholder="이름" maxlength="10" v-model="model.parentName"/>
          </div>
        </div>
      </div>
    </li>
    <li class="half tit-lg">
      <div class="title">보호자 관계 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.parentTypeName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input type="text" name="보호자 관계" placeholder="예) 엄마" maxlength="10" v-model="model.parentTypeName"/>
          </div>
        </div>
      </div>
    </li>
    <li>
      <div class="title">투약일 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span class="txt-primary">{{ $moment(model.timestampStart).format('YYYY-MM-DD') }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <ul class="add-date">
            <li v-for="(medicationDate, idx) of model.medicationDates" :key="`medicationDate-${idx}`">
              <div class="input-box-wrap period-wrap med">
                <date-picker
                  name="투약일"
                  valueType="timestamp"
                  :disabled-date="(date) => disabledMedicationDate(date, idx)"
                  v-model="model.medicationDates[idx]"
                  style="width: inherit"
                  placeholder="날짜 선택"
                  :editable="false"
                ></date-picker>
              </div>
              <template v-if="isModeCreate">
                <HiButton v-if="idx === 0" class="ml-10" size="sm" color="primary" outline @click="addMedicationDate">
                  <HiIcon name="ico-plus2" color="primary" size="14"></HiIcon> 날짜 추가
                </HiButton>
                <HiButton v-else class="ml-10 delet-ico" size="xs" color="link" @click="deleteMedicationDate(idx)">
                  <HiIcon name="ico-minus2" color="white" bgColor="default" size="14" rounded="rounded"></HiIcon>
                </HiButton>
              </template>
            </li>
          </ul>
          <p v-if="isModeCreate" class="info">투약일은 최대 3일까지 설정하실수 있습니다.</p>
        </div>
      </div>
    </li>
    <li>
      <div class="title">증상 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.reason }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input type="text" name="증상" maxlength="10" placeholder="예) 감기, 장염" v-model="model.reason"/>
          </div>
        </div>
      </div>
    </li>
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
import DatePicker from 'vue2-datepicker'

export default {
  name: "medication-order",
  components: {
    ClazzApplicationFormUpload,
    DatePicker
  },
  props: {
    isModeView: {
      type: Boolean,
    },
    isModeCreate: {
      type: Boolean
    },
    clazz: {
      type: Object,
    },
    model: {
      type: Object,
    },
    unusedFiles: {
      type: Array,
    },
    formName: {
      type: String,
    },
    isManager: {
      type: Boolean,
    }
  },
  methods: {
    fileUploadAct() {
      this.$emit('fileUploadAct')
    },
    addMedicationDate() {
      if (this.model.medicationDates.length === 3) {
        this.$hiClass.alert('날짜 선택은 최대 3일까지 가능합니다.', null, false)
        return
      }
      this.model.medicationDates.push(null)
    },
    deleteMedicationDate(idx) {
      this.model.medicationDates.splice(idx, 1)
    },
    disabledMedicationDate(date, idx) {
      if (this.model.medicationDates
          .filter(date => date !== this.model.medicationDates[idx])
          .includes(this.$moment(date).valueOf())) return true
      if (this.isManager) return false
      return this.$moment(date).valueOf() < this.$moment().startOf('day').valueOf() ||
          this.$moment(date).valueOf() > this.$moment().add(6, 'days').startOf('day').valueOf()
    }
  },
  watch: {
    'model.reason'() {
      if (!this.model.reason) return
      this.model.reason = this.model.reason.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
  }
}
</script>

<style scoped>

</style>