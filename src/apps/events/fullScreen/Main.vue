<template>
  <iframe
      class="iframe"
      :src="iframeSrc"
      credentialless
  />
</template>

<script lang="js">
import EventMixin from "@/apps/events/mixins/EventMixin";

export default {
  name: 'FullScreenEvent',
  mixins: [EventMixin],
  data() {
    return {
      eventName: '',
      iframeSrc: ''
    };
  },
  async mounted() {
    if (!this.$route.params.eventName) return;
    this.eventName = this.$route.params.eventName;

    await this.getFullScreenEvents();

    const event = this.getEventByEventName(this.eventName);
    this.iframeSrc = event.iframeSrc
    document.title = event.title;

    // iframe 과 하이클래스 스크롤이 중첩돼서 하이클래스 스크롤 없애기 위함
    this.$hiClass.toggleBodyClass('add', 'hidden')
    // mac 은 아니지만  padding 없애기 위해 mac 클래스 (padding 0) 추가
    this.$hiClass.toggleBodyClass('add', 'mac')

    window.addEventListener('message', (event) => {
      if (event.data && event.data.shareData) {
        try {
          if (navigator.share) {
            navigator.share(event.data.shareData)
            return
          }

          const deviceType = navigator.userAgent.toLowerCase()
          if (/iPad|iPhone|iPod/.test(deviceType)) {
            const postMessage = {
              command: 'shareMessage',
              shareMessage: event.data.shareData.url
            }
            window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
          } else {
            window.navigator.clipboard.writeText(event.data.shareData.url).then(() => {
              alert("링크가 복사되었습니다!\n주변 선생님께도 알려 함께 참여해보세요😊")
            })
          }
        } catch (err) {
          console.log('공유 취소 또는 오류:', err);
        }
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.iframe {
  border: 0;
  width: 100%;
  height: 100%;
}
</style>
