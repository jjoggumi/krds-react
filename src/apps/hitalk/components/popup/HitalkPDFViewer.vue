<template>
  <div
      class="modal print-note-modal has-top-btn-wrap"
      style="display: block;"
  >
    <div
        class="modal-cont-wrap"
        @click="handleModalClick($event)"
    >
      <div v-show="!isLoading" class="modal-cont">
        <div class="modal-cont-inner">
          <!-- top-btn area -->
          <div class="modal-top-btn-wrap">
            <div class="right-wrap">
              <button class="print-btn" @click="pdfPrint" @click.stop>
                <span>인쇄</span>
              </button>
              <button
                  class="download-btn"
                  @click="fileDownload"
              >
                <span>다운로드</span>
              </button>
              <div
                  class="modal-close-btn modal-close-icon"
                  @click="hideDocumentViewLayout"
              ></div>
            </div>
          </div>
          <!-- 메인영역-->
          <div class="pdf-viewer-layout">
            <div class="pdf-side-bar">
              <div class="side-bar-title">
                <span class="current-page">
                  {{ viewPage }}
                  </span>
                <span class="unit">/</span>
                <span>{{ numPages }}</span>
              </div>
              <div ref="pdfSideContainer" class="pdf-side-content custom-scr">
                <div class="pdf-page"></div>
              </div>
            </div>
            <div ref="pdfContainer" class="pdf-main-content custom-scr"></div>
          </div>
        </div>
        <div v-show="false">
           <iframe ref="pdfIframe" :src="iframeUrl"></iframe>
         </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'HitalkPDFViewer',

  data() {
    return {
      flag: false,
      filePath: '',
      page: 1,
      numPages: undefined,
      isLoading: true,
      viewPage: 1, // 보고있는 page
      zoomScale: 1,
      zoomStep: 0.1,
      minZoom: 0.5,
      maxZoom: 2,
      scrollTimeout: null,
      objectURL: null, // 생성된 objectURL 저장
    }
  },
  computed: {
    ...mapState('storeHitalk', [
      'isShowDocumentViewLayout',
      'fileContent',
    ]),
    ...mapFields({
      isDimLoading: 'isDimLoading',
    }),
    showFlag() {
      return this.flag
    },
    // iframe에서 사용할 URL (objectURL 또는 원본 경로)
    iframeUrl() {
      return this.objectURL || this.filePath
    }
  },
  created() {
    this.flag = this.isDocView
    console.log('pdfjsLib:', window.pdfjsLib) // 전역 변수 확인
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    if (!this.isAvailablePreview()) {
      this.$hiClass.alert('미리보기를 지원하지 않는 파일입니다.<br>첨부파일을 다운로드 합니다.').then(() => {
        this.fileDownload();
      })
      this.hideDocumentViewLayout();
    } else {
      this.getPdf();
    }
  },
  beforeDestroy() {
    const container = this.$refs.pdfContainer;
    container.removeEventListener('wheel', this.handleWheelZoom);
    // 스크롤 이벤트 리스너 제거
    container.removeEventListener('scroll', this.throttledHandleScroll);
    // 스크롤 타임아웃 정리
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
    this.$toasted.clear()
    // objectURL 메모리 해제
    this.revokeObjectURL()
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'showDocumentViewLayout',
      'hideDocumentViewLayout',
    ]),
    fileDownload() {
      this.$comn.download(this.fileContent.fileOriginalPath, this.fileContent.fileName)
    },
    initPrintView() {
      this.flag = false
      this.hideDocumentViewLayout()
    },
    isAvailablePreview() {
      const enabledFileExt = [
        'pdf',
        'hwp',
        'hwpx',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'odt',
      ]
      const extension = this.$comn.split(this.fileContent.fileOriginalPath, ".");
      const extensionLowerCase = extension ? extension.toLowerCase() : "";
      let isEnabled = false;

      switch (extensionLowerCase) {
        case "pdf": {
          isEnabled = true;
          break;
        }
        default: {
          isEnabled =
            enabledFileExt.includes(extensionLowerCase) &&
            this.fileContent.fileConvertPath;
        }
      }
      return isEnabled;
    },

    isPdf() {
      return this.fileContent.fileOriginalPath.substring(this.fileContent.fileOriginalPath.lastIndexOf(".") + 1, this.fileContent.fileOriginalPath.length).toLowerCase() === 'pdf';
    },

    async createObjectURL() {
      try {
        // 기존 objectURL이 있으면 해제
        this.revokeObjectURL()
        this.filePath = this.fileContent.fileConvertPath || this.fileContent.fileOriginalPath
        const response = await fetch(this.filePath)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const blob = await response.blob()
        this.objectURL = URL.createObjectURL(blob)
        return this.objectURL
      } catch (error) {
        console.error('ObjectURL 생성 실패:', error)
        // 실패시 원본 경로 반환
        return this.filePath
      }
    },
    revokeObjectURL() {
      if (this.objectURL) {
        URL.revokeObjectURL(this.objectURL)
        this.objectURL = null
      }
    },
    async getPdf() {
      this.isLoading = true
      this.isDimLoading = true
      try {
        // filePath를 objectURL로 변환
        const pdfUrl = await this.createObjectURL()
        
        // 전역 변수 pdfjsLib 사용
        const pdf = await window.pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/`,
          cMapPacked: true,
        }).promise;

        console.log('PDF 로드 완료. 총 페이지:', pdf.numPages);
        const sideBar = this.$refs.pdfSideContainer
        const container = this.$refs.pdfContainer;
        container.innerHTML = ''; // 기존 내용 초기화
        this.numPages = pdf.numPages
        // 메인 컨텐츠 렌더링
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const scale = 1.2;
          const viewport = page.getViewport({scale});
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.className = 'pdf-page';

          container.appendChild(canvas);

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
        }

        // 사이드바 썸네일 렌더링
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const scale = 0.5;
          const viewport = page.getViewport({scale});

          // 썸네일 컨테이너 생성
          const thumbWrapper = document.createElement('div');
          thumbWrapper.className = 'thumbnail-wrapper';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.dataset.pageNum = pageNum.toString();

          // 첫페이지 active상태
          if (pageNum === 1) canvas.classList.add('active');

          // 페이지번호 생성
          const pageLabel = document.createElement('div');
          pageLabel.className = 'page-label';
          pageLabel.textContent = pageNum;

          // 썸네일 클릭 이벤트
          canvas.addEventListener('click', () => {
            this.viewPage = pageNum;
            this.updateSidebarActive(pageNum);

            const targetPage = container.querySelector(`canvas:nth-child(${pageNum})`);
            if (targetPage) {
              targetPage.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
          });

          // 식별용 클래스 부여(선택)
          canvas.classList.add('pdf-thumb-canvas');

          thumbWrapper.appendChild(canvas);
          thumbWrapper.appendChild(pageLabel);

          sideBar.appendChild(thumbWrapper);

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
        }

        // PDF 로딩 완료 후 초기 스크롤 상태 체크
        this.$nextTick(() => {
          const container = this.$refs.pdfContainer;
          this.handleScroll();
          container.addEventListener('wheel', this.handleWheelZoom, {passive: false})
          // 스크롤 이벤트 리스너 추가
          container.addEventListener('scroll', this.throttledHandleScroll, {passive: true})
        });
      } catch (err) {
        this.flag = false
        this.hideDocumentViewLayout();
        console.error('PDF 렌더링 오류:', err.message)
        
        if (err.message === 'Failed to fetch') {
          this.$hiClass.alert('PDF 다운로드를 실패하였습니다.'); //case 1 : 파일 못받아옴
        } else if (err.message === "Cannot read property 'getDocument' of undefined" || !window.pdfjsLib) {
          this.$hiClass.alert('PDF 뷰어를 정상적으로 사용하기 위해서 브라우저 업데이트가 필요합니다.'); //case 2: 버전문제로 모듈을 못불러옴
        } else if (err.message === "Invalid PDF structure.") { //case 3: 손상된 file 
          if(this.isPdf === true) {
            this.$hiClass.alert('파일이 손상되어 PDF 뷰어를 실행할 수 없습니다.'); 
          } else {
            this.$hiClass.alert('미리보기를 지원하지 않는 파일입니다.<br>첨부파일을 다운로드 합니다.')
              .then(() => {
                this.fileDownload();
              }); 
          }
        } else if (err.message === "No password given") { //case 4: 암호화된 pdf
          this.$hiClass.alert('미리보기를 지원하지 않는 파일입니다.<br>첨부파일을 다운로드 합니다.')
            .then(() => {
              this.fileDownload();
            }); 
        } else {
          this.$hiClass.alert('PDF 로드중 오류가 발생하였습니다. 브라우저 업데이트가 필요합니다.'); // 알 수 없는 에러
        }
      } finally {
        this.isLoading = false
        this.isDimLoading = false
      }
    },
    handleModalClick(e) {
      const closeSelector = 'div.modal-cont-inner, div.modal-cont-wrap'
      try {
        if (e.target.matches(closeSelector) && this.numPages > 0) {
          this.$log.debug(`e.target.matches(closeSelector): e.target => `, e.target)
          this.close(e)
        }
      } catch (err) {
        this.$log.warn(`e.target.matches(closeSelector): err => `, err)
      }
    },
    handleWheelZoom(e) {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const delta = e.deltaY < 0 ? 1 : -1;
      let newZoom = this.zoomScale + delta * this.zoomStep;
      newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, newZoom));

      if (newZoom !== this.zoomScale) {
        this.zoomScale = newZoom;
        this.applyZoom();
      }
    },
    applyZoom() {
      const container = this.$refs.pdfContainer;
      const canvases = container.querySelectorAll('canvas.pdf-page');

      let maxHeight = 0;
      let maxWidth = 0;

      canvases.forEach(canvas => {
        if (!canvas.dataset.baseWidth) {
          canvas.dataset.baseWidth = canvas.width;
          canvas.dataset.baseHeight = canvas.height;
        }

        const marginBottom = parseFloat(getComputedStyle(canvas).marginBottom) || 0;

        let newWidth = canvas.dataset.baseWidth * this.zoomScale;
        let newHeight = canvas.dataset.baseHeight * this.zoomScale;

        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';

        // marginBottom 포함해서 최대 높이 계산
        const totalHeight = newHeight + marginBottom;
        if (totalHeight > maxHeight) maxHeight = totalHeight;
        if (newWidth > maxWidth) maxWidth = newWidth;
      });

      container.style.width = `${maxWidth}px`;
    },
    throttledHandleScroll() {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      this.scrollTimeout = setTimeout(() => {
        this.handleScroll();
      }, 100); // 100ms 쓰로틀
    },
    handleScroll() {
      const container = this.$refs.pdfContainer;
      const canvases = container.querySelectorAll('canvas.pdf-page');
      
      if (canvases.length === 0) return;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      
      let newViewPage = this.viewPage; // 현재 viewPage를 기본값으로 설정
      let maxVisibleArea = 0;
      let maxVisibleRatio = 0;
      
      canvases.forEach((canvas, index) => {
        const pageNum = index + 1;
        const canvasTop = canvas.offsetTop;
        const canvasBottom = canvasTop + canvas.offsetHeight;
        
        // 페이지가 컨테이너 뷰포트와 겹치는 영역 계산
        const visibleTop = Math.max(containerTop, canvasTop);
        const visibleBottom = Math.min(containerBottom, canvasBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibleRatio = visibleHeight / canvas.offsetHeight;
        
        // 가장 많이 보이는 페이지를 찾기 (50% 이상이 우선이지만, 없으면 가장 많이 보이는 것 선택)
        if (visibleHeight > 0) {
          if (visibleRatio >= 0.5 && visibleHeight > maxVisibleArea) {
            maxVisibleArea = visibleHeight;
            maxVisibleRatio = visibleRatio;
            newViewPage = pageNum;
          } else if (maxVisibleArea === 0 && visibleRatio > maxVisibleRatio) {
            // 50% 이상 보이는 페이지가 없을 때는 가장 많이 보이는 페이지 선택
            maxVisibleRatio = visibleRatio;
            newViewPage = pageNum;
          }
        }
      });
      
      // viewPage 업데이트 및 사이드바 활성 상태 변경
      if (newViewPage !== this.viewPage) {
        this.viewPage = newViewPage;
        this.updateSidebarActive(newViewPage);
      }
    },
    updateSidebarActive(pageNum) {
      const sideBar = this.$refs.pdfSideContainer;
      const currentActive = sideBar.querySelector('.pdf-thumb-canvas.active');
      const newActive = sideBar.querySelector(`canvas[data-page-num="${pageNum}"]`);

      if (currentActive) currentActive.classList.remove('active');
      if (newActive) {
        newActive.classList.add('active');
        const thumbnailWrapper = newActive.closest('.thumbnail-wrapper');

        if (thumbnailWrapper) {
          const sideBarTop = sideBar.scrollTop;
          const sideBarBottom = sideBarTop + sideBar.clientHeight;
          const thumbnailTop = thumbnailWrapper.offsetTop;
          const thumbnailBottom = thumbnailTop + thumbnailWrapper.offsetHeight;

          // 썸네일이 사이드바 뷰포트 위쪽에 있을 경우
          if (thumbnailTop < sideBarTop) {
            sideBar.scrollTo({
              top: thumbnailTop - 20, // 20px 여백
              behavior: 'smooth'
            });
          }
          // 썸네일이 사이드바 뷰포트 아래쪽에 있을 경우
          else if (thumbnailBottom > sideBarBottom) {
            sideBar.scrollTo({
              top: thumbnailBottom - sideBar.clientHeight + 20, // 20px 여백
              behavior: 'smooth'
            });
          }
        }
      }
    },
    pdfPrint() {
      //Iframe을 이용한 인쇄
      this.$refs.pdfIframe.contentWindow.print()
    }
  } // end methods
}
</script>

<style lang="scss" scoped>
.modal {
  &.print-note-modal {
    max-height: 100%;

    &.has-top-btn-wrap {
      .modal-cont-inner {
        padding-top: 0;
      }
    }

    .modal-top-btn-wrap {
      .right-wrap button {
        height: 40px;

        span {
          font-size: 15px;
        }
      }
      .right-wrap {
        top: 16px;
        .download-btn {
          border-radius: 8px;
          margin-right: 0;
          border-color: rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.8);
        }
      }
    }

    .pdf-viewer-layout {
      display: flex;
      max-height: 100vh;
      overflow: hidden;

      .pdf-side-bar {
        width: 220px;
        height: 100vh;
        border-right: 1px solid rgba(0, 0, 0, 0.30);
        background: rgba(0, 0, 0, 0.40);

        .side-bar-title {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E0E0E0;
          height: 56px;
          width: 220px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.30);
          z-index: 1;

          span {
            font-size: 16px;
            font-weight: 400;
            color: #E0E0E0;
            line-height: normal;

            &.current-page {
              color: #578AF5;
            }
          }

          .unit {
            display: inline-block;
            margin: 0 2px;
          }
        }

        .pdf-side-content {
          position: relative;
          padding: 20px;
          top: 0;
          height: calc(100vh - 56px);
          overflow-y: auto;

          ::v-deep .thumbnail-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;

            .pdf-thumb-canvas {
              display: block;
              width: 100px;
              max-height: 150px;
              object-fit: contain;
              object-position: top;
              border: 4px solid transparent;
              border-radius: 8px;
              transition: border-color 0.2s ease;
              cursor: pointer;

              &.active {
                border-color: #528AFF;
              }
            }

            .page-label {
              color: #E0E0E0;
              font-size: 12px;
              font-weight: 500;
              line-height: normal;
              padding-top: 4px;
            }
          }
        }
      }

      .pdf-main-content {
        flex: 1;
        overflow-y: auto;
        height: 100vh;
        padding-top: 76px;

        ::v-deep .pdf-page {
          width: 1000px;

          + .pdf-page {
            margin-top: 10px;
          }
        }
      }

      @media (max-width: 1280px) {
        .pdf-side-bar {
          width: 150px;

          .side-bar-title {
            width: 150px;
          }

          .pdf-side-content {
            ::v-deep .thumbnail-wrapper {
              .pdf-thumb-canvas {
                width: 80px;
                max-height: 120px;
              }
            }
          }
        }
        .pdf-main-content {
          ::v-deep .pdf-page {
            min-width: 30%;
            max-width: 80%;
          }
        }
      }
    }
  }
}
</style>