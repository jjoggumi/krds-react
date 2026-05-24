<!--
@File(Method): -
@Author: -
@Date Created: -
@Description: 게시판 내보내기 모달
-->
<template>
  <div class="post-export-wrap">
    <HiModal class="post-export" type="type01" size="lg" @close="$emit('close')">
      <template v-slot:heading>
        게시글 내보내기
        <div class="smr">내보내기 할 클래스와 게시판을 선택해주세요.</div>
      </template>
      <template v-slot:content>
        <div class="hi-row no-gutters mb-10">
          <div class="col-sm-6 txt-left">
            <HiButton color="light-primary" size="sm" bitrounded @click="openModal('fetchGroups')">
              <HiIcon name="ico-star-fill" size="18"></HiIcon>
              그룹 불러오기
            </HiButton>
            <div class="option-list type01" v-if="modals.fetchGroups" v-click-outside="() => closeModal('fetchGroups')">
              <ul>
                <li v-if="groups.length === 0" class="no-data">
                  <HiIcon name="ico-warning-circle-fill" color="disabled" size="50"></HiIcon>
                  등록된 그룹이 없습니다.
                </li>
                <li v-else v-for="group in groups" :key="group.value" :class="{ 'is-selected': group.value === selectedGroup }">
                  <HiButton color="link" class="item" @click="openModal('reFetch')">
                    {{ group.title }}
                  </HiButton>
                  <div class="append">
                    <HiButton color="link" @click="openModal('groupEdit')">
                      <HiIcon name="ico-pen" color="white" size="20" rounded="rounded"></HiIcon>
                    </HiButton>
                    <HiButton color="link" @click="openModal('groupDel')">
                      <HiIcon name="ico-delete" size="20"></HiIcon>
                    </HiButton>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-sm-6 txt-right">
            <HiButton color="line-default" size="sm" bitrounded @click="openModal('groupSave')" :disabled="!classInfo.some((classItem) => classItem.isExportChecked)">
              <HiIcon name="ico-plus2" size="18"></HiIcon>
              그룹저장
            </HiButton>
          </div>
        </div>
        <div class="export-list">
          <ul>
            <li v-for="(classItem, index) in classInfo" :key="index">
              <input
                type="checkbox"
                name="export-board-chk"
                :id="`chk-class-${classItem.classId}`"
                v-model="classItem.isExportChecked"
                :class="{ disabled: !classItem.chkBoardObj.boardId.length && !classItem.chkBoardObj.folderId.length }"
                @click="exportCheckbox($event, classItem)"
              />
              <label :for="`chk-class-${classItem.classId}`">
                <span>
                  <div class="class-name">
                    {{ classItem.className }}
                  </div>
                  <HiSelectBox
                    :class="{
                      'opt-top': (classInfo.length >= 8 && index >= classInfo.length - 4) || (classInfo.length < 8 && index >= classInfo.length - (classInfo.length - 4)),
                    }"
                    :items="classItem.classBoard"
                    :value="formattedSelectedValues[index]"
                    :empty-title="formattedSelectedValues[index] || '게시판을 선택해주세요.'"
                    @clickOutside="handleOutsideClick(classItem)"
                  >
                    <template #custom-option>
                      <div class="board-list">
                        <div v-if="classItem.classBoard.length === 0" class="no-data">
                          <HiIcon name="ico-warning-circle-fill" color="disabled" size="50"></HiIcon>
                          사용중인 게시판이 없습니다.
                        </div>
                        <div class="board" v-else v-for="item of classItem.classBoard" :key="`board-list-${item.boardId}`">
                          <div
                            class="board-name"
                            :class="{
                              on: classItem.chkBoardObj.boardId.includes(item.boardId),
                            }"
                          >
                            <div class="title">
                              <input
                                type="checkbox"
                                name="move-board-chk"
                                :id="`chk-board-${item.boardId}`"
                                :value="item.boardId"
                                v-model="classItem.chkBoardObj.boardId"
                                @change="toggleBoardCheck(classItem, item)"
                              />
                              <label :for="`chk-board-${item.boardId}`">
                                <span class="chk-title">{{ item.boardName }}</span>
                              </label>
                            </div>
                            <div class="auth">읽기({{ getAuth(item) }})</div>
                          </div>
                          <ul v-if="item.folderCount > 0">
                            <li
                              v-for="folderItem of item.folderList"
                              :key="`folder-list-${folderItem.folderId}`"
                              :class="{
                                on: classItem.chkBoardObj.folderId.includes(folderItem.folderId),
                              }"
                            >
                              <span class="check">
                                <input
                                  type="checkbox"
                                  name="move-board-chk"
                                  :id="`chk-folder-${folderItem.folderId}`"
                                  :value="folderItem.folderId"
                                  v-model="classItem.chkBoardObj.folderId"
                                  @change="toggleFolderCheck(classItem, item)"
                                />
                                <label :for="`chk-folder-${folderItem.folderId}`">
                                  <span class="chk-title"><i :style="`background: ${folderItem.color};`"></i>{{ folderItem.folderName }}</span>
                                </label>
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </template>
                  </HiSelectBox>
                  게시판으로 보냅니다
                </span>
              </label>
            </li>
          </ul>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="closeModal('postExport')">취소</HiButton>
        <HiButton color="primary" size="lg" @click="openModal('exporting')" :disabled="!classInfo.some((classItem) => classItem.isExportChecked)">내보내기</HiButton>
        <HiButton color="primary" size="lg" @click="openModal('exportNoti')">미완료 내보내기</HiButton>
      </template>
    </HiModal>

    <!-- 그룹 저장 모달  -->
    <HiModal type="type01" size="sm" v-if="modals.groupSave" closeSkip @close="closeModal('groupSave')">
      <template v-slot:heading>그룹 저장하기</template>
      <template v-slot:content
        >선택된 클래스와 게시판을 그룹으로 저장합니다.
        <div class="input-box-wrap mt-30">
          <input type="text" id="userName" maxlength="20" v-model="groupName" placeholder="그룹명을 입력해주세요." />
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="closeModal('groupSave')">취소</HiButton>
        <HiButton color="primary" size="lg" :disabled="!groupName">저장</HiButton>
      </template>
    </HiModal>

    <!-- 그룹명 수정 모달  -->
    <HiModal type="type01" size="sm" v-if="modals.groupEdit" closeSkip @close="closeModal('groupEdit')">
      <template v-slot:heading>그룹명 수정하기</template>
      <template v-slot:content>
        <div class="input-box-wrap">
          <input type="text" id="userName" maxlength="20" v-model="editedGroup" />
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="closeModal('groupEdit')">취소</HiButton>
        <HiButton color="primary" size="lg" >수정</HiButton>
      </template>
    </HiModal>

    <!-- 그룹 삭제 모달 -->
    <HiModal type="type01" size="xs" v-if="modals.groupDel" closeSkip @close="closeModal('groupDel')">
      <template v-slot:heading>내보내기 그룹을 삭제하시겠습니까.</template>
      <template v-slot:content>삭제된 그룹은 복구되지 않습니다.</template>
      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="closeModal('groupDel')">취소</HiButton>
        <HiButton color="info" size="lg" >삭제</HiButton>
      </template>
    </HiModal>

    <!-- 선택 해제 후 그룹 불러오기 모달 -->
    <HiModal type="type01" size="xs" v-if="modals.reFetch" closeSkip @close="closeModal('reFetch')">
      <template v-slot:heading>이미 선택된 게시판이 있습니다.</template>
      <template v-slot:content>선택 해제하고 그룹을 불러오시겠습니까.</template>
      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="closeModal('reFetch')">취소</HiButton>
        <HiButton color="primary" size="lg">확인</HiButton>
      </template>
    </HiModal>

    <!-- 내보내기 진행 모달 -->
    <HiModal type="type01" size="xs" v-if="modals.exporting" closeSkip @close="closeModal('exporting')">
      <template v-slot:heading>내보내기 중입니다.</template>
      <template v-slot:content>
        <div class="w100">
          <p>6/77</p>
          <div class="progressbar">
            <span class="bar" style="width: calc(6 / 77 * 100%)"></span>
          </div>
        </div>
      </template>
    </HiModal>

    <!-- 내보내기 미완료 노티 모달  -->
    <HiModal class="export-noti" type="type01" size="sm" closeSkip v-if="modals.exportNoti" @close="closeModal('exportNoti')">
      <template v-slot:content>
        <div class="swal2-icon swal2-warning swal2-icon-show"><div class="swal2-icon-content">!</div></div>
        <div class="tit">
          내보내기가 완료되지 않은 클래스/게시판이 있습니다.
          <p class="smr">다시 시도 하시겠습니까?</p>
        </div>
        <div class="textbox">
          <ul>
            <li>서울시공초등학교 1학년 하늘반 알림장</li>
            <li>서울시공초등학교 1학년 하늘반 알림장</li>
            <li>서울시공초등학교 1학년 하늘반 알림장</li>
            <li>서울시공초등학교 1학년 하늘반 알림장</li>
            <li>서울시공초등학교 1학년 하늘반 알림장</li>
            <li>서울시공초등학교 1학년 하늘반 알림장</li>
          </ul>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="closeModal('exportNoti')">취소</HiButton>
        <HiButton color="primary" size="lg">재시도</HiButton>
      </template>
    </HiModal>
  </div>
</template>
<script>
import HiModal from "@/components/Modal/HiModal.vue";
import HiButton from "@/components/Button/HiButton.vue";
import HiSelectBox from "@/components/Form/HiSelectBox.vue";
import HiIcon from "@/components/Icon/HiIcon.vue";
import board from "./data.js";

export default {
  name: "ComponentsModal",
  components: { HiModal, HiButton, HiSelectBox, HiIcon },  
  data() {
    return {
      modals: {
        fetchGroups: false,
        groupSave: false,
        groupEdit: false,
        groupDel: false,
        reFetch: false,
        exporting: false,
        exportNoti: false,
      },
      groupName: "",
      editedGroup: "", 
      selectedGroup: "2학년 알람장", 
      groups: [
        { value: "1학년 수학게시판", title: "1학년 수학게시판" },
        { value: "2학년 알람장", title: "2학년 알림장" },
        { value: "3학년 과제게시판", title: "3학년 과제게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
        { value: "4학년 수학게시판", title: "4학년 수학게시판" },
      ],
      classInfo: board.classInfo
    };
  },
  methods: {
    openModal(modalName) {
      this.$set(this.modals, modalName, true);
    },
    closeModal(modalName) {
      this.$set(this.modals, modalName, false);
    },

    // 내보내기 리스트 내 체크박스 disabled 상태일때 클릭시 toast
    exportCheckbox(event, classItem) {
      if (!classItem.chkBoardObj.boardId.length && !classItem.chkBoardObj.folderId.length) {
        this.$toasted.show("게시판을 선택해주세요.", {
          duration: 2000,
          className: "type01",
          position: "bottom-center",
        });
        event.preventDefault();
      }
    },

    // 게시판 선택박스 OutsideClick시 클래스 리스트 체크 상태 업데이트
    handleOutsideClick(classItem) {
      classItem.isExportChecked = classItem.chkBoardObj.boardId.length > 0 || classItem.chkBoardObj.folderId.length > 0;
    },

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

    // boardId 체크 여부에 따라 하위 folderId 체크 상태 변경
    toggleBoardCheck(classItem, boardItem) {
      const { boardId, folderId } = classItem.chkBoardObj;
      if (boardId.includes(boardItem.boardId)) {
        boardItem.folderList.forEach((folder) => {
          if (!folderId.includes(folder.folderId)) {
            folderId.push(folder.folderId);
          }
        });
      } else {
        classItem.chkBoardObj.folderId = folderId.filter((folder) => !boardItem.folderList.some((item) => item.folderId === folder));
      }
    },

    // folderId 체크 여부에 따라 상위 boardId 체크 상태 변경
    toggleFolderCheck(classItem, boardItem) {
      const { boardId, folderId } = classItem.chkBoardObj;
      const allFoldersChecked = boardItem.folderList.every((folder) => folderId.includes(folder.folderId));
      if (allFoldersChecked) {
        if (!boardId.includes(boardItem.boardId)) {
          boardId.push(boardItem.boardId);
        }
      } else {
        classItem.chkBoardObj.boardId = boardId.filter((id) => id !== boardItem.boardId);
      }
    },
  },

  computed: {
    //게시판 선택박스내 체크박스 선택시 해당 데이터 선택버튼에 반영
    formattedSelectedValues() {
      return this.classInfo.map((classItem) => {
        const selectedBoards = classItem.classBoard.filter((board) => classItem.chkBoardObj.boardId.includes(board.boardId)).map((board) => board.boardName);

        const selectedFolders = classItem.classBoard.flatMap((board) =>
          board.folderList.filter((folder) => classItem.chkBoardObj.folderId.includes(folder.folderId)).map((folder) => `${board.boardName}_${folder.folderName}`)
        );

        const combinedValues = [...selectedBoards, ...selectedFolders].join();
        return combinedValues;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.post-export-wrap{    
  position: fixed;
  z-index: 9999;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .post-export {
    ::v-deep .modal__layer {
      height: 740px;
      .modal__content {
        height: calc(100% - 172px);
      }
    }

    // 그룹불러오기 리스트
    .option-list {
      border: 1px solid #d6d6d6;
      border-radius: 6px;
      overflow-y: auto;
      width: 260px;
      max-height: 242px;
      position: absolute;
      top: 35px;
      background: #fff;
      z-index: 1;

      > ul {
        max-height: 100%;
        > li {
          .append > button {
            width: 40px;
            height: 40px;

            i:after {
              background-color: #bdbdbd;
            }
            &:hover {
              > i:after {
                background-color: #616161;
              }
            }
          }
          &:hover {
            padding-right: 70px;
          }
        }
      }
    }

    // 내보내기 리스트
    .export-list {
      border: 1px solid var(--gray-05);
      border-radius: 6px;
      padding: 12px 0;
      height: calc(100% - 34px);

      ul {
        overflow-y: auto;
        height: 100%;

        > li {
          > label {
            display: flex;
            align-items: center;
            padding: 8px 20px;
            &::before {
              background: url(~@/assets/img/svg/checkbox-add.svg) no-repeat;
            }
            > span {
              display: flex;
              align-items: center;
              .class-name {
                width: 220px;
                text-align: left;
              }
            }
          }
          > input[type="checkbox"]:checked + label::before {
            background: url(~@/assets/img/svg/checkbox-checked.svg) no-repeat;
          }

          .hi-selectbox::v-deep {
            width: 340px;
            margin: 0 10px;
            .option__layer {
              // max-height: 330px;
              max-height: 217px;
            }
            .board-list {
              border: 0;
            }
            .selected {
              border: 1px solid #666;
            }
            &:not(.is-opened):hover .selected {
              border: 1px solid #222;
              transition: 0.3s;
            }
          }
          input[type="checkbox"]:disabled + label > span,
          input[type="checkbox"].disabled + label > span {
            color: #bdbdbd;
            .hi-selectbox::v-deep {
              &:not(.is-opened) .selected {
                color: #616161;
                border: 1px solid #e0e0e0;
              }
              &:not(.is-opened):hover .selected {
                border-color: #666;
                transition: 0.3s;
              }
            }
          }
          input[type="checkbox"]:checked + label > span {
            .hi-selectbox::v-deep {
              .selected {
                border: 1px solid var(--primary);
                background: var(--primary-03);
              }
            }
          }
        }
      }
    }
  }

  //내보내기 미완료 노티 모달
  .export-noti::v-deep {
    .modal__layer {
      max-width: 420px;
      .swal2-icon {
        display: flex;
        margin: -20px auto 30px;
      }
      .textbox {
        padding-right: 1px;
        ul {
          height: 103px;
          overflow-y: scroll;
          li {
            text-align: left;
            font-size: 14px;
            color: #616161;
            font-weight: var(--font-normal);
            line-height: 1.5;
          }
        }
      }
    }
  }
}
</style>