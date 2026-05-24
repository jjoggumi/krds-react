<template>
  <div class="application-form-report">
    <div class="tit">
      투약보고서
      <p class="smr">투약보고서는 실제 투약 후 작성될 수 있습니다.</p>
    </div>
    <div class="con">
      <p>금일 본원에서 위 아동에 대해 의뢰하신 내용으로 투약했음을 보고합니다.</p>
      <p class="date">
        {{ `${$moment(medicationReport.dosageTimestamp).format('YYYY년 MM월 DD일')} ${medicationReport.reportUserName}` }}
      </p>
      <p class="noti" v-if="medicationReport.memo.trim().length > 0">
        <span>특이사항</span>
        {{ medicationReport.memo }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "medication-report-complete",
  props: {
    medicationReport: {
      type: Object
    }
  }
}
</script>

<style scoped>

</style>