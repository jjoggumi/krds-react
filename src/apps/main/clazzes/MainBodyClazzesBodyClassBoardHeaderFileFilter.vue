<template>
  <!-- 2022-08-01 파일 모아보기 필터 -->
  <div class="board__filter">
    <div class="group-filter-sub file">
      <button
        v-for="(tab, index) of tabs"
        :key="`${tab.code}-${index}`"
        :class="{
          'is-active': activeTabCode === tab.code,
          [tab.class]: true
        }"
        @click="changeActiveTab(tab.code)"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="group-filter-latest">
      <input type="checkbox" id="allchk" v-model="allCheck" @change="onChangeAllCheck" @click="onClickAllCheck">
      <label for="allchk">
        <span>전체 선택</span>
      </label>
      <div class="area-download">
        <div
          v-if="checkedCount > 0"
          class="text"
        >
          <span class="num">{{ checkedCount }}개</span> 선택
        </div>

        <!-- 2022-08-30 데이터 결과 없을 경우 & 0개 선택 시 -->
        <button
          class="btn-download"
          :class="{
            'is-selected': checkedCount > 0
          }"
          :disabled="checkedCount === 0"
          @click="emitDownloadCheckFiles"
        >
          다운로드
        </button>

      </div>
    </div>
    <div class="group-filter-latest pt-00" v-if="totalCount > 0">
      <div class="btn-sort">
        <input type="checkbox" id="latest" v-model="newestCheckBox">
        <label for="latest">
          <span>최신순</span>
        </label>
      </div>
    </div>
    <main-body-clazzes-file-modal
      v-if="fileModalFlag"
      :count="modalPage"
      @closeModal="onCloseModal"
    />
  </div>

</template>

<script>
import {mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import {cloneDeep, isEmpty} from "lodash";
import {mapFields} from "vuex-map-fields";
import MainBodyClazzesFileModal from "@/apps/main/clazzes/MainBodyClazzesFileModal";
import _ from 'lodash';
import axios from "axios";

export default {
  name: "main-body-clazzes-body-class-board-header-file-filter",
  components: {
    MainBodyClazzesFileModal,
  },
  props: {
    curForm: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      allCheck: false,
      fileModalFlag: false,
      modalPage: 0,
      filesList: [],
      tabs: [
        {
          code: 'image',
          name: '이미지',
          class: 'btn-photo'
        },
        {
          code: 'video',
          name: '동영상',
          class: 'btn-video'
        },
        {
          code: 'file',
          name: '파일',
          class: 'btn-file'
        },
      ],
      newestCheckBox: true,
      sort: {
        newest: 'insertedTimestamp,desc',
        oldest: 'insertedTimestamp,asc',
      },
      checkedCount: 0,
      uploadPercent: 0,
      axiosCancel: null,
    }
  },
  computed: {
    ...mapState({
      curClassItem: 'curClassItem',
      curClassPostFileTabCode: 'curClassPostFileTabCode',
      curClazzesPostFiles: 'curClazzesPostFiles',
      curClassPostFileSearchQuery : 'curClassPostFileSearchQuery'
    }),
    ...mapFields({
      infiniteScroll: 'infiniteScroll',
    }),
    activeTabCode() {
      return this.curClassPostFileTabCode
    },
    totalCount() {
      return this.$store.state.storeBoard.boardFileTotalCount
    },
    classId() {
      return this.curClassItem.currentId
    },
    mode() {
      return this.curClassPostFileTabCode
    },
  },
  watch: {
    activeTabCode() {
      this.checkedCount = 0
      this.$store.state.storeBoard.boardCheckBoxes = []
      this.filesList = []
    },
    'checkBoxes.length'(val) {

    },
    newestCheckBox(val) {
      return this.changeNewestCheckBox(val)
    },
    checkedCount(v) {
      const totalCount = this.$store.state.storeBoard.boardFileTotalCount
      const files = this.$store.state.storeBoard.boardFiles

      if (totalCount === v) {
        this.allCheck = true
      } else if (files.length === v && totalCount === v) {
        this.allCheck = true
      } else {
        this.allCheck = false
      }
    },
    async allCheck(v) {
      //헤더문제로 안됨 날짜별선택 오작동
      // this.$store.state.storeBoard.boardAllCheck = v
    }
  },
  created() {
    const firstTab = this.tabs[0]
    if (firstTab && firstTab.code) {
      this.setCurClassPostFileTabCode(firstTab.code)
    }
  },
  mounted() {
    eventBus.$on('set-checked-count', count => {
      this.checkedCount = count
    })
  },
  beforeDestroy() {
    eventBus.$off('set-checked-count')
  },
  methods: {
    ...mapMutations({
      SetCurClazzesPostAllFiles: 'SetCurClazzesPostAllFiles',
      setCurClassPostFileTabCode: 'setCurClassPostFileTabCode',
      setCurClassPostFileSearchQueryAttr: 'setCurClassPostFileSearchQueryAttr',
      setInfiniteScrollIsBusy: 'setInfiniteScrollIsBusy'
    }),

    // 전체 선택 프로세스 모달
    onCloseModal() {
      // request cancel !!!!
      this.axiosCancel.cancel();

      // request cancel Reset
      this.axiosCancel = null;
      this.$store.commit('storeBoard/clearProgressTimerId');
      this.$store.commit('storeBoard/setIsProgress', false);

      // 컴포넌트 Reset
      if(this.filesList.length > 0) {
        this.allCheck = true;
      }else {
        this.checkedCount = 0;
        this.allCheck = false;
      }
      
      this.fileModalFlag = false
    },
    async onClickAllCheck() {
      if (!this.allCheck) {
        this.checkedCount = this.totalCount
        const totalPage = this.$store.state.storeBoard.boardFileTotalPage
        if (this.filesList.length === this.totalCount) {
          let list = []
          for (const key in this.filesList) {
            list.push(this.filesList[key].seq)
          }
          this.$store.state.storeBoard.boardCheckBoxes = list
        } else {
          this.filesList = []
          this.$store.state.storeBoard.boardCheckBoxes = []
          
          // 1. 전체 데이터를 호출한다
          let requestParams = {
            size: this.$store.state.storeBoard.boardFileTotalCount,
            postType: this.curForm,
            sort: this.curClassPostFileSearchQuery.sort
          }

          if(this.$store.state.storeBoard.curBoardId) {
            requestParams.boardId = this.curClassPostFileSearchQuery.boardId
          }
          if(this.$store.state.storeBoard.curBoardFolderId) {
            requestParams.folderId = this.curClassPostFileSearchQuery.folderId
          }

          // 호출시 모달을 띄운다
          if(totalPage > 1) {
            //페이지가 1개 이상일때만 모달표시
            this.fileModalFlag = true
          }

          // 2. API Progress를 부를 state 값을 true로 변경한다.
          this.$store.commit('storeBoard/setIsProgress', true);
          this.$store.commit('storeBoard/setProgress', 0);
          // 3. API 호출 후 데이터를 저장한다.
          const axiosSource = axios.CancelToken.source();
          this.axiosCancel = { cancel: axiosSource.cancel };

          if(requestParams.size<1000) {
            await this.$hiClass.clazzesPostFiles
                .search(requestParams, this.classId, this.mode, axiosSource.token)
                .then(res => {
                  if(!isEmpty(res.data._embedded.files)) {
                    res.data._embedded.files.map(file => {
                      file.date = this.$moment(file.insertedTimestamp).format('YYYY년MM월DD일')
                      this.filesList.push(file)
                    })
                  } else {
                    throw new Error('clazzesPostFiles API 호출에 실패 하였습니다. ');
                  }
                })
                .catch(error => {
                  if(axios.isCancel(error)) {
                    console.log('Request canceled', error.message)
                  }
                });
          } else {
            let len = Math.ceil(requestParams.size / 1000)
            for(let i = 0;i<len;i++) {
              requestParams.page = i
              requestParams.size = 1000

              await this.$hiClass.clazzesPostFiles
                .search(requestParams, this.classId, this.mode, axiosSource.token)
                .then(res => {
                  if(!isEmpty(res.data._embedded.files)) {
                    res.data._embedded.files.map(file => {
                      file.date = this.$moment(file.insertedTimestamp).format('YYYY년MM월DD일')
                      this.filesList.push(file)
                    })
                  } else {
                    throw new Error('clazzesPostFiles API 호출에 실패 하였습니다. ');
                  }
                })
                .catch(error => {
                  if(axios.isCancel(error)) {
                    console.log('Request canceled', error.message)
                  }
                });
            }
          }

          if(this.$store.state.storeBoard.isProgress){
            this.$store.state.storeBoard.boardFiles = this.filesList
            this.SetCurClazzesPostAllFiles(this.filesList)

            // 4. API Progress를 부를 state 값을 false로 변경한다.
            this.$store.commit('storeBoard/setIsProgress', false);

            // 5. infinityScroll Config가 재계산된다.
            const countPage = this.curClazzesPostFiles.length/20; // 전체 페이지 - 현재 페이지의 20개 기준 총량
            this.infiniteScroll.page = Math.floor(countPage);

            // 6.전체 체크박스가 체크된다.
            setTimeout(() => {
              this._updateCheckBoxStatus(this.curClazzesPostFiles);
            })
            
            // 7. 0.5s 뒤 모달이 닫힌다.
            setTimeout(() => {
              this.fileModalFlag = false
            }, 500)
          }
        }
      }
    },
    _updateCheckBoxStatus(list){
      let arr = []
        //1.getPostFiles 불러온후 조건식대로 리스트 만들고나서
        //2.체크박스LIST에 seq값 넣고 중복값 제거
        _.map(list, function(file){
          return arr.push(file.seq)
        })

        let boardCheckBoxes = this.$store.state.storeBoard.boardCheckBoxes|| [];
        boardCheckBoxes = [...boardCheckBoxes, ...arr]
        this.$store.state.storeBoard.boardCheckBoxes = [...new Set(boardCheckBoxes)]
    },
    onChangeAllCheck() {
      if (!this.allCheck) {
        this.$store.state.storeBoard.boardCheckBoxes = []
        this.checkedCount = 0
      }
    },
    async getPostFiles(page) {
      const requestPostType = this.curForm
      let requestParams = {
        size: 20,
        page,
        postType: requestPostType,
      }
      if(this.$store.state.storeBoard.curBoardId) {
        requestParams.boarId = this.$store.state.storeBoard.curBoardId
      }
      if(this.$store.state.storeBoard.curBoardFolderId) {
        requestParams.folderId = this.$store.state.storeBoard.curBoardFolderId
      }

      await this.$hiClass.clazzesPostFiles
        .search(requestParams, this.classId, this.mode)
        .then(res => {
          if(!isEmpty(res.data._embedded.files)) {
            res.data._embedded.files.map(file => {
              file.date = this.$moment(file.insertedTimestamp).format('YYYY년MM월DD일')
              this.filesList.push(file)
            })
            this.$store.state.storeBoard.boardFiles = this.filesList
            this.SetCurClazzesPostAllFiles(this.filesList)
          }
        })
        .catch(error => {
          this.$log.debug(this.$options.name, 'error:', error)
        })
    },
    changeActiveTab(code) {
      this.allCheck = false
      this.checkedCount = 0
      this.SetCurClazzesPostAllFiles(undefined)
      this.setCurClassPostFileTabCode(null)
      this.setCurClassPostFileSearchQueryAttr({keyword: null})
      this.$nextTick(() => {
        this.setCurClassPostFileTabCode(code)
        eventBus.$emit('get-cur-post-files', true)
      })
    },
    changeNewestCheckBox(val) {
      this.setCurClassPostFileSearchQueryAttr({
        sort: val ? this.sort.newest : this.sort.oldest
      })
      this.changeActiveTab(this.activeTabCode)
    },
    emitDownloadCheckFiles() {
      eventBus.$emit('download-checked-files')
    },
  }

}
</script>