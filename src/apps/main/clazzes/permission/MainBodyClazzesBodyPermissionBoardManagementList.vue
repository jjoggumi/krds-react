<!--
@File(Method): MainBodyClazzesBodyPermissionBoardManagementList.vue
@Description: 클래스 > 게시판 설정 > 게시판 관린 > 게시판 리스트
@Modified: 2025-03-06 - #72670 비밀게시판 명칭 변경 > 그룹게시판
-->
<template>
  <draggable
    class="admin__list"
    tag="div"
    v-model="boardList"
    v-bind="dragOptions"
    @start="isDrag = true"
    @end="isDrag = false"
    @change="emitBoardList"
    :disabled="!isDraggableMode"
  >
    <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
      <div
        :role="!isDraggableMode ? 'button' : ''"
        class="admin__item draggable-area"
        :class="{'is-draggable': isDraggableMode, 'is-request-delete': requestDeleteBoardId === item.boardId}"
        v-for="item in boardList"
        :key="item.sortNo"
        @click="requestDeleteBoardId === item.boardId ? undefined : onClickBoard(item)"
      >
        <div>
          <span
            v-if="!isDraggableMode"
            class="label"
            :class="{'none': item.boardStatus !== 'ACTIVATE'}"
          >
            {{ item.boardStatus === 'ACTIVATE' ? '사용' : '미사용' }}
          </span>
          <strong class="name">
            <HiIcon name="ico-group-fill" color="gray" size="20" class="board-type-group" v-if="isSecretBoard(item)" />
            {{ item.boardName }}</strong>
          <!-- 
          <strong class="name" :class="{'secret': isSecretBoard(item)}" >{{ item.boardName }}</strong>
          -->
          <button
            class="btn-delete"
            :disabled="requestDeleteBoardId === item.boardId"
            v-if="!item.isDefault && !isDraggableMode"
            @click.stop="deleteBoard(item)"
          />
          <div class="setting" v-if="item.boardStatus === 'ACTIVATE'">
            <span v-if="!isSecretBoard(item)" class="target">{{ getPermissionNameGroup(item) }}</span>
            <span v-if="isSecretBoard(item)" class="target">
              읽기<em>({{item.boardPermission.readCount}}명)</em>,
              쓰기(<em :class="{'txt-warning': item.boardPermission.readCount !== item.boardPermission.writeCount && item.boardPermission.writeCount !== 0}">{{ item.boardPermission.writeCount == 0 ? '권한 없음' : item.boardPermission.writeCount + '명' }}</em>),
              <span v-if="item.boardPermission.commentCount !== 0">
                댓글(<em :class="{'txt-warning': item.boardPermission.readCount !== item.boardPermission.commentCount}">{{ item.boardPermission.commentCount + '명' }}</em>)
              </span>
              <span v-else>
                댓글 사용안함
              </span>
            </span>
            <span class="num" v-if="!isDraggableMode">{{ item.isUsedFolder ? `${item.folderCount}개` : '사용안함' }}</span>
          </div>
        </div>
      </div>
    </transition-group>

  </draggable>
</template>

<script>
import {mapActions, mapState} from "vuex";
import draggable from 'vuedraggable'
import {eventBus} from "@/main";

export default {
  name: "main-body-clazzes-body-permission-board-management-list",
  components: {
    draggable
  },
  data() {
    return {
      boardList: [],
      isDrag: false,
      dragOptions: {
        animation: 200,
        disabled: false,
        forceFallback: true
      },
      // 삭제 요청중인 BoardId
      requestDeleteBoardId: null,
    };
  },
  props: {
    clazzes: {
      type: Object
    },
    isDraggableMode: {
      type: Boolean
    },
    responseItem: {
      type: Object
    },
    boardType: {
      type: String,
      required: true,
      default: 'PUBLIC'
    }
  },
  computed: {
    ...mapState('storeBoard', {
      curBoardList: 'curBoardList'
    })
  },
  methods: {
    ...mapActions('storeBoard', [
      'getBoardList',
      'getBoardListForManager',
      'deleteBoardPost',
      'initCurBoardListUpdate',
      'readBoard'
    ]),
    onClickBoard(item) {
      if (this.isDraggableMode) {
        return false
      }
      this.$emit('onUpdateBoard', item)
    },
    getPermissionNameGroup(item) {
      const postType = item.postType

      const read = `읽기(${this.getPermissionName(item.isReadParents, item.isReadStudent)}), `
      const write = postType === 'NOTE' || postType === 'HOMEWORK' ?
        '' :
        `쓰기(${this.getPermissionName(item.isWriteParents, item.isWriteStudent)}), `
      const comment = item.isUsedComment ?
        `댓글(${this.getPermissionName(item.isCommentParents, item.isCommentStudent)})` :
        '댓글 사용안함'

      return `${read}${write}${comment}`
    },
    getPermissionName(parents, students) {
      return parents || students ?
        `${this.getParentsPermissionName(parents)}${this.getComma(parents, students)}${this.getStudentPermissionName(students)}` :
        '권한 없음'
    },
    getParentsPermissionName(parentsPermission) {
      return parentsPermission ? '학부모' : ''
    },
    getStudentPermissionName(studentPermission) {
      return studentPermission ? '학생' : ''
    },
    getComma(parentsPermission, studentPermission) {
      return parentsPermission && studentPermission ? ', ' : ''
    },
    async setBoardList(queryBoardId) {
      const payload = {
        'classId': this.clazzes.currentId,
        'includeDeactivate': true,
        'includeNotUsedFolder': true,
        'includePostCount': true,
        'includePermissionCount': true
      }

      const boardListForManager = await this.getBoardListForManager(payload)
      const boardListLegacy = await this.getBoardList(payload)

      const boardList = boardListForManager.map(b => ({
        folderCount: 0, folderList: [], hasNewPost: false,
        ...b, ...(boardListLegacy.find(l => l.boardId === b.boardId) || {}),
        boardPermission: b.boardPermission
      }))

      let responseItem = {}

      if (this.responseItem.item.boardId !== '') {
        if (this.responseItem.mode !== 'delete') {
          for (const key of Object.keys(boardList[0])) {
            if (key === 'folderCount') {
              responseItem[key] = this.responseItem.item.folders.length
            } else if (key === 'folderList') {
              responseItem[key] = this.responseItem.item.folders
            } else {
              responseItem[key] = this.responseItem.item[key]
            }
          }
        }

        switch (this.responseItem.mode) {
          case 'create': {
            const resBoardId = this.responseItem.item.boardId
            // search response 에 방금 등록한 게시판 정보가 없으면 등록 response 로 추가
            if (boardList.findIndex(boardItem => boardItem.boardId === resBoardId) < 0) {
              boardList.push(responseItem)
            }
            break
          }
          case 'update': {
            let isEqual = true
            const targetIndex = boardList.findIndex(boardItem => boardItem.boardId === this.responseItem.item.boardId)
            const target = boardList[targetIndex]

            for (const key of Object.keys(target)) {
              if (key === 'folderCount' || key === 'folderList') { // 목록에서는 폴더수만 필요하므로 개수로만 비교
                if (target.folderCount != this.responseItem.item.folders.length) {
                  isEqual = false
                }
              } else {
                if (target[key] !== this.responseItem.item[key])
                isEqual = false
              }
            }

            if (!isEqual) {
              boardList.splice(targetIndex, 1, responseItem)
            }
            break
          }
          case 'delete': {
            const targetIndex = boardList.findIndex(boardItem => boardItem.boardId === this.responseItem.item.boardId)
            if (targetIndex > -1) {
              boardList.splice(targetIndex, 1)
            }
          }
          break
        }
      }
      this.boardList = boardList
      this.initCurBoardListUpdate(boardList) // lnb 리스트 업데이트
      eventBus.$emit('init-lnb-red-dot', {lnbList: boardList})

      this.responseItem.mode = ''
      this.responseItem.item = {}
      this.responseItem.item.boardId = ''

      if (queryBoardId) {
        const foundBoardItem = this.boardList.find(board => board.boardId === queryBoardId)
        if (foundBoardItem) {
          this.onClickBoard(foundBoardItem)
        }
      }
    },
    deleteBoard(item) {
      const confirmMessage = `게시판을 삭제하면 모든 게시글이 삭제되어</br>복원 불가합니다. 정말 삭제하시겠습니까?`
      const opts = {
        reverseButtons: true
      }

      this.$hiClass.confirm(confirmMessage, null, opts)
        .then(async () => {
          const boardId = item.boardId
          this.requestDeleteBoardId = boardId

          try {
            const res = await this.deleteBoardPost({boardId});

            if (res.response && res.response.status === 404) {
              this.$hiClass.alert('삭제된 게시판입니다.')
            }

            this.responseItem.mode = 'delete'
            this.responseItem.item.boardId = boardId
          } catch (e) {
            this.$hiClass.alert('삭제요청 중 에러가 발생하였습니다.')
          }

          this.setBoardList(null).finally(() => {
            this.requestDeleteBoardId = null
          })
        })
        .catch(() => {})
    },
    emitBoardList() {
      this.$emit('emitBoardList', this.boardList)
    },
    onDeleteFinishUpdateList(list){
      const newList = list.map(v => {
        return {
          ...v,
          folderCount : v.isUsedFolder ? v.folderList.length : 0,
          folderList : v.isUsedFolder ? v.folderList.map(f => {
            return {
              folderId : f.folderId, 
              classId : f.classId, 
              folderName : f.folderName,
              sortNo : f.sortNo,
              color : f.color, 
              isDefault : f.isDefault, 
              postCount : f.postCount
            }
          }) : []
        }
      })

      return newList
    },
    isSecretBoard(item) {
      return item.boardType === 'SECRET'
    }
  },
  mounted() {
    const queryBoardId = this.$route.query.boardId || null
    this.setBoardList(queryBoardId)

    // query 삭제
    if (queryBoardId) {
      const path = this.$route.path
      const query = {}
      this.$router.replace({ path, query }, () => {})
    }
  },
}
</script>

<style scoped>

</style>