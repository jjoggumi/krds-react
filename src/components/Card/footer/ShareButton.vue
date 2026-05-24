<template>
  <!-- TODO: 2022-09-26 footer 공유하기 버튼 퍼블리싱 이슈 있음 -->
  <fragment>
    <button
      :class="[ setClassList ]"
      style="display: block"
      @click="openSharePop"
    >
      <span v-if="isFloating === false">{{$t("main.text.share")}}</span>
    </button>
    <div class="btn-tooltip" v-if="isFloating === true">{{$t("main.text.share")}}</div>

    <div
      v-if="isShowSharePop"
      class="share-popup-wrap"
      style="display: block"
      v-click-outside="closeSharePop"
    >
      <div
        class="share-popup-box"
        @click.stop
      >
        <div class="share-list-wrap">
          <!--
          <ul>
            <li>
              <button class="share-kakaos">
                <span>{{$t("main.text.kakaostory")}}</span>
              </button>
            </li>
            <li>
              <button class="share-kakaot">
                <span>{{$t("main.text.kakaotalk")}}</span>
              </button>
            </li>
            <li>
              <button class="share-band">
                <span>{{$t("main.text.band")}}</span>
              </button>
            </li>
            <li>
              <button class="share-facebook">
                <span>{{$t("main.text.facebook")}}</span>
              </button>
            </li>
          </ul>
          -->
        </div>
        <div class="share-url-wrap">
          <div class="url-box">{{shareUrl}}</div>
          <button
            class="btn-bg-w"
            @click="copyToClipboard()"
            tabindex="0"
          >{{$t("main.text.copyurl")}}</button>
        </div>
      </div>
    </div>
  </fragment>
</template>

<script>
export default {
  name: "share-button",
  data() {
    return {
      isShowSharePop: false,
      isClick: false,
      shareUrl: ""
    }
  },
  props: ["isFloating", "currentId"],
  computed: {
    setClassList() {
      const setClassList = []
      if (this.isFloating) {
        setClassList.push('floating-share')
      } else {
        setClassList.push('btn-share')
      }
      if (this.isShowSharePop) setClassList.push('on')
      return setClassList;
    },
  },
  methods: {
    copyToClipboard() {
      var dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = this.shareUrl;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      this.$hiClass.alert("링크가 복사되었습니다.");
    },
    openSharePop() {
      this.isShowSharePop = true
    },
    closeSharePop() {
      this.isShowSharePop = false
    }
  },
  mounted() {
    this.shareUrl = this.$webUrl + "/share/" + this.currentId;
  }
};
</script>

<style lang="scss" scoped>
.hi-board .board__footer .group-btn-footer .btn-share::before {
  background-position: -140px -20px;
}
</style>
