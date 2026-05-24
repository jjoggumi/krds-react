<!--
@File(Method): ExportModalBoardList.vue
@Date Created: 2024.10.30
@Description: 게시글 내보내기 모달 (게시판 목록)
@modified: 2025.02.04 #71527 [댓글]등록된 태그 없을 경우 안내문구 영역 hover 시 bg 영역은 잡히지 않도록 >> hi-nodata hover시 bg 삭제 공통 적용  >>>  nodata를 hi-nodata로 변경 적용 및 사용하지 않는 style 삭제
-->
<template>
  <HiSelectBox
      :class="{'opt-top': (classLength >= 8 && index >= classLength - 4) || (classLength < 8 && index >= classLength - (classLength - 4))}"
      :items="classItem.boardList || []"
      :value="formattedSelectedValues"
      :empty-title="formattedSelectedValues || '게시판을 선택해주세요.'"
      @clickOutside="handleOutsideClick(classItem)"
  >
    <template #custom-option>
      <div class="board-list">
        <div v-if="classItem.boardList.length === 0" class="hi-nodata">
          <p>
          사용중인 게시판이 없습니다.
          </p>
        </div>
        <div class="board" v-else v-for="board of classItem.boardList" :key="`board-list-${board.boardId}`">
          <!-- 게시판  -->
          <div
              class="board-name"
              :class="{on: board.isChecked}"
          >
            <div class="title">
              <input
                  :ref="`chk-board-${board.boardId}`"
                  type="checkbox"
                  name="move-board-chk"
                  :id="`chk-board-${board.boardId}`"
                  v-model="board.isChecked"
                  @change="toggleBoardCheck(board)"
                  :class="{'dis': !checkPushTarget(board)}"
              />
              <label :for="`chk-board-${board.boardId}`">
                <span class="chk-title">{{ board.boardName }}</span>
              </label>
            </div>
            <div class="auth">{{ `읽기(${getAuth(board)})` }}</div>
          </div>

          <!-- 폴더 목록  -->
          <ul v-if="board.isUsedFolder">
            <li
                v-for="folderItem of board.folderList"
                :key="`folder-list-${folderItem.folderId}`"
                :class="{on: folderItem.isChecked}"
            >
              <span class="check">
                <input
                    :ref="`chk-folder-${folderItem.folderId}`"
                    type="checkbox"
                    name="move-board-chk"
                    :id="`chk-folder-${folderItem.folderId}`"
                    v-model="folderItem.isChecked"
                    @change="toggleFolderCheck(board, folderItem)"
                    :class="{'dis': !checkPushTarget(board)}"
                />
                <label :for="`chk-folder-${folderItem.folderId}`">
                  <span class="chk-title">
                    <i :style="`background: ${folderItem.color};`"></i>{{ folderItem.folderName }}
                  </span>
                </label>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </HiSelectBox>
</template>

<script>
import HiSelectBox from "@/components/Form/HiSelectBox";
import HiIcon from "@/components/Icon/HiIcon";

export default {
  name: "export-modal-board-list",
  components: {
    HiIcon,
    HiSelectBox
  },
  props: {
    classItem: {
      type: Object
    },
    classLength: {
      type: Number
    },
    index: {
      type: Number
    },
    pushTarget: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 선택된 게시판/폴더 '게시판', '게시판_폴더' 문자열로 변환
    formattedSelectedValues() {
      let selectedArr = [];
      if (this.classItem.boardList && this.classItem.boardList.length > 0) {
        this.classItem.boardList.forEach(board => {
          if (board.isChecked) {
            selectedArr.push(
                ...board.folderList.map(folder => {
                  return board.isUsedFolder && folder.isChecked ? `${board.boardName}_${folder.folderName}` : board.boardName;
                })
            )

          } else { // 게시판 선택 X
            selectedArr.push(
                ...board.folderList.filter(folder => folder.isChecked).map(folder => {
                  return `${board.boardName}_${folder.folderName}`;
                })
            )
          }
        })
      }

      return [...selectedArr].join();
    },
  },
  methods: {
    // 셀렉 박스 제어 ======================================================================
    // 게시판 셀렉박스 바깥 영역 선택시 클래스 목록 체크 상태 업데이트
    handleOutsideClick(classItem) {
      const isCheckedBoard = this.classItem.boardList.some(board => board.isChecked);
      const isCheckedFolder = this.classItem.boardList
          .flatMap(board => board.folderList.flatMap(folder => folder.isChecked))
          .some(isChecked => isChecked);
      classItem.isExportChecked = isCheckedBoard || isCheckedFolder;
    },

    // boardId 체크 여부에 따라 하위 folderId 체크 상태 변경
    toggleBoardCheck(boardItem) {
      const isPushTarget = this.checkPushTarget(boardItem);
      if (!isPushTarget) {
        this.cancelSelect('board', boardItem, '');
      }

      boardItem.folderList.map(folder => folder.isChecked = boardItem.isChecked);
    },

    // folderId 체크 여부에 따라 상위 boardId 체크 상태 변경
    toggleFolderCheck(boardItem, folderItem) {
      const isPushTarget = this.checkPushTarget(boardItem);
      if (!isPushTarget) {
        this.cancelSelect('folder', boardItem, folderItem);
      }

      boardItem.isChecked = boardItem.folderList.every(folder => folder.isChecked);
    },

    // 권한이 없어 선택 불가일때 체크박스 체크 취소
    cancelSelect(type, boardItem, folderItem) {
      this.checkPushTargetToast();

      if (type === 'board') {
        boardItem.isChecked = false;
        this.$refs[`chk-${type}-${boardItem.boardId}`][0].checked = false;
      } else {
        folderItem.isChecked = false;
        this.$refs[`chk-${type}-${folderItem.folderId}`][0].checked = false;
      }

      return false;
    },

    // 권한 체크 ======================================================================
    //읽기 권한
    getAuth(item) {
      if (!item.isReadParents && !item.isReadStudent) {
        return "권한없음";
      } else if (item.isReadParents && item.isReadStudent) {
        return "학부모, 학생";
      } else if (item.isReadParents) {
        return "학부모";
      } else if (item.isReadStudent) {
        return "학생";
      }
    },

    // 게시판 읽기 권한 체크
    checkPushTarget(board) {
      switch (this.pushTarget) {
        case 'ALL': {
          return board.isReadParents && board.isReadStudent;
        }
        case 'PARENTS': {
          return board.isReadParents;
        }
        case 'STUDENT': {
          return board.isReadStudent;
        }
        case 'TEACHER': {
          return true;
        }
        default: {
          return false;
        }
      }
    },

    checkPushTargetToast() {
      this.$toasted.clear();
      this.$toasted.show("수신대상의 읽기 권한이 없는 게시판입니다.", {
        duration: 2000,
        className: "type01",
        position: "bottom-center",
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.hi-nodata{padding:95px 0;}
</style>