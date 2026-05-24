<template>
  <div>
    <div class="heading-sub">
      <strong>폴더</strong>
    </div>
    <div class="admin-option">
      <div class="admin-option__item">
        <div class="option__heading">
          <strong>폴더 사용 여부</strong>
        </div>
        <div class="option">
          <div class="hi-switch" id="cbfb-use-folder">
            <input type="checkbox" id="chkTog" @click="onClickUserFolder" v-model="isUsedFolder">
            <label for="chkTog">
              <span class="track"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="admin-option__details" v-if="isUsedFolder">

        <draggable
          class="admin-folder__list"
          tag="div"
          v-model="list"
          v-bind="dragOptions"
          handle=".btn-move"
          @start="drag = true"
          :disabled="hideBtnMove"
        >
          <transition-group type="transition" :name="!drag ? 'flip-list' : null">
            <div class="admin-folder__item" v-for="(element, index) in list" :key="`folder_${index}`">

              <button class="btn-move" v-if="draggableFlag"></button> <!-- 수정화면에서는 전체 이동버튼 비노출 -->

              <div class="left">
                <span class="icon-color"
                      :style="{ 'background-color'
                      : element.activeColorIdx ? colors[element.activeColorIdx] : element.color }">
                </span>

                <button
                  class="btn-edit"
                  @click="edit(element)"
                  v-show="!element.isEditable"
                >{{ `${element.folderName}(${element.postCount ? element.postCount : 0})` }}
                </button>

                <input type="text"
                       maxlength="10"
                       v-model="element.folderName"
                       placeholder="폴더 이름"
                       @input="onInput(element.folderName, index)"
                       v-show="element.isEditable">
                <div class="color__list" v-show="element.isEditable">
                  <button class="color__item"
                          v-for="(color, idx) in colors"
                          :id="`${colorIds[idx]}`"
                          :key="idx"
                          :style="{ 'background-color': color }"
                          :class="{ 'is-active': element.activeColorIdx === idx }"
                          @click="onClickColor(element, idx, index)"
                  ></button>
                </div>
              </div>

              <div class="right" v-show="!element.isEditable">
                <button v-if="list.length > 1 && draggableFlag" class="hi-btn btn-sm btn-line-lgray"
                        @click="deleteFolder(element)">{{ element.button ? element.button : '폴더삭제' }}
                </button>
                <!--                <button v-else class="hi-btn btn-sm btn-line-lgray">게시글 관리</button>-->
              </div>

              <div class="right" v-show="element.isEditable">
                <button class="hi-btn btn-sm btn-line-lgray" @click="cancel(element)">취소</button>
                <!-- <button class="hi-btn btn-sm btn-line" disabled>저장</button> -->
                <button class="hi-btn btn-sm btn-line" :disabled="setDisabled(element.folderName)" @click="save(element)">
                  {{ element.original ? '변경' : '추가' }}
                </button>
              </div>
            </div>
          </transition-group>
        </draggable>

        <button class="btn-add-folder" @click="add">폴더 추가</button>
      </div>
    </div>

    <ul class="text-refer">
      <li>* 폴더 사용 시 최소 1개의 폴더가 필요합니다.</li>
      <li>* 폴더 사용을 OFF 하면 폴더 메뉴는 보이지 않고, 작성한 게시글은 게시판에서 모두 확인 가능합니다.</li>
      <li>* 폴더 삭제를 원할 경우 폴더 안에 있는 게시글을 모두 삭제해주세요.</li>
<!--      <li>(폴더 내 게시글을 일괄 삭제하거나 이동하는 기능은 추후 업데이트 될 예정입니다.)</li>-->
<!--      <li>* 폴더 사용을 ON 하면 게시판 내 폴더를 생성하고 관리할 수 있습니다.</li>-->
<!--      <li>* 폴더 사용 시 최소 1개의 폴더가 필요합니다. 폴더를 사용하지 않으려면 폴더 사용을 OFF로 변경해주세요.</li>-->
<!--      <li>* 폴더 사용을 OFF 하면 게시판 폴더 탭이 보이지 않고, 폴더 접근이 불가합니다.</li>-->
<!--      <li>* 폴더 사용을 OFF 해도 작성한 게시글은 모두 확인 가능합니다.</li>-->
<!--      <li>* 생성된 폴더의 삭제를 원할 경우 폴더 안에 있는 게시글을 모두 삭제해주세요.<br>(폴더 내 게시글을 일괄 삭제하거나 이동하는 기능은 추후 업데이트 될 예정입니다.)</li>-->
    </ul>
    <default-folder-select-modal
      v-if="defaultFolderSelectFlag"
      @onChangeFolderModal="onChangeFolderModal"
      :items="list"
      @setFolder="setFolder"
    />
  </div>

</template>

<script>
import draggable from 'vuedraggable'
import {cloneDeep, isEmpty} from "lodash";
import DefaultFolderSelectModal from "@/apps/main/clazzes/permission/components/DefaultFolderSelectModal";

export default {
  name: "FolderList",
  components: {
    DefaultFolderSelectModal,
    draggable
  },
  props: {
    boardStatus: {
      type: Boolean
    },
  },
  data() {
    return {
      defaultFolderSelectFlag: false,
      draggableFlag: true,
      onHideDeleteButton: false,
      isUsedFolder: false,
      isUsedFolderFirst: false,
      activeEditableIdx: null,
      hideBtnMove: true,
      colors: ['#555555', '#F85C8E', '#FE7143', '#FFBF09', '#00B1A0', '#8CC24A', '#43CCB4', '#33E1EA', '#5B9EF3', '#8367EB'],
      colorIds: ['cbf-black', 'cbf-pink', 'cbf-orange', 'cbf-amber', 'cbf-green', 'cbf-greenlight', 'cbf-mint', 'cbf-bluesky', 'cbf-blue', 'cbf-purple'],
      list: [],
      drag: false,
      hiddenPostExist: false, // 다른 구성원이 작성한 예약 게시글이나 임시저장한 게시글이 존재하는가?
      deletablePostExist: false, // 관리자가 삭제 가능한 게시글이 존재하는가?
      
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        disabled: false,
        forceFallback: true
      };
    },
    classId() {
      return this.$store.state.curClassItem.currentId
    }
  },
  watch: {
    list(v) {
      v.forEach((item, idx) => {
        item.sortNo = idx + 1
      })
      this.hideBtnMove = this.list.length < 2
      this.removeDragIcon()
    },
    isUsedFolder(v) {
      //폴더 사용여부와 상관없이
      //폴더는 있어야하는데 비어서옴
      if (isEmpty(this.list)) {
        this.isUsedFolderFirst = true
      }
      this.$emit('setUsedFolder', v)
      this.removeDragIcon()
      if (!v) {
        //폴더 사용 여부 false 일때 기본폴더 선택모달 띄움
        this.onCheckDefaultFolder()
      } else {
        this.list.forEach(folder => {
          folder.isDefault = false
        })
      }
    },
    isUsedFolderFirst(v) {
      if (v) {
        this.list.push({
          boardId: null,
          classId: this.classId,
          sortNo: 1,
          folderName: `새 폴더`,
          activeColorIdx: 0,
          postCount: 0,
          color: this.colors[0],
          isEditable: false,
          isDefault: false
        })
        this.isUsedFolderFirst = false
      }
    }
  },
  mounted() {
    //폴더중 isDefault 하나는 true로 들어가야 함 value체크
  },
  methods: {
    onInput(forderName, idx) {
      this.list[idx].folderName = forderName
        .replace(/[^a-z|A-Z|0-9|ㄱ-ㅎ|가-힣|_(){}[]\s{0, 10}/g, "")
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
    },
    setFolderList(data) {
      this.isUsedFolder = data.isUsedFolder
      this.list = cloneDeep(data.folders)
    },
    onClickColor(item, idx, index) {
      let folderList = cloneDeep(this.list)
      folderList[index].activeColorIdx = idx
      folderList[index].color = this.colors[idx]
      this.list = folderList
    },
    onCheckEdit() {
      const editCheck = this.list.filter(item => {
        return item.isEditable === true
      })
      return editCheck
    },
    removeDragIcon() {
      setTimeout(() => {
        if (this.list.length < 2 && this.isUsedFolder && document.getElementsByClassName('btn-move')[0]) {
          document.getElementsByClassName('btn-move')[0].className = ''
        }
      })
    },
    add() {
      let sortNo = this.list[this.list.length - 1].sortNo + 1;
      this.hideBtnMove = true;
      this.list.push({
        boardId: null,
        classId: this.classId,
        sortNo,
        folderName: '',
        activeColorIdx: 0,
        color: this.colors[0],
        postCount: 0,
        isEditable: true,
        addFolder: true,
        isDefault: false
      })
      this.draggableFlag = false
    },
    edit(el) {
      el.original = cloneDeep(el)
      el.addFolder = false
      this.hideBtnMove = true;
      el.isEditable = true;
      this.draggableFlag = false
      this.$forceUpdate()
    },
    save(el) {
      if (el.original) {
        delete el.original
      }
      el.isEditable = false
      if (isEmpty(this.onCheckEdit())) {
        //전체 리스트 수정상태 확인하고 없을시에만 드래그허용
        this.draggableFlag = true
        const editableLength = this.list.find((elm) => {
          return elm.isEditable
        });
        if (!editableLength) this.hideBtnMove = false;
      }
      this.$forceUpdate()
    },
    cancel(el) {
      if (el.original) {
        el.folderName = el.original.folderName
        el.color = el.original.color
        el.activeColorIdx = el.original.activeColorIdx
        delete el.original
      }
      el.isEditable = false;
      if (el.addFolder) {
        //폴더추가시에만 삭제
        this.list = this.list.filter(elm => {
          return elm !== el
        })
      }
      if (isEmpty(this.onCheckEdit())) {
        this.draggableFlag = true
        const editableLength = this.list.find((elm) => {
          return elm.isEditable
        });
        if (!editableLength) this.hideBtnMove = false;
      }
      this.$forceUpdate()
    },
    async deleteFolder(item) {
      this.$toasted.clear()

      // 삭제할 폴더의 삭제가능한 게시글 또는 다른 구성원이 작성한 임시게시글이 있는지 확인
      const url = `/boardFolders/${item.folderId}/post-exist`
      await this.$axios.get(url)
        .then(res => {
          this.deletablePostExist = res.data.deletablePostExist
          this.hiddenPostExist = res.data.hiddenPostExist
        })

      if (item.postCount < 1) {
        let folderList = []
        folderList = this.list.filter(folder => {
          return folder.sortNo !== item.sortNo
        })
        folderList.forEach((item, idx) => {
          item.sortNo = idx + 1
        })
        this.list = folderList
      } else if (!this.deletablePostExist && this.hiddenPostExist) {
        this.$hiClass.confirm('다른 구성원이 작성한 예약/임시저장 게시글이 있습니다.<br>삭제하시겠습니까?')
          .then(() => {
            let folderList = []
            folderList = this.list.filter(folder => {
              return folder.sortNo !== item.sortNo
            })
            folderList.forEach((item, idx) => {
              item.sortNo = idx + 1
            })
            this.list = folderList
          })
          .catch(() => {
            return
          })
      } else {
        this.$toasted.show('게시글이 존재하는 폴더는 삭제가 불가능합니다.')
      }
    },
    onSubmitFolder() {
      let arr = cloneDeep(this.list)
      arr.forEach((item, idx) => {
        item.sortNo = idx + 1
      })
      return arr
    },
    unUsedBoard() {
      this.isUsedFolder = false
    },
    onCheckDefaultFolder() {
      const params = this.list
      if (!isEmpty(params)) {
        if (params.length < 2 || !this.boardStatus) {
          params[0].isDefault = true
        } else {
          // this.$hiClass.alert('기본폴더를 선택해주세요.', 'info').then(() => {
          this.defaultFolderSelectFlag = true
          // })
          return
        }
      }
      this.onChangeFolderModal(false)
    },
    onChangeFolderModal(v) {
      this.defaultFolderSelectFlag = v
      if (!v) {
        if (this.list.length > 1 && this.boardStatus){ this.isUsedFolder = true }
      }
    },
    setFolder(folders) {
      this.list = folders
      this.defaultFolderSelectFlag = false
    },
    setDisabled(v) {
      const folderName = v.replace(/[^a-z|A-Z|0-9|ㄱ-ㅎ|가-힣|_(){}[]/g, "")
      return folderName === '' ? true : false
    },
    onClickUserFolder() {
      setTimeout(() => {
        if (!this.isUsedFolder) {
          this.$toasted.clear()
          this.$toasted.show('폴더 사용을 OFF 해도 작성한 게시글은 모두 확인 가능합니다.')
        }
      })
    },
  }
}
</script>

<style>

</style>