<!--
@File(Method): RecordEdit.vue
@Date Created: 2025-07-23
@Description: 학급기록 > 인원체크 > 상세
@Modified: #81015 인원체크 상세 확장 기능 추가
-->
<template>
  <div class="record-recording" :class="[{ open: isOpen }, { 'full-open': isFullOpen }]">
    <div class="record-recording__top">
      <div class="record-top-btns">
        <div v-if="!isExternalChecklist" class="close">
          <i class="bh-icon-arrowright-24 cursor-pointer" @click="close"></i>
          <span>닫기</span>
        </div>
        <div v-if="!isFullOpen" class="close">
          <i class="bh-icon-maximize cursor-pointer" @click="openFull"></i>
          <span>전체 화면 보기</span>
        </div>
        <div v-if="!isOpen" class="close">
          <i class="bh-icon-minimize cursor-pointer" @click="open"></i>
          <span>전체 화면 축소</span>
        </div>
      </div>
      <div v-if="!isExternalChecklist" class="download-warp">
        <span class="unlink" @click="confirmAllTokenDelete"> <HiIcon name="ico-unlink" color="gray" size="24" /><em>새 창 URL 만료</em> </span>
        <span class="qr" @click="openGenerateQRPopup"> <HiIcon name="ico-qr-code" color="gray" size="24" /><em>새 창 QR</em> </span>
        <span class="download" @click="onExportChecklist('excel')"> <HiIcon name="ico-file-down" color="gray" size="24" /><em>다운로드</em> </span>
        <span class="print" @click="onExportChecklist('print')"> <HiIcon name="ico-printer" color="gray" size="24" /><em>인쇄</em> </span>

        <!-- QR 생성 -->
        <div v-if="!isExternalChecklist && isGenerateQRPopupOpen" class="qr-popup-wrap" v-click-outside="closeGenerateQRPopup">
          <div class="qr-popup-title">
            <h2>인원체크 새 창 보기</h2>
            <div class="sub">태블릿 또는 스마트 기기로 QR을 스캔해주세요.</div>
          </div>
          <div class="qr-popup-content">
            <div class="qr-popup-view">
              <div class="qr-wrap">
                <img v-if="!isExpired && qrDataUrl !== ''" class="qr-popup-img" :src="qrDataUrl" alt="QR 코드 이미지" />
                <div v-else class="qr-refresh" @click="generateQrCode">
                  <HiIcon name="ico-refresh" color="black" size="24" />
                  <span>재발급</span>
                </div>
              </div>

              <div class="expire-time">
                <template v-if="expireTime > 0">
                  남은 시간<span class="timer">{{ timerStr }}</span>
                </template>
                <template v-else>인증 시간이 만료되었습니다.</template>
              </div>
            </div>
            <div>
              <button class="url-copy-btn" @click="copyUrl" :disabled="expireTime === 0">URL 복사</button>
            </div>
          </div>
          <div class="qr-popup-close-btn" @click="closeGenerateQRPopup"></div>
        </div>
      </div>
    </div>

    <div class="record-recording__content inwon">
      <div
        class="record-recording__content__inwon"
        :class="{
          check: writeItem.checklistType === 'CHECK',
          point: ['SCORE', 'LEVEL_COMMENT'].includes(writeItem.checklistType),
        }"
      >
        <div class="top">
          <div class="check" :key="`top-check-${writeItem.checklistId}-${getInwonCheckComplete}-${getInwonCheckProgress}`">
            <template v-if="!getInwonCheckComplete && !getInwonCheckProgress">
              <input type="checkbox" id="inwon-check-total" v-model="writeItem.isCompleted" @change="changeIsCompleted" />
              <label for="inwon-check-total"></label>
            </template>
            <template v-else-if="getInwonCheckComplete">
              <lottie :options="completeLottie" :style="{ width: '48px', height: '48px' }" />
            </template>
            <template v-else-if="getInwonCheckProgress">
              <lottie :options="progressLottie" :style="{ width: '48px', height: '48px' }" />
            </template>

            <em>{{ writeItem.isCompleted ? '진행으로 변경' : '체크 완료' }}</em>
          </div>

          <div class="content">
            <div class="title">
              <textarea
                v-model="writeItem.checklistTitle"
                ref="checkListTitle"
                maxlength="50"
                @keydown="itemCheckListTitle($event)"
                @input="inputTitleStyle($event)"
                :readonly="isExternalChecklist"
              ></textarea>
            </div>
            <div class="etc">
              <i class="input-btn-calendar bh-icon-calendar-24 cursor-pointer" @click="openCalendar"></i>
              <span class="date" @click="openCalendar">{{ $moment(writeItem.checklistDate).format('YY.MM.DD (ddd)') }}</span>
              <calendar-monthly
                v-if="isCalendarOpen"
                :timestamp="calendarDateTimestamp"
                :value-goe="null"
                :isBoardUse="true"
                :calendarType="'type03'"
                v-click-outside="closeCalendar"
                @selectedDate="setCalendarDateTimestamp"
                @close="updateCalendarDate"
              />
            </div>
          </div>
        </div>

        <!-- 버튼 영역 -->
        <div class="list-wrap">
          <div v-if="!isExternalChecklist" class="btn-wrap">
            <div class="left">
              <button v-if="!rewardTargetSet" class="give-point" @click="onClickRewardButton" :class="{ on: rewardTargetList }">
                <i class="bh-reward-32"></i>포인트 지급
              </button>
              <template v-if="rewardTargetSet">
                <button class="give-point-effort" @click="giveRewardPoint('effort')"><i class="bh-reward-32"></i> 노력</button>
                <button class="give-point-good" @click="giveRewardPoint('good')"><i class="bh-reward-32"></i> 좋음</button>
                <button class="give-point-esc" @click="initRewardTargetSet"><i class="bh-icon-close-32"></i> 취소</button>
              </template>

              <!-- 포인트 지급 -->
              <personnel-point
                v-if="rewardTargetList"
                :items="writeItem.items"
                :students="writeItem.students"
                @openRewardModal="openRewardModal"
                @closeRewardTargetList="closeRewardTargetList"
              />
            </div>

            <div class="right" v-if="!rewardTargetSet">
              <button v-if="writeItem.checklistType !== 'MEMO'" class="btn-modify" :class="{ on: isItemsEditOpen }" @click="openChecklistItems">
                <HiIcon name="ico-pen3" color="default" size="18"></HiIcon>항목 수정
              </button>
              <button class="btn-user" :class="{ on: isStudentEditOpen }" @click="openStudentEdit">
                <HiIcon name="ico-user3" color="default" size="18"></HiIcon>학생 추가
              </button>
              <button @click="confirmResetChecklist"><HiIcon name="ico-refresh2" color="default" size="18"></HiIcon>전체 초기화</button>
              <button @click="confirmDeleteChecklist"><HiIcon name="ico-delete" color="default" size="18"></HiIcon>삭제</button>

              <!-- 항목 수정 -->
              <CheckItemsEdit
                v-if="isItemsEditOpen && ['CHECK', 'SCORE', 'LEVEL_COMMENT'].includes(writeItem.checklistType)"
                :itemCheckListItems="itemCheckListItems"
                :checklistType="writeItem.checklistType"
                :checklistId="writeItem.checklistId"
                @deleteCheckListItems="deleteCheckListItems"
                @closeChecklistItems="closeChecklistItems"
                @updateCheckListItems="updateCheckListItems"
                v-click-outside="closeChecklistItems"
              />

              <!-- 학생 추가 -->
              <ExcludeStudentsEdit
                v-if="isStudentEditOpen"
                :checklistId="writeItem.checklistId"
                @closeStudentEdit="closeStudentEdit"
                @setStudents="setStudents"
                @openConfirmModal="openConfirmModal"
                v-click-outside="closeStudentEdit"
              />
            </div>
          </div>

          <!-- 체크판 -->
          <Checklist
            v-if="Object.keys(writeItem).length > 0"
            ref="checklist"
            :writeItem="writeItem"
            :rewardTargetSet="rewardTargetSet"
            :isSearch="isSearch"
            :searchKind="searchKind"
            :bannedWords="bannedWords"
            @reloadChecklist="reloadChecklist"
            @setCheckedStudents="setCheckedStudents"
            @updateList="updateList"
            @initTitleStyle="initTitleStyle"
            @handleError="handleError"
          />
        </div>

        <FinishToast
          className="progress-change"
          :message="toastMessage"
          @undo="checkProgressEsc"
          @finish-toast-ready="(el) => (processToastDom = el)"
        />

        <FinishToast className="finish-toast" :message="toastMessage" @finish-toast-ready="(el) => (rightFinishToastDom = el)" />
      </div>
    </div>

    <!-- 포인트 지급 모달 -->
    <give-total-point
      v-if="rewardModal.isOpen"
      :mode="rewardModal.rewardType"
      :studentList="rewardModal.studentList"
      :memo="rewardMemo"
      :checklistId="writeItem.checklistId"
      @close="closeRewardModal"
      @closeSubmit="rewardFinish"
    />

    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      :isAlert="confirmModal.isAlert"
      @closeConfirmDialog="closeConfirmModal"
    />

    <personnel-inwon-print v-if="isPrintMode" :printItem="copyItem" @downloadPrintInwonClose="onExportDone('print')" />

    <personnel-inwon-excel v-if="isExcelMode" :excelItem="copyItem" @downloadExcelInwonClose="onExportDone('excel')" />
  </div>
</template>

<script>
import * as completeLottie from '@/assets/img/icon/bh_inwon_check_complete_detail.json';
import * as progressLottie from '@/assets/img/icon/bh_inwon_check_progress_detail.json';
import QRCode from 'qrcode';
import { debounce } from 'lodash';
import { mapActions, mapState } from 'vuex';

import Lottie from '@/components/Lottie/Lottie';
import CalendarMonthly from '@/components/Calendar/CalendarMonthly.vue';
import CheckItemsEdit from '@/apps/behavior/pages/personnel/components/CheckItemsEdit.vue';
import ExcludeStudentsEdit from '@/apps/behavior/pages/personnel/components/ExcludeStudentsEdit.vue';
import PersonnelPoint from '@/apps/behavior/pages/personnel/PersonnelPoint.vue';
import GiveTotalPoint from '@/apps/behavior/components/popup/GiveTotalPointModal.vue';
import Checklist from '@/apps/behavior/pages/personnel/components/Checklist.vue';
import FinishToast from '@/apps/behavior/pages/personnel/components/FinishToast.vue';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import PersonnelInwonExcel from '@/apps/behavior/components/excel/PersonnelInwonExcel.vue';
import PersonnelInwonPrint from '@/apps/behavior/components/pdf/PersonnelInwonPrint.vue';

import { handleTokenExpired } from '@/apps/behavior/pages/personnel/personnel';
import { useChecklistController } from '@/apps/behavior/modules/personnel';
const checklistController = useChecklistController();

export default {
  name: 'RecordEdit',
  components: {
    PersonnelInwonPrint,
    PersonnelInwonExcel,
    ConfirmModal,
    GiveTotalPoint,
    FinishToast,
    Checklist,
    PersonnelPoint,
    ExcludeStudentsEdit,
    CheckItemsEdit,
    CalendarMonthly,
    Lottie,
  },
  data() {
    return {
      isOpen: false,
      isFullOpen: false,

      // 현재 편집중인 체크판
      writeItem: {},

      // 엑셀 다운로드/인쇄
      copyItem: {},
      isExcelMode: false,
      isPrintMode: false,

      // QR 생성
      isGenerateQRPopupOpen: false,
      isExpired: false,
      expireTime: 180,
      timer: null,
      qrDataUrl: '',
      checklistUrl: '',

      // 상태 Lottie
      completeLottie: { animationData: completeLottie },
      progressLottie: { animationData: progressLottie },

      // 캘린더
      isCalendarOpen: false,
      calendarDateTimestamp: null,

      // 포인트 지급
      rewardTargetSet: false,
      rewardTargetList: false,
      rewardModal: {
        isOpen: false,
        mode: 'good',
        studentList: [],
      },

      // 항목 수정
      isItemsEditOpen: false,
      itemCheckListItems: [],

      // 학생 수정
      isStudentEditOpen: false,

      // 컨펌 모달
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        action: '',
        target: null,
        isAlert: false,
      },

      // 체크판 > 포인트 지급 > 체크된 학생
      checkedStudents: {},

      // 토스트 메시지
      toastMessage: {
        text: '',
        kind: '',
      },
      processToastDom: null,
      rightFinishToastDom: null,
    };
  },
  props: {
    // 목록 검색
    isSearch: {
      type: Boolean,
      required: true,
    },
    searchKind: {
      type: String,
      required: true,
    },
    inwonCheckCompleteList: {
      type: Array,
      default: () => [],
    },
    inwonCheckProgressList: {
      type: Array,
      default: () => [],
    },
    bannedWords: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeBehavior', ['isExternalChecklist', 'updateSubscribeList']),
    currentChecklistId() {
      return checklistController.model.checklistId;
    },
    getInwonCheckComplete() {
      return this.inwonCheckCompleteList.findIndex((v) => v === this.writeItem.checklistId) > -1;
    },
    getInwonCheckProgress() {
      return this.inwonCheckProgressList.findIndex((v) => v === this.writeItem.checklistId) > -1;
    },
    rewardMemo() {
      const title = this.writeItem.checklistTitle.length > 20 ? `${this.writeItem.checklistTitle.substring(0, 20)}..` : this.writeItem.checklistTitle;
      return `[${title}] 에서 지급`;
    },
    timerStr() {
      const minutes = Math.floor(this.expireTime / 60);
      let seconds = this.expireTime % 60;
      seconds = seconds === 0 ? '00' : seconds < 10 ? `0${seconds}` : seconds;
      return `0${minutes}:${seconds}`;
    },
    userId() {
      return this.user.currentId || null;
    },
  },
  async mounted() {
    this.isOpen = await this.init();
    if (this.isiPad()) {
      document.body.classList.add('ios');
    }
  },
  methods: {
    ...mapActions('storeBehavior', ['sendStompClient']),
    // init
    async init() {
      await this.reloadChecklist();
      if (!this.writeItem.checklistId) {
        return false;
      }
      this.initCalendarDateTimestamp();
      this.initTitleStyle();
      this.initVariables();
      return true;
    },
    async reloadChecklist() {
      try {
        const res = this.isExternalChecklist
          ? await checklistController.reloadChecklistTemporary()
          : await checklistController.reloadChecklist({ userId: this.userId, isIncludeStudents: true });
        let visibleStudentIds = [];
        if (this.writeItem.students) {
          visibleStudentIds = this.writeItem.students.filter((s) => s.isVisible).map((s) => s.studentId);
        }
        this.writeItem = res ? res.data : {};
        this.writeItem.students =
          visibleStudentIds.length > 0
            ? this.writeItem.students.map((s) => ({ ...s, isVisible: visibleStudentIds.includes(s.studentId) }))
            : this.writeItem.students.map((s) => ({ ...s, isVisible: true }));
      } catch (err) {
        if (err?.response?.status === 404) {
          this.$hiClass.alert('삭제된 체크판입니다.').then(() => {
            if (this.isExternalChecklist) {
              this.$router.push('/');
            } else {
              this.close();
              this.updateList();
            }
          });
          return;
        }
        this.handleError(err);
      }
    },
    initCalendarDateTimestamp() {
      const date = this.writeItem.checklistDate.split('-');
      const dateTime = `${date[0]}/${date[1]}/${date[2]}`;
      this.calendarDateTimestamp = this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf();
    },
    initTitleStyle() {
      this.$refs.checkListTitle.style.height = '33px';
      this.$refs.checkListTitle.style.height = `${this.$refs.checkListTitle.scrollHeight}px`;
    },
    initVariables() {
      this.rewardTargetSet = false;
      this.rewardTargetList = false;
    },

    // 체크판 닫기
    close() {
      this.isOpen = false;
      this.isFullOpen = false;
      this.$emit('closeContentLayer');
    },
    open() {
      this.isFullOpen = false;
      this.isOpen = true;
    },
    openFull() {
      this.isOpen = false;
      this.isFullOpen = true;
    },

    // 컨펌 모달 제어
    openConfirmModal(option) {
      for (const [key, value] of Object.entries(option)) {
        this.confirmModal[key] = value;
      }
      this.confirmModal.isOpen = true;
    },
    closeConfirmModal(isConfirm) {
      if (isConfirm) {
        const fn = {
          deleteChecklist: () => this.deleteChecklist(),
          resetChecklist: () => this.resetChecklist(),
          deleteAllToken: () => this.deleteAllToken(),
        };
        const actionFn = fn[this.confirmModal.action];
        if (actionFn) actionFn();
      }
      this.confirmModal.isOpen = false;
    },

    // 토스트
    toggleFinishToast(text, kind, dom, fn) {
      // FinishToast 공통 toggle 함수
      this.toastMessage.text = text;
      this.toastMessage.kind = kind;
      dom.style.display = 'none';
      dom.style.display = 'flex';

      if (fn && typeof fn === 'function') {
        // 우선 함수 있을 경우만 호출
        setTimeout(async () => {
          fn();
          dom.style.display = 'none';
        }, 1300);
      }
    },

    // 생성된 토큰 모두 삭제
    confirmAllTokenDelete() {
      this.openConfirmModal({
        title: 'QR로 발급된 URL을 만료 처리 하시겠습니까?',
        description: '',
        confirmButtonText: '확인',
        confirmButtonColor: '#F04F59',
        action: 'deleteAllToken',
        isAlert: false,
        target: null,
      });
    },
    async deleteAllToken() {
      try {
        await checklistController.deleteChecklistToken();
        const sendContent = {
          contentType: 'checklist',
          content: JSON.stringify({
            checklistId: this.writeItem.checklistId,
            eventType: 'deleteChecklistToken',
          }),
        };
        await this.sendStompClient(sendContent);
      } catch (err) {
        this.$log.debug('classroom checklist deleteAllToken error => ', err);
      }
    },

    // QR 생성
    async openGenerateQRPopup() {
      if (this.isGenerateQRPopupOpen) return;
      await this.generateQrCode();
      this.isGenerateQRPopupOpen = true;
    },
    closeGenerateQRPopup() {
      this.initQrDataUrl();
      this.initChecklistUrl();
      this.initTimer();
      this.isGenerateQRPopupOpen = false;
    },
    initQrDataUrl() {
      this.qrDataUrl = '';
    },
    initChecklistUrl() {
      this.checklistUrl = '';
    },
    initTimer() {
      this.isExpired = false;
      this.expireTime = 180;
      clearInterval(this.timer);
    },
    async generateQrCode() {
      this.initQrDataUrl();
      this.initChecklistUrl();
      this.initTimer();
      const {
        data: { tokenId },
      } = await checklistController.createChecklistToken({ userId: this.userId });
      if (tokenId) {
        const component = this;
        this.checklistUrl = `${process.env.VUE_APP_BASE_UI_URI}/checklist/${tokenId}`;
        QRCode.toDataURL(component.checklistUrl, { width: 400, margin: 1 }, function (err, url) {
          component.qrDataUrl = url;
          component.timer = setInterval(() => {
            component.expireTime = component.expireTime - 1;
            if (component.expireTime <= 0) {
              component.isExpired = true;
              clearInterval(component.timer);
            }
          }, 1000);
        });
      }
    },
    copyUrl() {
      window.navigator.clipboard.writeText(this.checklistUrl).then(() => {
        this.toggleFinishToast('링크가 복사되었습니다.', 'confirmToast', this.processToastDom);
        setTimeout(async () => {
          this.processToastDom.style.display = 'none';
        }, 1300);
      });
    },

    // 다운로드/인쇄
    onExportChecklist(mode) {
      this.copyItem = JSON.parse(JSON.stringify(this.writeItem));
      mode === 'excel' ? (this.isExcelMode = true) : (this.isPrintMode = true);
      this.$hiClass.toggleBodyClass('add', 'hidden');
    },
    onExportDone(mode) {
      mode === 'excel' ? (this.isExcelMode = false) : (this.isPrintMode = false);
      this.$hiClass.toggleBodyClass('remove', 'hidden');
    },

    // 체크판 상태 변경
    changeIsCompleted() {
      if (!this.isExternalChecklist) {
        this.writeItem.isCompleted
          ? this.$emit('appendCompleteList', this.writeItem.checklistId)
          : this.$emit('appendProgressList', this.writeItem.checklistId);
      }

      const copyItem = { ...this.writeItem };
      const msg = this.writeItem.isCompleted ? '할 일을 완료했습니다.' : '진행중으로 변경했습니다.';
      this.$emit('setIsComplete', this.writeItem);

      this.toggleFinishToast(msg, 'checkFinish', this.processToastDom);
      setTimeout(async () => {
        if (this.writeItem.isCompleted === copyItem.isCompleted) {
          if (this.isExternalChecklist) {
            const status = this.writeItem.isCompleted ? 'complete' : 'in-progress';
            try {
              await checklistController.updateChecklistStatus(this.isExternalChecklist, status, { userId: this.userId });
            } catch (err) {
              this.handleError(err);
            }
          } else {
            this.$emit('checkFinish', this.writeItem, 'detail');
          }

          this.processToastDom.style.display = 'none';
        }
      }, 1300);
    },
    checkProgressEsc() {
      if (this.writeItem.isCompleted) {
        this.writeItem.isCompleted = false;
        this.$emit('filterCompleteList', this.writeItem.checklistId);
        this.$emit('appendProgressList', this.writeItem.checklistId);

        this.toggleFinishToast('진행중으로 변경했습니다.', '', this.rightFinishToastDom, () => {
          this.$emit('filterProgressList', this.writeItem.checklistId);
        });
      } else {
        this.writeItem.isCompleted = true;
        this.$emit('filterProgressList', this.writeItem.checklistId);
        this.$emit('appendCompleteList', this.writeItem.checklistId);

        this.toggleFinishToast('할 일을 완료했습니다.', '', this.rightFinishToastDom, () => {
          this.$emit('filterCompleteList', this.writeItem.checklistId);
        });
      }
      this.$emit('setIsComplete', this.writeItem);
    },
    setIsCompleted(isCompleted) {
      this.writeItem.isCompleted = isCompleted;
    },

    // 체크판 제목
    inputTitleStyle(e) {
      e.target.value = e.target.value.substring(0, 50);
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      this.$refs.checkListTitle.style.height = '33px';
      this.$refs.checkListTitle.style.height = `${this.$refs.checkListTitle.scrollHeight}px`;
    },
    itemCheckListTitle: debounce(async function (e) {
      this.writeItem.checklistTitle = e.target.value.substring(0, 50);
      try {
        await checklistController.updateChecklistTitle({
          userId: this.userId,
          checklistTitle: this.writeItem.checklistTitle,
        });

        this.$emit('updateChecklistTitle', this.writeItem);
      } catch (err) {
        this.$log.debug('classroom checklist memo PATCH() error => ', err);
      }
    }, 200),

    // 캘린더
    openCalendar() {
      if (this.isExternalChecklist) return;
      this.isCalendarOpen = true;
    },
    closeCalendar() {
      this.isCalendarOpen = false;
    },
    setCalendarDateTimestamp(dateTimeJson) {
      this.calendarDateTimestamp = this.$moment(dateTimeJson).valueOf();
      this.writeItem.checklistDate = this.$moment(dateTimeJson).format('YYYY-MM-DD');
    },
    async updateCalendarDate() {
      try {
        await checklistController.updateChecklistDate({
          userId: this.userId,
          checklistDate: this.writeItem.checklistDate,
        });
        this.isCalendarOpen = false;
        this.updateList();
      } catch (err) {
        this.$log.debug(' classroom checklist date PATCH() error => ', err);
      }
    },

    // 포인트 지급
    async onClickRewardButton() {
      // 체크, 점수판
      if (['CHECK', 'SCORE'].includes(this.writeItem.checklistType)) {
        if (!this.rewardTargetList) {
          // #74064 포인트 지급 버튼 선택 시 체크판 갱신 되지 않음
          await this.reloadChecklist();
        }
        this.rewardTargetList = !this.rewardTargetList;
      } else {
        // 메모, 평가판
        this.rewardTargetSet = true;
      }
    },
    giveRewardPoint(rewardType) {
      if (Object.keys(this.checkedStudents).length === 0) {
        // 체크한 학생이 없을 경우 팝업
        this.openConfirmModal({
          title: '포인트를 지급할 학생을 선택해주세요.',
          description: '',
          confirmButtonText: '확인',
          confirmButtonColor: '',
          action: '',
          isAlert: true,
          target: null,
        });
      } else {
        // 있으면 openRewardModal 호출
        this.openRewardModal({ studentList: [Object.values(this.checkedStudents)], rewardType });
      }
    },
    initRewardTargetSet() {
      this.rewardTargetSet = false;
      this.checkedStudents = {};
    },
    openRewardModal({ studentList, rewardType }) {
      this.rewardModal.studentList = studentList;
      this.rewardModal.rewardType = rewardType;
      this.rewardModal.isOpen = true;
    },
    closeRewardModal() {
      this.rewardModal.studentList = [];
      this.rewardModal.isOpen = false;
    },
    async rewardFinish() {
      this.closeRewardTargetList();
      await this.reloadChecklist();
      this.closeRewardModal();
      // #74548 포인트 지급 완료 시 체크박스 초기화 (그냥 창 닫았을 경우는 유지)
      this.isMemoOrLevel() && this.initRewardTargetSet();
    },
    closeRewardTargetList() {
      this.rewardTargetList = false;
    },
    isMemoOrLevel() {
      return ['MEMO', 'LEVEL_COMMENT'].includes(this.writeItem.checklistType);
    },

    // 항목 수정
    openChecklistItems() {
      this.isStudentEditOpen = false;
      this.isItemsEditOpen = !this.isItemsEditOpen;

      if (this.isItemsEditOpen) {
        this.itemCheckListItems = JSON.parse(JSON.stringify(this.writeItem.items));
        if (['SCORE', 'LEVEL_COMMENT'].includes(this.writeItem.checklistType)) {
          this.itemCheckListItems = this.itemCheckListItems.map((item) => {
            return { ...item, originalItemLabel: item.itemLabel };
          });
        }
      }
    },
    closeChecklistItems() {
      this.isItemsEditOpen = false;
    },
    deleteCheckListItems(item) {
      this.itemCheckListItems = this.itemCheckListItems.filter((v) => v !== item);
    },
    updateCheckListItems(res) {
      this.writeItem.items = res.data.items;
      this.writeItem.students = res.data.students.map((s) => ({ ...s, isVisible: true }));
      this.$refs.checklist.resetFilter();
      this.isItemsEditOpen = false;

      if (this.isSearch && this.searchKind === 'user') {
        this.updateList();
      }
    },

    // 학생 수정
    openStudentEdit() {
      this.isItemsEditOpen = false;
      this.isStudentEditOpen = true;
    },
    closeStudentEdit() {
      this.isStudentEditOpen = false;
    },
    setStudents(students) {
      this.writeItem.students = students.map((s) => ({ ...s, isVisible: true }));
      this.$refs.checklist.resetFilter();
      this.isStudentEditOpen = false;

      this.$nextTick(() => {
        this.$refs.checklist.initMemoStyle();
        this.initTitleStyle();
      });
    },
    deleteStudent(studentId) {
      this.writeItem.students = this.writeItem.students.filter((student) => student.studentId !== studentId);
    },

    // 전체 초기화
    confirmResetChecklist() {
      this.openConfirmModal({
        title: '체크한 내용을 전체 초기화(삭제) 하시겠습니까?',
        description: '삭제된 내용은 복원되지 않습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#F04F59',
        action: 'resetChecklist',
        isAlert: false,
        target: null,
      });
    },
    async resetChecklist() {
      try {
        const res = await checklistController.resetChecklist({ userId: this.userId });
        if (res) {
          const sendContent = {
            contentType: 'checklist',
            content: JSON.stringify({
              checklistId: this.writeItem.checklistId,
              eventType: 'resetChecklist',
            }),
          };
          await this.sendStompClient(sendContent);
        }
      } catch (err) {
        this.$log.debug(' classroom checklist reset all PATCH() error => ', err);
      }
    },

    // 체크판 삭제
    confirmDeleteChecklist() {
      this.openConfirmModal({
        title: '작성중인 내용이 있습니다.<br/>그래도 삭제하시겠습니까?',
        description: '',
        confirmButtonText: '삭제',
        confirmButtonColor: '#F04F59',
        action: 'deleteChecklist',
        isAlert: false,
        target: null,
      });
    },
    async deleteChecklist() {
      await checklistController.deleteChecklist({ userId: this.userId });
      this.updateList();
      this.close();
    },

    // 체크판
    setCheckedStudents(checkedStudents) {
      this.checkedStudents = checkedStudents;
    },

    // 목록 갱신
    updateList() {
      this.$emit('updateList', 0);
    },

    // 에러 처리
    handleError(err, requestObj = {}) {
      if (this.isExternalChecklist && err?.response?.status === 401) {
        handleTokenExpired();
        return;
      }

      const errCode = err?.response?.data?.error || '';
      const errorObj =
        {
          deleteStudent: ['alert', '삭제된 학생입니다.'],
          deleteChecklist: ['alert', '삭제된 체크판입니다.'],
          451: ['', '금칙어'],
        }[errCode] || [];
      if (errorObj.length === 0) return;

      if (errorObj[0] === 'alert') {
        this.$hiClass.alert(errorObj[1]).then(() => {
          if (errCode === 'deleteStudent') {
            const studentId = err.response.data.message?.split(':')[1].trim() || '';
            studentId === '' ? this.reloadChecklist() : this.deleteStudent(studentId);
          } else if (errCode === 'deleteChecklist') {
            if (this.isExternalChecklist) {
              this.$router.push('/');
            } else {
              this.close();
              this.updateList();
            }
          }
        });
      } else {
        console.log(err, requestObj);
        if (errCode === '451') {
          // 메모, 평가판
          if (['writeMemo', 'updateLevelComment'].includes(requestObj.eventName)) {
            const memoInput = document.querySelector(requestObj.elId);
            if (!memoInput.classList.contains('banned')) {
              this.$toasted.show('작성하신 문장 내에 사용 금지 단어가 포함되어 있습니다.');
              memoInput.classList.add('banned');
            }
          }
        }
      }
    },
    // iPad를 감지
    isiPad() {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
    },
  },
  watch: {
    currentChecklistId() {
      this.init();
    },
    updateSubscribeList(newVal) {
      if (newVal.contentType === 'checklist') {
        if (newVal.content.checklistId !== this.writeItem.checklistId) return;

        const eventObj = {
          resetChecklist: async () => {
            await this.reloadChecklist();
            this.$refs.checklist.resetFilter();
            this.writeItem.students = this.writeItem.students.map((s) => ({ ...s, isVisible: true }));
            const bannedEl = document.querySelectorAll(`.record-recording__content__inwon .list-wrap .banned`);
            bannedEl.forEach((el) => el.classList.remove('banned'));
          },
        };

        eventObj[newVal.content.eventType]?.();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.qr-popup-wrap {
  position: absolute;
  background: #ffffff;
  top: 60px;
  right: 114px;
  width: 82%;
  max-width: 810px;
  padding: 36px;
  min-height: 770px;
  height: auto;
  border: 1px solid #d6d6d6;
  border-radius: 10px;
  -webkit-box-shadow: 0px 5px 10px 0px #0000001f;
  box-shadow: 0px 5px 10px 0px #0000001f;
  z-index: 2;
  overflow: auto;

  .qr-popup-title {
    h2 {
      margin-bottom: 10px;
      font-size: 22px;
      font-weight: bold;
      text-align: center;
    }

    .sub {
      font-size: 18px;
      font-weight: 400;
      line-height: 24px;
      color: #616161;
      margin-bottom: 24px;
      text-align: center;
    }
  }

  .qr-popup-content {
    text-align: center;

    .qr-popup-view {
      margin-bottom: 24px;

      .qr-wrap {
        max-width: 76%;
        height: auto;
        background-color: #f5f6f7;
        margin: 0 auto;

        img {
          width: 100%;
        }

        .qr-refresh {
          cursor: pointer;
          height: 100%;
          border: 1px solid #d6d6d6;
          aspect-ratio: 1;
          align-content: center;

          span {
            width: 100%;
            height: 20px;
          }
        }
      }

      .expire-time {
        margin-top: 20px;
        font-size: 18px;

        span.timer {
          color: #f95f6e;
          display: inline;
          margin-left: 6px;
        }
      }
    }

    .url-copy-btn {
      width: auto;
      min-width: 78px;
      height: 40px;
      border-radius: 32px;
      border: 1px solid #e0e0e0;
      margin-right: 8px;
      font-size: 16px;
      font-weight: 400;
      color: #616161;
      padding: 0 16px;

      &:disabled {
        color: #e0e0e0;
        cursor: default;
      }
    }
  }

  .qr-popup-close-btn {
    position: absolute;
    width: 24px;
    height: 24px;
    top: 16px;
    right: 16px;
    background: url('~@/assets/img/icon/icon_modal_close.svg') no-repeat;
    cursor: pointer;
  }
}

@media screen and (max-width: 1180px) {
  .qr-popup-wrap {
    right: 0;
    left: 22px;
  }
}

@media screen and (max-width: 1024px) {
  .qr-popup-wrap {
    height: auto;
    min-height: auto;
    min-width: 420px;
  }
}
@media screen and (max-width: 1400px) and (max-height: 900px) and (orientation: landscape) {
  .qr-popup-wrap {
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    height: auto;
    min-height: auto;
  }
}

.ios {
  .qr-popup-wrap {
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    height: auto;
    min-height: auto;
  }
}
</style>

<style scoped>
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button {
  padding: 0 12px;
  height: 32px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  background: #f6f6f6;
  color: #616161;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point {
  background: #3aafff;
  color: #fff;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point.on {
  background: #fff;
  color: #3aafff;
  border: 1px solid #3aafff;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point.on
  i {
  background: url('~@/assets/img/icon/ic_reward_fill_52.svg');
  background-size: 20px 20px;
  width: 20px;
  height: 20px;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-good {
  background: #3987f8;
  margin-left: 8px;
  color: #fff;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-good:hover {
  background: #3379de;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-effort {
  background: #f95f6e;
  color: #fff;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-effort:hover {
  background: #e55865;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-esc {
  border-radius: 4px;
  background: #fff;
  border: 1px solid #d6d6d6;
  font-size: 13px;
  font-weight: 500;
  color: #616161;
  text-align: center;
  margin-left: 8px;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-good,
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-effort,
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-esc {
  min-height: 32px;
  min-width: 96px;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button
  i {
  width: 20px;
  height: 20px;
  background-size: 20px;
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .record.inwon
  .record-recording
  .record-recording__content
  .record-recording__content__inwon
  .list-wrap
  .btn-wrap
  button.give-point-esc
  i {
  width: 18px;
  height: 18px;
  background-size: 18px;
  opacity: 0.6;
}
</style>
