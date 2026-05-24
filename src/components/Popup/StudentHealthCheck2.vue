<!--
@File(Method): StudentHealthCheck2.vue
@Author: -
@Date Created: -
@Description: 학생건강 자가진단
@ETC : 4년전 수정된 파일로 현재 사용하는지 여부 알수 없음. (미사용 페이지로 추정됨 )
-->
<template>
  <div class="modal normal-modal free-send-sms-modal" style="display: block;">
    <div ref="modal" class="modal-cont-wrap">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner" v-click-outside="closeLayer">
          <div class="modal-title-wrap">
            <div class="title">학생건강 자가진단</div>
          </div>
          <div class="self-health-wrap">
            <div class="health-txt">
              <p>
                학생건강 자가진단 서비스는 2020년 9월 7일부터 <br />
                교육부에서 제공하는 사이트를 통해 이용하실 수 있습니다.<br /><br />
                학교의 안내에 따라 진행해 주시기를 바라며,<br />
                앞으로는 교육부 사이트를 통해 이용해 주시기 바랍니다.
              </p>
            </div>
            <br />
            <div class="confirm-btn-wrap">
              <button class="btn-bg-c" @click="linkGo()">
                학생건강 자가진단하기(교육부)
              </button>
            </div>
            <div
              class="modal-close-btn modal-close-icon"
              @click.self="closeLayer"
            ></div>
            <br /><br /><br />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentHealthCheck2',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.initModal()
  },

  methods: {
    initModal() {
      const modalPosition = this.$comn.getModalPosition(this.$refs.modal)
      this.$refs.modal.style.marginTop = `-${modalPosition.m_height}px`
      this.$refs.modal.style.marginLeft = `-${modalPosition.m_width}px`
    },
    closeLayer() {
      this.$store.commit('setStudentHealthCheck', {
        isOpen: false
      })
    },
    linkGo() {
      let link = 'https://hcs.eduro.go.kr'
      window.open(link)
    }
  }
}
</script>
<style lang="scss" scoped>
.self-health-wrap {
  padding: 0 0 10px;

  .confirm-btn-wrap {
    padding: 0;
    border-top: none;
  }

  .health-txt > p {
    transform: skew(0.2deg);
    color: #333;
    font-size: 15px !important;
    line-height: 150%;
    margin: 24px 0 10px;
  }  
}
</style>