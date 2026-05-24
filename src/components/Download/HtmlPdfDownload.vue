<template>
  <vue-html2pdf
    :show-layout="false"
    :float-layout="true"
    :enable-download="true"
    :preview-modal="false"
    :filename="fileName"
    :paginate-elements-by-height="1100"
    :pdf-quality="2"
    pdf-format="a4"
    pdf-orientation="portrait"
    pdf-content-width="800px"
    :manual-pagination="true"

    @hasDownloaded="hasDownloaded($event)"

    ref="html2Pdf"
  >
    <!--
      @progress="onProgress($event)"
      @startPagination="startPagination()"
      @hasPaginated="hasPaginated()"
      @beforeDownload="beforeDownload($event)"
    -->

    <html-pdf-download-data
      slot="pdf-content"
      :pdfContent="pdfContent"
    ></html-pdf-download-data>
  </vue-html2pdf>
</template>

<script>
import VueHtml2pdf from 'vue-html2pdf'
import {mapFields} from "vuex-map-fields";
import HtmlPdfDownloadData from "@/components/Download/HtmlPdfDownloadData";
import {eventBus} from "@/main";

export default {
  name: "html-pdf-download",
  components: {
    HtmlPdfDownloadData,
    VueHtml2pdf
  },
  props: {
    pdfContent: {
      type: HTMLDivElement
    },
    pdfContentHeight: {
      type: Number
    },
    fileName: {
      type: String,
      default() {
        return '신청서'
      }
    }
  },
  data() {
    return {
      isGeneratePdf: false,
      timer: null
    }
  },
  computed: {
    ...mapFields([
      'htmlPdfDownload'
    ]),
  },
  beforeCreate() {
    window.scrollTo(0, 0)
  },
  created() {},
  mounted() {
    /**
     * Generate Report using refs and calling the
     * refs function generatePdf()
     */
    this.$nextTick(() => {
      this.timer = setInterval(() => {
        const html2Pdf = this.$refs.html2Pdf

        this.$log.debug(`window.pageYOffset => `, window.pageYOffset)

        /**
         * IE 11 지원 (pageYOffset)
         * https://developer.mozilla.org/ko/docs/Web/API/Window/pageYOffset
         */
        if (html2Pdf !== undefined && this.isGeneratePdf === false && window.pageYOffset === 0) {
          html2Pdf.generatePdf()
          this.isGeneratePdf = true
        }

        if (this.isGeneratePdf) {
          clearInterval(this.timer)
          this.timer = null
        }

      }, 100)
    })
  },
  destroyed() {
    this.$store.commit('setIsLoading', false)
  },
  methods: {
    async beforeDownload ({ html2pdf, options, pdfContent }) {
      await html2pdf().set(options).from(pdfContent).toPdf().get('pdf').then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i)
          pdf.setFontSize(10)
          pdf.setTextColor(150)
          pdf.text('Page ' + i + ' of ' + totalPages, (pdf.internal.pageSize.getWidth() * 0.88), (pdf.internal.pageSize.getHeight() - 0.3))
        }
      }).save()

      this.hasDownloaded()
    },
    hasDownloaded(event) {
      this.$log.debug(`hasDownloaded event => `, event)

      this.htmlPdfDownload.pdfContentHeight = 0
      this.htmlPdfDownload.pdfContent = null
      this.htmlPdfDownload.isOpen = false

      eventBus.$emit('clazz-application-form-pdf-download-complete')
    }
  }
}
</script>

<style>
.print-div .application-form-top .application-form-title { font-size: 25px; }
.print-div .application-form-bottom p.principal { font-size: 20px;margin-top: 10px; }
.print-div .application-form-bottom .date-wrap { padding-top: 0;}
</style>