<!--
@File(Method): MainBodyClazzesBodyClassBoardClazzPostFiles.vue
@Description: 파일 모아보기
@Modified: css scoped 적용
-->
<template>
  <!-- 2022-08-01 파일 모아보기 사진 -->
  <div class="board__attachment">
    <div
      class="board-file__list"
      :key="`list_${index}`"
      v-for="(list, index) in filesData"
    >
      <div
        class="board-file__date"
        :style="{ marginTop: index > 0 ? '24px' : '0px' }"
      >
        <input
          type="checkbox"
          :id="`date${index}`"
          v-model="dateChecked[list[0].date]"
          @change="
            getSelectedDateItems(
              dateChecked[list[0].date],
              list,
              infiniteScroll.page,
              list[0].date
            )
          "
        />
        <label :for="`date${index}`">
          <span class="date">{{ list[0].date }}</span>
        </label>
      </div>
      <!-- 파일 모아보기 이미지, 동영상 -->
      <main-body-clazzes-body-class-board-clazz-post-files-mode-image-video
        v-if="isVisiblePhotoVideoList"
        :key="`${mode}-image-video`"
        :files="list"
        :date-check="list[0].date"
        :check-flag="dateChecked[list[0].date]"
        @dateCheck="dateCheck"
      />

      <!-- 파일 모아보기 첨부파일 -->
      <main-body-clazzes-body-class-board-clazz-post-files-mode-file
        v-else-if="isVisibleFileList"
        :key="`${mode}-file`"
        :files="list"
        :date-check="list[0].date"
        :check-flag="dateChecked[list[0].date]"
        @dateCheck="dateCheck"
      />

      <main-body-clazzes-body-class-board-clazz-post-files-loading-box
        v-if="curClazzesPostFiles === undefined"
      />
    </div>
    <div v-if="filesData.length === 0" class="board__nodata">
      <p>{{ noDataMessage }}</p>
    </div>
  </div>
  <!-- //2022-08-01 파일 모아보기 사진 -->
</template>

<script>
import { eventBus } from "@/main";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { mapFields } from "vuex-map-fields";
import jszip from "jszip";
import axios from "axios";
// zip file archive download
import { saveAs } from "file-saver";
import MainBodyClazzesBodyClassBoardClazzPostFilesModeImageVideo from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardClazzPostFilesModeImageVideo.vue";
import MainBodyClazzesBodyClassBoardClazzPostFilesModeFile from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardClazzPostFilesModeFile.vue";
import MainBodyClazzesBodyClassBoardClazzPostFilesLoadingBox from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardClazzPostFilesLoadingBox.vue";
import { cloneDeep, isEmpty } from "lodash";

export default {
  name: "main-body-clazzes-body-class-board-clazz-post-files",
  components: {
    MainBodyClazzesBodyClassBoardClazzPostFilesLoadingBox,
    MainBodyClazzesBodyClassBoardClazzPostFilesModeFile,
    MainBodyClazzesBodyClassBoardClazzPostFilesModeImageVideo,
  },
  props: {
    curForm: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isAll: false,
      isImgView: false,
      imgIndex: 0,
      checkBoxes: [],
      fileNameObj: {},
      filesData: [],
      dateChecked: {},
      dateCheckedList: [],
      postFiles: [],
      backupDataCheckList: [], // 반복 api 확인을 방지 하기 위한 백업 데이터
    };
  },
  computed: {
    ...mapState({
      curClassItem: "curClassItem",
      curClazzesPostFiles: "curClazzesPostFiles",
      curClassPostFileTabCode: "curClassPostFileTabCode",
      curClassPostFileSearchQuery: "curClassPostFileSearchQuery",
    }),
    ...mapGetters({}),
    ...mapFields({
      infiniteScroll: "infiniteScroll",
    }),
    isVisibleFileList() {
      return ["file"].includes(this.curClassPostFileTabCode);
    },
    isVisiblePhotoVideoList() {
      return ["image", "video"].includes(this.curClassPostFileTabCode);
    },
    classId() {
      return this.curClassItem.currentId;
    },
    mode() {
      return this.curClassPostFileTabCode;
    },
    /**
     * TODO:
     * @returns {number|number}
     */
    count() {
      return this.checkBoxes.length || 0;
    },
    files() {
      return this.curClazzesPostFiles || [];
    },
    noDataMessage() {
      let contentStr = "첨부파일";
      let suffix = "이";

      switch (this.curClassPostFileTabCode) {
        case "image": {
          contentStr = "이미지";
          suffix = "가";
          break;
        }
        case "video": {
          contentStr = "동영상";
          break;
        }
        case "file": {
          contentStr = "첨부파일";
          break;
        }
      }
      return `게시글에 등록된 ${contentStr + suffix} 없습니다.`;
    },
    activeTabCode() {
      return this.curClassPostFileTabCode;
    },
  },
  watch: {
    activeTabCode() {
      this.dateChecked = {};
    },
    files: {
      deep: true,
      handler(v) {
        this.setFilesData(v);
      },
    },
    dateChecked(v) {
      let list = [];
      for (let date in v) {
        if (v[date]) {
          list.push(date);
        }
      }
      this.dateCheckedList = list;
    },
    dateCheckedList(v) {
      if (!this.backupDataCheckList.includes(v[v.length - 1])) {
        this.backupDataCheckList.push(v[v.length - 1]);
      }
    },
    mode() {
      this.backupDataCheckList = [];
    },
  },
  mounted() {
    this.getCurClazzesPostFiles(true);
    eventBus.$on("get-cur-post-files", (initFlag) => {
      this.getCurClazzesPostFiles(initFlag);
    });
    eventBus.$on("destroy-cur-post-files", () => {
      this.destroyCurPostFiles();
    });
    // boardCheckBoxes reset = 체크되어있지 않은 파일은 제거
    this.$store.state.storeBoard.boardCheckBoxes.splice(0);
    // 체크되었던 전체 데이터 초기화
    this.dateChecked = {};
  },
  beforeDestroy() {
    eventBus.$off("get-cur-post-files");
    eventBus.$off("destroy-cur-post-files");

    this.destroyCurPostFiles();
  },
  methods: {
    ...mapMutations({
      setCurClazzesPostFiles: "setCurClazzesPostFiles",
      setCurClassTabCode: "setCurClassTabCode",
      setCurClassPostFileTabCode: "setCurClassPostFileTabCode",
      setIsDimLoading: "setIsDimLoading",
      setIsFileLoading: "setIsFileLoading",
      setInfiniteScrollIsBusy: "setInfiniteScrollIsBusy",
    }),
    ...mapActions({
      initInfiniteScroll: "initInfiniteScroll",
      openAttachFilesViewer: "openAttachFilesViewer",
    }),
    // 전체 선택 시 날짜별 체크박스 선택
    dateCheck(obj) {
      let dateChecked = cloneDeep(this.dateChecked);
      dateChecked[obj.date] = this.$store.state.storeBoard.boardAllCheck
        ? true
        : obj.check;
      this.dateChecked = dateChecked;
    },
    async getDateList(page) {
      const requestPostType = this.curForm;
      const requestParams = {
        size: 20,
        page,
        postType: requestPostType,
      };
      await this.getCurClazzesPostFiles(false, requestParams);
    },
    async getSelectedDateItems(value, list, page, date = null) {
      //[API recycle code]전체선택 한번이라도 한적 있으면 실행 안함
      if (!this.backupDataCheckList.includes(date)) {
        this.setIsFileLoading(true);

        //1. 선택한 날짜의 데이터를 가져온다.
        await this._getSelectedDatePostFiles(date, list);
        //2. 선택한 날짜의 데이터와 지금 가지고 있는 데이터의 날짜를 비교한다.
        const getUnselectedPostFiles = this.postFiles.filter((selectedItem) => {
          return !this.curClazzesPostFiles.some((unselectedItem) => {
            return unselectedItem.seq === selectedItem.seq;
          });
        });
        // 3. CurClazzesPostFiles(:실제파일보관소) 에 데이터를 추가한다.
        this.setCurClazzesPostFiles(getUnselectedPostFiles);
        // 4. 기존 infiniteScroll 의 page를 호출한 값만큼 재계산 한다.
        let countPage = this.curClazzesPostFiles.length / 20; // 전체 페이지 - 현재 페이지의 20개 기준 총량
        this.infiniteScroll.page = Math.floor(countPage);

        this.setIsFileLoading(false);
      }
      //5. 체크박스 상태를 '선택됨' 으로 변경한다.
      setTimeout(() => {
        this._updateCheckBoxStatus(value, list);
      });
    },
    // [getSelectedDateItems] 의 내장함수
    async _getSelectedDatePostFiles(date, list) {
      // yyyy년 mm월 dd일을 공백제거하고 yyyy-mm-dd 포맷으로 변경
      const dateStr = date
        .replace(/ /g, "")
        .replace(/년/g, "-")
        .replace(/월/g, "-")
        .replace(/일/g, "");
      const requestParams = {
        boardId: this.curClassPostFileSearchQuery.boardId,
        folderId: this.curClassPostFileSearchQuery.folderId,
        postType: this.curForm,
        postStatus: "COMPLETE",
        dayOfPosted: dateStr,
      };
      await this.$hiClass.clazzesPostFiles
        .search(requestParams, this.classId, this.mode)
        .then((res) => {
          this.postFiles = res.data._embedded.files;
          return list;
        })
        .catch((error) => {
          this.$log.debug(this.$options.name, "error:", error);
        });
    },
    // [getSelectedDateItems] 의 내장함수
    _updateCheckBoxStatus(checking, list) {
      let arr = [];
      if (checking) {
        //1.getPostFiles 불러온후 조건식대로 리스트 만들고나서
        //2.체크박스LIST에 seq값 넣고 중복값 제거
        this.files.map((file) => {
          if (file.date === list[list.length - 1].date) {
            arr.push(file.seq);
          }
        });
        let boardCheckBoxes =
          this.$store.state.storeBoard.boardCheckBoxes || [];
        boardCheckBoxes = [...boardCheckBoxes, ...arr];
        this.$store.state.storeBoard.boardCheckBoxes = [
          ...new Set(boardCheckBoxes),
        ];
      } else {
        let listSeq = [];
        let boxes = [...this.$store.state.storeBoard.boardCheckBoxes];
        list.map((item) => {
          listSeq.push(item.seq);
        });
        const result = boxes.filter((x) => !listSeq.includes(x));
        this.$store.state.storeBoard.boardCheckBoxes = result;
      }
    },

    setFilesData(data) {
      const date = "posted";
      const format = "YYYY년 MM월 DD일";
      let files = {};
      let arr = [];

      if (!isEmpty(data)) {
        data.forEach((item) => {
          item.date = this.$moment(item[date]).format(format);
          if (!files[this.$moment(item[date]).format(format)]) {
            files[this.$moment(item[date]).format(format)] = [item];
          } else {
            files[this.$moment(item[date]).format(format)].push(item);
          }
        });


        for (const key in files) {
          this.dateChecked[key] = this.dateChecked[key]
            ? this.dateChecked[key]
            : false;
          arr.push(files[key]);
        }
      }
      this.filesData = arr;
      // this.$store.state.storeBoard.boardFiles = v
    },
    destroyCurPostFiles() {
      // 무한 스크롤 store 초기화
      this.initInfiniteScroll();
      this.setCurClassTabCode("LIST");
      this.setCurClazzesPostFiles(undefined);
      this.setCurClassPostFileTabCode("image");
    },
    async getCurClazzesPostFiles(initFlag, param = {}) {
      if (initFlag) {
        this.initInfiniteScroll();
        this.setCurClazzesPostFiles(undefined);
      }

      if (!this.infiniteScroll.isBusy && !this.infiniteScroll.isListEnd) {
        this.setInfiniteScrollIsBusy(true);

        const requestPostType = this.curForm;
        const requestParams = isEmpty(param)
          ? {
              size: this.infiniteScroll.size,
              page: this.infiniteScroll.page,
              postType: requestPostType,
            }
          : param;
        for (const [key, value] of Object.entries(
          this.curClassPostFileSearchQuery
        )) {
          if (value !== null) requestParams[key] = value;
        }
        await this.$hiClass.clazzesPostFiles
          .search(requestParams, this.classId, this.mode)
          .then((res) => {
            let list = [];
            if (!isEmpty(res.data._embedded.files)) {
              res.data._embedded.files.forEach((file) => {
                file.page = requestParams.page;
                list.push(file);
              });
            }
            this.setCurClazzesPostFiles(list);
            this.postFiles = res.data._embedded.files;
            const totalPages = res.data.page.totalPages;
            const pageNumber = res.data.page.number;
            this.$store.state.storeBoard.boardFileTotalPage =
              res.data.page.totalPages;
            this.$store.state.storeBoard.boardFileTotalCount =
              res.data.page.totalElements;
            if (totalPages > pageNumber + 1) {
              this.infiniteScroll.page++;
              this.infiniteScroll.isListEnd = false;
            } else {
              this.infiniteScroll.page = 0;
              this.infiniteScroll.isListEnd = true;
            }
            return list;
          })
          .catch((error) => {
            this.$log.debug(this.$options.name, "error:", error);
          })
          .finally(() => {
            this.setInfiniteScrollIsBusy(false);
          });
      }
    },

    download() {
      this.fileNameObj = {};

      let sumFileSize = 0;
      let maxFileSize = 100 * 1024 * 1024; // 100mb

      let array = [];
      for (let i of this.checkBoxes) {
        let obj = {};
        // 일괄 다운로드에 변환된 동영상 경로 추가
        obj.href =
          this.files[i].fileTranscodePath || this.files[i].fileOriginalPath;
        obj.filename = this.files[i].fileName;
        array.push(obj);

        try {
          sumFileSize += Number(this.files[i].fileSize);
        } catch (e) {
          this.$log.error(e);
        }
      }

      if (array.length <= 1) {
        this.$comn.downloadFiles(array); // OLD (단일 다운로드 가능)
      } else {
        if (this.$comn.isIE() && sumFileSize > maxFileSize) {
          alert(
            "해당 브라우저(internet explorer)의 보안 정책에 따라 대용량 파일을 다운로드할 수 없습니다. Chrome 사용 또는 개별 다운로드하시길 바랍니다."
          );
          this.setIsDimLoading(false);
          return false;
        }

        this.setIsDimLoading(true);

        let zip = new jszip();
        let archiveFileName = this.getArchiveFileName();
        let getApis = [];

        // 다운로드할 원본 데이터 요청
        for (const file of array) {
          const getApi = axios({
            method: "get",
            url: file.href,
            responseType: "blob",
            headers: "",
          });
          getApis.push(getApi);
        }

        Promise.all(getApis)
          .then((responses) => {
            responses.map((res, index) => {
              this.$log.warn(`res => `, res);

              const blob = new Blob([res.data], {
                type: "application/octet-stream",
              });

              // 과제 파일 이름
              let fileName = array[index].filename;
              fileName = this.getFileName(fileName);

              this.$log.warn(`fileName => `, fileName);

              zip.file(fileName, blob);
            });

            // zip 파일 생성
            zip
              .generateAsync(
                { type: "blob" }
                // 압축의 진행상황을 사용자에게 보여주기 위한 콜백함수
                // function updateCallback(metadata) {
                //   var msg =
                //     'progression : ' + metadata.percent.toFixed(2) + ' %'
                //   if (metadata.currentFile) {
                //     msg += ', current file = ' + metadata.currentFile
                //   }
                // }
              )
              .then((blob) => {
                // 과제 모음 zip파일 이름
                saveAs(blob, archiveFileName);
              })
              .finally(() => {
                this.setIsDimLoading(false);
              });
          })
          .catch((e) => {
            this.$log.warn(e);
            this.$hiClass.alert("파일 다운로드를 실패했습니다.<br>잠시 후 다시 시도해주세요.", "error");
            this.setIsDimLoading(false);
          });
      }
    },

    /**
     * 앨범 zip 다운로드 파일 이름
     */
    getArchiveFileName() {
      let fileName = "";
      try {
        fileName += `${this.posts[0].parent.className}`;
        fileName += `_앨범`;
        fileName += `_${this.$moment().format("YYMMDD")}`;
      } catch (error) {
        this.$log.debug(error);
        fileName = `앨범`;
      }
      if (this.$comn.isIE()) fileName += `.zip`;
      return fileName;
    },
    /**
     * 압축파일 내 중복 파일명이 있을 경우 파일명 변경
     * @param fileName
     * @return {string}
     */
    getFileName(fileName) {
      try {
        if (this.fileNameObj[fileName] === undefined)
          this.fileNameObj[fileName] = 0;
        else this.fileNameObj[fileName] = ++this.fileNameObj[fileName];
      } catch (e) {
        this.$log.warn(e);
      }
      const dupleCount = this.fileNameObj[fileName];

      if (dupleCount > 0) {
        if (fileName.includes(".")) {
          const fileNameNoExtension = fileName.replace(/\.[^/\\.]+$/, "");
          const fileExtension = this.$comn.getFileExtensionName(fileName);
          fileName = `${fileNameNoExtension} (${dupleCount}).${fileExtension}`;
        } else {
          fileName = `${fileName} (${dupleCount})`;
        }
      }

      return fileName;
    },
  },
};
</script>
<style lang="scss" scoped>
.board__attachment {
  .board-file__list {
    .board-file__date { 
      border-bottom: 1px solid #ececec; 
      &:not(:first-of-type) { margin-top: 24px; }
      .date {
        color: #616161;
        font-size: 13px;
        font-weight: 400;
        line-height: 34px;
      }
      &.loading::before {
        content: "";
        display: inline-block;
        width: 30%;
        height: 18px;
        background-color: #f5f5f5;
        margin: 7px 0;
      }
    }
  }
}
@keyframes loading {
  0% { transform: translateX(-150px); }
  100% { transform: translateX(150px); }
}

</style>
