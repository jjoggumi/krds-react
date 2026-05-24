<template>
  <div class="modal notsupported-modal">
    <div
      ref="modal"
      class="modal-cont-wrap"
      :style="modalStyleObj"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="modal-close-btn modal-close-icon" @click="close"></div>
          </div>
          <div class="notsupported-content-wrap">
            <p class="desc">
              {{ notSupportedBrowser.title ? notSupportedBrowser.title : '학교 양식 신청서 메뉴는' }}<br>
              <strong class="ft-blue">인터넷 익스플로러</strong>를 지원하지 않습니다.
            </p>
            <p class="desc-sub">{{ browserTitle }}를 다운로드하시어<br>보다 안정적인 서비스를 이용하시길 부탁드립니다.</p>

            <ul class="browser-list">
              <li
                v-for="info of $store.state.browserDownloadInfos"
                :key="info.className"
                :class="[info.className]"
              >
                <strong class="name">{{ info.title }}</strong>
                <a
                  :href="info.downloadUrl"
                  target="_blank"
                  class="btn-download"
                >
                  다운로드
                </a>
              </li>
            </ul>
          </div>
          <div class="btn-wrap">
            <button class="btn-bg-c" @click="close">창닫기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapFields} from "vuex-map-fields";

export default {
  name: "not-supported-browser",
  data() {
    return {
      m_height: 0,
      m_width: 0,
    }
  },
  computed: {
    ...mapFields({
      notSupportedBrowser: 'notSupportedBrowser'
    }),
    modalStyleObj() {
      return {
        "margin-top": -this.m_height + "px",
        "margin-left": -this.m_width + "px"
      };
    },
    browserTitle() {
      let title = ''
      this.$store.state.browserDownloadInfos.forEach(info => {
        if (title)
          title +=' / '

        title += info.title
      })
      return title
    }
  },
  mounted() {
    const positionObj = this.$comn.getModalPosition(this.$refs.modal);
    this.m_height = positionObj.m_height;
    this.m_width = positionObj.m_width;

    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    // TODO: 닫기 전 action
    switch (this.notSupportedBrowser.pageName) {
      case 'worksheets-edit':
      case 'worksheetCreate': {
        this.notSupportedBrowser.pageName = ''
        this.$router.back()
        break
      }

      case 'worksheets-submit':
      case 'worksheets-detail':
      case 'worksheets-preview': {
        this.notSupportedBrowser.pageName = ''
        alert('현재 화면을 닫습니다.')
        window.close()
        break
      }
    }
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    close() {
      this.notSupportedBrowser.isOpen = false
    }
  }

}
</script>

<style scoped>
.modal.notsupported-modal {
  display: block;
}
</style>