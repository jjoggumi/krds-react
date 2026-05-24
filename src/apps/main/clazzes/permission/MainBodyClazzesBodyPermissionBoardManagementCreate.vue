<!--
@File(Method): MainBodyClazzesBodyPermissionBoardManagementCreate.vue
@Author: -
@Date Created: -
@Description: 게시판 관리 > 게시판 생성 및 수정
@Modified: 2024-11-28 #69568 비밀게시판 - 비밀게시판 권한 설정 영역 추가
-->
<template>
  <div class="admin-option__box">
    <div class="box">
      <div class="heading-sub">
        <strong>게시판 이름</strong>
      </div>
      <div :class="inputBoxClassName">
        <input type="text" ref="board_name" maxlength="10" placeholder="게시판 이름" :value="data.boardName"
               @keydown="onChangeBoardName" @input="onChangeBoardName" @blur="onBlurBoardName" :disabled="data.isDefault">
        <div class="count-word" v-if="!data.isDefault">
          <span class="count">{{ data.boardName.length ? data.boardName.length : 0 }}</span>
          <!-- 1글자 이상 .is-active 추가 -->
          <span>/10</span>
        </div>
        <span class="text" v-if="data.isDefault">기본 게시판은 이름 변경이 불가합니다.</span>
        <span class="text" v-if="inputBoxClassName === 'inputbox is-error'">이미 사용중입니다.</span>
      </div>
    </div>

    <div class="box">
      <div class="heading-sub">
        <strong>게시판 권한</strong>
        <HiButton color="light-primary" bitrounded @click="openModal(true)">이용안내</HiButton>
      </div>

      <div class="admin-option">
        <div class="admin-option__item">
          <div class="option__heading">
            <strong>게시판 사용 여부</strong>
          </div>
          <div class="option">
            <div class="hi-switch" id="cbfb-use">
              <input type="checkbox" id="tg01" v-model="boardStatus">
              <label for="tg01">
                <span class="track"></span>
              </label>
            </div>
          </div>
        </div>
        <div v-if="boardStatus" class="admin-option__details">
          <div v-if="isSecretBoard" class="admin-option__item">
            <div class="option__heading">
              <strong>게시판 권한</strong>
              <p class="desc">
                읽기({{ countOfSecretBoardUsers }}명),
                쓰기(<span :class="{'txt-warning': countOfSecretBoardUsers != countOfSecretBoardWritables && countOfSecretBoardWritables > 0 }">{{ countOfSecretBoardWritables > 0 ? `${countOfSecretBoardWritables}명` : '권한 없음' }}</span>),
                <span v-if="countOfSecretBoardCommentables > 0" >
                  댓글(<span :class="{'txt-warning': countOfSecretBoardUsers != countOfSecretBoardCommentables}">{{ countOfSecretBoardCommentables }}명</span>)
                </span>
                <span v-else>
                  댓글 사용안함
                </span>                
              </p>
            </div>
            <div class="option">              
              <HiButton color="primary" size="sm" outline bitrounded @click="isPermissionManagement=true">설정</HiButton>
            </div>
          </div>
          <div v-if="!isSecretBoard" class="admin-option__item">
            <div class="option__heading">
              <strong>읽기 권한</strong>
            </div>
            <div class="option">
              <div class="checkbox">
                <input type="checkbox" id="chk01-01" name="chk01" @click="onClickRead('student')" v-model="data.isReadStudent">
                <label for="chk01-01" id="cbfb-read-student"><span>학생</span></label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="chk01-02" name="chk01" @click="onClickRead('parents')" v-model="data.isReadParents">
                <label for="chk01-02" id="cbfb-read-parent"><span>학부모</span></label>
              </div>
            </div>
          </div>
          <div class="admin-option__item" v-if="!isSecretBoard && data.postType !== 'HOMEWORK' && data.postType !== 'NOTE'">
            <div class="option__heading">
              <strong>글쓰기 권한</strong>
            </div>
            <div class="option">
              <div class="checkbox">
                <input type="checkbox" id="chk02-01" name="chk02" v-model="data.isWriteStudent">
                <label for="chk02-01" id="cbfb-write-student"><span>학생</span></label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="chk02-02" name="chk02" v-model="data.isWriteParents">
                <label for="chk02-02" id="cbfb-write-parent"><span>학부모</span></label>
              </div>
            </div>
          </div>
          <div class="admin-option__item" v-if="!isSecretBoard && data.postType === 'HOMEWORK'">
            <div class="option__heading">
              <strong>과제 제출 권한</strong>
              <div class="icon-tooltip" role="button">
                <div class="hi-tooltip"><span>권한을 부여받은 구성원만 과제 제출이 가능합니다.</span></div>
              </div>
            </div>
            <div class="option">
              <div class="checkbox">
                <input type="checkbox" id="chk02-01" name="chk02" v-model="data.isWriteStudent">
                <label for="chk02-01" id="cbfb-homework-student"><span>학생</span></label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="chk02-02" name="chk02" v-model="data.isWriteParents">
                <label for="chk02-02" id="cbfb-homework-parent"><span>학부모</span></label>
              </div>
            </div>
          </div>
          <div v-if="!isSecretBoard" class="admin-option__item">
            <div class="option__heading">
              <strong>댓글 사용</strong>
            </div>
            <div class="option">
              <div class="hi-switch" id="cbfb-use-comment">
                <input type="checkbox" id="tg02" @click="onClickUsedComment" v-model="data.isUsedComment">
                <label for="tg02">
                  <span class="track"></span>
                </label>
              </div>
            </div>
          </div>
          <div v-if="!isSecretBoard" class="admin-option__item">
            <div class="option__heading">
              <strong>댓글 쓰기 권한</strong>
            </div>
            <div class="option">
              <div class="checkbox">
                <input type="checkbox" id="chk03-01" name="chk03" @click="onClickComment" v-model="data.isCommentStudent">
                <label for="chk03-01" id="cbfb-comment-student"><span>학생</span></label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="chk03-02" name="chk03" @click="onClickComment" v-model="data.isCommentParents">
                <label for="chk03-02" id="cbfb-comment-parent"><span>학부모</span></label>
              </div>
            </div>
          </div>
          <div class="admin-option__item">
            <div class="option__heading">
              <strong>좋아요 사용</strong>
            </div>
            <div class="option">
              <div class="hi-switch" id="cbfb-use-like">
                <input type="checkbox" id="tg03" v-model="data.isUsedLike">
                <label for="tg03">
                  <span class="track"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul class="text-refer" v-if="data.postType === 'HOMEWORK'">
        <li>* 과제작성(출제)은 선생님만 가능합니다.</li>
        <li>* 권한을 부여받은 구성원만 과제 제출이 가능합니다.</li>
      </ul>
      <ul class="text-refer" v-if="data.postType === 'NOTE'">
        <li>* 알림장 작성은 선생님만 가능합니다.</li>
      </ul>
    </div>
    <div class="box">
      <folder-list ref="folder_list" :boardStatus="boardStatus" @setUsedFolder="setUsedFolder"/>
    </div>
    <guide-modal v-if="guideFlag" @openModal="openModal" :boardType="data.boardType"/>
    <PermissionManagement
      v-if="isPermissionManagement=== true"
      @close="isPermissionManagement= false"
      v-model="data.boardUsers"
    />
  </div>
</template>

<script>
import FolderList from "@/apps/main/clazzes/permission/components/FolderList";
import GuideModal from "@/apps/main/clazzes/permission/components/GuideModal";
// #69568 비밀게시판 권한 설정 모달 추가
import PermissionManagement from "@/apps/main/clazzes/permission/modal/secret/PermissionManagement";
import {mapActions, mapState} from "vuex";
import {cloneDeep, isEmpty} from "lodash";
import axios from "axios";
import { buildBoardUserObjectForSecretBoard } from "@/apps/main/clazzes/permission/utils";

export default {
  name: "main-body-clazzes-body-permission-board-management-create",
  components: {GuideModal, FolderList, PermissionManagement},  //#69568 밀게시판 권한 설정 모달 추가
  props: {
    clazzes: {
      type: Object
    },
    componentType: {
      type: String
    },
    boardType: {
      type: String,
      required: true,
      default: 'PUBLIC'
    }
  },
  data() {
    return {
      data: {
        originalBoardName: '',
        boardName: '',
        boardStatus: '',
        isReadParents: true,
        isReadStudent: true,
        isWriteParents: false,
        isWriteStudent: false,
        isUsedComment: false,
        isUsedLike: false,
        isCommentParents: false,
        isCommentStudent: false,
        isUsedFolder: false,
        boardType: this.boardType || 'PUBLIC',
        boardUsers: []
      },
      boardStatus: true,
      guideFlag: false,
      inputBoxClassName: 'inputbox',
      
      // #69568 비밀게시판 더미 데이터
      isPermissionManagement: false,
    }
  },
  computed: {
    ...mapState(['user']),
    getTaskStudent(){
      return this.data.isWriteStudent;
    }, 
    getTaskParents(){
      return this.data.isWriteParents;
    }, 
    isSecretBoard() {
      return this.data.boardType === 'SECRET'
    },
    isCreatingSecretBoard() {
      return this.isSecretBoard && !this.data.boardId
    },
    countOfSecretBoardUsers() {
      return this.data.boardUsers.length
    },
    countOfSecretBoardWritables() {
      return this.data.boardUsers.filter(u => u.isWritable).length
    },
    countOfSecretBoardCommentables() {
      return this.data.boardUsers.filter(u => u.isCommentable).length
    }
  }, 
  watch: {
    boardStatus(v) {
      if(!v) {
        this.$refs.folder_list.unUsedBoard()
      }
    },
    getTaskStudent(v){
      if(v === true) this.data.isReadStudent = true;
    },
    getTaskParents(v){
      if(v === true) this.data.isReadParents = true;
    },
    boardType(newVal) {
      this.data.boardType = newVal;
    }
  },
  methods: {
    ...mapActions('storeBoard', ['getBoardInfo', 'getSecretBoardUsers']),
    onChangeBoardName(event) {
      const filteredBoardName = event.target.value
        .replace(/\s{0, 10}[^a-z|A-Z|0-9|ㄱ-ㅎ|가-힣|~!@#$%^&*()/_+|<>?:{}]/g, "")
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
      //키보드에 선입력된 11/10을 방지하기 위함
      this.data.boardName = filteredBoardName.substring(0, 10);
      this.$refs.board_name.value = this.data.boardName;
    },
    async setUpdateList(item) {
      //게시판 수정시 기존값
      this.data = {...await this.getBoardInfo(item.boardId), boardUsers: []}
      if (this.isSecretBoard) {
        this.data.boardUsers = (await this.getSecretBoardUsers(item.boardId))
      }
      this.boardStatus = item.boardStatus === "ACTIVATE"
      this.data.originalBoardName = this.data.boardName
      this.$refs.folder_list.setFolderList(this.data)
    },
    setUsedFolder(flag) {
      this.data.isUsedFolder = flag

      // 폴더 사용함이면 게시판도 사용함 처리
      if (flag) {
        this.boardStatus = flag
      }
    },
    getData() {
      this.data.boardNameCheck = this.inputBoxClassName !== 'inputbox is-error'
      this.data.boardStatus = this.boardStatus ? 'ACTIVATE' : 'DEACTIVATE'
      this.data.classId = this.$store.state.curClassItem.currentId

      this.data.folders = this.componentType === 'create'
        ? this.$refs.folder_list.onSubmitFolder()
        : this.setFolders()

      if(this.componentType === 'create') {
        this.data.postType = "BOARD"
      }
      return this.data
    },
    setFolders() {
      const oldFolders = cloneDeep(this.data.folders)
      const visibleFolders = cloneDeep(this.$refs.folder_list.onSubmitFolder())

      // 최종 result array
      let resultFolders = []

      for (let index = 0; index < visibleFolders.length; index++) {
        const visibleFolder = visibleFolders[index]
        const usedOldFolder = oldFolders.find(oldFolder => {
          return oldFolder.folderId === visibleFolder.folderId
        })
        // 이전에 생성한 폴더 중 편집 후 남아있는 폴더의 일부 필드 복사
        if (usedOldFolder) {
          visibleFolder.postCount = usedOldFolder.postCount
        }
        visibleFolder.isDel = false
        visibleFolder.visible = true
        visibleFolder.sortNo = index + 1
        resultFolders.push(visibleFolder)
      }
      // 삭제할 폴더를 new result array 에 추가
      oldFolders.map(oldFolder => {
        const usedFolder = resultFolders.find(resultFolder => {
          return resultFolder.folderId === oldFolder.folderId
        })
        if (!usedFolder && oldFolder.folderId) {
          oldFolder.visible = false
          oldFolder.isDel = true
          oldFolder.isDefault = false
          resultFolders.push(oldFolder)
        }
      })

      // 폴더 사용 여부가 true 인 경우 편집 후 남아있는 폴더 중 첫번째 폴더를 기본 폴더로 설정
      if (this.data.isUsedFolder && resultFolders.length > 0) {
        // resultFolders 원본 수정
        resultFolders.forEach(resultFolder => {
          resultFolder.isDefault = false
        })
        const newDefaultFolder = resultFolders.find(resultFolder => !resultFolder.isDel)
        if (newDefaultFolder) {
          newDefaultFolder.isDefault = true
        }
      }

      this.$log.warn(
        this.$options.name
        , `newDefaultFolders => `
        , resultFolders.filter(resultFolder => resultFolder.isDefault)
      )
      this.$log.warn(
        this.$options.name
        , `return resultFolders => `
        , resultFolders
      )

      return resultFolders
    },
    openModal(v) {
      this.guideFlag = v
    },
    async onBlurBoardName() {
      if (this.data.originalBoardName !== this.data.boardName) {
        const params = {
          boardName: this.data.boardName,
          classId: this.clazzes.currentId
        }

        try {
          const res = await axios({
            method: 'GET',
            url: `${this.$apiUrl}/boards/name-check`,
            params: params,
            headers: { Authorization: `Bearer ${localStorage.idToken}`}
          })

          this.inputBoxClassName = 'inputbox'

        } catch (e) {
          if (e.response.status === 412) {
            this.inputBoxClassName = 'inputbox is-error'
          }
        }
      }
    },
    onClickRead(type) {
      setTimeout(() => {
        if (type === 'student' && !this.data.isReadStudent) {
          this.data.isWriteStudent = false
          this.data.isCommentStudent = false
        }else if (type === 'parents' && !this.data.isReadParents) {
          this.data.isWriteParents = false
          this.data.isCommentParents = false
        }

        if(!this.data.isReadParents && !this.data.isReadStudent) {
          this.data.isWriteParents = false
          this.data.isCommentParents = false

          this.data.isWriteStudent = false
          this.data.isCommentStudent = false

          this.data.isUsedComment = false
        }
        this.onClickComment()
      })
    },
    onClickWrite(type) {
      setTimeout(() => {
        if (type === 'student') {
          if(!this.data.isWriteStudent) {
            // this.data.isCommentStudent = false
          } else {
            this.data.isReadStudent = true
          }
        }else if (type === 'parents') {
          if(!this.data.isWriteParents){
            // this.data.isCommentParents = false
          } else {
            this.data.isReadParents = true
          }
        }
      })
    },  
    onClickComment() {
      setTimeout(() => {
        if (!this.data.isCommentStudent && !this.data.isCommentParents) {
          this.data.isUsedComment = false
        }
        if (!this.data.isUsedComment && (this.data.isCommentStudent || this.data.isCommentParents)) {
          this.data.isUsedComment = true
        }
        if (this.data.isCommentStudent) this.data.isReadStudent = true
        if (this.data.isCommentParents) this.data.isReadParents = true
      })
    },
    onClickUsedComment() {
      setTimeout(() => {
        if (!this.data.isUsedComment) {
          this.data.isCommentStudent = false
          this.data.isCommentParents = false
        } else {
          this.data.isReadStudent = true
          this.data.isReadParents = true
          this.data.isCommentStudent = true
          this.data.isCommentParents = true
        }
      })
    },
    async initializeSecretBoard() {
      await this.$comn.asyncWaitFor(() => this.clazzes.classOwner);
      this.data.boardUsers = new Set([
        this.clazzes.classOwner, this.user
      ].map(u => u.currentId)).toJSON().map(u => buildBoardUserObjectForSecretBoard(u, true))
    }
  },
  mounted() {
    if (this.isCreatingSecretBoard) {
      this.initializeSecretBoard();
    }
  }
}
</script>
