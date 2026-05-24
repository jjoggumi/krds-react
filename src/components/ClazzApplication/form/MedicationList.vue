<template>
  <div class="medication-wrap">
    <div class="title">
      <p>투약 내용<template v-if="medicationLength > 1">({{ idx + 1 }})</template></p>
      <template v-if="!isModeView">
        <HiButton v-if="idx === 0" size="sm" color="primary" outline @click="$emit('addMedication')">
          <HiIcon name="ico-med-fill" size="20"></HiIcon> 약 추가하기</HiButton>
        <HiButton v-else size="sm" color="default" outline @click="$emit('deleteMedication', idx)">
          <HiIcon name="ico-delete2" size="18"></HiIcon>삭제
        </HiButton>
      </template>
    </div>

    <ul class="application-form-list">
      <li>
        <div class="title">약의 종류 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
        <div class="text">
          <div v-if="isModeView" class="text-box-wrap">
            <span>{{ medication.medicationType !== 'ETC' ? medicationType.find(type => type.code === medication.medicationType).name : medication.medicationDetail }}</span>
          </div>
          <div v-else class="modify-box-wrap">
            <div class="checkbox-wrap">
              <template v-for="(type, i) of medicationType">
                <input type="radio" :id="`${type.code}-${idx}`" :name="`medicationType-${idx}`" :value="type.code" v-model="medication.medicationType" :key="`${type}-${i}-input`">
                <template v-if="type.code !== 'ETC'">
                  <label :for="`${type.code}-${idx}`" :key="`${type}-${i}-label`"><span>{{ type.name }}</span></label>
                </template>
                <template v-else>
                  <label :for="`${type.code}-${idx}`" class="d-flex a-middle mr-00" :key="`medicationType-${i}-label`">
                    <span>기타 </span>
                    <div class="input-box-wrap ml-10 w100">
                      <input
                          type="text"
                          name="약의종류 기타"
                          maxlength="10"
                          placeholder="예) 알약, 연고"
                          v-model="medication.medicationDetail"
                      />
                    </div>
                  </label>
                </template>
              </template>
            </div>
          </div>
        </div>
      </li>
      <li>
        <div class="title">투약횟수 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
        <div class="text">
          <div v-if="isModeView" class="text-box-wrap">
            <span>{{ dosageFrequency.find(frequency => frequency.code === medication.dosageFrequency).name }}</span>
          </div>
          <div v-else class="modify-box-wrap">
            <hc-select
              :model.sync="medication.dosageFrequency"
              selectLabel="name"
              selectValue="code"
              defaultLabel="-  선택  -"
              :isFocusMode="false"
              :item="dosageFrequency"
            />
          </div>
        </div>
      </li>
      <li>
        <div class="title">투약시간 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
        <div class="text">
          <div v-if="isModeView" class="text-box-wrap">
            <span>{{ medication.dosageTime }}</span>
          </div>
          <div v-else class="modify-box-wrap">
            <div class="input-box-wrap">
              <input
                type="text"
                name="투약시간"
                maxlength="10"
                placeholder="예) 오전 간식 후 / 점심 후 / 오후 간식 후"
                v-model="medication.dosageTime"
              />
            </div>
          </div>
        </div>
      </li>
      <li :class="{ half: isModeView }">
        <div class="title">투약용량 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
        <div class="text">
          <div v-if="isModeView" class="text-box-wrap">
            <span>{{ `${ medication.dosageAmount }${ medication.isMlCc ? ' ml/cc' : '' }` }}</span>
          </div>
          <div v-else class="modify-box-wrap d-flex a-middle">
            <div class="input-box-wrap mr-10">
              <input
                type="text"
                name="투약용량"
                maxlength="10"
                placeholder="1회분 입력"
                v-model="medication.dosageAmount"
              />
            </div>
            <div class="checkbox-wrap">
              <input type="checkbox" :id="`isMlCc-${idx}`" :name="`isMlCc-${idx}`" v-model="medication.isMlCc">
              <label :for="`isMlCc-${idx}`"><span>ml/cc</span></label>
            </div>
          </div>
        </div>
      </li>
      <li :class="{ half: isModeView }">
        <div class="title">보관방법 <span v-if="!isModeView" class="txt-warning ml-05">*</span></div>
        <div class="text">
          <div v-if="isModeView" class="text-box-wrap">
            <span>{{ storageCondition.find(condition => condition.code === medication.storageCondition).name }}</span>
          </div>
          <div v-else class="modify-box-wrap">
            <div class="checkbox-wrap">
              <template v-for="(condition, i) of storageCondition">
                <input type="radio" :id="`${condition.code}-${idx}`" :name="`storageCondition-${idx}`" :value="condition.code" v-model="medication.storageCondition" :key="`condition-${i}-input`">
                <label :for="`${condition.code}-${idx}`" :key="`condition-${i}-label`"><span>{{ condition.name }}</span></label>
              </template>
            </div>
          </div>
        </div>
      </li>
      <li>
        <div class="title"><span>특이사항<br>(메모)</span></div>
        <div class="text">
          <div v-if="isModeView" class="text-box-wrap">
            <span>{{ medication.memo }}</span>
          </div>
          <div v-else class="modify-box-wrap">
            <div class="input-box-wrap">
              <div class="textarea-wrap">
                <textarea
                    type="text"
                    ref="memoTextarea"
                    rows="1"
                    name="특이사항"
                    maxlength="50"
                    placeholder="예) 앞 주머니에 있습니다."
                    style="overflow: hidden;"
                    v-model="medication.memo"
                    @input="changeTextarea"
                    class="input-type"
                />
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import HcSelect from '@/components/Form/HcSelect'

export default {
  name: "medication-list",
  components: {
    HcSelect,
  },
  data() {
    return {
      medicationType: [
        { name: '물약 + 가루약', code: 'LIQUID_POWDER' },
        { name: '물약', code: 'LIQUID' },
        { name: '가루약', code: 'POWDER' },
        { name: '기타', code: 'ETC' }
      ],
      dosageFrequency: [
        { name: '1회', code: 1 },
        { name: '2회', code: 2 },
        { name: '3회', code: 3 },
        { name: '4회', code: 4 },
        { name: '5회', code: 5 },
      ],
      storageCondition: [
        { name: '실온', code: 'ROOM' },
        { name: '냉장', code: 'REFRIGERATED' },
      ]
    }
  },
  props: {
    isModeView: {
      type: Boolean,
    },
    medication: {
      type: Object,
    },
    medicationLength: {
      type: Number
    },
    idx: {
      type: Number
    }
  },
  methods: {
    addMedication() {
      this.$emit('addMedication')
    },
    changeTextarea() {
      this.$refs.memoTextarea.style.height = 'auto'
      this.$refs.memoTextarea.style.height = this.$refs.memoTextarea.scrollHeight + 'px'
    },
  },
  watch: {
    'medication.medicationDetail'() {
      if (!this.medication.medicationDetail) return
      this.medication.medicationDetail = this.medication.medicationDetail.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'medication.dosageTime'() {
      if (!this.medication.dosageTime) return
      this.medication.dosageTime = this.medication.dosageTime.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'medication.dosageAmount'() {
      if (!this.medication.dosageAmount) return
      this.medication.dosageAmount = this.medication.dosageAmount.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'medication.memo'() {
      if (!this.medication.memo) return
      this.medication.memo = this.medication.memo.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    }
  }
}
</script>

<style scoped>

</style>