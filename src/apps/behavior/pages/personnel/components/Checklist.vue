<!--
@File(Method): Checklist.vue
@Date Created: 2025-07-21
@Description: 학급기록 > 인원체크 > 상세 > 체크판
@Modified: #81138 인원체크 새창 > 상단 전체 체크 / 초기화 히든처
-->
<template>
  <div class="list" ref="studentDetailList" :class="{ 'full-height': !visibleStudents }">
    <table>
      <colgroup>
        <col width="6%" />
        <col width="14%" />
        <col v-for="item in writeItem.items" :key="`item-check-list-colgroup-${item.itemKey}`" :width="detailTableWidth"/>
        <template v-if="writeItem.checklistType === 'MEMO'">
          <col width="" />
        </template>
        <template v-else>
          <col width="24%" />
        </template>
      </colgroup>
      <thead>
        <tr :class="{ 'all-center': !hasAnyCheckListTxt }">
          <th>
            <template v-if="rewardTargetSet">
              <input type="checkbox" ref="checkAll" id="checkAll" :checked="isAllStudentChecked" @change="toggleAllCheckStudent"/>
              <label for="checkAll">{{ isAllStudentChecked }}</label>
            </template>
            <template v-else>번호</template>
          </th>
          <th>학생명</th>

          <template v-if="writeItem.checklistType === 'LEVEL_COMMENT'">
            <th v-for="(item) in writeItem.items" :key="`item-check-list-th-${item.itemKey}`" :class="{'disabled': rewardTargetSet}">
              <p class="memo">
                <span v-if="item.itemLabel">{{ item.itemLabel }}</span>
                <i v-if="!isExternalChecklist" class="bh-icon-refresh-20 cursor-pointer" @click="confirmLevelItemReset(item)"></i>
              </p>
            </th>
          </template>
          <template v-else>
            <th
              v-for="(item) in writeItem.items"
              :key="`item-check-list-th-${item.itemKey}`"
              :class="{'filter-active': activeFilterKey !== null && activeFilterKey === item.itemKey}"
            >
              <p
                class="check-list"
                  :class="`check-${item.itemKey.toLowerCase()}`"                
              >
                <span class="checkbox-filter-wrap">
                  <span class="checkbox-wrap" :class="{ center: !isExternalChecklist }">
                    <span class="checkbox">
                      <input
                          v-if="!isExternalChecklist"
                          type="checkbox"
                          :id="`chk-item-list-all-${checklistId}-${item.itemKey}`"
                          :checked="getCheckedCount(item.itemKey) === writeItem.students.filter(s => s.isVisible).length && getCheckedCount(item.itemKey) > 0"
                          :disabled="writeItem.students.length === 0"
                          @click="handleCheckItemAll($event, item.itemKey)"
                      />
                      <label :for="`chk-item-list-all-${checklistId}-${item.itemKey}`"></label>
                      <em :class="writeItem.checklistType === 'SCORE' ? 'score' : item.itemKey.toLowerCase()">
                        {{ getCheckedCount(item.itemKey) }}
                      </em>
                    </span>
                  </span>
                  <!-- 필터 버튼 추가 -->
                  <button
                    v-if="!isExternalChecklist"
                    class="btn-filter"
                    @click="openFilterSelectPopup(item.itemKey)"
                  >
                    <i class="bh-icon-filter" />
                    <span class="sr-only">필터</span>
                  </button>
                  <!-- 필터 목록 팝업 -->
                  <filter-select-popup
                      v-if="filterSelectPopup.isShow && filterSelectPopup.key === item.itemKey"
                      :item-key="item.itemKey"
                      :cur-select="filterOptionsByKey[item.itemKey]"
                      @closeFilterSelectPopup="closeFilterSelectPopup"
                      @applyFilter="applyFilter"
                      v-click-outside="closeFilterSelectPopup"
                  />
                </span>
                <span class="check-list-txt" v-if="item.itemLabel">{{ item.itemLabel }}</span>
              </p>
            </th>
          </template>

          <th :class="{'disabled': rewardTargetSet}" >
            <p class="memo">
              메모<i v-if="!isExternalChecklist" class="bh-icon-refresh-20 cursor-pointer" @click="confirmMemoReset"></i>
            </p>
          </th>
        </tr>
      </thead>

      <tbody>
        <template v-if="visibleStudents">
          <tr
              v-for="(student, stdIdx) of writeItem.students"
              :key="`write-item-list-student-${student.studentId}`"
              v-show="student.isVisible"
          >
            <td :class="{'new': student.new}">
              <template v-if="rewardTargetSet">
                <input
                    type="checkbox"
                    :id="`check-give-point-${student.studentId}`"
                    :checked="getIsStudentChecked(student.studentId)"
                    @change="onChangeStudentCheckbox(student, $event)"
                />
                <label :for="`check-give-point-${student.studentId}`"></label>
              </template>
              <template v-else>
                {{ student.studentNo }}
              </template>
            </td>
            <td class="align-l" :class="{'new': student.new}">
              <p class="name" :class="{'readonly': isExternalChecklist}">
                <span class="n-txt">{{ student.studentName }}</span>
                <span v-if="!isExternalChecklist" class="delete" @click="confirmStudentDelete(student)"><i></i></span>
              </p>
            </td>

            <!-- 체크판, 점수판 -->
            <template v-if="['CHECK', 'SCORE'].includes(writeItem.checklistType)">
              <td v-for="(item) in writeItem.items" :key="`item-check-list-td-${item.itemKey}-${writeItem.checklistType.toLowerCase()}`">
                <p
                    :class="{
                      [`check-${item.itemKey.toLowerCase()}`]: writeItem.checklistType === 'CHECK',
                      'checked': getIsItemChecked(student, item),
                      [`check-list${writeItem.checklistType === 'SCORE' ? '-text' : ''}`]: true
                    }"
                    @click="handleCheckItem(student, item.itemKey)"
                >
                  <template v-if="writeItem.checklistType === 'CHECK'"><i></i></template>
                  <template v-else>{{ item.itemLabel }}</template>
                </p>
              </td>
            </template>

            <!-- #74548 평가판 -->
            <template v-else-if="writeItem.checklistType === 'LEVEL_COMMENT'">
              <PersonnelLevel
                  v-for="item in writeItem.items"
                  :key="`item-check-list-td-${item.itemKey}-level`"
                  :value="student[`levelComment${item.itemKey}`]"
                  @input="levelValueBinding(student, item.itemKey).set($event)"
                  @sendWebsocket="sendWebsocket"
                  @handleError="(err, requestObj) => $emit('handleError', err, requestObj)"
                  @checkBannedWord="checkBannedWord"
                  :itemKey="item.itemKey"
                  :checklistId="checklistId"
                  :studentId="student.studentId"
                  :disabled="rewardTargetSet"
              />
            </template>

            <td :class="{'disabled': rewardTargetSet}" :id="`memo-${student.studentId}`">
              <div class="input-text">
                <textarea
                    maxlength="50"
                    ref="studentCheckMemo"
                    placeholder=""
                    v-model="student.checkMemo"
                    @keydown="e => inputMemoStyle(e, stdIdx)"
                    @keyup="e => checkAndUpdateMemo(e, student.studentId)"
                    @blur="e => onBlurMemo(e, student.studentId)"
                    @focus="e => checkAndUpdateMemo(e, student.studentId)"
                >
                </textarea>
              </div>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td :colspan="writeItem.items.length + 3">
              <div class="no-data">
                <i class="bh-icon-warning-circle-fill-52" />
                <span>해당하는 학생이 없습니다.</span>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <template v-if="isEmptyStudentList">
      <div class="nodata">
        <i class="bh-icon-warning-circle-fill-52"></i>
        <span>
          등록된 학생이 없습니다.<br/>학생을 추가해주세요.
        </span>
      </div>
    </template>

    <toast-type01 v-if="toast.isShow" :item="toast" :is-show-cancel-btn="false"/>

    <confirm-modal
        v-if="confirmModal.isOpen"
        :title="confirmModal.title"
        :description="confirmModal.description"
        :confirmButtonText="confirmModal.confirmButtonText"
        :confirmButtonColor="confirmModal.confirmButtonColor"
        :isAlert="confirmModal.isAlert"
        @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>

<script>
import PersonnelLevel from "@/apps/behavior/pages/personnel/components/PersonnelLevel.vue";
import {mapActions, mapState} from "vuex";
import ConfirmModal from "@/apps/behavior/components/popup/ConfirmModal.vue";
import {debounce} from "lodash";
import { CHECK_ITEM_KEY } from '@/apps/behavior/pages/personnel/personnel.js';
import { useChecklistController } from '@/apps/behavior/modules/personnel';
import FilterSelectPopup from "@/apps/behavior/pages/personnel/components/FilterSelectPopup.vue";
import ToastType01 from "@/apps/behavior/components/toast/ToastType01.vue";
const checklistController = useChecklistController();

export default {
  name: 'CheckList',
  components: {ToastType01, FilterSelectPopup, ConfirmModal, PersonnelLevel},
  data() {
    return {
      checkedStudents: {},
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '확인',
        confirmButtonColor: '#F04F59',
        action: '',
        target: null,
        isAlert: false,        
      },
      debouncedUpdateMemo: null,
      setBannedWordTimer: null,
      filterSelectPopup: {
        isShow: false,
        key: null
      },
      filterOptionsByKey: {},
      activeFilterKey: null,
      toast: {
        message: '',
        isShow: false,
        top: null,
        bottom: 30,
        left: null,
        right: null,
        width: null,
        height: null,
        align: "center"
      }
    }
  },
  props: {
    writeItem: {
      type: Object,
      required: true
    },
    rewardTargetSet: {
      type: Boolean,
      required: true
    },
    isSearch: {
      type: Boolean,
      default: false
    },
    searchKind: {
      type: String,
      default: ''
    },
    bannedWords: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeBehavior', ['isExternalChecklist', 'updateSubscribeList']),
    detailTableWidth() {
      const totalWidth = "56"
      const itemWidth = totalWidth / this.writeItem.items.length
      return `${itemWidth}%`
    },
    isAllStudentChecked() {
      return (
          this.writeItem?.students?.length > 0 && 
          this.writeItem.students.length === Object.keys(this.checkedStudents).length
      )
    },
    isEmptyStudentList() {
      return this.writeItem.students?.length === 0
    },
    userId() {
      return this.user.currentId || null
    },
    checklistId() {
      return this.writeItem.checklistId || null
    },
    hasAnyCheckListTxt() {
      return this.writeItem.items.some(item => !!item.itemLabel)
    },
    visibleStudents() {
      if (!this.activeFilterKey) return true
      return this.writeItem.students.some(s => s.isVisible)
    }
  },
  mounted() {
    if (this.writeItem.items && this.writeItem.items.length > 0) {
      this.setFilterOptionsByKey()
      this.$nextTick(() => {
        this.initMemoStyle()
      })
    }
    // 메모 input 입력 debounce
    this.debouncedUpdateMemo = debounce(async (e, idx) => {
      await this.updateMemo(e, idx)
    }, 300)
  },
  methods: {
    ...mapActions('storeBehavior', ['sendStompClient']),

    updateMemoHeight(idx) {
      this.$nextTick(() => {
        if (!this.$refs.studentCheckMemo || !this.$refs.studentCheckMemo[idx]) return
        const el = this.$refs.studentCheckMemo[idx]
        el.style.height = '21px'
        el.style.height = `${el.scrollHeight}px`
      })
    },
    // init
    initMemoStyle() {
      if (!this.writeItem.students || this.writeItem.students.length === 0) return
      for (let i = 0; i < this.writeItem.students.length; i++) {
        this.updateMemoHeight(i)
      }
    },

    // 체크
    toggleAllCheckStudent(e) { // 전체 toggle
      if (e.target.checked) {
        this.writeItem?.students?.forEach(s => {
          this.$set(this.checkedStudents, s.studentId, s)
        })
      } else {
        this.checkedStudents = {}
      }
      this.$emit('setCheckedStudents', this.checkedStudents)
    },
    onChangeStudentCheckbox(student, e) { // 학생 toggle
      if (e.target.checked) {
        this.$set(this.checkedStudents, student.studentId, student)
      } else {
        this.$delete(this.checkedStudents, student.studentId)
      }
      this.$emit('setCheckedStudents', this.checkedStudents)
    },
    getCheckedCount(key) {
      return this.writeItem.students.filter(s => s.isVisible).filter(s => s[`checkItem${key}`]).length
    },
    getIsStudentChecked(studentId) {
      return studentId in this.checkedStudents
    },
    getIsItemChecked(student, item) {
      return student[`checkItem${item.itemKey}`]
    },
    async handleCheckItemAll(e, itemKey) {
      const mode = e.target.checked ? 'check' : 'uncheck'
      const data = { userId: this.userId, itemKey }
      if (this.activeFilterKey !== null) {
        data.studentIds = this.writeItem.students.filter(s => s.isVisible).map(s => s.studentId)
      }
      
      try {
        await checklistController.updateChecklistCheckStatus(this.isExternalChecklist, {mode, data})
        const sendItem = {
          eventType: 'handleCheck', itemKey, isChecked: e.target.checked
        }
        if (this.activeFilterKey !== null) {
          sendItem.studentIds = this.writeItem.students.filter(s => s.isVisible).map(s => s.studentId)
        }
        await this.sendWebsocket(sendItem)

        if (e.target.checked) {
          for (const student of this.writeItem.students.filter(s => s.isVisible)) {
            student[`checkItem${itemKey}`] = true
            student.isVisible = this.isVisibleStudent(student)
            if (this.writeItem.checklistType === "SCORE") {
              this.handleStudentCheck(CHECK_ITEM_KEY.filter(key => key !== itemKey), student, false)
            }
          }

        } else {
          for (const student of this.writeItem.students.filter(s => s.isVisible)) {
            student[`checkItem${itemKey}`] = false
            student.isVisible = this.isVisibleStudent(student)
          }
        }
      } catch (err) {
        this.$emit('handleError', err)
        this.$log.debug('classroom checklist all check PATCH() error => ', err)
      }
    },
    async handleCheckItem(student, itemKey) {
      const mode = student[`checkItem${itemKey}`] ? 'uncheck' : 'check'
      
      try {
        await checklistController.updateChecklistStudentCheckStatus(this.isExternalChecklist, {
          mode, studentId: student.studentId, data: { userId : this.userId, itemKey }
        })

        await this.sendWebsocket({
          eventType: 'handleCheck', studentIds: [student.studentId], itemKey, isChecked: mode === 'check'
        })
        if (this.writeItem.checklistType === 'SCORE' && mode === 'check') {
          this.handleStudentCheck(CHECK_ITEM_KEY, student, false)
        }
        student[`checkItem${itemKey}`] = mode === 'check'
        student.isVisible = this.isVisibleStudent(student)
      } catch (err) {
        this.$emit('handleError', err)
      }

      if (this.isSearch && this.searchKind === 'user') {
        this.$emit('updateList', 0)
      }
    },
    handleStudentCheck(items, student, isChecked) {
      items.forEach(key => student[`checkItem${key}`] = isChecked)
    },

    // 평가판
    levelValueBinding(student, itemKey) {
      const key = `levelComment${itemKey}`
      return {
        set: (val) => {
          student[key] = val
        }
      }
    },
    async resetLevelItem(item) {
      try {
        await checklistController.resetChecklistLevelItem(this.isExternalChecklist, {
          userId: this.userId,
          itemKey: item.itemKey,
        })
        await this.sendWebsocket({
          eventType: 'resetLeveComment', itemKey: item.itemKey
        })
        this.$emit('reloadChecklist')
      } catch (err) {
        this.$emit('handleError', err)
        this.$log.debug('classroom resetLevelItem error => ', err)
      }
    },

    // 컨펌 모달
    async confirmMemoReset() {
      if (this.activeFilterKey !== null) {
        if (this.toast.isShow) return
        this.toast.message = '필터를 해제해주세요.'
        this.toast.isShow = true
        setTimeout(() => {
          this.toast.message = ''
          this.toast.isShow = false
        }, 1300)
        return
      }

      this.openConfirmModal({
        title: '메모를 초기화(삭제) 하시겠습니까?',
        description: '',
        confirmButtonText: '확인',
        confirmButtonColor: '#F04F59',
        action: 'resetMemo',
        target: null,
        isAlert: false
      })
    },
    async confirmStudentDelete(item) {
      this.openConfirmModal({
        title: `<span style='color: #000;'>${item.studentName}</span> 학생을 제외하시겠습니까?`,
        description: '학생에게 기록된 내역은 복구되지 않습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#F04F59',
        action: 'deleteStudent',
        target: item,
        isAlert: false
      })
    },
    async confirmLevelItemReset(item) {
      let title = item.itemLabel
      if (title && title !== '') {
        title = `${title}에 `
      }

      this.openConfirmModal({
        title: `${title}입력한 내용을 초기화(삭제) 하시겠습니까?`,
        description: '삭제된 내용은 복원되지 않습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#F04F59',
        action: 'resetLevel',
        target: item,
        isAlert: false
      })
    },

    // 컨펌 모달 제어
    openConfirmModal(option) {
      for (const [key, value] of Object.entries(option)) {
        this.confirmModal[key] = value
      }
      this.confirmModal.isOpen = true
    },
    closeConfirmModal(isConfirm) {
      if (isConfirm) {
        const fn = {
          'resetMemo': () => this.resetMemo(),
          'deleteStudent': () => this.itemCheckListUserDelete(this.confirmModal.target),
          'resetLevel': () => this.resetLevelItem(this.confirmModal.target)
        }
        const actionFn = fn[this.confirmModal.action]
        if (actionFn) actionFn()
      }
      this.confirmModal.isOpen = false
    },

    // 메모
    async updateMemo(e, studentId) {
      if (e.target.parentNode.parentNode.classList.contains('banned')) {
        return
      }

      try {
        const checkMemo = e.target.value
        await checklistController.updateChecklistMemo(this.isExternalChecklist, {
          studentId, data: { userId : this.userId, checkMemo : checkMemo }
        })
        await this.sendWebsocket({
          eventType: 'writeMemo', studentId, checkMemo
        })
      } catch (err) {
        this.$emit('handleError', err, { eventName: 'writeMemo', elId: `#memo-${studentId}` })
        this.$log.debug('classroom checklist memo PATCH() error => ', err)
      }
    },
    async resetMemo() {
      try {
        await checklistController.resetChecklistMemo({ userId : this.userId })
        await this.sendWebsocket({eventType: 'resetMemo'})
        for (let i = 0; i < this.writeItem.students.length; i++) {
          this.writeItem.students[i].checkMemo = null
          this.updateMemoHeight(i)
        }
      } catch (err) {
        this.$log.debug('classroom checklist memo reset PATCH() error => ', err)
      }
    },
    inputMemoStyle(e, idx) {
      e.target.value = e.target.value.substring(0, 50)
      if (e.key === 'Enter') {
        e.preventDefault()
      }
      this.updateMemoHeight(idx)
    },
    checkAndUpdateMemo(e, studentId) {
      if (this.isExternalChecklist) {
        this.checkBannedWord(e, e.target.value)
      }
      this.debouncedUpdateMemo(e, studentId)
    },
    onBlurMemo(e, studentId) {
      this.updateMemo(e, studentId)
      this.debouncedUpdateMemo.cancel()
    },
    checkBannedWord(e, text) {
      this.$toasted.clear()

      if (this.bannedWords.filter(w => text.includes(w)).length > 0) {
        this.setBannedWordTimer = setTimeout(() => {
          if (!e.target.parentNode.parentNode.classList.contains('banned')) {
            this.$toasted.show('작성하신 문장 내에 사용 금지 단어가 포함되어 있습니다.', {position: 'top-center'})
            e.target.parentNode.parentNode.classList.add('banned')
          }
        }, 250)

      } else {
        clearTimeout(this.setBannedWordTimer)
        if (e.target.parentNode.parentNode.classList.contains('banned')) {
          e.target.parentNode.parentNode.classList.remove('banned')
        }
      }
    },

    // 학생 제외
    async itemCheckListUserDelete(item) {
      try {
        const res = await checklistController.deleteChecklistStudent({
          userId : this.userId, studentIds : [item.studentId]
        })

        if (res) {
          this.writeItem.students = this.writeItem.students.filter(student => student.studentId !== item.studentId)

          // 메모판, 평가판 점수에 체크되었던 학생이라면 checkbox 목록에서 삭제
          if (['MEMO', 'LEVEL_COMMENT'].includes(this.writeItem.checklistType) && item.studentId in this.checkedStudents) {
            this.$delete(this.checkedStudents, item.studentId)
          }

          this.$nextTick(() => {
            this.initMemoStyle()
            this.$emit('initTitleStyle')
          })
        }
      } catch (err) {
        this.$log.debug('classroom checklist items DELETE() error => ', err)
      }
    },

    // 웹소켓으로 전송
    async sendWebsocket(content) {
      const sendContent = {
        contentType: 'checklist',
        content: JSON.stringify({
          checklistId: this.writeItem.checklistId,
          checklistType: this.writeItem.checklistType,
          ...content
        })
      }
      await this.sendStompClient(sendContent)
    },

    // 체크판, 점수판 필터
    setFilterOptionsByKey() {
      this.filterOptionsByKey = this.writeItem.items.reduce((acc, value) => {
        return {
          ...acc,
          [value.itemKey]: ['CHECKED', 'UNCHECKED']
        }
      }, {})
    },
    openFilterSelectPopup(itemKey) {
      if (this.filterSelectPopup.isShow && this.filterSelectPopup.key === itemKey) {
        this.closeFilterSelectPopup()
        return
      }
      this.filterSelectPopup.key = itemKey;
      this.filterSelectPopup.isShow = true;
    },
    closeFilterSelectPopup() {
      this.filterSelectPopup.key = null;
      this.filterSelectPopup.isShow = false
    },
    applyFilter({itemKey, selectedFilters}) {
      // 이전 선택 필터 초기화
      if (this.activeFilterKey !== null) {
        this.filterOptionsByKey[this.activeFilterKey] = ['CHECKED', 'UNCHECKED'];
        this.activeFilterKey = null
      }

      if (selectedFilters.includes('CHECKED') && selectedFilters.includes('UNCHECKED')) {
        // 현재 선택 필터 초기화
        this.filterOptionsByKey[itemKey] = ['CHECKED', 'UNCHECKED'];
        this.writeItem.students.map(s => {s.isVisible = true})
        return
      }

      this.activeFilterKey = itemKey;
      this.filterOptionsByKey[itemKey] = selectedFilters
      this.writeItem.students.map(s => {s.isVisible = this.isVisibleStudent(s)})
    },
    resetFilter() {
      this.activeFilterKey = null
      this.filterSelectPopup.key = null
      this.setFilterOptionsByKey()
    },
    isVisibleStudent(student) {
      if (!this.activeFilterKey) return true

      const filtered = this.filterOptionsByKey[this.activeFilterKey]
      if (filtered.includes('CHECKED') && filtered.includes('UNCHECKED')) {
        return true
      }
      return filtered.includes('CHECKED') ?
          student[`checkItem${this.activeFilterKey}`] :
          !student[`checkItem${this.activeFilterKey}`]
    },
  },
  watch: {
    rewardTargetSet(newVal) {
      if (newVal) {
        if (['MEMO', 'LEVEL_COMMENT'].includes(this.writeItem.checklistType)) {
          this.checkedStudents = {}
          this.$emit('setCheckedStudents', this.checkedStudents)
        }
      }
    },
    // 웹소켓 동기화
    updateSubscribeList(newVal) {
      if (newVal.contentType === 'checklist') {
        if (newVal.content.checklistId !== this.checklistId) return

        let student = null
        if (newVal.content.studentId) {
          student = this.writeItem.students.find(s => s.studentId === newVal.content.studentId)
        }

        const eventObj = {
          'handleCheck': () => {
            // 항목 체크
            const checkItems = (s) => {
              s[`checkItem${newVal.content.itemKey}`] = newVal.content.isChecked
              if (this.writeItem.checklistType === 'SCORE' && newVal.content.isChecked) {
                this.handleStudentCheck(CHECK_ITEM_KEY.filter(key => key !== newVal.content.itemKey), s, false)
              }
            }
            newVal.content.studentIds ?
                this.writeItem.students.filter(s => newVal.content.studentIds.includes(s.studentId)).forEach(s => checkItems(s)) :
                this.writeItem.students.forEach(s => checkItems(s))
          },
          'writeMemo': () => {
            if (student) {
              const activeEl = document.activeElement;
              const isEditing = activeEl && activeEl.closest(`#memo-${student.studentId}`);

              if (!isEditing) {
                student.checkMemo = newVal.content.checkMemo;
                const memoInput = document.querySelector(`#memo-${student.studentId}`);
                if (memoInput) memoInput.classList.remove('banned');
                
                const idx = this.writeItem.students.findIndex(s => s.studentId === student.studentId)
                if (idx !== -1) this.updateMemoHeight(idx)
              }
            }
          },
          'resetMemo': () => {
            this.writeItem.students.forEach((s, idx) => {
              s.checkMemo = null
              const memoInput = document.querySelector(`#memo-${s.studentId}`)
              if (memoInput) memoInput.classList.remove('banned')
              this.updateMemoHeight(idx)
            })
          },
          'writeLevelComment': () => {
            if (student) {
              const activeEl = document.activeElement;
              const isEditing = activeEl && activeEl.closest(`#levelComment-${student.studentId}-${newVal.content.itemKey}`);

              if (!isEditing) {
                student[`levelComment${newVal.content.itemKey}`] = newVal.content.levelComment
                const levelCommentInput = document.querySelector(`#levelComment-${student.studentId}-${newVal.content.itemKey}`)
                if (levelCommentInput) levelCommentInput.classList.remove('banned');
              }
            }
          },
          'resetLeveComment': () => {
            this.writeItem.students.forEach(s => {
              s[`levelComment${newVal.content.itemKey}`] = null
              const levelCommentInput = document.querySelector(`#levelComment-${s.studentId}-${newVal.content.itemKey}`)
              levelCommentInput.classList.remove('banned')
            })
          }
        }

        eventObj[newVal.content.eventType]?.()
      }
    },
    'writeItem.checklistId'() {
      this.writeItem.students.forEach(s => s.isVisible = true)
      this.resetFilter()
    }
  }
}
</script>

<style scoped lang="scss">
.behavior-wrapper__body {
  .behavior-wrapper__body__content {
    .record.inwon .record-recording {
      .record-recording__content {
        .record-recording__content__inwon {
          .list-wrap {
            .list {
              &.full-height {
                table {
                  height: 100%;
                }
              }
              table {
                tbody {
                  tr {
                    td.banned {
                      border: 1px solid #f95f6e !important;
                    }
                  }
                }
                tr {
                  // 모든 th에 텍스트가 없을 때만 가운데 정렬
                  &.all-center {
                    .check-list {
                      justify-content: center;
                    }                    
                  }
                  th {
                    .check-list {
                      justify-content: flex-start;
                      padding: 10px 4px;
                      height: 100%;                      
                      .checkbox-filter-wrap {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        min-height: 22px;                        
                        padding: 0;
                        margin-top: 0;
                        .checkbox-wrap {
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          min-height: 22px;
                          flex: 1;
                          margin-top: 0;
                          padding: 0;
                          &.center {
                            margin-left: 16px;
                          }
                        }
                        .btn-filter {
                          .bh-icon-filter {
                            display: inline-block;                            
                            width: 16px;
                            height: 16px;
                            background: url('~@/assets/img/icon/ic_filter_sort_16.svg') 0 / 16px no-repeat;                            
                          }
                        }
                      }
                      .check-list-txt {
                        padding: 0;
                        min-height: auto;
                      }                
                    }
                    &.filter-active {
                      background: #FFF8F0;
                      .check-list {
                        .checkbox-filter-wrap {
                          .btn-filter {
                            .bh-icon-filter {
                              background: url('~@/assets/img/icon/ic_filter_16.svg') 0 / 16px no-repeat;                            
                            }
                          }
                        }
                      }                      
                    }
                  }
                  td {
                    .no-data {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-direction: column;
                      gap: 12px;
                      span {
                        font-size: 15px;
                        font-weight: 400;
                        line-height: 15px;
                        color: #9E9E9E;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>