<!--
@File(Method): MainBodyClazzesBodyPermissionBoardManagement.vue
@Description: 게시판 관리
@Modified:  2025-03-06 - #72670 비밀게시판 명칭 변경 > 그룹게시판
-->
<template>
  <div>
    <div class="page-sub-heading">
      <h3 class="heading">{{ title }}</h3>
      <div class="group-btn" v-if="curMode === 'ManagementList' && !isDraggableMode">
        <button class="hi-btn btn-md btn-line-lgray btn-order" @click="setDraggableMode(true)">순서변경</button>
        <button class="hi-btn btn-md btn-add" @click="openModal">게시판 추가</button>
      </div>
      <div
        class="group-btn"
        v-if="curMode === 'ManagementCreate' ||
        curMode === 'ManagementUpdate' ||
        (curMode === 'ManagementList' && isDraggableMode)"
      >
        <button class="hi-btn btn-md btn-line-lgray" @click="onClickCancel">취소</button>
        <button class="hi-btn btn-md" @click="onSave">저장</button>
      </div>
    </div>
    <div v-if="boardType === 'SECRET' && ['ManagementCreate', 'ManagementUpdate'].includes(curMode) && isModalOpen === false" class="sub-heading-info-message">
      * 게시판 권한을 개별/그룹으로 설정할 수 있으며, 설정한 구성원에게만 노출됩니다.<br>
      * 읽기, 글쓰기, 댓글 권한 등 상세 설정을 할 수 있습니다.
    </div>
    <div v-else class="sub-heading-info-message">
      * 게시판, 폴더를 추가 생성하거나 관리할 수 있습니다.<br>
      * 게시판별 사용 여부, 권한 등 상세 설정을 할 수 있습니다.
    </div>

    <!--    교체 영역-->
    <component
      :is="curMode"
      :clazzes="clazzes"
      ref="component"
      :componentType="type"
      :isDraggableMode="isDraggableMode"
      :responseItem="responseItem"
      :boardType="boardType"
      @onUpdateBoard="onUpdateBoard"
      @emitBoardList="setBoardList"
    />
    <HiModal v-if="isModalOpen" type="type01" size="sm" @close="closeModal" class="board-add">
      <template v-slot:heading>게시판 추가하기        
        <p class="smr">추가할 게시판 유형을 선택해주세요.</p>
      </template>
      <template v-slot:content> 
        <div class="board-type">
          <input id="1" type="radio" name="boardType" value="PUBLIC" v-model="boardType" />
          <label for="1">
            <span class="tit">
              <HiIcon name="ico-list2" color="primary" size="24"></HiIcon>
              일반 게시판
            </span>
            <span class="smr">자유 게시판과 동일한 형태의 일반 게시판입니다.<br>
              읽기, 쓰기, 댓글 등 원하는대로 권한 설정이 가능합니다.</span>
          </label>
          <input id="2" type="radio" name="boardType" value="SECRET" v-model="boardType" />
          <label for="2" class="mb-00">
            <span class="tit">
              <HiIcon name="ico-group" color="primary" size="24"></HiIcon>
              그룹 게시판
            </span>
            <span class="smr">선생님이 수신대상을 개별/그룹으로 지정할 수 있습니다.<br>
              선택된 구성원만 게시글을 읽을 수 있습니다.</span>
          </label>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="light-primary" outline size="lg" @click="cancelAddModal">취소</HiButton>
        <HiButton color="primary" size="lg" @click="handleAdd" :disabled="!boardType">추가</HiButton>           
      </template>
    </HiModal>
     <!-- // #69568 게시판 추가 모달 -->

  </div>
</template>

<script>
import ManagementList
  from "@/apps/main/clazzes/permission/MainBodyClazzesBodyPermissionBoardManagementList";
import ManagementCreate
  from "@/apps/main/clazzes/permission/MainBodyClazzesBodyPermissionBoardManagementCreate";
import ManagementUpdate
  from "@/apps/main/clazzes/permission/MainBodyClazzesBodyPermissionBoardManagementCreate";
import {mapActions, mapState} from "vuex";
import {cloneDeep, isEmpty} from "lodash";
import {eventBus} from "@/main";
export default {
  name: "main-body-clazzes-body-permission-board-management",
  components: {
    ManagementList,
    ManagementCreate,
    ManagementUpdate
  },
  data() {
    return {
      curMode: 'ManagementList',
      title: '게시판 관리',
      type: '',
      isDraggableMode: false,
      disabledSave: true,
      boardList: [],
      responseItem: {
        mode: 'read',
        item: {
          boardId: ''
        }
      },
      isModalOpen: false,
      boardType: 'PUBLIC'
    }
  },
  props: {
    clazzes: {
      type: Object
    }
  },
  watch: {
    curMode(v) {
      switch (v){
        case "ManagementCreate":{
          this.title = `새 ${this.isSecretBoard ? "그룹 " : ""}게시판`
          this.type = 'create'
          return
        }
        case "ManagementUpdate":{
          this.title = '게시판 상세 설정'
          this.type = 'update'
          return
        }
        default:{
          this.title = '게시판 관리'
          this.type = 'list'
          return
        }
      }
    }
  },
  computed: {
    ...mapState('storeBoard', ['curBoardList']),
    isSecretBoard() {
      return this.boardType === 'SECRET'
    }
  },
  methods: {
    ...mapActions('storeBoard', [
      'createBoard',
      'updateBoard',
      'updateBoardSortNo',
      'initCurBoardList',
      'initCurBoardListUpdate',
      'readBoard'
    ]),
    onUpdateBoard(item) {
      this.setMode('ManagementUpdate')
      this.boardType = item.boardType
      setTimeout(() => {
        this.$refs.component.setUpdateList(item)
      })
    },
    onClickCancel() {
      this.boardType = 'PUBLIC'
      this.setMode('ManagementList')
    },
    setMode(mode) {
      this.curMode = mode
      if (this.isDraggableMode) {
        this.$refs.component.setBoardList()
        this.isDraggableMode = !this.isDraggableMode
      }
    },
    setDraggableMode(flag) {
      this.isDraggableMode = flag
    },
    async onSave() {
      if (this.curMode === 'ManagementList') {
        this.onSaveBoardSort()
      } else {
        const params = this.$refs.component.getData()
        const blank_pattern = /^\s+|\s+$/g;
        if (!params.boardNameCheck || isEmpty(params.boardName) || params.boardName.replace(blank_pattern, '' ) == "" ) {
          this.$hiClass.alert('게시판 이름을 확인해주세요.')
          return false
        }
        if (params.folders.find(f => !f.folderName || (f.folderName && f.folderName.trim().length === 0))) {
          this.$hiClass.alert('폴더 이름을 확인해주세요.')
          return false
        }
        if (params.folders.find(f => f.isEditable)) {
          this.$hiClass.alert('폴더 편집을 완료해주세요.')
          return false
        }

        if (this.curMode === 'ManagementUpdate') {
          // 불필요한 필드 파라미터에서 삭제. folderList 는 read 전용
          if (params.folderList) {
            delete params.folderList
          }

          const updateRes = await this.updateBoard(params)
          this.responseItem = {
            mode: 'update',
            item: updateRes.data
          }

          if (updateRes === 428) {
            this.$toasted.clear()
            this.$toasted.show('게시글이 존재하는 폴더는 삭제가 불가능합니다.')
          } else if (updateRes === 418) {
            this.$toasted.clear()
            this.$toasted.show('폴더가 삭제되었습니다. 다시 확인해주세요.')
            this.curMode = 'ManagementList' 
          } else if (updateRes === 404) {
            this.$toasted.clear()
            this.$toasted.show('게시판이 삭제되었습니다. 다시 확인해주세요.')
          }

          this.setMode('ManagementList')
        } else {
          const createRes = await this.createBoard(params)
          this.responseItem = {
            mode: 'create',
            item: createRes
          }

          this.setMode('ManagementList')
        }
      }
    },
    onSaveFinishUpdateList(updateRes){
      const list = [...this.curBoardList]
      const chkParams = list.find(v => v.boardId === updateRes.boardId)

      if(!chkParams === true) {
        list.push(updateRes)
      }

      const newList = list.map(v => {
        if(v.boardId === updateRes.boardId){
          let boardItem = {}
          for (const [key, value] of Object.entries(updateRes)) {
            if (key === 'folders') {
              boardItem.folderList = []
              boardItem.folderCount = value.length
              value.forEach(folder => {
                boardItem.folderList.push(folder)
              })
            } else {
              boardItem[key] = value
            }
          }
          return boardItem
        } else {
          return v
        }
      })

      newList.sort((a, b) => a.sortNo - b.sortNo)
      return newList
    }, 
    onSaveFinishNewList(res){
      const list = [...this.curBoardList]
      list.push({ 
        boardId : res.boardId, 
        parentId : res.parentId,
        boardName : res.boardName,
        boardStatus : res.boardStatus,
        sortNo : res.sortNo,
        isUsedFolder : res.isUsedFolder,
        postType: res.postType,
        isDefault : res.isDefault,
        isWriteParents : res.isWriteParents,
        isWriteStudent : res.isWriteStudent,
        isReadParents : res.isReadParents,
        isReadStudent : res.isReadStudent,
        isUsedComment : res.isUsedComment,
        isCommentParents : res.isCommentParents,
        isCommentStudent : res.isCommentStudent,
        isUsedLike : res.isUsedLike,
        folderCount : res.isUsedFolder ? res.folders.length : 0,
        folderList : res.isUsedFolder ? res.folders.map(f => {
          return {
            folderId : f.folderId, 
            classId : this.clazzes.currentId, 
            folderName : f.folderName,
            sortNo : f.sortNo,
            color : f.color, 
            isDefault : f.isDefault, 
            postCount : f.postCount
          }
        }) : []
      })

      return list;
    },
    onSaveBoardSort() {
      let request = []
      this.boardList.forEach((boardItem, index) => {
        boardItem.sortNo = index + 1 // 저장후에 api 호출안하고 리스트 갱신하기위함
        const item = {
          boardId: boardItem.boardId,
          sortNo: boardItem.sortNo
        }
        request.push(item)
      })

      const payload = {
        classId: this.clazzes.currentId,
        request: request
      }

      this.updateBoardSortNo(payload)
        .then(res => {
          this.initCurBoardList({ classId: this.clazzes.currentId })
          this.isDraggableMode = false
          eventBus.$emit('init-lnb-red-dot', {lnbList: this.boardList})
        })
    },
    setBoardList(boardList) {
      this.boardList = boardList
    },
    openModal() {
      this.boardType = 'PUBLIC'
      this.isModalOpen = true
    },
    cancelAddModal() {
      this.boardType = 'PUBLIC'
      this.isModalOpen = false
    },
    closeModal() {
      this.isModalOpen = false
    },
    handleAdd() {
      this.setMode('ManagementCreate')
      this.closeModal()
  },
  }
}
</script>

<style lang="scss" scoped>
.sub-heading-info-message {
    font-family: var(--font-body); font-weight: 400; font-size: 14px; color: #9E9E9E; line-height: 21px; margin: -10px 0 16px 0;
}

.board-add{
  .board-type {
    text-align: left;

    input[type="radio"] {
      position: absolute;
      opacity: 0;
    }
    input[type="radio"]:checked + label {
      border-color: var(--primary);
      background-color: rgba(71, 120, 222, 0.1);     
      .tit{
        color:var(--primary);
      }
    }
    label {
      display: block;
      padding: 20px 15px;
      border: 1px solid #F8F9FC;
      border-radius: 8px;
      background-color: #F8F9FC; 
      cursor: pointer;
      margin-bottom: 12px; 
      &::before{
        display: none;
      }
      .tit {
        display: flex;
        align-items: center;
        font-size: 15px;
        font-weight: 400;
        color: #000000;
        margin:0;
      }
      .smr {
        display: block;
        font-size: 13px;
        font-weight: 400;
        color: #616161;
        line-height: 1.4;
      }      
    }
  }
}

</style>