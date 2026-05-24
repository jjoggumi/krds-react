<template>
  <iframe
    v-if="sheetId"
    id="worksheetSubmitPage"
    ref="worksheetSubmitPage"
    :src="iframeSrc"
    @load="onLoadIframe"
    style="border: 0"
    :style="iframeStyle"
  ></iframe>
</template>

<script>
import "@/assets/css/worksheets.scss";

import { mapFields } from "vuex-map-fields";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "worksheet-submit-body",
  props: {
    worksheetApplyViewType: {
      type: String,
    },
    isPC: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      option: {
        loading: {
          upload: false,
        },
      },
      sheetId: null,
      classId: null,
      parentId: null,
      sheet: {
        title: null,
      },
      clazzSubscribeView: {},
    };
  },
  computed: {
    ...mapGetters({
      CONSTANTS: "CONSTANTS",
      getApplyTypeNameByCode: "getApplyTypeNameByCode",
    }),
    ...mapFields({
      isDimLoading: "isDimLoading",
    }),
    ...mapFields("storeWorksheet", {
      // testWorkSheetId: 'testWorkSheetId'
    }),
    isVisibleHeader() {
      return false;
    },
    iframeSrc() {
      const params = {
        ver: "20251103",
        quizIdx: this.sheetId,
        idToken: this.$authentication.load().idToken,
        applyId: this.applyId,
        viewType: this.viewType,
      };
      return (
        "/module/worksheet/make/quizWorksheetSubmitPage.html" +
        "?" +
        this.$qs.stringify(params)
      );
    },
    iframeStyle() {
      const style = {};

      if (!this.isVisibleHeader && !this.isPC) {
        style["height"] = "calc(100vh)";
      }

      return style;
    },
    worksheetContainerStyle() {
      return this.isPC ? "" : "padding-top: 0";
    },
  },

  watch: {},

  async created() {
    this.isDimLoading = true;
    const keys = ["idToken"];
    this.setQuery(keys);

    this.sheetId = this.$route.params.sheetId;
    this.applyId = this.$route.params.applyId;
    this.viewType = this.$route.params.viewType;

    if (this.worksheetApplyViewType === this.CONSTANTS.WORKSHEET_APPLY.MODIFY)
      this.viewType = "modify";
  },
  mounted() {
    window.addEventListener("message", this.handleWorksheetIframeTask);

    const myViewport = document.querySelector("#myViewport");
    this.myViewportContent = myViewport.getAttribute("content");

    // todo: 모바일인 경우 viewport 수정
    // myViewport.setAttribute('content', 'width=device-width,initial-scale=0.3,minimum-scale=0.3')
    myViewport.setAttribute(
      "content",
      "width=device-width,initial-scale=0.5,minimum-scale=0.5"
    );
  },
  beforeDestroy() {
    this.initIframes();

    this.isDimLoading = false;

    const myViewport = document.querySelector("#myViewport");
    myViewport.setAttribute("content", this.myViewportContent);

    window.removeEventListener("message", this.handleWorksheetIframeTask);
  },
  methods: {
    ...mapActions("storeWorksheet", {
      loadedWorksheetIframe: "loadedWorksheetIframe",
      initIframes: "initIframes",
    }),
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key]);
      }
    },
    goto(name) {
      if (name === "home") this.$router.push("/");
      else if (name === "back") this.$router.back();
    },
    open(name) {
      if (name === "userSign") this.$hiClass.changeUserSign();
    },
    handleWorksheetIframeTask(e) {
      // if (e.origin !== 'http://1.209.6.154:8080') {
      //   return
      // }

      try {
        if (e.data !== null && e.data !== undefined && e.data !== "") {
          // iframe 내 첨부파일 뷰어
          if (
            e.data.command === "open-attach-file" &&
            e.data.file &&
            e.data.file.fileOriginalPath
          ) {
            this.$hiClass.openAttachFile(e.data.file);
            return;
          }

          // iframe 에서 alert 메시지 전달
          if (e.data.command === "alert" && e.data.msgData && e.data.msgData.message) {
            // this.$hiClass.alert(e.data.msgData.message, e.data.msgData.icon)
            //   .then(() => {
            //     switch (e.data.additionalProcess) {
            //       case 'goto|back': {
            //         this.goto('back')
            //         break
            //       }
            //       case 'goto|home': {
            //         this.goto('home')
            //         break
            //       }
            //       default:
            //     }
            //   })
            // return
          }

          // dim loading toggle
          if (e.data.command === "toggle-dim-loading") {
            this.isDimLoading = e.data.value;
            e.source.postMessage({ name: "isDimLoading", payload: this.isDimLoading });
            return;
          }

          // old command
          if (
            e.data === "clickFooterItem|terms" ||
            e.data === "clickFooterItem|privacyPolicy" ||
            e.data === "clickFooterItem|contactus" ||
            e.data === "goto|home" ||
            e.data === "goto|back" ||
            e.data === "open|userSign"
          ) {
            const taskName = this.$comn.split(e.data, "|");
            const functionName = this.$comn.split(e.data, "|", 0);
            this[functionName](taskName);
          }
        }
      } catch (e) {
        this.$log.debug(e);
      }
    },
    onLoadIframe() {
      const name = "worksheetSubmitPage";
      const payload = {
        name,
        data: this.$refs[name],
        authentication: this.$authentication.load(),
      };
      this.loadedWorksheetIframe(payload);
    },
  },
};
</script>

<style scoped>
.worksheet-form-title .required::after {
  content: "*";
  color: #ff6a6a;
}
</style>
