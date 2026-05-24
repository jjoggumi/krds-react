<template>
  <div></div>
</template>

<script>
export default {
  name: "class-year-remind",
  props: {
    clazz: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {}
  },
  created() {
    // 클래스 년도 갱신 안내
    setTimeout(() => {
      // 2021년 3월 22일 부터 2021년 3월 31일까지 노출
      const isBetween = this.$moment().isBetween('2021-03-21', '2021-04-01')

      if (isBetween && this.clazz.classYear === '2020') {
        const itemId = `class-year-remind|${this.clazz.currentId}`

        if (this.$hiClass.replayData.handleItem('NOTTODAY', itemId))
          this.openClassYearRemindPopup(this.clazz.classYear)
      }
    }, 100)
  },
  methods: {
    openClassYearRemindPopup(classYear) {
      const nextYear = parseInt(classYear, 10) + 1
      const message = `작년 ${classYear}년도 클래스 대상으로<br><span class="ft-blue">${nextYear}년 4월 1일부로 자동 비공개 상태</span>로 <br>변경됨을 안내드립니다.<br>클래스를 계속 사용하시려면 클래스 년도를 '${nextYear}년' 또는 '연도무관'으로 변경 후 저장해주세요.`

      this.$store.commit('setPopupMessage', {
        isOpen: true,
        message: message,
        title: `클래스 년도 갱신 안내`
      })
    },

  }
}
</script>

<style scoped>

</style>