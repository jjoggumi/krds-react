<!--
@File(Method): AlarmPlusDetailPopup.vue
@Author: -
@Date Created: -
@Description: 학교 알리미 ?
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 4달전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->
<template>
  <div
    v-if="isShow"
    class="modal slick-modal view-main-detail-modal ofy"
    :class="{ alarmPlusOn: isShow, alarmPlusOff: !isShow }"
  >
    <!-- ofy 클래스 : 스크롤 영역 보이게 -->
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="family-detail-pop boundary-box" v-click-outside="close">
            <!-- iframe -->
            <iframe
              credentialless
              ref="iframeDetail"
              id="iframeDetail"
              :src="iframeSrc"
              frameborder="0"
              width="100%"
              @load="iframeLoaded"
            ></iframe>
            <!-- iframe -->
          </div>
          <div class="modal-close-btn modal-close-icon" @click="close"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {eventBus} from "@/main";

export default {
  name: 'alarmPlusDetailPopup',
  props: {},
  data() {
    return {
      alarmPlusDetail: {
        eLetterId: this.$store.state.alarmPlusDetail.eLetterId,
        userId: this.$store.state.alarmPlusDetail.userId
      },
      iframe: {
        src: ''
      },
      post: {}
    }
  },
  computed: {
    isShow() {
      if (
        this.$store.state.alarmPlusDetail.eLetterId !== null &&
        this.$store.state.alarmPlusDetail.userId !== null &&
        this.$store.state.alarmPlusDetail.post !== null
      ) {
        this.$hiClass.toggleBodyClass('add', 'hidden')
        this.checkPostReadUser()
        return true
      } else {
        this.$hiClass.toggleBodyClass('remove', 'hidden')
        return false
      }
    },
    iframeSrc() {
      return (
        process.env.VUE_APP_BASE_ALARM_PLUS_URI +
        process.env.VUE_APP_BASE_ALARM_PLUS_DETAIL_PATH +
        '?elEducationLetterId=' +
        this.$store.state.alarmPlusDetail.eLetterId +
        '&version=2'
      )
    }
  },
  created() {},
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
    window.addEventListener('message', this.handleIframeTask)
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
    window.removeEventListener('message', this.handleIframeTask)
  },
  methods: {
    iframeLoaded() {
      const queryParam = this.$authentication.load()
      const loginInfoJson = {
        uuid: queryParam.uuid,
        idToken: queryParam.idToken,
        refreshToken: queryParam.refreshToken
      }
      this.$refs.iframeDetail.contentWindow.postMessage(loginInfoJson, '*')
    },
    close() {
      const alarmPlusDetail = {
        eLetterId: null,
        studentId: null,
        userId: null,
        post: null
      }
      this.$store.commit('setAlarmPlusDetail', alarmPlusDetail)
    },
    checkPostReadUser() {
      this.post = this.$store.state.alarmPlusDetail.post

      if(!this.post.isRead) {
        const params = {
          deviceType: 'PC',
          post: `${process.env.VUE_APP_BASE_API_URI}/posts/${this.post.currentId}`,
          user: this.$store.state.userUri
        }
        this.$hiClass.postReadUsers.create(params).then(result => {
          this.$log.debug(
            this.$options.name + ' post postReadUsers() result : ',
            result
          )
          // 읽음 확인 처리
          this.post.isRead = true
        })
      }
      /*this.searchPostReadUser().then(result => {
        if (result.data.page.totalElements === 0) {
          const params = {
            deviceType: 'PC',
            post: `${process.env.VUE_APP_BASE_API_URI}/posts/${this.post.currentId}`,
            user: this.$store.state.userUri
          }
          this.$hiClass.postReadUsers.create(params).then(result => {
            this.$log.debug(
              this.$options.name + ' post postReadUsers() result : ',
              result
            )
            // 읽음 확인 처리
            this.post.isRead = true
          })
        }
      })*/
    },
    searchPostReadUser() {
      const params = {
        _user: this.$store.state.userUri,
        _post: `${process.env.VUE_APP_BASE_API_URI}/posts/${this.post.currentId}`
      }
      return this.$hiClass.postReadUsers.search(params).then(result => {
        this.$log.debug(
          this.$options.name + ' search searchPostReadUser() result : ',
          result
        )
        return result
      })
    },
    handleIframeTask(e) {
      // if (e.origin !== 'http://1.209.6.154:8080') {
      //   return
      // }
      try {
        if (e.data !== null && e.data !== undefined && e.data !== '') {

          if (e.data === 'close|alarmPlus') {
            this.close()
            return
          }

          // iframe 내 첨부파일 뷰어
          if (
              e.data.command === 'open-attach-file'&&
              e.data.file &&
              e.data.file.fileOriginalPath
          ) {
            this.$hiClass.openAttachFile(e.data.file)
            return
          }

          // old command
          if (
              e.data === 'goto|home' ||
              e.data === 'open|userSign' ||
              e.data === 'emit|onReplyResult'
          ) {
            const taskName = this.$comn.split(e.data, '|')
            const functionName = this.$comn.split(e.data, '|', 0)
            this[functionName](taskName)
          }
        }

      } catch (e) {
        this.$log.debug(e)
      }
    },
    goto(name) {
      if (name === 'home')
        this.$router.push('/')
    },
    open(name) {
      if (name === 'userSign')
        this.$hiClass.changeUserSign()
    },
    emit(name) {
      if (name === 'onReplyResult') {
        eventBus.$emit(`reload-alarm-plus-post-by-post-id|${this.post.currentId}`)
      } else {
        this.$emit(name)
      }
    },
  }
}
</script>

<style scoped>
#iframeDetail {
  position: relative;
  /* top:62px; */
  /* height:calc(100vh - 62px); */
  min-height: 77vh;
}
.alarmPlusOn {
  display: block;
}
.alarmPlusOff {
  display: none;
}
.modal .family-detail-pop{
    width: 880px!important;
    margin: 50px auto;
    min-height: 800px;
    text-align: left;
    padding: 20px;
}
</style>
