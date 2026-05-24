<template>
  <div :class="{
          'seating-plan-manual' : seatPlanMode === 'seating-plan-manual',
          'seating-plan-preset' : seatPlanMode === 'seating-plan-preset',
          'seating-plan-selection' : isSelectionMode,
          'on-total-give': isTotalGivePointMode === true,
          'on-who': isWhoWriteMode === true,
          'on-total-reset': isResetMode === true,
        }"
       class="class__wrap"
  >
    <div class="class__content">
      <template v-if="seatPlanMode === 'seating-plan-manual'">
        <div class="seating-plan-view">
          <div class="mode-head">
            <div class="tit">
              자리 수동 변경하기
              <p class="smr">변경할 자리를 순차로 선택하여 변경해주세요. 학생이 추가된 경우 자리를 활성화 할 수 있습니다.</p>
            </div>
            <div class="btns">
              <span v-if="this.item.seatPlanType === 'FREE'" class="available">사용 가능 자리 <em>{{ seatActiveCount }}</em> / 56</span>
              <button class="btn01" type="button" @click="openConfirmModal('manualEsc')">취소</button>
              <button class="btn02" type="button" @click="onPatchManual">저장</button>
            </div>
          </div>

          <components
              :is="componentName"
              ref="seatPlanComponent"
              :detail="item"
              :studentCount="studentCount"
              @changingSeat="changingSeat"
              @submit="submitPatchManual"
          />
        </div>
      </template>

      <template v-else-if="seatPlanMode === 'seating-plan-preset'">
        <div class="seating-plan-view">
          <div class="mode-head">
            <div class="tit">
              자리 미리 지정하기
              <p class="smr">선생님이 원하는대로 학생의 자리를 미리 지정할 수 있습니다. 학생을 순차적으로 클릭하여 변경해주세요.</p>
            </div>
            <div class="btns">
              <button class="btn01" type="button" @click="openConfirmModal('presetEsc')">나가기</button>
              <button class="btn02" type="button" @click="onPreBatchFinish">설정완료</button>
            </div>
          </div>

          <components
              :is="componentName"
              ref="seatPlanComponent"
              :detail="item"
              :studentCount="studentCount"
              @changingSeat="changingSeat"
              @submit="submitPreBatch"
          />
        </div>
      </template>

      <template v-else>
        <div class="seating-plan-view">
          <div class="mode-head">
            <template v-if="!isSelectionMode">
              <div v-click-outside="outsideSeatPlansSelectBox"
                   :class="{
                                'is-opened': isOpenSeatPlansSelectBox
                            }"
                   class="hi-selectbox"
                   @click="toggleSeatPlansSelectBox"
              >
                <button class="selected">{{ selectedItem.seatPlanName }}</button>
                <div class="option__layer">
                  <ul>
                    <li v-for="item of seatPlans" :key="`seat-plan-${item.seatPlanId}`">
                      <button :class="{
                                                'is-selected': item.seatPlanId === selectedItem.seatPlanId
                                            }" class="option"
                              type="button"
                              @click="selectSeatPlan(item)"
                      >{{ item.seatPlanName }}
                      </button>
                      <button class="del" type="button" @click="clickDeleteDetailItem(item)">
                        <i class="bh-icon-delete-20"></i>
                      </button>
                    </li>
                  </ul>
                  <button class="add" type="button" @click="openSeatAdd">
                    <i class="bh-icon-plus-20"></i
                    ><span class="">자리배치도 추가</span>
                  </button>
                </div>
              </div>
              <div class="ctr-btns">
                <button type="button" @click="onClickPrint">
                  <i class="bh-icon-printer-24"></i>
                  <span>인쇄</span>
                </button>
                <button type="button" @click="onSeatPlanMode('seating-plan-manual')">
                  <i class="bh-icon-random-24"></i>
                  <span>자리 수동 변경</span>
                </button>
                <button :class="{
                                active: item.isStudentHidden
                              }" type="button"
                        @click="openConfirmModal('preset')"
                >
                  <i class="bh-icon-image-edit-24"></i>
                  <span>선생님 모드</span>
                </button>
                <button type="button" @click="openSeatAdd('update')">
                  <i class="bh-icon-set-24"></i>
                  <span>자리배치도 설정</span>
                </button>
                <button class="auto-plan" type="button" @click="onPositionBatch">자동 자리배치 하기</button>
              </div>
            </template>
          </div>

          <components
              :is="componentName"
              ref="seatPlanComponent"
              :detail="item"
              :isTotalGivePointMode="isTotalGivePointMode"
              :isWhoWriteMode="isWhoWriteMode"
              @reBatchChangeSutdent="reBatchChangeStudent"
              @studentCheck="studentCheck"
          />
        </div>
      </template>
    </div>

    <template v-if="!isEmpty">
      <div class="class__badge">
        <template v-if="!isMode">
          <template v-if="isTotalGivePointMode === true">
            <div>
              <button class="give-esc" @click="closeTotalGivePointMode">취소</button>
              <template v-if="checkedStudentCount > 0">
                <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{
                    checkedStudentCount
                  }}명 선택해제</span>
                <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
              </template>

              <template v-else>
                <span class="total" @click="studentTotalCheck"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
              </template>
            </div>
            <div>
              <button :class="{
                            dis: isSubmit === false
                        }"
                      :disabled="isSubmit === false"
                      class="give-point"
                      @click="openGiveTotalPointModal2"
              ><i class="bh-reward-32"></i>{{ checkedStudentCount }}명 포인트 지급
              </button>
            </div>
          </template>

          <template v-else-if="isWhoWriteMode === true">
            <div>
              <button class="give-esc" @click="closeWhoWriteMode">취소</button>
              <template v-if="checkedStudentCount > 0">
                <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{
                    checkedStudentCount
                  }}명 선택해제</span>
                <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
              </template>

              <template v-else>
                <span class="total" @click="studentTotalCheck"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
              </template>
            </div>
            <div>
              <button :class="{
                              dis: isSubmit === false
                          }"
                      :disabled="isSubmit === false"
                      class="who-write"
                      @click="openWhoWriteMode"><i class="bh-icon-pencil-32"></i>누가기록 작성
              </button>
            </div>
          </template>

          <template v-else-if="isResetMode === true">
            <div>
              <button class="give-esc" @click="closeResetMode">취소</button>
              <template v-if="checkedStudentCount > 0">
                <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{
                    checkedStudentCount
                  }}명 선택해제</span>
                <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
              </template>

              <template v-else>
                <span class="total" @click="studentTotalCheck"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
              </template>
            </div>
            <div>
              <button class="check-total" @click="openConfirmModal('resetAllStudents')">전체 초기화</button>
              <button :class="{
                                  dis: isSubmit === false
                              }"
                      :disabled="isSubmit === false"
                      class="give-point"
                      @click="openConfirmModal('resetSelectedStudents')"
              >
                {{ checkedStudentCount }}명 포인트 초기화
              </button>
            </div>
          </template>

          <template v-else>
            <div>
                        <span class="reset" @click="openResetMode">
                            <i class="bh-icon-refresh-24"></i>보이는 포인트 초기화
                        </span>
              <template v-if="checkedStudentCount > 0">
                <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{
                    checkedStudentCount
                  }}명 선택해제</span>
                <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
              </template>

              <template v-else>
                <span class="total" @click="studentTotalCheck"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
              </template>
            </div>
            <div>
              <button v-if="item.sectionType !== 'FREE_LAYOUT'" class="group" @click="openGroupDraw">그룹<br>뽑기</button>
              <button class="who" @click="openWhoWriteMode">누가<br>기록</button>
              <button class="effort" @click="openTotalGivePointMode('effort')">노력 지급</button>
              <button class="good" @click="openTotalGivePointMode('good')">좋음 지급</button>
            </div>
          </template>
        </template>

        <template v-else>
          <template v-if="seatPlanMode === 'seating-plan-preset'">
            <div class="txt">
              <p>
                고정된 학생이 있는 경우 랜덤 섞기 시 해당 학생을 제외한 나머지 학생의 자리만 변경됩니다.
              </p>
              <p>
                <span class="em">주의</span>자리 지정 후 설정 > 자리대형을 변경하면, 자리 지정이 해제 됩니다
              </p>
            </div>
            <button type="button" @click="onPositionRandomBatch">
              <i class="bh-icon-random-24"></i>랜덤 섞기
            </button>
          </template>
        </template>
      </div>
    </template>


    <confirm-modal
        v-if="confirmModal.isOpen"
        :cancelButtonText="confirmModal.cancelButtonText"
        :confirmButtonColor="confirmModal.confirmButtonColor"
        :confirmButtonText="confirmModal.confirmButtonText"
        :description="confirmModal.description"
        :isAlert="confirmModal.isAlert"
        :title="confirmModal.title"
        @closeConfirmDialog="closeConfirmModal"
    />

    <seat-add-modal
        v-if="isOpenSeatAddModal"
        :isReBatchChangeSutdent="isReBatchChangeStudent"
        :updateItem="updateItem"
        @close="closeSeatAdd"
        @submit="seatAddSubmit"
    />

    <give-total-point-modal
        v-if="isGiveTotalPointModal === true"
        :mode="totalGivePointKind"
        :studentList="[totalGivePointStudents]"
        @close="closeGiveTotalPointModal"
        @closeSubmit="givePointFinish"
    />

    <who-write-modal
        v-if="isOpenWhoWriteModal === true"
        :mode="'write'"
        :studentList="totalGivePointStudents"
        @close="closeWhoWriteModal"
        @closeSubmit="whoWriteFinish"
    />
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from 'vuex'
import SeatAddModal from '@/apps/behavior/components/popup/SeatAddModal.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import SeatPlansRow from '@/apps/behavior/components/list/SeatPlansRow.vue'
import SeatPlansGroup from '@/apps/behavior/components/list/SeatPlansGroup.vue'
import SeatPlansFree from '@/apps/behavior/components/list/SeatPlansFree.vue'
import SeatPlansManualRow from '@/apps/behavior/components/list/SeatPlansManualRow.vue'
import SeatPlansManualGroup from '@/apps/behavior/components/list/SeatPlansManualGroup.vue'
import SeatPlansManualFree from '@/apps/behavior/components/list/SeatPlansManualFree.vue'
import SeatPlansPreBatchRow from '@/apps/behavior/components/list/SeatPlansPreBatchRow.vue'
import SeatPlansPreBatchGroup from '@/apps/behavior/components/list/SeatPlansPreBatchGroup.vue'
import SeatPlansPreBatchFree from '@/apps/behavior/components/list/SeatPlansPreBatchFree.vue'
import WhoWriteModal from '@/apps/behavior/components/popup/WhoWriteModal.vue'
import GiveTotalPointModal from '@/apps/behavior/components/popup/GiveTotalPointModal.vue'
import {eventBus} from '@/main'
import GroupDraw from "@/apps/behavior/pages/classrooms/GroupDraw.vue";
import {getSeatPlanSections} from "@hiclass/core";
import {mapFields} from "vuex-map-fields";
import SeatPlansMixin from "@/apps/behavior/mixins/SeatPlansMixin.vue";

export default {
  name: 'seat-plans',
  props: {},
  components: {
    GroupDraw,
    ConfirmModal,
    SeatAddModal,
    SeatPlansRow,
    SeatPlansGroup,
    SeatPlansFree,
    SeatPlansManualRow,
    SeatPlansManualGroup,
    SeatPlansManualFree,
    SeatPlansPreBatchRow,
    SeatPlansPreBatchGroup,
    SeatPlansPreBatchFree,
    WhoWriteModal,
    GiveTotalPointModal
  },
  data() {
    return {
      isOpenSeatAddModal: false,
      isOpenSeatPlansSelectBox: false,
      selectedItem: {},
      item: {},
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        cancelButtonText: '',
        action: '',
        isAlert: false
      },
      targetDelete: {},
      updateItem: {},
      isReBatchChangeStudent: false,
      studentCount: 0,
      /* 포인트지급, 누가기록, 포인트 초기화 */
      checkedStudentCount: 0,
      totalGivePointStudents: [],
      /* 누가기록 */
      isWhoWriteMode: false,
      isOpenWhoWriteModal: false,
      /* 포인트 지급 */
      isTotalGivePointMode: false,
      isGiveTotalPointModal: false,
      totalGivePointKind: "",
      /* 포인트 초기화 */
      isResetMode: false,
      isChangingSeat: false
    }
  },
  computed: {
    ...mapFields([
      'isDimLoading'
    ]),
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
      seatPlans: 'seatPlans',
      seatPlanMode: 'seatPlanMode',
      seatActiveCount: 'seatActiveCount',
      lastSeatPlanId: 'lastSeatPlanId'
    }),
    classroomId: function () {
      return this.curClassroom.classroomId
    },
    isEmpty: function () {
      return this.seatPlans.length <= 0
    },
    isMode: function () {
      return !!this.seatPlanMode
    },
    componentName() {
      let name = ""
      if (this.seatPlanMode === 'seating-plan-manual') {
        if (this.item.seatPlanType === "DIVISION") {
          name = "SeatPlansManualRow"
        } else if (this.item.seatPlanType === "GROUP") {
          name = "SeatPlansManualGroup"
        } else if (this.item.seatPlanType === "FREE") {
          name = "SeatPlansManualFree"
        }
      } else if (this.seatPlanMode === 'seating-plan-preset') {
        if (this.item.seatPlanType === "DIVISION") {
          name = "SeatPlansPreBatchRow"
        } else if (this.item.seatPlanType === "GROUP") {
          name = "SeatPlansPreBatchGroup"
        } else if (this.item.seatPlanType === "FREE") {
          name = "SeatPlansPreBatchFree"
        }
      } else {
        if (this.item.seatPlanType === "DIVISION") {
          name = "SeatPlansRow"
        } else if (this.item.seatPlanType === "GROUP") {
          name = "SeatPlansGroup"
        } else if (this.item.seatPlanType === "FREE") {
          name = "SeatPlansFree"
        }
      }

      return name
    },
    style() {
      return {
        width: '100%',
        height: '100%'
      }
    },
    seatIsActiveCount() {
      return this.item.seatSections[0].seats.filter((seat) => seat.isActive).length;
    },
    seatCount() {
      let count = 0

      for (const seatSection of this.item.seatSections) {
        count = count + seatSection.seatCount
      }

      return count
    },
    isSelectionMode() {
      return this.isWhoWriteMode || this.isTotalGivePointMode || this.isResetMode
    },
    isSubmit() {
      return this.checkedStudentCount > 0
    }
  },
  watch: {
    classroomId() {
      this.closeSeatPlanMode(null)
      this.getSeatPlanList()
      this.initSelectionMode()
    },
    selectedItem(v) {
      this.setLastSeatPlanId(v.seatPlanId)

      let list = []
      const latestSeatPlanIds = JSON.parse(localStorage.getItem("latestSeatPlanIds"))
      if (latestSeatPlanIds) {
        const rList = latestSeatPlanIds.filter(v => v.classroomId !== this.classroomId)
        list = [
          ...rList,
          {
            classroomId: this.classroomId,
            seatPlanId: v.seatPlanId
          }
        ]
      } else {
        list = [{
          classroomId: this.classroomId,
          seatPlanId: v.seatPlanId
        }]
      }
      localStorage.setItem('latestSeatPlanIds', JSON.stringify(list))
    }
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudents: 'getClassroomStudents',
      getDetailSeatPlan: 'getDetailSeatPlan',
      getDetailSeatPlanSections: 'getDetailSeatPlanSections',
      deleteSeatPlan: 'deleteSeatPlan',
      getSeatPlans: 'getSeatPlans',
      patchPointGiveFinishModal: 'patchPointGiveFinishModal',
      patchRewardResetStudents: 'patchRewardResetStudents',
      patchRewardResetAllStudents: 'patchRewardResetAllStudents',
      sendStompClient: 'sendStompClient',
    }),
    ...mapMutations('storeBehavior', {
      setSeatPlans: 'setSeatPlans',
      setSeatPlanMode: 'setSeatPlanMode',
      setLastSeatPlanId: 'setLastSeatPlanId'
    }),
    async openGroupDraw() {
      const isStudentCount = this.seatIsStudentCount()

      if (isStudentCount > 0) {
        let version = this.selectedItem.version
        if (this.selectedItem.isStudentHidden) {
          // 선생님 모드여서 숨긴 상태일 때는 전 버전을 불러온다
          version = this.selectedItem.beforeVersion || 1;
        }
        eventBus.$emit('behavior-records/openGroupDraw', {
          classroomId: this.classroomId,
          seatPlanId: this.selectedItem.seatPlanId,
          version
        });
      } else {
        // 자리에 학생들이 배치되지 않았을 경우
        this.openConfirmModal("studentNoneBatch")
      }
    },
    async getStudents() {
      const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
      return await this.getClassroomStudents(params)
    },
    async getStudentUpdateList() {
      const students = this.$refs.seatPlanComponent.getTargetStudents()
      const students2 = await this.getStudents()
      const list = students2.filter(v => students.findIndex(v2 => v.studentId === v2.studentId) > -1)

      return list
    },
    async getSeatPlanList() {
      try {
        await this.getSeatPlans({classroomId: this.classroomId})
        this.init()
      } catch (err) {
        this.$log.debug('getSeatPlanList GET() error => ', err)
      }
    },
    async getSeatPlanUpdateList() {
      try {
        await this.getSeatPlans({classroomId: this.classroomId})
      } catch (err) {
        this.$log.debug('getSeatPlanList GET() error => ', err)
      }
    },
    seatIsStudentCount() {
      return this.$refs.seatPlanComponent.isStudentActiveCount()
    },
    init() {
      if (this.seatPlans.length > 0) {
        // let obj = null

        // if(this.lastSeatPlanId) {
        //   obj = this.seatPlans.find(v => v.seatPlanId === this.lastSeatPlanId)
        // }

        // if(obj) {
        //   this.selectedItem = obj
        // } else {
        //   this.selectedItem = this.seatPlans[0]
        // }
        const latestSeatPlanIds = JSON.parse(localStorage.getItem("latestSeatPlanIds"))
        if (latestSeatPlanIds) {
          const seatPlanIdObj = latestSeatPlanIds.find(v => v.classroomId === this.classroomId)
          if (seatPlanIdObj) {
            const obj = this.seatPlans.find(v => v.seatPlanId === seatPlanIdObj.seatPlanId)
            if (obj) {
              this.selectedItem = obj
            } else {
              this.selectedItem = this.seatPlans[0]
            }
          } else {
            this.selectedItem = this.seatPlans[0]
          }
        } else {
          this.selectedItem = this.seatPlans[0]
        }
        this.getDetailItem()
      }
    },
    async getDetailItem() {
      let version = this.selectedItem.version

      if (this.seatPlanMode !== "seating-plan-preset") {
        if (this.selectedItem.isStudentHidden) {
          version = this.selectedItem.beforeVersion || 1
        }
      }

      try {
        this.item = await getSeatPlanSections(this.classroomId, this.selectedItem.seatPlanId, version)
        this.$log.debug("getDetailItem res => ", this.item)
      } catch (err) {
        this.$log.debug('getDetailItem GET() error => ', err)
      }
    },
    clickDeleteDetailItem(item) {
      let mode = "deleteItem"
      this.targetDelete = item
      this.openConfirmModal(mode)
    },
    async deleteDetailItem(item) {
      try {
        const params = {
          classroomId: this.classroomId,
          seatPlanId: item.seatPlanId,
          version: item.version
        }
        await this.deleteSeatPlan(params)

        const list = _.cloneDeep(this.seatPlans.filter(v => v.seatPlanId !== item.seatPlanId))
        this.setSeatPlans(list)

        if (list.length > 0) {
          this.selectSeatPlan(list[0])
        } else {  // 빈값일때 해당 클래스에 있는 seatplanid삭제
          let list = []
          const latestSeatPlanIds = JSON.parse(localStorage.getItem("latestSeatPlanIds"))
          if (latestSeatPlanIds) {
            const rList = latestSeatPlanIds.filter(v => v.classroomId !== this.classroomId)
            list = [
              ...rList
            ]
          }
        }
      } catch (err) {
        this.$log.debug('deleteDetailItem DELETE() error => ', err)
      }
    },
    toggleSeatPlansSelectBox() {
      this.isOpenSeatPlansSelectBox = !this.isOpenSeatPlansSelectBox
    },
    outsideSeatPlansSelectBox() {
      if (this.isOpenSeatPlansSelectBox) {
        this.isOpenSeatPlansSelectBox = false
      }
    },
    selectSeatPlan(item) {
      this.selectedItem = item
      this.getDetailItem()
    },
    async openSeatAdd(mode = null) {
      const students = await this.getStudents()
      if (!(students.length > 0)) {
        this.openConfirmModal("studentNone")
        return
      }

      if (mode === 'update') {
        if (this.item.seatPlanType === "FREE") {
          await this.getDetailItem()
        }
        this.updateItem = _.cloneDeep(this.item)
      } else {
        if (this.seatPlans.length >= 50) {
          // this.$hiClass.alert('자리배치도는 최대 10개까지 생성가능합니다.', 'error')

          this.openConfirmModal("seatAddMax")
          return
        }
        this.updateItem = {}
      }
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.isOpenSeatAddModal = true
    },
    closeSeatAdd() {
      this.updateItem = {}
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isOpenSeatAddModal = false
      this.isReBatchChangeStudent = false
    },
    async seatAddSubmit(data, mode) {
      if (mode === "add") {
        this.setSeatPlans([data, ...this.seatPlans])
        const obj = this.seatPlans.find(v => v.seatPlanId === data.seatPlanId)
        this.selectedItem = {...obj, version: data.version}
        this.item = data
      } else if (mode === "reset") {
        await this.getSeatPlanUpdateList()
        const obj = this.seatPlans.find(v => v.seatPlanId === data.seatPlanId)
        this.selectSeatPlan({...obj, version: data.version})

      } else {
        this.selectedItem.seatPlanName = data.seatPlanName
        await this.getDetailItem()
      }
      this.closeSeatAdd()
    },
    async studentCheckInSeat() {
      let isNext = "ok"
      this.studentCount = 0
      const students = await this.getStudents()
      const studentCount = students.length

      if (studentCount === 0) {
        isNext = "studentNone"
      } else if (this.seatCount < studentCount) {
        isNext = "studentCount"
        if (this.item.seatPlanType === "FREE") {
          isNext = "ok"
        } else if (this.item.seatPlanType === "DIVISION") {
          if (this.item.sectionType === "SINGLE_COLUMN") { // 48
            if (this.seatCount >= 48) {
              isNext = "ok"
            }
          } else if (this.item.sectionType === "DOUBLE_COLUMN") {  // 56
            if (this.seatCount >= 56) {
              isNext = "ok"
            }
          }
        }
      }
      this.studentCount = studentCount

      return isNext
    },
    async onSeatPlanMode(data) {
      const isNext = await this.studentCheckInSeat()
      if (isNext === "ok") {
        this.setSeatPlanMode(data)
        await this.getSeatPlanUpdateList()
        const obj = this.seatPlans.find(v => v.seatPlanId === this.selectedItem.seatPlanId)
        this.selectSeatPlan(obj)
        await this.getDetailItem()
      } else if (isNext === "studentNone") {
        this.openConfirmModal("studentNone")
      } else if (isNext === "studentCount") {
        this.openConfirmModal("studentCount")
      }
    },
    closeSeatPlanMode(mode = null) {
      this.setSeatPlanMode(null)
      if (mode === "presetEsc") this.getDetailItem()
    },
    async onPositionBatch() {
      if ((await this.getStudents()).length === 0) return this.openConfirmModal("studentNone")
      this.$refs.seatPlanComponent.autoPositionBatch()
      // 배치후 Vuex 및 사용 하는 각 데이터의 isStudentHidden false 처리
      const selectedItem = this.seatPlans.find(v => v.seatPlanId === this.selectedItem.seatPlanId)
      if (selectedItem) {
        selectedItem.isStudentHidden = false
        const list = _.cloneDeep(this.seatPlans)
        this.setSeatPlans(list)
      }
      this.selectedItem.isStudentHidden = false
      this.item.isStudentHidden = false
    },
    onPositionRandomBatch() {
      if (!this.isChangingSeat) {
        this.$refs.seatPlanComponent.randomPositionBatch()
      }
    },
    onClickPrint() {
      document.querySelector('.start-alert').classList.remove('on-random', 'on-onece')
      this.$refs.seatPlanComponent.onClickSeatPrint()
    },
    changingSeat(data) {
      this.isChangingSeat = data
    },
    reBatchChangeStudent() {
      this.isReBatchChangeStudent = true
      this.openSeatAdd('update')
    },
    onPatchManual() {
      if (!this.isChangingSeat) {
        this.$refs.seatPlanComponent.onPatchManual()
      }
    },
    submitPatchManual() {
      this.closeSeatPlanMode()
      this.getDetailItem()
    },
    onPreBatchFinish() {
      if (!this.isChangingSeat) {
        this.$refs.seatPlanComponent.preBatchFinish()
      }
    },
    submitPreBatch() {
      this.closeSeatPlanMode()
      // this.getDetailItem()
      this.getSeatPlanList()
    },
    goManageStudents() {
      this.$router.push(`/behavior-records/${this.classroomId}/classrooms/manageStudents`)
    },
    openConfirmModal: function (action) {
      if (action === "presetEsc") {
        if (this.isChangingSeat) return
      }
      this.confirmModal = {...this.confirmModal, action}
      switch (action) {
        case 'deleteItem' :
          this.confirmModal.title = `자리배치도를 삭제하시겠습니까?`
          this.confirmModal.description = '삭제된 자리배치도는 복원이 불가합니다.'
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#f04f59'
          break;

        case 'manualEsc' :
          this.confirmModal.title = `변경사항이 저장되지 않습니다.<br/>취소하시겠습니까?`
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#ff8737'
          break;

        case 'preset' :
          this.confirmModal.title = `선생님만 있는 공간에서<br/>이용해주세요.`
          this.confirmModal.cancelButtonText = '나가기'
          this.confirmModal.confirmButtonText = '입장'
          this.confirmModal.confirmButtonColor = '#ff8737'
          break;

        case 'presetEsc' :
          this.confirmModal.title = `이대로 나가면<br/>설정된 값이 저장되지 않습니다.`
          this.confirmModal.cancelButtonText = '저장 후 나가기'
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#ff8737'
          break;

        case 'studentNone' :
          this.confirmModal.title = `등록된 학생 명단이 없습니다.<br/>명단을 추가해주세요.`
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#ff8737'
          this.confirmModal.isAlert = true
          break;

        case 'studentCount' :
          this.confirmModal.title = `학생 수가 생성된 자리보다 많습니다.<br/>대형을 다시 생성해주세요.`
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#ff8737'
          this.confirmModal.isAlert = true
          break;

        case 'seatAddMax' :
          this.confirmModal.title = `자리배치도는 최대 50개까지 생성가능합니다.`
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#ff8737'
          this.confirmModal.isAlert = true
          break;

        case 'resetAllStudents':
          this.confirmModal.title = `전체 초기화 하시겠습니까?`
          this.confirmModal.description = '현재 교실에서 보이는 포인트만 0으로 되며\n기존 지급내역은 리포트에서 확인 가능합니다.'
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#f04f59'
          break;

        case 'resetSelectedStudents':
          this.confirmModal.title = `${this.checkedStudentCount}명 초기화 하시겠습니까?`
          this.confirmModal.description = '현재 교실에서 보이는 포인트만 0으로 되며\n기존 지급내역은 리포트에서 확인 가능합니다.'
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#f04f59'
          break;

        case 'studentNoneBatch' :
          this.confirmModal.title = `자리배치된 학생이 없습니다.<br/>자리배치를 실행해주세요.`
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.confirmButtonColor = '#ff8737'
          this.confirmModal.isAlert = true
          break;
      }
      this.confirmModal = {...this.confirmModal, isOpen: true}
    },
    closeConfirmModal: async function (isConfirm) {
      if (!isConfirm) {
        switch (this.confirmModal.action) {
          case 'presetEsc' :  // 저장 후 나가기
            this.onPreBatchFinish()
            break;
        }

        this.confirmModal = {
          isOpen: false,
          title: '',
          description: '',
          cancelButtonText: '',
          confirmButtonText: '',
          confirmButtonColor: '',
          action: '',
          isAlert: false
        }
        return
      }

      switch (this.confirmModal.action) {
        case 'deleteItem' :
          await this.deleteDetailItem(this.targetDelete)
          break;

        case 'manualEsc' :
          this.closeSeatPlanMode()
          break;

        case 'preset':
          this.onSeatPlanMode('seating-plan-preset')
          break;

        case 'presetEsc' :
          this.closeSeatPlanMode('presetEsc')
          break;

        case 'studentNone' :
          this.goManageStudents()
          break;

        case 'studentCount' :
          this.reBatchChangeStudent()
          break;

        case 'resetAllStudents' :
          await this.rewardResetAllStudents()
          break;

        case 'resetSelectedStudents' :
          await this.rewardResetStudents()
          break;
      }

      this.confirmModal = {
        isOpen: false,
        title: '',
        description: '',
        cancelButtonText: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        action: '',
        isAlert: false
      }
    },
    /* 포인트지급, 누가기록, 포인트 초기화 */
    studentCheck() {
      const students = this.$refs.seatPlanComponent.getTargetStudents()
      this.checkedStudentCount = students.length
    },
    studentCheckOut() {
      this.$refs.seatPlanComponent.setChecked()
    },
    studentCheckChange() {
      this.$refs.seatPlanComponent.setCheckedChange()
    },
    studentTotalCheck() {
      const isStudentCount = this.seatIsStudentCount()
      if (isStudentCount > 0) {
        this.$refs.seatPlanComponent.setCheckedTotal()
      } else {
        this.openConfirmModal("studentNoneBatch")
      }
    },
    /* 누가기록 */
    openWhoWriteMode() {
      const isStudentCount = this.seatIsStudentCount()
      if (isStudentCount) {
        const students = this.$refs.seatPlanComponent.getTargetStudents()

        if (students.length > 0) {
          this.openWhoWriteModal(students)
        } else {
          this.isWhoWriteMode = true
        }
      } else {
        this.openConfirmModal("studentNoneBatch")
      }
    },
    closeWhoWriteMode: function () {
      this.isWhoWriteMode = false
      this.$refs.seatPlanComponent.setChecked()
    },
    openWhoWriteModal: function (students) {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.isOpenWhoWriteModal = true
      this.totalGivePointStudents = JSON.parse(JSON.stringify(students))
    },
    closeWhoWriteModal: function () {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isOpenWhoWriteModal = false
      this.totalGivePointStudents = []
    },
    whoWriteFinish: function () {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isOpenWhoWriteModal = false
      this.totalGivePointStudents = []
      this.isWhoWriteMode = false
      // this.studentsUnChecked()
      this.$refs.seatPlanComponent.setChecked()
    },
    /* 누가기록 */
    /* 포인트지급 */
    openTotalGivePointMode: async function (data) {
      const isStudentCount = this.seatIsStudentCount()
      if (isStudentCount) {
        this.totalGivePointKind = data
        const students = this.$refs.seatPlanComponent.getTargetStudents()

        if (students.length > 0) {
          const students2 = await this.getStudents()
          const list = students2.filter(v => students.findIndex(v2 => v.studentId === v2.studentId) > -1)
          this.openGiveTotalPointModal(list)
        } else {
          this.isTotalGivePointMode = true
        }
      } else {
        this.openConfirmModal("studentNoneBatch")
      }
    },
    closeTotalGivePointMode: function () {
      this.isTotalGivePointMode = false
      this.$refs.seatPlanComponent.setChecked()
    },
    openGiveTotalPointModal: function (students) {
      this.patchPointGiveFinishModal({
        open: false,
        mode: 'null'
      })
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.isGiveTotalPointModal = true
      this.totalGivePointStudents = JSON.parse(JSON.stringify(students))
    },
    openGiveTotalPointModal2: async function () {
      const list = await this.getStudentUpdateList()

      this.patchPointGiveFinishModal({
        open: false,
        mode: 'null'
      })
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.isGiveTotalPointModal = true
      this.totalGivePointStudents = JSON.parse(JSON.stringify(list))
    },
    closeGiveTotalPointModal: function () {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isGiveTotalPointModal = false
      this.totalGivePointStudents = []
    },
    givePointFinish: async function (mode) {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isGiveTotalPointModal = false
      this.totalGivePointStudents = []
      this.isTotalGivePointMode = false
      this.totalGivePointKind = ""
      this.$refs.seatPlanComponent.setChecked()

      // this.givePointMode = mode
    },
    /* 포인트지급 */
    /* 포인트초기화 */
    openResetMode: function () {
      const isStudentCount = this.seatIsStudentCount()
      if (isStudentCount) {
        this.isResetMode = true
      } else {
        this.openConfirmModal("studentNoneBatch")
      }
    },
    closeResetMode: function () {
      this.isResetMode = false
      this.$refs.seatPlanComponent.setChecked()
    },
    rewardResetAllStudents: async function () {
      // const students = this.$refs.seatPlanComponent.getTargetStudents()
      // const students2 = await this.getStudents()
      // const list = students2.filter(v => students.findIndex(v2 => v.studentId === v2.studentId) > -1)
      const list = await this.getStudentUpdateList()
      const params = {
        classroomId: this.classroomId
      }
      const res = await this.patchRewardResetAllStudents(params)

      if (res.status === 200) {
        const studentPoints = list.map(o => {
          return {
            studentId: o.studentId,
            studentName: o.studentName,
            studentCharacter: o.studentCharacter,
            studentPhoto: o.studentPhoto
          }
        })
        const message = {
          contentType: 'pointReset',
          sender: localStorage.uuid,
          content: JSON.stringify({
            classroomId: this.classroomId,
            isToAll: true,
            studentPoints
          })
        }
        this.sendStompClient(message)
      }
      this.closeResetMode()
    },
    rewardResetStudents: async function () {
      // const students = this.$refs.seatPlanComponent.getTargetStudents()
      // const students2 = await this.getStudents()
      // const list = students2.filter(v => students.findIndex(v2 => v.studentId === v2.studentId) > -1)

      const list = await this.getStudentUpdateList()
      // const selectedStudents = this.students.filter(s => s.checked)
      const params = {
        classroomId: this.classroomId,
        studentIds: list.map(s => s.studentId)
      }
      const res = await this.patchRewardResetStudents(params)

      if (res.status === 200) {
        const studentPoints = list
            .map(o => {
              return {
                studentId: o.studentId,
                studentName: o.studentName,
                studentCharacter: o.studentCharacter,
                studentPhoto: o.studentPhoto
              }
            })
        const message = {
          contentType: 'pointReset',
          sender: localStorage.uuid,
          content: JSON.stringify({
            classroomId: this.classroomId,
            isToAll: false,
            studentPoints
          })
        }
        this.sendStompClient(message)
      }

      this.closeResetMode()
    },
    /* 포인트초기화 */
    initSelectionMode() {
      this.isWhoWriteMode = false
      this.isTotalGivePointMode = false
      this.isResetMode = false
    },
  },
  created() {
  },
  mounted() {
    this.getSeatPlanList()
  }
}
</script>
<style lang="scss" scoped>
.group-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
}
.seating-plan-view {
  .hi-selectbox {
    min-width: 212px;
    width: auto;
    .selected {
      padding-right: 40px;
    }    
    .option__layer {
      ul {
        li {
          .option {
            white-space: nowrap; 
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            display: block;
          }
        }
      }
    }
  }
}
</style>