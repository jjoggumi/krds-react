<template>
  <div class="medication-wrap mb-20">
    <div class="title">
      <p>투약보고서</p>
    </div>

    <ul class="application-form-list">
      <li>
        <div class="title">담당자명 <span class="txt-warning ml-05">*</span></div>
        <div class="text">
          <div class="modify-box-wrap">
            <div class="input-box-wrap">
              <input type="text" name="담당자명" v-model="medicationReport.reportUserName" maxlength="10"/>
            </div>
          </div>
        </div>
      </li>
      <li>
        <div class="title">투약일 <span class="txt-warning ml-05">*</span></div>
        <div class="text">
          <div class="modify-box-wrap">
            <div class="input-box-wrap period-wrap med">
              <date-picker
                  name="투약일"
                  valueType="timestamp"
                  v-model="dosageTimestamp"
                  style="width: inherit"
                  :editable="false"
                  :clearable="false"
              ></date-picker>
            </div>
          </div>
        </div>
      </li>
      <li>
        <div class="title"><span>특이사항<br>(메모)</span></div>
        <div class="text">
          <div class="modify-box-wrap">
            <div class="input-box-wrap">
              <div class="textarea-wrap">
                <textarea type="text" name="특이사항" maxlength="250" placeholder="선택사항 (250자)" v-model="medicationReport.memo"/>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker'

export default {
  name: "medication-report",
  props: {
    medicationReport: {
      type: Object
    }
  },
  components: {
    DatePicker
  },
  computed: {
    dosageTimestamp: {
      get() {
        return this.medicationReport.dosageTimestamp
      },
      set(val) {
        this.medicationReport.dosageTimestamp = val
      }
    }
  },
  watch: {
    'medicationReport.reportUserName'() {
      if (!this.medicationReport.reportUserName) return
      this.medicationReport.reportUserName = this.medicationReport.reportUserName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    }
  }
}
</script>

<style scoped>

</style>