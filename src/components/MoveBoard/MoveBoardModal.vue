<!--
@File(Method): MoveBoardModal.vue
@Author: -
@Date Created: -
@Description: 클래스 > 게시판 > 게시글 내 캐밥 클릭 > 이동(복사)할 게시판 선택 모달
@Modified: 2025-03-24 - #73195 클래스 > 게시글 복사 팝업 노출 시 딤드 뒷화면 스크롤 되지 않도록 수정 : Himodal로 수정
-->
<template>
  <HiModal type="type01" size="sm" @close="close">
    <template v-slot:heading>{{ `${boardModalType === 'move' ? '이동' : '복사'}할 게시판을 선택해주세요.` }}</template>
    <template v-slot:content> 
      <div class="modal-board-move-container">
          <HiSelectBox
            v-if="boardModalType === 'copy'"
            class="w100 mb-10"
            :items="classes"
            :value="selectedClassId"
            @update:value="selectedClassId = $event"
            :empty-title="'' || '클래스를 선택해주세요.'"
          />
          <div class="content" :class="{copy : boardModalType === 'copy'}">
            <template v-if="boardList.length > 0">
              <div class="board" v-for="item of boardList" :key="`board-list-${item.boardId}`">
                <p class="board-name"
                  :class="{'on': chkMoveObj.boardId === item.boardId}"
                >
                  <span class="title" v-if="item.folderCount > 0" >
                    <HiIcon name="ico-group-fill" color="gray" size="20" class="board-type-group" v-if="item.boardType === 'SECRET'" />
                    {{ item.boardName }}</span>
                  <span class="title" v-else>
                  <input type="radio" name="move-board-chk" :id="`chk-board-${item.boardId}`"
                    :class="{'dis': boardModalType === 'move' && selectId === item.boardId}"
                    :disabled="boardModalType === 'move' && selectId === item.boardId"
                    :value="item"
                    v-model="chkMoveObj"
                  />
                  <label :for="`chk-board-${item.boardId}`">
                    <span class="chk-title">
                      <HiIcon name="ico-group-fill" color="gray" size="20" class="board-type-group" v-if="item.boardType === 'SECRET'" />
                      {{ item.boardName }}
                      </span>
                  </label>
                </span>
                <span class="auth" v-if="item.boardType !== 'SECRET'">읽기({{ getAuth(item) }})</span>
                </p>
                <ul v-if="item.folderCount > 0">
                  <li v-for="folderItem of item.folderList" :key="`folder-list-${folderItem.folderId}`"
                    :class="{'on': chkMoveObj.folderId === folderItem.folderId}"
                  >
                  <span class="check">
                    <input type="radio" name="move-board-chk" :id="`chk-board-${folderItem.folderId}`"
                      :class="{'dis': boardModalType === 'move' && selectId === folderItem.folderId}"
                      :disabled="boardModalType === 'move' && selectId === folderItem.folderId"
                      :value="folderItem"
                      v-model="chkMoveObj"
                    />
                    <label :for="`chk-board-${folderItem.folderId}`">
                      <span class="chk-title"><i :style="`background: ${folderItem.color};`"></i>{{ folderItem.folderName }}</span>
                    </label>
                  </span>
                  </li>
                </ul>
              </div>
            </template>
            <template v-else>
              <div class="board__nodata">
                <p>사용중인 게시판이 없습니다.</p>
              </div>
            </template>
        </div>        
      </div>
      <MoveBoardRecevieTargetModal v-if="isMoveBoardReceiveTargetModal"
        :postId="postId"
        :selectObj="selectObj"
        :moveObj="moveObj"
        :postStatus="postStatus"
        @movePost="movePost"
        @close="closeMoveBoardReceiveTargetModal"
      />
    </template>
    <template v-slot:footer> 
      <HiButton color="line-default" size="lg" @click="close">취소</HiButton>
      <HiButton color="primary" size="lg"  @click="boardModalType === 'move' ? submitMove() : submitCopy()" :disabled="!isSubmit">
        {{ boardModalType === 'copy' ? '복사하기' : '선택' }}
      </HiButton>
    </template>       
  </HiModal>

  <!--  #73195 클래스 > 게시글 복사 팝업 노출 시 딤드 뒷화면 스크롤 되지 않도록 수정 : Himodal로 수정 이전 코드
  <div
      v-if="isReady"
      class="modal normal-modal slick-modal view-main-detail-modal"
      id="moveBoardModal"
      style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="modal-board-move-container">
            <div class="title-wrap">
              <h2>{{ `${boardModalType === 'move' ? '이동' : '복사'}할 게시판을 선택해주세요.` }}</h2>
            </div>

            <div class="content-wrap">
              <HiSelectBox
                  v-if="boardModalType === 'copy'"
                  class="w100 mb-10"
                  :items="classes"
                  :value="selectedClassId"
                  @update:value="selectedClassId = $event"
                  :empty-title="'' || '클래스를 선택해주세요.'"
              />
              <div class="content" :class="{copy : boardModalType === 'copy'}">
                <template v-if="boardList.length > 0">
                  <div class="board" v-for="item of boardList" :key="`board-list-${item.boardId}`">
                    <p class="board-name"
                      :class="{'on': chkMoveObj.boardId === item.boardId}"
                    >
                      <span class="title" v-if="item.folderCount > 0" >
                        <HiIcon name="ico-group-fill" color="gray" size="20" class="board-type-group" v-if="item.boardType === 'SECRET'" />
                        {{ item.boardName }}</span>
                      <span class="title" v-else>
                      <input type="radio" name="move-board-chk" :id="`chk-board-${item.boardId}`"
                        :class="{'dis': boardModalType === 'move' && selectId === item.boardId}"
                        :disabled="boardModalType === 'move' && selectId === item.boardId"
                        :value="item"
                        v-model="chkMoveObj"
                      />
                      <label :for="`chk-board-${item.boardId}`">
                        <span class="chk-title">
                          <HiIcon name="ico-group-fill" color="gray" size="20" class="board-type-group" v-if="item.boardType === 'SECRET'" />
                          {{ item.boardName }}
                          </span>
                      </label>
                    </span>
                    <span class="auth" v-if="item.boardType !== 'SECRET'">읽기({{ getAuth(item) }})</span>
                    </p>
                    <ul v-if="item.folderCount > 0">
                      <li v-for="folderItem of item.folderList" :key="`folder-list-${folderItem.folderId}`"
                          :class="{'on': chkMoveObj.folderId === folderItem.folderId}"
                      >
                      <span class="check">
                        <input type="radio" name="move-board-chk" :id="`chk-board-${folderItem.folderId}`"
                          :class="{'dis': boardModalType === 'move' && selectId === folderItem.folderId}"
                          :disabled="boardModalType === 'move' && selectId === folderItem.folderId"
                          :value="folderItem"
                          v-model="chkMoveObj"
                        />
                        <label :for="`chk-board-${folderItem.folderId}`">
                          <span class="chk-title"><i :style="`background: ${folderItem.color};`"></i>{{ folderItem.folderName }}</span>
                        </label>
                      </span>
                      </li>
                    </ul>
                  </div>
                </template>
                <template v-else>
                  <div class="board__nodata">
                    <p>사용중인 게시판이 없습니다.</p>
                  </div>
                </template>
              </div>
            </div>

            <div class="btn-wrap">
              <button class="esc" @click="close">취소</button>
              <button
                  @click="boardModalType === 'move' ? submitMove() : submitCopy()"
                  :class="{ dis: !isSubmit }"
                  :disabled="!isSubmit"
              >
                {{ boardModalType === 'copy' ? '복사하기' : '선택' }}
              </button>
            </div>

            <div class="modal-close-btn" @click="close"></div>
          </div>
        </div>
      </div>
    </div>
    <MoveBoardRecevieTargetModal v-if="isMoveBoardReceiveTargetModal"
      :postId="postId"
      :selectObj="selectObj"
      :moveObj="moveObj"
      :postStatus="postStatus"
      @movePost="movePost"
      @close="closeMoveBoardReceiveTargetModal"
    />
  </div> -->
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import MoveBoardRecevieTargetModal from '@/components/MoveBoard/MoveBoardRecevieTargetModal.vue'
import HiSelectBox from '@/components/Form/HiSelectBox.vue'
import HiIcon from '@/components/Icon/HiIcon.vue'

export default {
  name: 'move-board-modal',
  components: {
    MoveBoardRecevieTargetModal, HiSelectBox, HiIcon
  },
  data() {
    return {
      isReady: false,

      classes: [],
      selectedClassId: '',

      boardList: [],
      chkMoveObj: {},
      moveObj: {},
      isMoveBoardReceiveTargetModal: false,
    }
  },
  props: {
    board: {
      type: Object
    },
    folder: {
      type: Object
    },
    postId: {
      type: String
    },
    postStatus: {
      type: String
    },
    boardModalType: {
      type: String
    },
    isParentDeactivated: {
      type: Boolean
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    classId() {
      return this.board.classId
    },
    selectObj() {
      return {
        board : this.board,
        folder : this.folder
      }
    },
    selectId() {
      return this.folder ? this.folder.folderId : this.board.boardId
    },
    isSubmit() {
      return !_.isEmpty(this.chkMoveObj)
    }
  },
  methods:{
    ...mapActions('storeBoard', {
      getBoardList: 'getBoardList',
    }),
    ...mapMutations({
      setIsDimLoading: 'setIsDimLoading',
      setCurClazzesPostsAfterDelete: 'setCurClazzesPostsAfterDelete'
    }),

    getAuth(item) {
      if(!item.isReadParents && !item.isReadStudent) {
        return "권한없음"
      } else if(item.isReadParents && item.isReadStudent) {
        return "학부모, 학생"
      } else if(item.isReadParents) {
        return "학부모"
      } else if(item.isReadStudent) {
        return "학생"
      }
    },

    close() {
      this.$emit("close")
    },

    async getBoards() {
      try {
        const res = await this.getBoardList({ classId: this.selectedClassId })
        const boardList = _.cloneDeep(
          res.filter(b => b.boardType !== 'SECRET'
            || (this.boardModalType == 'copy' && (b.boardPermission || {}).isWritable)))
        this.boardList = boardList.map(board => {
          return {
            ...board,
            folderList: board.folderList.map(folder => {
              return {
                ...folder,
                boardId: board.boardId,
                postType: board.postType
              }
            })
          }
        })
      } catch (err) {
        this.$log.debug('getBoards getBoardList GET() error => ', err)
      }
    },

    async getClasses() {
      let params = {
        page: 0
      }

      const res = await this.$axios({
        method: 'GET',
        url: `/users/${this.user.currentId}/classes/${this.user.userType}`,
        params: params
      })

      const classes = (res.data._embedded || {}).classes || []
      this.classes.push(...classes.map(classItem => {
        return {title: classItem.className, value: classItem.classId}
      }))
    },

    // 게시물 이동 ===========================================================
    openMoveBoardReceiveTargetModal() {
      this.isMoveBoardReceiveTargetModal = true
    },

    closeMoveBoardReceiveTargetModal(reload = false, deleted = false) {
      this.isMoveBoardReceiveTargetModal = false

      if(reload) {
        this.getBoards()
      }

      if(deleted) {
        this.$emit("deletePost", this.postId)
      }
    },

    async submitMove() {
      let isConfirm = true
      if(this.selectObj.board.postType === "HOMEWORK" && this.chkMoveObj.postType !== "HOMEWORK") {
        const chkres = await this.$hiClass.confirm('게시판 이동 시 과제 제출 내역을 확인할 수 없습니다. 이동하시겠습니까?', 'warning')

        if(chkres.isConfirmed === false) {
          isConfirm = false
        }
      }

      if(isConfirm) {
        if(this.chkMoveObj.folderId) {
          this.moveObj = {
            board: this.boardList.find(v => v.boardId === this.chkMoveObj.boardId),
            folder: this.chkMoveObj
          }
        } else {
          this.moveObj = {
            board: this.chkMoveObj,
            folder: null
          }
        }

        this.openMoveBoardReceiveTargetModal()
      }
    },

    movePost(post) {
      this.$emit("movePost", post)
      this.closeMoveBoardReceiveTargetModal()
    },

    // 게시물 복사 ===========================================================
    async submitCopy() {
      try {
        const res = await this.$hiClass.posts.read(`/posts/${this.postId}`)
        if (res.data) {
          let post = res.data

          if (post.del) {
            this.$hiClass.alert('게시글이 삭제되었습니다.')
                .then(() => {
                  this.$emit("deletePost", this.postId)
                  this.close()
                })
            return false
          }

          this.setIsDimLoading(true)
          // 파일을 복사해서 파일 배열로 생성
          const promises = await this.makeCopyFileList(post)

          try {
            let isAllSuccess = true
            let resFiles = []
            let errFiles = []
            if (promises.length > 0) {
              const res = await Promise.allSettled(promises)
              for (let r of res) {
                if (r.status === 'fulfilled' && r.value.status === 200) {
                  const requestFileOriginalPath = JSON.parse(r.value.config.data).fileOriginalPath
                  const originalFile = post.files.find(f => f.fileOriginalPath === requestFileOriginalPath)
                  let fileContentType = originalFile.fileContentType
                  let fileName = originalFile.fileName

                  if (r.value.data.fileOriginalPath && r.value.data.fileOriginalPath.includes('.mp4')) {
                    try {
                      fileContentType = 'video/mp4'
                      fileName = `${originalFile.fileName.split('.')[0]}.mp4`
                    } catch (e) {
                      fileContentType = originalFile.fileContentType
                      fileName = originalFile.fileName
                    }
                  }

                  resFiles.push({
                    originalFile: originalFile,
                    fileContentType: fileContentType,
                    fileFlag: originalFile.fileFlag,
                    fileName: fileName,
                    fileSize: originalFile.fileSize,
                    ...r.value.data
                  })
                } else {
                  const requestFileOriginalPath = JSON.parse(r.reason.config.data).fileOriginalPath
                  const originalFile = post.files.find(f => f.fileOriginalPath === requestFileOriginalPath)

                  errFiles.push({
                    originalFile: originalFile,
                    fileContentType: originalFile.fileContentType,
                    fileFlag: originalFile.fileFlag,
                    fileName: originalFile.fileName,
                    fileSize: originalFile.fileSize
                  })
                }
              }

              // 모든 요청이 성공했으나
              isAllSuccess = res.every(r => r.status === 'fulfilled')
              if (isAllSuccess) {
                // 서버 에러(404, 500)가 난 경우 체크
                isAllSuccess = res.every(r => r.value.status === 200)
              }
            }

            // post 복사 작업
            const copyPostObj = await this.makeCopyPostObj(post, resFiles, errFiles)

            if (!isAllSuccess) {
              this.$hiClass.alert('일부 파일을 불러오지 못했습니다.<br>파일을 다시 첨부해주세요.')
            }

            this.$emit("copyPost", copyPostObj)
          } catch (e) {
            throw new Error(e)
          }
        }
      } catch (e) {
        this.$log.debug(`copyPost err: ${e}`)
      } finally {
        this.setIsDimLoading(false)
      }
    },

    async makeCopyFileList(post) {
      const promises = []
      let file = {}
      if (post.files && post.files.length > 0) {
        for (const f of post.files) {
          file = {}
          // 이미지일때
          if (f.fileContentType.startsWith('image')) {
            file.fileOriginalPath = f.fileOriginalPath
          }

          // 영상일때
          if (f.fileContentType.startsWith('video')) {
            file.fileOriginalPath = f.fileOriginalPath
            if (f.fileTranscodePath) { // 인코딩 완료됨
              file.fileTranscodePath = f.fileTranscodePath
              // 썸네일
              if (f.fileThumbnailPath && !f.fileThumbnailPath.includes('image.hiclass.net')) {
                file.fileThumbnailPath = f.fileThumbnailPath.split('?')[0]
              }
            }
          }

          // 문서일때
          if (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video')) {
            file.fileOriginalPath = f.fileOriginalPath
            if (f.fileConvertPath && !f.fileConvertPath.includes('image.hiclass.net')) {
              file.fileConvertPath = f.fileConvertPath
            }
            if (f.fileThumbnailPath && !f.fileThumbnailPath.includes('image.hiclass.net')) {
              file.fileThumbnailPath = f.fileThumbnailPath.split('?')[0]
            }
          }

          // 영상일때는 인코딩 false
          promises.push(
              this.$hiClass.multipart.copy(file, {
                encode: !f.fileContentType.startsWith('video')
              })
          )
        }
      }
      return promises
    },

    async makeCopyPostObj(post, resFiles, errFiles) {
      let copyPostObj = {
        postType: this.chkMoveObj.postType,
        postTitle: post.postTitle,
        postContent: post.postContent,
        postStatus: '',
        postMustRead: false,
        postPin: false,
        version: 'V2',
        boardId: this.chkMoveObj.boardId,
        postOptions: [],
        disclosureType: true,
        parentUri: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.selectedClassId}`,
      }

      let boardObj = _.cloneDeep(this.chkMoveObj)
      if (this.chkMoveObj.folderId) {
        let parent = this.boardList.find(board => board.boardId === this.chkMoveObj.boardId)
        if (parent) {
          boardObj = parent
          copyPostObj.categoryId = this.chkMoveObj.folderId
        }
      }

      if (boardObj) {
        copyPostObj.board = boardObj
      }

      copyPostObj.files = [...resFiles, ...errFiles]

      return copyPostObj
    },
  },
  async mounted() {
    if (this.boardModalType === 'copy') {
      await this.getClasses()
    }

    if (this.boardModalType === 'move' || !this.isParentDeactivated) {
      this.selectedClassId = this.classId
    } else {
      this.selectedClassId = this.classes[0].value
    }

    await this.getBoards()
    this.isReady = true
  },
  watch: {
    selectedClassId(newVal, oldVal) {
      if (oldVal !== '') {
        this.getBoards()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.modal-board-move-container {
  height: 457px;
  background: #FFF;
  border-radius: 16px;
  position: relative;

  .content {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    border: 1px solid #E0E0E0;
    overflow: auto;

    &.copy {
      height:calc(100% - 50px);
    }
    .board{      
      .board-name {
        width: 100%;
        height: 56px;
        border-bottom: 1px solid #EEEEEE;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }
      .board-name.on {
          background: #4778DE14;
      }
      .board-name span.title {
          font-size: 16px;
          font-weight: 400;
          color: #222;
          display: flex;
          height: 100%;
          width: 100%;
          align-items: center;
          padding: 0 20px;
          
      }
      .board-name span.title input[type=radio]+label {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
      }
      .board-name span.title em {
          display: inline-block;
          margin-left: 8px;
      }
      .board-name span.auth {
          font-size: 13px;
          font-weight: 400;
          color: #9E9E9E;
          position: absolute;
          right: 20px;
          pointer-events: none;
      }
      ul li {
          width: 100%;
          height: 52px;
          margin: 0;
          padding: 0 30px;
          display: flex;
          align-items: center;
          background: #FAFAFA;
          position: relative;
      }
      ul li:not(:first-child):before {
          content: "";
          position: absolute;
          left: 15px;
          top: 0;
          height: 1px;
          width: calc(100% - 30px);  /* or 100px */
          border-top: 1px solid #EEEEEE;
      }
      ul li.on {
          background: #4778DE14;
      }
      ul li:first-child {
          border-top: 0;
      }
      ul li span {
          display: inline-block;
      }
      ul li span.check {    
          display: flex;
          height: 100%;
          width: 100%;
          align-items: center;
      }
      ul li span.check input[type=radio]+label {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
      }
      .board-name label span.chk-title, 
      ul li label span.chk-title {
          font-size: 15px;
          font-weight: 400;
          color: #222;
          margin-left: 8px;
          display: inline-flex;
          align-items: center;
      }
      .board-name input[type=radio]:checked + label span.chk-title, 
      ul li input[type=radio]:checked + label span.chk-title,
      .board-name input[type=radio].dis + label span.chk-title, 
      ul li input[type=radio].dis + label span.chk-title,
      .board-name:hover label span.chk-title, 
      ul li:hover label span.chk-title {
          font-weight: 600;
      }
      ul li label span.chk-title i {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 5px;
      }
    }
  }
}
</style>