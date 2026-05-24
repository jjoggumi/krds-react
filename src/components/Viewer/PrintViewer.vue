<template>
  <div
    class="modal print-note-modal has-top-btn-wrap"
    :style="{ display: isShowPrintView ? 'block' : 'none' }"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="modal-top-btn-wrap">
            <!-- <div class="page-conut-wrap">1 / 1 페이지</div> -->
            <div class="right-wrap">
              <button class="print-btn" @click.stop @click="onClickPrint">
                <span>인쇄</span>
              </button>
              <div
                class="modal-close-btn modal-close-icon"
                @click="closePrintView"
              ></div>
            </div>
          </div>
          <div class="print-note-cont" ref="printNote" id="printNote">
            <div
              class="print-cont page"
              style="min-height: 768px; height:100%;"
              :style="printStyle"
            >
              <div class="item-title-wrap">
                <div class="title type-none">
                  <span>
                    <slot>하이클래스 {{ postTypeName }}</slot>
                  </span>
                </div>
                <div
                  v-if="(className || '') !== ''"
                  class="date"
                >
                  {{ $comn.convertTimestamp2DateByFormat(posted, '.', '') }}{{ className ? ` / ${className}` : '' }}
                </div>
              </div>
              <br />
              <!-- <div
                id="printContent"
                class="print-cont-inner subpage"
                v-html="$comn.setContent2(printContent)"
              ></div> -->

              <!-- <div
                id="printContent"
                class="print-cont-inner subpage"
                v-html="printContent"
              ></div> -->

              <div
                id="printContent"
                class="subpage"
                v-html="printContent"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: 'print-viewer',
  props: [],
  data() {
    return {
      isShowPrintView: false,
      isPrint: false,
      printContent: null,
    }
  },
  computed: {
    ...mapState({
      printView: 'printView'
    }),
    isPrintView() {
      return this.printView.isOpen
    },
    content() {
      return this.printView.content
    },
    className() {
      return this.printView.className
    },
    posted() {
      return this.printView.posted
    },
    postTypeName() {
      return this.printView.postTypeName
    },
    printStyle() {
      let printStyle = {}

      if (this.isPrint) {
        printStyle.padding = '50px'
      }

      return printStyle
    },
    titleStyle() {
      return {
        'display': 'inline-block',
        'font-size': '20px',
        'line-height': '150%',
        'font-weight': '900',
        'vertical-align': 'middle'
      }
    }
  },
  watch: {
    $route() {
      this.closePrintView()
    }
  },
  created() {},
  mounted() {
    this.isShowPrintView = true
    this.printContent = this.getPostContentEditor(this.content)

    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations({
      setPrintView: 'setPrintView',
    }),
    async onClickPrint() {
      this.isPrint = true

      await this.$nextTick()

      // 1. iframe print plugin
      this.$print(this.$refs.printNote)

      // 2. print.js plugin
      // this.$printjs('printNote', 'html')

      this.isPrint = false
    },
    getPostContentEditor(postContent) {
      if (postContent === undefined || postContent === null)
        return null

      try {
        let domParser = new DOMParser()
        let postContentDocument = domParser.parseFromString(postContent, 'text/html')

        const editorElement = postContentDocument.body.querySelector('.class-fr-editor')
        const videoEls = editorElement.querySelectorAll("video")
        for(const videoEl of videoEls) {
          videoEl.style.removeProperty('width')
        }
        return editorElement.innerHTML

      } catch (e) {
        return postContent
      }
    },
    closePrintView() {
      this.setPrintView({
        isOpen: false,
        content: null,
        className: null,
        posted: null,
        postTypeName: null
      })
    },
  },
}
</script>

<style lang="scss">
.print-note-modal {
  display: block;
}
.item-title-wrap > div {
  line-height: 180%;
}
.title.type-none {
  display: inline-block;
  font-size: 18px;
  line-height: 150%;
  font-weight: 900;
  vertical-align: middle;
}

body p {
  word-break: break-all;
}

.print-cont video {
  width: 100%;
}
/* 알림장 인쇄하기 page, print media query */
@page {
  size: auto;
  margin: 15mm 0 10mm 0;
}
@media print {
  body {
    background-color: #fff;
  }
  body * {
    transform: skew(0deg) !important;
  }
  p {
    font-weight: normal !important;
    font-size: 1.3em !important;
  }
  .print-cont {
    max-width: 100%;
    width: 240mm;
    max-height: 297mm;
    padding: 0;
    margin: 0;
    border: 0;
    -webkit-print-color-adjust: exact;
    page-break-before: always;
  }
  .print-cont img {
    width: auto;
    max-width: 100%;
  }
  .print-cont video {
    width: 100%;
  }
}
</style>
