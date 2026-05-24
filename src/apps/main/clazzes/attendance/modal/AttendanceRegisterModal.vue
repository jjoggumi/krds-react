<!--
@File(Method): AttendanceRegisterModal.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 출결 알리기 > 출결 등록 모달
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한) - 출결구분 위치 이동 / 누적 사용일수 추가 / 가정 체험학습 구분 / 가정 체험학습 안내 문구 추가 
-->
<template>
    <div>
        <!-- 출결 모달 -->
        <HiModal class="normal-modal"  type="type01" size="sm" id="registerStudent" @close="closeAttendanceRegisterModal">
            <template v-slot:heading>{{ isConfirmMode ? `출결 ${hasMultiIds ? '일괄 ' : '' }확인하기` : '출결 알리기'}}</template>
            <template v-slot:content>
                <div class="attendance-popup-wrap">
                    <div v-if="isTeacher && id && !isConfirmMode" class="highlight-box">
                        <div class="text">
                            <div class="warning-icon" >
                            </div>
                            선생님은 제출된 내용을 모두 수정하실 수 있습니다.<br>내용 변경 시, 제출자에게도 반영됩니다.
                        </div>
                    </div>
                    <div v-if="!hasMultiIds && (!id || (id && !isTeacher)) && isVisibleGuideArea('INFO')" class="gray-box mt-10" v-autolinker:[options]="guideText('INFO')">
                    </div>
                    <div class="profile-detail mt-10">
                        <ul>
                            <li v-if="!isConfirmMode">
                                <div class="label">{{isTeacher ? '학생명' : '자녀 이름'}}</div>
                                <div class="input-wrap">
                                    <input
                                        :disabled="isDisabledEdit"
                                        type="text"
                                        @input="changeStudentName"
                                        @blur="autoInputFocusChange(false)"
                                        @focus="autoInputFocusChange(true)"
                                        maxlength="20"
                                        :class="{err: validation.studentName.error, disabled: isDisabledEdit}"
                                        v-model="attendance.studentName"
                                        :placeholder="isTeacher ? '학생 이름을 입력해주세요.' : '자녀의 본명'"
                                    >
                                    <div class="auto-box" v-if="isTeacher && isFocus">
                                        <div
                                            class="item"
                                            v-for="(student,index) of filterClazzStudents"
                                            :key="index"
                                            @mousedown="onClickAutoItem(student)"
                                        >
                                            <span>
                                              <button class="item-ban">{{ student.studentNo }}</button>
                                              <span class="txt-ellipsis-multi">{{ student.studentName }}</span>
                                            </span>
                                            <span v-if="student.tagId" class="tag">{{ student.tagName }}</span>
                                        </div>
                                        <div class="no-item" v-if="filterClazzStudents.length === 0"><span>{{ clazzStudents.length === 0 ? '학생 목록이 없습니다.' : '일치하는 학생이 없습니다.' }}</span></div>
                                    </div>
                                    <span v-if="validation.studentName.error" class="err-text" v-html="validation.studentName.reason"></span>
                                </div>
                            </li>
                            <li v-if="isVisibleNo && !isConfirmMode && !isTeacher">
                                <div class="label">반 번호</div>
                                <div class="input-wrap">
                                    <input
                                        type="text"
                                        @input="changeStudentNo"
                                        @blur="validStudentNo"
                                        :disabled="isDisabledEdit"
                                        :class="{err: validation.studentNo.error, disabled: isDisabledEdit}"
                                        v-model="attendance.studentNo"
                                        placeholder="숫자만 입력"
                                    >
                                    <span v-if="validation.studentNo.error" class="err-text" v-html="validation.studentNo.reason"></span>
                                </div>
                            </li>
                            <li v-if="isVisibleTagName && !isConfirmMode && !isTeacher">
                                <div class="label">학반</div>
                                <div class="input-wrap">
                                    <HiSelectBox class="opt-default"
                                        :value="selectedTagId"
                                        @update:value="selectTag($event)"
                                        :items="filteredTags"
                                        empty-title="학반 선택"
                                    />
                                    <span v-if="validation.tagName.error" class="err-text" v-html="validation.tagName.reason"></span>
                                </div>
                            </li>
                            <li v-if="!hasMultiIds">
                                <div class="label">
                                    <div>
                                        출결 구분                                    
                                        <span v-if="isConfirmMode && isFieldStudyTypeSelected" class="desc txt-disabled ml-10">
                                          * 출석인정
                                          <span :class="{'txt-warning': isOverFieldStudyDays}">{{ acceptedAsAttendanceFieldStudyDays }}</span>일
                                          / {{ setting.classFieldStudyMaxDays }}일
                                          <span v-if="isOverFieldStudyDays" class="txt-warning"> (초과)</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="option">
                                    <div class="checkbox" @click="onClickTypeRadio('ABSENCE')">
                                        <input 
                                            name="attendanceType" 
                                            type="radio" 
                                            value="ABSENCE" 
                                            v-model="attendance.attendanceType"
                                        >
                                        <label><span>결석</span></label>
                                    </div>

                                    <div class="checkbox" @click="onClickTypeRadio('EARLY_LEAVE')">
                                        <input 
                                            name="attendanceType" 
                                            type="radio" 
                                            value="EARLY_LEAVE" 
                                            v-model="attendance.attendanceType"
                                        >
                                        <label><span>조퇴</span></label>
                                    </div>

                                    <div class="checkbox" @click="onClickTypeRadio('LATENESS')">
                                        <input 
                                            name="attendanceType" 
                                            type="radio" 
                                            value="LATENESS" 
                                            v-model="attendance.attendanceType"
                                        >
                                        <label><span>지각</span></label>
                                    </div>

                                    <div class="checkbox" @click="onClickTypeRadio('OUT')">
                                        <input 
                                            name="attendanceType" 
                                            type="radio" 
                                            value="OUT" 
                                            v-model="attendance.attendanceType"
                                        >
                                        <label><span>외출</span></label>
                                    </div>
                                    <div v-if='setting.attendanceFieldStudyUsed || isOriginalyFieldStudyTypeSelected' class="checkbox"
                                      @click="() => setting.attendanceFieldStudyUsed && onClickTypeRadio('FIELD_STUDY')">
                                        <input 
                                            name="attendanceType" 
                                            type="radio" 
                                            value="FIELD_STUDY"
                                            :disabled="!setting.attendanceFieldStudyUsed"
                                            v-model="attendance.attendanceType"
                                        >
                                        <label><span :class="{disabled: !setting.attendanceFieldStudyUsed}">가정 체험학습</span></label>
                                    </div>
                                </div>
                                <div v-if="isVisibleGuideArea(attendance.attendanceType)" class="blue-box"><pre>{{ guideText(attendance.attendanceType) }}</pre></div>
                            </li>  
                            <li v-if="!isConfirmMode">
                                <div class="label">
                                    출결일
                                    <HiButton v-if="!id" color="primary" size="xs" outline @click="addAttendanceDate">
                                        <HiIcon name="ico-plus2" color="primary" size="14"></HiIcon> 날짜 추가
                                    </HiButton>
                                </div>
                                <p v-if='isFieldStudyTypeSelected' class="desc txt-gray">
                                  <span v-if='isTeacher'>
                                    출석인정 <span :class="{'txt-primary': !isOverFieldStudyDays, 'txt-warning': isOverFieldStudyDays}">{{ acceptedAsAttendanceFieldStudyDays }}</span>일
                                    / {{ setting.classFieldStudyMaxDays }}일
                                    <span class="txt-warning" v-if="isOverFieldStudyDays"> (초과)</span>
                                  </span>
                                  <span v-else>
                                    남은 일수 {{Math.max(isOriginalyFieldStudyTypeSelected ? 1 : 0, availableFieldStudyDays)}}일 중 
                                    <span class="txt-primary" v-if="!noRemainingFieldStudyDays || isOriginalyFieldStudyTypeSelected">{{attendanceDates.length}}일을 신청합니다.</span>
                                    <span class="txt-warning" v-else>{{availableFieldStudyDays > 0 ? attendanceDates.length : 0}}일을 신청합니다.{{ availableFieldStudyDays > 0 ? ' (초과)' : '' }}</span>
                                  </span>
                                </p>

                                <div class="input-wrap">
                                  <template v-for="(attendanceDate, idx) of attendanceDates.filter((a, i) => !disabledAppendingFieldStudyDays || i == 0)">
                                    <div :key="attendanceDate" v-if="idx === 0" class="date-wrap" :class="{disabled: isDisabledEdit || disabledAppendingFieldStudyDays}" @click="isDisabledEdit || disabledAppendingFieldStudyDays ? null : openPopupCalendar(idx)">
                                      <div class="date" >
                                        {{ disabledAppendingFieldStudyDays ? '신청 가능한 잔여일수가 없습니다.' : selectedDateString(attendanceDate) }}
                                      </div>
                                      <button v-if="!isDisabledEdit" class="calendar-icon-btn"></button>
                                    </div>

                                    <div :key="attendanceDate" v-else class="add-date">
                                      <div class="date-wrap" @click="isDisabledEdit ? null : openPopupCalendar(idx)">
                                        <div class="date" >
                                          {{ selectedDateString(attendanceDate) }}
                                        </div>
                                        <button class="calendar-icon-btn"></button>
                                      </div>
                                      <button class="delete-icon" @click="deleteAttendanceDate(idx)"></button>
                                    </div>

                                    <calendar-monthly
                                        :key="`${attendanceDate}-calendar`"
                                        v-if="isPopupCalendar && calendarIndex === idx"
                                        v-click-outside="closePopupCalendar"
                                        :timestamp="attendanceDate"
                                        :value-goe="null"
                                        :isTeacher="isTeacher"
                                        :setting="setting"
                                        :selectedDates="attendanceDates"
                                        calendarType="type01"
                                        @selectedDate="setCalendarDateTimestamp"
                                        @close="closePopupCalendar"
                                    />
                                  </template>
                                  <p class="txt-warning" v-show="validation.attendanceDates.error">날짜를 선택해 주세요.</p>
                                </div>
                            </li>
                            <li v-if="hasFieldStudyInMultiConfirm">
                              <div class="highlight-box">
                                <div class="text">
                                  <div class="warning-icon"></div>
                                  가정 체험학습이 포함된 경우 질병/기타를 선택할 수 없습니다.
                                </div>
                              </div>
                            </li>
                            <li v-if="isTeacher">
                                <div class="label">상세 구분</div>
                                <div class="option" :class="{confirm: hasIdOrMultiIds}">
                                    <div v-if="hasIdOrMultiIds" class="error">
                                        {{ validation.attendanceConfirmType.reason }}
                                    </div>
                                    <div class="checkbox" :class="{confirm: hasIdOrMultiIds}" @click="isFieldStudyTypeSelected ? null : onClickConfirmTypeRadio('ILLNESS')">
                                        <input 
                                            name="attendanceConfirmType"
                                            type="radio" 
                                            value="ILLNESS"
                                            v-model="attendance.attendanceConfirmType"
                                            :disabled="isFieldStudyTypeSelected"
                                        >
                                        <label><span :class="{disabled: isFieldStudyTypeSelected}">질병</span></label>
                                    </div>

                                    <div class="checkbox" :class="{confirm: hasIdOrMultiIds}" @click="onClickConfirmTypeRadio('NOT_ACCEPT')">
                                        <input 
                                            name="attendanceConfirmType"
                                            type="radio" 
                                            value="NOT_ACCEPT"
                                            v-model="attendance.attendanceConfirmType"
                                        >
                                        <label><span>미인정</span></label>
                                    </div>

                                    <div class="checkbox" :class="{confirm: hasIdOrMultiIds}" @click="isFieldStudyTypeSelected ? null : onClickConfirmTypeRadio('ETC')">
                                        <input 
                                            name="attendanceConfirmType" 
                                            type="radio" 
                                            value="ETC"
                                            v-model="attendance.attendanceConfirmType"
                                            :disabled="isFieldStudyTypeSelected"
                                        >
                                        <label><span :class="{disabled: isFieldStudyTypeSelected}">기타</span></label>
                                    </div>

                                    <div class="checkbox" :class="{confirm: hasIdOrMultiIds}" @click="disabledConfirmTypeAttendance ? null : onClickConfirmTypeRadio('ATTENDANCE')">
                                        <input 
                                            name="attendanceConfirmType" 
                                            type="radio" 
                                            value="ATTENDANCE"
                                            v-model="attendance.attendanceConfirmType"
                                            :disabled="disabledConfirmTypeAttendance"
                                        >
                                        <label><span :class="{disabled: disabledConfirmTypeAttendance}">출석인정</span></label>
                                    </div>
                                </div>
                                <span v-if="!hasIdOrMultiIds && validation.attendanceConfirmType.error" class="err-text" v-html="validation.attendanceConfirmType.reason"></span>
                            </li>
                            <li v-if="!isConfirmMode">
                                <div class="label">사유</div>
                                <div class="input-wrap">
                                    <textarea 
                                        class="custom-scr"
                                        :class="{err: validation.reason.error}" 
                                        v-model="attendance.reason"
                                        @input="changeReason"
                                        @blur="validReason"
                                        placeholder="간단히 입력해 주세요. (최대 100자)"
                                        maxlength="100"
                                    ></textarea>
                                    <div class="desc-wrapper">
                                        <span v-if="validation.reason.error" class="err-text" v-html="validation.reason.reason"></span>
                                        <span class="reason-length">{{ strReasonLength }}/100</span>
                                    </div>
                                </div>
                            </li>
                            <li v-if="!isConfirmMode && (accessFile || visibleFiles.length > 0)">
                                <div class="label">첨부파일</div>
                                <div class="attaching-file-list mb-10">
                                    <div 
                                        class="attaching-file mt-10" 
                                        style="height: 35px;"
                                        v-for="(file, index) of visibleFiles"
                                        :key="index"
                                    >
                                        <span class="file-text" @click="editImages(null, getTargetIdx(file))"><span class="file-icon" /> {{ file.fileName }}</span>
                                        <button
                                            v-if="file.fileOriginalPath && accessFile"
                                            class="delete-icon"
                                            @click="deleteFile(file, index)"
                                        ></button>
                                    </div>
                                    <div v-if="isUploading" class="loading-infinite-scroll-wrap">
                                        <div class="icon"></div>
                                    </div>
                                </div>
                                <div class="input-wrap last" v-if="accessFile">
                                    <input class="file-hidden" id="file" ref="fileUpload" type="file" @change="fileChange" placeholder="숫자">
                                    <button id="btn-upload" for="file" class="btn-input-file" @click="openFile">
                                        <div>
                                            <span class="upload-icon" />
                                            <span>파일 업로드</span>
                                            <span class="desc" v-if="isConfirmUpdate === false"> (이미지, 문서 각 3개씩)</span>
                                        </div>
                                    </button>
                                </div>
                            </li>
                            <li v-if="isTeacher" class="mb-00">
                                <div class="label" :class="{'mt-30': !isConfirmMode}">비고</div>
                                <div class="input-wrap last">
                                    <input 
                                        type="text" 
                                        v-model="attendance.memo"
                                        placeholder="메모 (선생님만 볼 수 있습니다.)"
                                        maxlength="30"
                                    >
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
            <template v-slot:footer>
                <HiButton class="mr-10" color="light-primary" size="lg" outline  @click="closeAttendanceRegisterModal">취소</HiButton>
                <HiButton :color="isConfirmMode ? 'noti' : 'primary'" size="lg"
                    :class="{ dis: !isSubmit, confirm: isSubmit && isConfirmMode }"
                    :disabled="!isSubmit"
                    @click="submit"
                    >
                    {{ submitButtonName }}
                </HiButton>
            </template>
        </HiModal>

        <!-- 파일 업로드 진행 모달 -->
        <HiModal v-if="isShowUploadModal" type="type01" size="xs" closeSkip @close="closeModal('isShowUploadModal')">
          <template v-slot:heading>파일 업로드 중입니다.</template>
          <template v-slot:content>
            <div class="w100">
              <p>{{ `${uploadProgress}/${uploadTotal}` }}</p>
              <div class="progressbar">
                <span class="bar" :style="{'width': `calc(${uploadProgress} / ${uploadTotal} * 100%)`}"></span>
              </div>
            </div>
          </template>
        </HiModal>

        <HiModal v-if="isShowUploadFailConfirm" type="type01" size="xs" closeSkip @close="closeModal('isShowUploadFailConfirm')">
          <template v-slot:heading>내트워크 오류로 등록에 실패하였습니다.</template>
          <template v-slot:content>재시도 하시겠습니까?</template>
          <template v-slot:footer>
            <HiButton color="line-light-primary" size="lg" @click="closeModal('isShowUploadFailConfirm')">취소</HiButton>
            <HiButton color="primary" size="lg" @click="retry">재시도</HiButton>
          </template>
        </HiModal>

        <confirm-dialog 
            v-if="confirmDialog.isShow"
            :isOtherUse="true"
            :isNeis="true"
            :isAlert="confirmDialog.isAlert"
            :title="confirmDialog.title"
            :description="confirmDialog.description"
            @closeConfirmDialog="closeConfirmDialog"
        />
    </div>
</template>

<script>
import CalendarMonthly from "@/components/Calendar/CalendarMonthly";
import {mapActions, mapState, mapGetters, mapMutations} from 'vuex'
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog'
import {eventBus} from "@/main";
import HiButton from "@/components/Button/HiButton";
import HiModal from "@/components/Modal/HiModal";
import HiIcon from "@/components/Icon/HiIcon";

const Messages = {
  Confirm: {
    OverRegist: '출석인정 가능일을 모두 사용하였습니다.<br>초과 등록 하시겠습니까?'
  }
}

export default {
    name: "attendance-register-modal",
    components: {CalendarMonthly, ConfirmDialog, HiButton, HiModal, HiIcon},
    props: {
        ids: Array,
        id: String,
        classId: String,
        clazzMemberRole: String,
        isConfirmMode: {
            type: Boolean,
            default: false
        },
        isNeis: {
            type: Boolean,
            default: false
        },
        targetDate: String,
        targetStudentId: String
    },
    data() {
        return {
            option: {
                fileMb: 1024 * 1024
            },
            options: {
                className:'attendancelinker',
                stripPrefix: {
                    scheme: false,
                    www: false
                }
            },
            isFocus : false,
            isPopupCalendar: false,
            isVisibleNo: false,
            isVisibleTagName: false,
            selectedId: null,
            validation: {
                studentName: {
                    error: false,
                    reason: ''
                },
                studentNo: {
                    error: false,
                    reason: ''
                },
                tagName: {
                    error: false,
                    reason: ''
                },
                reason: {
                    error: false,
                    reason: ''
                },
                attendanceConfirmType: {
                    error: this.isConfirmMode,
                    reason: '상세 구분을 선택해주세요.'
                },
                attendanceDates: {
                  error: false
                }
            },
            progreses: {},
            filterClazzStudents: [],
            clazzStudents: [],
            guide: {},
            original: {},
            attendance: {
                classId: null,
                studentId: null,
                studentName: null,
                studentNo: null,
                attendanceDate: null,
                attendanceType: 'ABSENCE',
                attendanceConfirmType: null,
                reason: null,
                memo: null,
                files: []
            },
            confirmDialog : {
                isShow: false,
                isAlert: false,
                title: '',
                description: '',
                changeValiable: ''
            },
            setting: {
              attendanceHolidayUsed: false,
              attendanceFileUsed: false,
              attendanceFieldStudyUsed: false,
              classFieldStudyMaxDays: '20',
            },
            unusedFiles: [],

            // 출결알리기 기간 설정
            attendanceDates: [],
            calendarIndex: 0,
            isShowUploadModal: false,
            uploadProgress: 0,
            uploadTotal: 0,
            isShowUploadFailConfirm: false,

            filteredTags: [],
            selectedTagId: null,
            submitCountsForMemberRole: {},
            detailSubmitCountsForMemberRole: {},
            acceptedAsAttendanceFieldStudyDays: 0,
            multiConfirmContext: {
              attendances: []
            },
            hasNotChanged: false
        }
    },
    computed: {
        ...mapState(['curClassItem']),
        ...mapState('storeImageEditor', ['deleteImages']),
        ...mapState('storeClazzTag', ['clazzTags']),
        ...mapState('storeClazzes', {
          storedAttendanceContext: 'attendance'
        }),
        ...mapGetters({
            CONSTANTS: 'CONSTANTS',
            curClassId: 'curClassId'
        }),
        ...mapGetters('storeClazzes', ['getApplyListOf']),
        isDisabledEdit: function() {
            return this.id && !this.isTeacher
        },
        visibleFiles: function() {
            return this.attendance.files.filter(f => f.fileOriginalPath)
        },
        isUploading: function() {
            return Object.keys(this.progreses).length > 0
        },
        isSubmit: function() {
          if (this.isConfirmMode) {
            return this.attendance.attendanceConfirmType
          }
          const allFilesUploaded = this.attendance.files.filter(f => !f.fileOriginalPath).length === 0

          if (this.id) {
            return allFilesUploaded && !this.isUploading && (this.isTeacher ? this.attendance.attendanceConfirmType : true)
          }
            return allFilesUploaded && !this.isUploading
        },
        isTeacher: function() {
            return ['OWNER', 'MANAGER'].includes(this.clazzMemberRole)
        },
        submitButtonName: function() {
            const selectedCount = this.attendanceDates.filter(date => date !== null).length
            if (this.isTeacher) {
                return this.hasIdOrMultiIds ? (this.isConfirmMode ? '확인완료' : '수정') : (selectedCount > 1 ? '일괄등록' : '등록')
            } else {
                return this.id ? '수정' : (selectedCount > 1 ? '일괄제출' : '제출')
            }
        },
        accessFile() {
            return this.isTeacher || this.setting.attendanceFileUsed
        },
        isConfirmUpdate() {
            // return !this.id === false && !this.attendance.attendanceConfirmType === false
            return !this.id === false && this.isTeacher === true
        },
        strReasonLength() {
            return !this.attendance.reason === true ? 0 : this.attendance.reason.length
        },
        uploadedImageFiles() {
          return this.attendance.files.filter(file => file.fileContentType.startsWith('image'))
        },
        isOriginalyFieldStudyTypeSelected() {
          return this.original.attendanceType === 'FIELD_STUDY' || this.hasFieldStudyInMultiConfirm
        },
        isOriginalyConfirmedOfAttendance() {
          return (this.original || {}).attendanceConfirmType === 'ATTENDANCE'
        },
        isFieldStudyTypeSelected() {
          return this.attendance.attendanceType === 'FIELD_STUDY' || this.hasFieldStudyInMultiConfirm
        },
        appliedFieldStudies() {
          if (this.attendance.attendanceType !== 'FIELD_STUDY') return []
          return this.getApplyListOf(this.attendance.studentId, 'FIELD_STUDY').filter(a => !this.id || a.attendanceId !== this.id)
        },
        availableFieldStudyDays() {
          if (!this.attendance.studentId) return 0
          return this.setting.classFieldStudyMaxDays - this.submitCountsOfFieldStudy
        },
        submitCountsOfFieldStudy() {
          return this.submitCountsForMemberRole['FIELD_STUDY'] || 0
        },
        noRemainingFieldStudyDays() {
          return !this.hasFieldStudyInMultiConfirm && this.isFieldStudyTypeSelected && (this.availableFieldStudyDays <= 0 || this.attendanceDates.length > this.availableFieldStudyDays)
        },
        noRemainingAvailableFieldStudyDays() {
          return !this.hasFieldStudyInMultiConfirm && this.isFieldStudyTypeSelected && this.availableFieldStudyDays <= 0
        },
        invalidRemainingAvailableFieldStudyDays() {
          return !this.hasFieldStudyInMultiConfirm && this.isFieldStudyTypeSelected && this.availableFieldStudyDays < 0
        },
        disabledConfirmTypeAttendance() {
          return !this.isTeacher && ((this.isConfirmMode && this.invalidRemainingAvailableFieldStudyDays)
              || (!this.isConfirmMode && this.invalidRemainingAvailableFieldStudyDays
                  && (!this.original || this.original.attendanceConfirmType !== 'ATTENDANCE')))
        },
        hasMultiIds () {
          return this.ids && this.ids.length > 0
        },
        hasIdOrMultiIds () {
          return this.id || this.hasMultiIds
        },
        hasFieldStudyInMultiConfirm () {
          return this.hasMultiIds && this.multiConfirmContext.attendances.some(att => att.attendanceType === 'FIELD_STUDY')
        },
        disabledAppendingFieldStudyDays() {
          return !this.isTeacher && !this.hasIdOrMultiIds && this.noRemainingAvailableFieldStudyDays
        },
        isOverFieldStudyDays() {
          return this.acceptedAsAttendanceFieldStudyDays > this.setting.classFieldStudyMaxDays
        },
        isOverFieldStudyDaysWhenAddingAttendanceDates() {
          return this.acceptedAsAttendanceFieldStudyDays + this.attendanceDates.length > this.setting.classFieldStudyMaxDays
        },
        isAttendanceSelectedFieldStudy() {
          return this.attendance.attendanceType === 'FIELD_STUDY' && this.isAttendanceSelected
        },
        isAttendanceSelected() {
          return this.attendance.attendanceConfirmType === 'ATTENDANCE'
        },
    },
    methods: {
        ...mapActions({
            increaseFileUploadCount: 'increaseFileUploadCount',
        }),
        ...mapActions('storeClazzes',[
            'callClazzStudents',
            'callCreateAttendance',
            'callUpdateAttendance',
            'callAttendanceById',
            'callClazzStudentsUsers',
            'callAttendanceGuide',
            'callAttendancesByClassId'
        ]),
        ...mapActions('storeImageEditor', {
          openImageEditor: 'openImageEditor',
          changeFilesSort: 'changeFilesSort'
        }),
        ...mapMutations('storeImageEditor', {
          clearDeleteImages: 'clearDeleteImages'
        }),
        selectedDateString: function(attendanceDate) {
          if (!attendanceDate) return '날짜 선택'
          const curDate = this.$moment().format('YYYY년 M월 D일')
          const date = this.$moment(attendanceDate)
          return `${date.format('M월 D일')} ${this.getDayName(date.day())+'요일'} ${date.format('YYYY년 M월 D일') === curDate ? '(오늘)' : ''}`
        },
        isVisibleGuideArea: function(type) {
            if(!this.guideText(type)) return false
            
            return this.guideText(type).replace(/(?:\r\n|\r|\n)/g, '').trim().length > 0
        },
        getDayName(day) {
            switch (day) {
                case 0:
                return this.$t("chat.settings.sunday");
                case 1:
                return this.$t("chat.settings.monday");
                case 2:
                return this.$t("chat.settings.tuesday");
                case 3:
                return this.$t("chat.settings.wednesday");
                case 4:
                return this.$t("chat.settings.thursday");
                case 5:
                return this.$t("chat.settings.friday");
                case 6:
                return this.$t("chat.settings.saturday");
            }
        },
        guideText: function(type) {
            if(this.guide) {
                return this.guide[type] ? this.guide[type].replace(/(?:\r\n|\r|\n)/g, '<br />') : null
            }
            return null
        },
        changeStudentName: function(e) {
            if (this.isVisibleNo) { this.isVisibleNo = false }
            if (this.isVisibleTagName) { this.isVisibleTagName = false }
            this.selectedId = null
            this.selectedTagId = null
            this.attendance.studentId = null
            this.isFocus = true
            if(e.target.value) {
                this.filterClazzStudents = this.clazzStudents.filter(o => o.studentName.replace(/\s/g, "").indexOf(e.target.value.replace(/\s/g, "")) > -1)
            } else {
                this.filterClazzStudents = this.clazzStudents
            }
        },
        initInputVariables() {
          this.attendance.attendanceType = 'ABSENCE'
          this.attendanceDates = [this.$moment().startOf('day').valueOf()]
          this.attendance.attendanceConfirmType = null
        },
        changeStudentNo: function(e) {
          if (this.isVisibleTagName) { this.isVisibleTagName = false }
          this.selectedId = null
          this.selectedTagId = null
          this.attendance.studentId = null
          if (e.target.value) {
            this.filterClazzStudents = this.clazzStudents.filter(o =>
                o.studentName.replace(/\s/g, "") === this.attendance.studentName.replace(/\s/g, "") && o.studentNo == e.target.value
            )
          } else {
            this.filterClazzStudents = [...this.clazzStudents]
          }
        },
        changeReason: function(event) {
            this.attendance.reason = event.target.value.substring(0, 100)
            this.validReason()
        },
        autoInputFocusChange: function(val) {
            this.isFocus = val
            if (!val) {
              this.attendance.studentNo = null
              this.validStudentName()
            }
        },
        onClickAutoItem: function(student) {
            if(student) {
                this.attendance.studentName = student.studentName
                this.attendance.studentId = student.studentId
                this.attendance.studentNo = student.studentNo
                this.selectedId = student.studentId
                this.isFocus = false
            }
        },
        onClickTypeRadio: function(value) {
          if (value === 'FIELD_STUDY') {
            if (!this.attendance.studentId)
              return this.$hiClass.alert('학생을 먼저 선택해주세요.');
            if (['ILLNESS', 'ETC'].includes(this.attendance.attendanceConfirmType))
              this.attendance.attendanceConfirmType = null;
          }
          this.attendance.attendanceType = value
        },
        onClickConfirmTypeRadio: function(value) {
            this.attendance.attendanceConfirmType = value
            this.validConfirmType()
        },
        closeAttendanceRegisterModal: function(optionalAttendances = []) {
            this.$emit('close', optionalAttendances)
        },
        closePopupCalendar: function() {
            this.isPopupCalendar = false
        },
        setCalendarDateTimestamp: function(dateTimeJson) {
            const tmpYear = dateTimeJson.year
            let tmpMonth = dateTimeJson.month + 1
            if (tmpMonth.toString().length === 1) {
                tmpMonth = '0' + tmpMonth
            }
            let tmpDate = dateTimeJson.date
            if (tmpDate.toString().length === 1) {
                tmpDate = '0' + tmpDate
            }
            const dateTime = `${tmpYear}/${tmpMonth}/${tmpDate}`
            this.attendanceDates.splice(this.calendarIndex, 1, this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf())
            if (this.validation.attendanceDates.error) {
              this.validDates()
            }
        },
        openFile: function(e) {
            e.preventDefault()
            this.$refs.fileUpload.value = ''
            this.$refs.fileUpload.click()
        },
        deleteFile: function(file, index) {
            this.attendance.files.splice(index, 1)
            if (file.isNew) {
                this.$hiClass.multipart.delete(file)
            } else {
              this.unusedFiles.push(file)
            }
        },
        fileChange: async function(e) {
            e.preventDefault()
            const files = e.target.files || e.dataTransfer.files

            const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
            const extension = files[0].name.substring(files[0].name.lastIndexOf('.') + 1, files[0].name.length).toLowerCase()
            
            if(isNotAllowExtensions.includes(extension)) {
                this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
                return;
            }

            if(files[0].type.indexOf('video') !== -1 || files[0].type.indexOf('audio') !== -1) {
                this.$hiClass.alert('비디오, 오디오 파일은 등록할 수 없습니다.')
                return;
            }

            if(this.isConfirmUpdate === true) {
                if(this.attendance.files.length >= 50) {
                    this.$hiClass.alert('최대 50개 까지 가능합니다.')
                    return;
                }
            } else {
                if(this.attendance.files.length === 6) {
                    this.$hiClass.alert('첨부파일은 최대 6개까지 첨부하실 수 있습니다.')
                    return;
                }
                
                const image = this.attendance.files.filter(f => f.fileContentType.startsWith('image')).length
                const doc = this.attendance.files.filter(f => !f.fileContentType.startsWith('image')).length
                if(files[0].type.startsWith('image')) {
                    if(image === 3) {
                        this.$hiClass.alert('이미지는 최대 3개까지만 첨부 가능합니다.')
                        return;
                    }
                    if(files[0].size > this.option.fileMb * this.$store.state.upload.class.image.size) {
                        const fileUploadErrorMessage = this.$t(
                            'file.upload.error.size.over.image',
                            {
                                sizeStr: this.$store.state.upload.class.image.sizeStr
                            }
                        )
                        this.$hiClass.alert(fileUploadErrorMessage)
                        return;
                    }
                }
            
                if(!files[0].type.startsWith('image')) {
                    if(doc === 3) {
                        this.$hiClass.alert('문서는 최대 3개까지만 첨부 가능합니다.')
                        return;
                    }
                    if(files[0].size > this.option.fileMb * this.$store.state.upload.class.etc.size) {
                        const fileUploadErrorMessage = this.$t(
                            'file.upload.error.size.over.etc',
                            {
                                sizeStr: this.$store.state.upload.class.etc.sizeStr
                            }
                        )
                        this.$hiClass.alert(fileUploadErrorMessage)
                        return;
                    }
                }
            }

          const uploadFile = files[0].type.indexOf('image') !== -1
              ? await this.$hiClass.getConvertedFile(files[0])
              : files[0]
            const key = this.$moment().toString()
            this.progreses = {
                ...this.progreses,
                [key]: {fileName: uploadFile.name, fileContentType: uploadFile.type, progress: 0}
            }
        
            this.$hiClass.multipart.upload(uploadFile, {
                onUploadProgress: progressEvent => {
                    this.progreses = {
                        ...this.progreses,
                        [key]: {
                            ...this.progreses[key],
                            progress: Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        }
                    }
                }
            }).then(result => {
                const uploaded = {...this.returnFileData(result.data), isNew: true}
                this.attendance.files.push(uploaded)
                delete this.progreses[key]
                this.progreses = {...this.progreses}
            })
            
            this.$refs.fileUpload.value = ''
        },
        validationChecked: function() {
          this.validStudentName()
          if (this.isVisibleNo) {
            this.validStudentNo()
          }
          if (this.isVisibleTagName) {
            this.validTag()
          }
          this.validDates()
          this.validReason()
          this.validReason()
          this.validConfirmType()

          return Object.values(this.validation).map(errItem => errItem.error).every(error => error === false)
        },
        validStudentName() {
          this.validation.studentName = {error: false, reason: ''}

          if (!this.attendance.studentName) {
            this.validation.studentName = {error: true, reason: `${this.isTeacher ? '학생' : '자녀'} 이름을 입력해주세요.`};

          } else {
            if (this.filterClazzStudents.length === 0) {
              if (!this.id) {
                this.validation.studentName = {error: true, reason: '학생 명단의 이름과 다를 경우 사용이 제한되며, 담임선생님께 문의해<br>주세요.'}
              } else {
                this.attendance.studentName = this.original.student.studentName
                this.attendance.studentNo = this.original.student.studentNo
                this.attendance.studentId = this.original.student.studentId
                this.selectedId = this.original.student.studentId
              }

            } else if (this.filterClazzStudents.length === 1) {
              this.attendance.studentId = this.filterClazzStudents[0].studentId

            } else {
              if (this.isTeacher) {
                if (!this.selectedId) {
                  this.validation.studentName = {error: true, reason: '중복되는 학생이 있습니다. 학생을 직접 선택해주세요.'}
                }

              } else {
                if (!this.id && !this.selectedId) {
                  this.validation.studentNo = {error: true, reason: '반 번호를 입력해주세요.'}
                  this.isVisibleNo = true
                }
              }
            }
          }
        },
        validStudentNo() {
          this.validation.studentNo = {error: false, reason: ''}
          if (!this.attendance.studentNo) {
            this.validation.studentNo = {error: true, reason: '반 번호를 입력해주세요.'}

          } else {
            if (this.filterClazzStudents.length === 0) {
              this.validation.studentNo = {error: true, reason: '자녀의 반 번호를 다시 확인해주세요.<br>계속해서 틀리실 경우, 담임선생님께 문의해주세요.'}
            } else if (this.filterClazzStudents.length === 1){
              this.attendance.studentId = this.filterClazzStudents[0].studentId
            } else {
              if (!this.id && !this.selectedId) {
                this.validTag()
              }
            }
          }
        },
        validTag() {
          const students = this.clazzStudents.filter(o =>
              o.studentName.replace(/\s/g, "") === this.attendance.studentName.replace(/\s/g, "") &&
              o.studentNo == this.attendance.studentNo
          )
          this.filterClazzStudents = [...students]

          this.validation.tagName = { error: false, reason: '' }
          if (!this.selectedTagId) {
            this.validation.tagName = { error: true, reason: '자녀의 학반을 선택해주세요.' }
            this.isVisibleTagName = true
            this.filteredTags = [...this.clazzTags]
                .filter(t => students.map(s => s.tagId).includes(t.tagId))
                .map(t => ({ value: t.tagId, title: t.tagName }))
          }
        },
        validDates() {
          this.validation.attendanceDates.error = this.attendanceDates.filter(date => date === null).length > 0
        },
        validReason() {
          this.validation.reason = {error: false, reason: ''}

          if ((this.attendance.reason || '').trim().length === 0) {
            this.validation.reason = {error: true, reason: '사유를 입력해 주세요.'}
          }
        },
        validConfirmType() {
          this.validation.attendanceConfirmType.error = !this.attendance.attendanceConfirmType && this.isTeacher
        },
        returnFileData: function(item) {
            let fileConvertPath = null
            let fileThumbnailPath = null

            try {
                if (item._links.convert && item._links.convert.href)
                    fileConvertPath = item._links.convert.href

                if (item._links.thumbnail && item._links.thumbnail.href)
                    fileThumbnailPath = item._links.thumbnail.href
            } catch (error) {
                this.$log.debug(error)
            }

            let fileInfo = {
                fileName: item.filename.replace(/^.*[\\/]/, ''),
                fileSize: item.size,
                fileOriginalPath: item._links.original.href,
                fileContentType: item.contentType,
            }

            if (fileConvertPath !== null)
                fileInfo.fileConvertPath = fileConvertPath

            if (fileThumbnailPath !== null) {
                fileInfo.fileThumbnailPath = fileThumbnailPath
            } else if (item.contentType.indexOf('video') > -1) {
                fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
            }

            if (item.contentType.indexOf('image') > -1) {
                fileInfo.fileFlag = 'IMAGE_PACK'
            }

            // 완료 후 파일업로드 위치 GA 호출
            this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS })
            return fileInfo
        },
        openConfirmDialog: function (changeValiable) {
            let title = ''
            let description = ''
            let isAlert = false
            switch(changeValiable) {
                case 'insert' : {
                  if (this.isTeacher && this.isAttendanceSelectedFieldStudy && this.isOverFieldStudyDaysWhenAddingAttendanceDates) {
                    title = Messages.Confirm.OverRegist
                  } else {
                    const selectedCount = this.attendanceDates.filter(date => date !== null).length
                    title = selectedCount > 1 ? `${selectedCount}개의 신청서를 ` : '신청서를 '
                    title += selectedCount > 1 ? '일괄 ' : ''
                    title += this.isTeacher ? '등록하시겠습니까?' : '제출하시겠습니까?'
                  }
                  break;
                }
                case 'update' : {
                  title = (this.isTeacher && this.isAttendanceSelectedFieldStudy
                          && this.isOverFieldStudyDaysWhenAddingAttendanceDates
                          && ((this.original.student || {}).studentId !== this.attendance.studentId || !this.isOriginalyConfirmedOfAttendance))
                    ? Messages.Confirm.OverRegist
                    : '신청서를 수정하시겠습니까?'
                  break;
                }
                case 'deleted': {
                    title = '삭제된 내역입니다.'
                    isAlert = true
                    break;
                }
                case 'complete' : {
                    title = '선생님께서 신청서 내용을<br>확인하셨습니다.'
                    description = '확인완료된 내역은 수정이 불가합니다.'
                    isAlert = true
                    break;
                }
                case 'deletedStudent': {
                    title = '삭제 처리된 학생입니다.'
                    isAlert = true
                    break;
                }
                case 'attendanceOff': {
                    title = '출결알리기 사용이 OFF 되었습니다.'
                    isAlert = true
                    break;
                }
            }
            this.confirmDialog = {
                changeValiable,
                title,
                description,
                isShow: true,
                isAlert
            }
        },
        closeConfirmDialog: async function(isConfirm) {
            if(isConfirm) {
                switch(this.confirmDialog.changeValiable) {
                    case 'insert' : 
                    case 'update' : 
                    case 'confirm' : {
                        this.submitAttendance()
                        break;
                    }
                    case 'complete':
                    case 'deleted':
                    case 'attendanceOff' : {
                        this.closeAttendanceRegisterModal()
                        break;
                    }
                    case 'deletedStudent': {
                        if(!this.isTeacher) {
                            this.closeAttendanceRegisterModal()
                        }
                    }
                }
            }

            this.confirmDialog = {
                isShow: false,
                isAlert: false,
                title: '',
                description: '',
                changeValiable: ''
            }
        },
        submit() {
          if (!this.isTeacher && !this.hasIdOrMultiIds && this.noRemainingFieldStudyDays) {
            return this.showAlertForLimitationOfFieldStudyDays()
          }
          const isValid = this.validationChecked()
          if (!isValid && !this.hasMultiIds) {
            return
          }

          this.isConfirmMode && (this.hasMultiIds || !(this.isAttendanceSelectedFieldStudy && this.isOverFieldStudyDaysWhenAddingAttendanceDates)) ?
              (this.hasMultiIds ? this.processMultiAttendances() : this.submitAttendance())
              : this.openConfirmDialog(this.id ? 'update' : 'insert')
        },
        async recheckAvailableFieldStudyDaysBeforeSubmit() {
          if (!this.isFieldStudyTypeSelected
            || this.attendance.attendanceConfirmType === 'NOT_ACCEPT'
            || this.isOriginalyConfirmedOfAttendance
            || this.isOriginalyFieldStudyTypeSelected
          ) return true
          await Promise.all([
            this.getAttendanceSetting(),
            this.callAttendancesByClassId({init: true, isDeleted: false})
          ])
          await this.$nextTick()
          return !this.invalidRemainingAvailableFieldStudyDays
        },
        async processMultiAttendances() {
          try {
            if (this.hasFieldStudyInMultiConfirm) {
              await this.getAttendanceSetting()
              const isOver = this.isAttendanceSelected
                && (await Promise.all(this.multiConfirmContext.attendances.filter(att => att.attendanceType === 'FIELD_STUDY').map(async att => {
                      try {
                        return ((await this.getDetailSubmitCountOf(att.student.studentId))['FIELD_STUDY']['ATTENDANCE'] || 0)
                                    >= this.setting.classFieldStudyMaxDays
                      } catch (e) { return false }
              }))).some(isOver => isOver)
              if (isOver && !((await this.$hiClass.confirm(
                Messages.Confirm.OverRegist, null, { reverseButtons: true}
              ).catch(() => {})) || {}).isConfirmed) return;
            }
          } catch (e) {
            return this.showAlertForAlreadyDeletedStudentAndClose()
          }
          const { data } = await this.$axios({
            method: 'PATCH',
            url: `/attendances/multiple-confirm`,
            params: {...this.storedAttendanceContext.applyListSearch.params, page: 0},
            data: {
              classId: this.curClassItem.currentId || this.classId,
              attendanceIds: this.ids,
              attendanceConfirmType: this.attendance.attendanceConfirmType,
              memo: this.attendance.memo
            }}).catch(_ => {
              return this.showAlertForAlreadyDeletedStudentAndClose()
            })
          this.$toasted.clear()
          this.$toasted.show(`${this.ids.length} 건 확인 완료 되었습니다.`, {duration: 5000})
          this.closeAttendanceRegisterModal((data._embedded || {}).attendances || [])
        },
        showAlertForLimitationOfFieldStudyDays() {
          this.$hiClass.alert('체험학습 신청 가능일을 모두 사용하여 제출이 불가합니다.<br>출결 구분을 변경해주세요')
        },
        shotAlertForLimitationOfAvailableFieldStudyDays() {
          this.$hiClass.alert('가정 체험학습은 남은 일수 내에서만<br>제출 가능합니다.')
        },
        showAlertForAlreadyDeletedStudentAndClose() {
          this.$hiClass.alert('삭제된 내역입니다.')
          this.closeAttendanceRegisterModal()
        },
        submitAttendance: async function() {
            let error = 0
            if (!this.isTeacher && (!(await this.recheckAvailableFieldStudyDaysBeforeSubmit())
              || (this.original
                  && ((this.original.student || {}).studentId !== this.attendance.studentId
                      || this.original.attendanceType !== this.attendance.attendanceType)
                    && this.noRemainingFieldStudyDays))) {
                return this.showAlertForLimitationOfFieldStudyDays()
            }
            if(this.id) {
                const res = await this.callAttendanceById(this.id)
                if(res.status === 428) {
                    this.openConfirmDialog('deleted')
                    return;
                } else if(res.status === 417) {
                    this.openConfirmDialog('attendanceOff')
                    return;
                }
            
                if(res.data.attendanceConfirmType  && !this.isTeacher) {
                    this.openConfirmDialog('complete')
                    return;
                }
            }

            const seqArr = this.attendance.files
                .filter(file => file.seq)
                .map(file => file.seq)
                .sort((a, b) => a - b)

            this.attendance.files.forEach((file, idx) => {
              if (idx < seqArr.length) {
                file.seq = seqArr[idx]
              } else {
                if (Object.keys(file).includes('seq')) {
                  delete file.seq
                }
              }
            })
            
            const input = {
                classId: this.curClassItem.currentId || this.classId,
                studentId: this.attendance.studentId,
                attendanceType: this.attendance.attendanceType,
                attendanceConfirmType: this.attendance.attendanceConfirmType,
                reason: this.attendance.reason,
                memo: this.attendance.memo
            }
            if (this.id) {
              input.files = this.attendance.files
              input.attendanceDate = this.$moment(this.attendanceDates[0]).format('YYYY-MM-DD')

              error = await this.callUpdateAttendance({id: this.id, data: input})
              if (error === 428) return this.showAlertForLimitationOfFieldStudyDays();
              if (error === 0) {
                if(this.isConfirmMode) {
                  this.$hiClass.alert('확인완료 처리되었습니다.')
                } else {
                  this.$toasted.clear()
                  const options = { duration: 5000 }
                  this.$toasted.show('수정되었습니다.', options)
                }
              }
            } else {
              input.files = {}
              input.attendanceDates = this.attendanceDates
                  .filter(date => date !== null)
                  .map(date => this.$moment(date).format('YYYY-MM-DD'))

              input.attendanceDates.forEach((date, idx) => {
                input.files[date] = idx === 0 ?
                    input.files[date] = [...this.attendance.files] :
                    []
              })

              if (input.attendanceDates.length > 1 && this.attendance.files.length > 0) {
                this.uploadTotal = input.attendanceDates.length
                this.isShowUploadModal = true

                const isSuccess = await this.copyFile(input.files)
                if (!isSuccess) {
                  this.closeModal('isShowUploadModal')
                  this.isShowUploadFailConfirm = true
                  return false
                }
              }

              error = await this.callCreateAttendance(input)
            }
            if (error === 0) {
                if (this.unusedFiles.length > 0) {
                  this.unusedFiles.forEach(file => {
                    this.$hiClass.multipart.delete(file)
                  })
                }

                this.closeModal('isShowUploadModal')
                this.closeAttendanceRegisterModal()
            } else {
                this.openConfirmDialog(error === 412 ? 'deletedStudent' : 'attendanceOff')
            }
        },
        async copyFile(dateFiles) {
          for (const date of Object.keys(dateFiles)) {
            // 이미 업로드된 파일 묶음이 있으므로 첫번째는 복사하지않아도됨
            if (this.uploadProgress === 0) {
              this.uploadProgress++
              continue
            }

            for (let file of this.attendance.files) {
              try {
                const res = await this.$hiClass.multipart.copy({
                  fileOriginalPath: file.fileOriginalPath,
                  ...(file.fileConvertPath && {fileConvertPath: file.fileConvertPath}),
                  ...(file.fileThumbnailPath && {fileThumbnailPath: file.fileThumbnailPath}),
                }, {encode: false})

                dateFiles[date].push({
                  ...file,
                  ...res.data
                })

              } catch (err) {
                Object.entries(dateFiles)
                    .filter(([date]) => date !== Object.keys(dateFiles)[0])
                    .flatMap(([, files]) => files)
                    .forEach(file => {this.$hiClass.multipart.delete(file)})

                return false
              }
            }
            this.uploadProgress++
          }

          return true
        },
        async getAttendanceSetting() {
            this.setting = (await this.$axios.get(`/attendances/setting/${this.curClassId}`)).data
        },
        async editImages(inputFiles, targetIdx) {
          await this.openImageEditor({
            uploadedFiles: this.uploadedImageFiles,
            inputFiles,
            imageLimitCount: 3,
            componentKey: 'attendance-register-modal',
            targetIdx,
            parentComponent: 'attendanceRegisterModal'
          })
        },
        getTargetIdx(targetFile) {
          const idx = this.uploadedImageFiles.findIndex(file => file.fileOriginalPath === targetFile.fileOriginalPath)
          return idx > -1 ? idx : 0
        },

        addAttendanceDate() {
          if (!this.isTeacher && this.isFieldStudyTypeSelected && this.attendanceDates.length >= this.availableFieldStudyDays) {
            return this.shotAlertForLimitationOfAvailableFieldStudyDays()
          }
          if (!this.isTeacher && this.attendanceDates.length >= 5) {
            this.$toasted.clear()
            this.$toasted.show('날짜 추가는 최대 5개까지 가능합니다.')
            return
          }
          this.attendanceDates.push(null)
        },
        deleteAttendanceDate(idx) {
          this.attendanceDates.splice(idx, 1)
          if (this.attendanceDates.filter(date => date === null).length === 0 && this.validation.attendanceDates.error) {
            this.validation.attendanceDates.error = false
          }
        },
        openPopupCalendar(idx) {
          this.calendarIndex = idx
          this.isPopupCalendar = true
        },
        closeModal(modalName) {
          this[modalName] = false
        },
        retry() {
            this.closeModal('isShowUploadFailConfirm')
            this.uploadProgress = 0
            this.submitAttendance()
        },
        selectTag(tagId) {
            this.selectedTagId = tagId
            const students = this.clazzStudents.filter(o =>
                o.studentName.replace(/\s/g, "") === this.attendance.studentName.replace(/\s/g, "") &&
                o.studentNo == this.attendance.studentNo
            )
            this.attendance.studentId = students.find(s => s.tagId === this.selectedTagId).studentId
            this.validTag()
        },
        async getSubmitCountOf(studentId) {
          return (await this.$axios.get(`/attendances/submit-count/${studentId}`)).data
        },
        async getDetailSubmitCountOf(studentId) {
          return (await this.$axios.get(`/attendances/submit-count/${studentId}/details`)).data
        },
        async reloadSubCountForMemberRole() {
          return Promise.all([
            this.getSubmitCountOf(this.attendance.studentId).then(res => { this.submitCountsForMemberRole = res }),
            this.getDetailSubmitCountOf(this.attendance.studentId).then(res => {
              this.detailSubmitCountsForMemberRole = res
              this.acceptedAsAttendanceFieldStudyDays = res['FIELD_STUDY']['ATTENDANCE'] || 0
            })
          ])
        },
        async prepareMultiConfirmContext() {
          if (!this.hasMultiIds) return
          this.multiConfirmContext.attendances = (await Promise.all(this.ids.map(id => this.callAttendanceById(id))))
              .filter(res => res.status === 200)
              .map(res => res.data)
        },
    },
    beforeMount() {
        let today = this.targetDate ? this.$moment(this.targetDate) : this.$moment()
        let attemptCount = 0 // 무한루프 방지
        let calenderHolidays = localStorage.getItem('calenderHolidays')
        let holidays = (JSON.parse(calenderHolidays) || []).map(holiday => holiday.yyyymmdd)
        let isAvailable = false

        while (!isAvailable && attemptCount < 365) {
          if (!holidays.includes(today.format('YYYYMMDD')) && ![0, 6].includes(today.day())) {
            isAvailable = true
            break
          }
          today = today.add(1, 'day')
          attemptCount++
        }

        this.targetDate ?
            this.attendanceDates.push(today.startOf('day').valueOf()) :
            this.attendanceDates.push(today.startOf('day').valueOf())
    },
    mounted() {
        this.getAttendanceSetting()
        if (this.hasMultiIds) {
          this.prepareMultiConfirmContext()
        }

         eventBus.$on(`imageEditor-attendance-register-modal`,async uploadFileList => {
           // 편집기에서 삭제된 파일 삭제
           if (this.deleteImages.length > 0) {
             this.deleteImages.forEach(deleteImage => {
               const targetIdx = this.attendance.files.findIndex(file => deleteImage.fileOriginalPath === file.fileOriginalPath)
               if (targetIdx > -1) {
                 this.unusedFiles.push(this.attendance.files[targetIdx])
                 this.attendance.files.splice(targetIdx, 1)
               }
             })
             this.clearDeleteImages()
           }

           let fileInfos = []
           uploadFileList.forEach((uploadFile, idx) => {
             const addFile = uploadFileList[idx]
             let fileInfo = {
               fileContentType: addFile.file.type,
               fileName: addFile.file.name.replace(/^.*[\\/]/, ''),
               fileSize: addFile.file.size,
               isNew: true
             }

             const targetIdx = this.attendance.files.findIndex(file => file.fileOriginalPath === addFile.fileOriginalPath)
             if (targetIdx > -1) {
               this.attendance.files.splice(targetIdx, 1, fileInfo)
             } else {
               this.attendance.files.push(fileInfo)
             }
             fileInfos.push(fileInfo)
           })

           // 정렬
           const sortedArr = await this.changeFilesSort(this.attendance.files)
           if (sortedArr.length > 0) {
             this.attendance.files = sortedArr
           }

           // 업로드
           const key = this.$moment().toString()
           let postApi = []
           uploadFileList.forEach((uploadFile, idx) => {
             this.progreses = {
               ...this.progreses,
               [key]: {fileName: uploadFile.file.name, fileContentType: uploadFile.file.type, progress: 0}
             }

             postApi.push(this.$hiClass.multipart.upload(uploadFile.file, {
               onUploadProgress: progressEvent => {
                 this.progreses = {
                   ...this.progreses,
                   [key]: {
                     ...this.progreses[key],
                     progress: Math.round((progressEvent.loaded * 100) / progressEvent.total)
                   }
                 }
               }
             }))
           })

           Promise.all(postApi)
               .then(res => {
                 res.forEach((item, idx) => {
                   const uploaded = {...this.returnFileData(item.data), isNew: true}
                   if (fileInfos.length > 0) {
                     const targetIdx = this.attendance.files.findIndex(file => file === fileInfos[idx])
                     if (targetIdx > -1) {
                       this.attendance.files.splice(targetIdx, 1, uploaded)
                     }
                   }
                   delete this.progreses[key]
                   this.progreses = {...this.progreses}
                 })
               })
               .catch(err => {
                 this.$log.debug(this.$options.name, ' upload() error => ', err)
               })
         })
    },
    watch: {
      'attendance.studentId': function(newVal) {
        if (!newVal) return
        this.reloadSubCountForMemberRole()
        if (!this.hasNotChanged) {
          this.hasNotChanged = true
          return
        }
        this.initInputVariables()
      },
    },
    async created() {
        const guideParams = {
            classId: this.curClassItem.currentId || this.classId,
            guideType : {guideType: ['INFO', 'ABSENCE', 'EARLY_LEAVE', 'LATENESS', 'OUT', 'FIELD_STUDY']}
        }
        this.guide = await this.callAttendanceGuide(guideParams)
        
        const clazzStudentsParams = {
            isAll: true,
            isUsed: true,
            classId: this.curClassItem.currentId || this.classId,
            page: 0,
            size: 1000
        }
        const clazzStudents = await this.callClazzStudents(clazzStudentsParams)
        this.clazzStudents = (clazzStudents.every(s => !s.isMatchTag) || this.isTeacher) ?
            [...clazzStudents] :
            [...clazzStudents.filter(s => s.isMatchTag)]
        this.filterClazzStudents = [...this.clazzStudents]
        if(this.id) {
            const res = await this.callAttendanceById(this.id)
            if(res.status === 428) {
                this.openConfirmDialog('deleted')
                return;
            } else if(res.status === 417) {
                this.openConfirmDialog('attendanceOff')
                return;
            }
            this.original = res.data
            let files = []
            if (this.original.files && this.original.files.length > 0) {
              files = this.original.files.map(file => {
                return {
                  isNew: false,
                  ...file
                }
              })
            }
            this.attendance = {
                classId: this.original.classId,
                studentId: this.original.student.studentId,
                studentName: this.original.student.studentName,
                studentNo: this.original.student.studentNo,
                attendanceDate: this.$moment(new Date(this.original.attendanceDate)).valueOf(),
                attendanceType: this.original.attendanceType,
                attendanceConfirmType: this.original.attendanceConfirmType,
                reason: this.original.reason,
                memo: this.original.memo,
                files: files
            }
            this.selectedId = this.original.student.studentId
            this.attendanceDates[0] = this.attendance.attendanceDate
            this.validationChecked()
            this.reloadSubCountForMemberRole()
        } else {
            if(!this.isTeacher) {
                const res = await this.callClazzStudentsUsers({classId: this.curClassItem.currentId || this.classId})
                if(res.length > 0) {
                    this.attendance = {
                        ...this.attendance,
                        studentId: res[0].studentId,
                        studentName: res[0].studentName,
                        studentNo: res[0].studentNo
                    }
                    this.selectedId = res[0].studentId
                }
            }
            if (this.targetStudentId) {
                const target = this.clazzStudents.filter(o => o.studentId === this.targetStudentId)[0]
                if (target) {
                  this.attendance = {
                    ...this.attendance,
                    studentId: target.studentId,
                    studentName: target.studentName,
                    studentNo: target.studentNo
                  }
                  this.selectedId = target.studentId
                }
            }
        }
    },
    beforeDestroy() {
      eventBus.$off(`imageEditor-attendance-register-modal`)
    }
}
</script>

<style scoped lang="scss">
.hi-modal-common.normal-modal{
   ::v-deep {
       .modal__layer{
            top:30px;
            vertical-align: top;   
            max-width: 460px;
            .desc {
                font-size: 13px;
                font-weight: 400;
                line-height: 18px; /* 153.846% */
                letter-spacing: -0.2px;
                vertical-align: middle;
            }
        }
       @media screen and (max-width: 1024px) {
            .modal__layer{
                top:10px;
                transform: none;
            }
        }
    }
}
.attendance-popup-wrap {
    text-align: left;
    font-family: var(--font-body);
    font-style: normal;
    font-feature-settings: 'clig' off, 'liga' off;
    margin: 0px !important;
    
    .gray-box {
        padding-left: 15px;
        padding-top: 10px;
        padding-bottom: 12px;
        width: 100%;
        border-radius: 8px;
        background: #FAFAFA;
        color: #616161;
        font-size: 14px;
        font-weight: 400;
        line-height: 21px; /* 150% */
        letter-spacing: -0.2px;
        margin-bottom: 25px;
        word-break: break-all;
        white-space: pre-wrap;        
    }
    .gray-box a {
        color: #00f !important;
        text-decoration: underline !important;
    }
    .blue-box {
        padding:15px;
        width: 100%;
        border-radius: 4px;
        background: rgba(237, 241, 250, 0.60);
        color: var(--web-text-gray-09, #616161);
        font-size: 13px;
        font-weight: 400;
        line-height: 20px; /* 150% */
        letter-spacing: -0.2px;
        word-break: break-all;
    }
    .blue-box.bordered {
      border: solid 1px var(--primary);
      color: var(--primary);
    }
    .profile-detail{
        ul li{
            margin-bottom:30px;
            &:last-child{
                margin-bottom:0;
            }
            .label {
                color: var(--web-text-txt-02, #222);
                font-size: 13px;
                font-weight: 500;
                line-height: 26px; 
                letter-spacing: -0.2px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .input-wrap {
                margin-top: 4px;
                font-size: 15px;
                font-weight: 500;
                line-height: 23px; /* 153.333% */
                letter-spacing: -0.2px;
                &.last {
                    margin-bottom: 0px;
                }            
                input {
                    height: 44px;
                    width: 100%;
                    border-radius: 6px;
                    background-color: transparent;
                    padding-left: 15px;
                    border: 1px solid var(--web-border-br-01, #E0E0E0);
                    background: #FFF;
                    &.err {
                        border-color: #EC1F2D;
                    }
                    &.disabled {
                        color: #9E9E9E;
                        background: #EEEEEE;
                    }
                }
                .add-date {
                    margin-top:5px;
                    position: relative;
                    padding-left: 40px;
                    .date-wrap{
                        flex-grow: 1;
                    }
                    .delete-icon{
                        top: 0;
                        left: 0;
                        right: auto;
                        width: 35px;
                        height: 42px;              
                        background:url('~@/assets/img/icon/icon_delete_circle_fill.svg') no-repeat center;
                        opacity: 0.7;
                    }
                }
                .add-date + .txt-warning{
                    padding-top: 10px;
                    font-size: 13px;
                    font-weight: 400;
                    padding-left: 40px;
                }
                .date-wrap {
                    display: flex;
                    height: 44px;
                    border-radius: 6px;
                    background-color: transparent;
                    padding-left: 15px;
                    padding-right: 15px;
                    justify-content: space-between;
                    border: 1px solid var(--web-border-br-01, #E0E0E0);
                    background: #FFF;
                    align-items: center;
                    cursor: pointer;
                    .date {
                        color: var(--primary);
                    }
                    .calendar-icon-btn {
                        display: inline-block;
                        width: 24px;
                        height: 24px;
                        background: url('~@/assets/img/icon_calendar_24.png');
                        vertical-align: middle;
                    }
                    &.err {
                        border-color: #EC1F2D
                    }
                    &.disabled {
                        background: #EEEEEE;                        
                        .date {
                            color: #9E9E9E;
                        }
                    }
                }
                .hi-selectbox{
                    width: 100%;
                    height: 44px;
                    ::v-deep button.selected{height:100%;}
                    &.err {
                        ::v-deep button.selected{
                            border-color: #EC1F2D;
                        }
                    }
                }
            }
            textarea {
                margin-top: 4px;
                height: 84px;
                width: 100%;
                border-radius: 6px;
                background-color: transparent;
                padding-top: 10px;
                padding-left: 15px;
                padding-right: 15px;
                padding-bottom: 15px;
                border: 1px solid var(--web-border-br-01, #E0E0E0);
                background: #FFF;
                line-height: 18px;
                &.err {
                    border-color: #EC1F2D
                }
            }
            
            .option {
                display: flex;
                height: 45px;
                text-align: left;
                align-items: center;
                font-size: 15px;
                font-weight: 500;
                letter-spacing: -0.2px;
                &.confirm {
                    padding: 20px;
                    width: 100%;
                    display: inline-table;
                    border-radius: 6px;
                    border: 1px solid var(--app-state-coral, #FF6A6A);
                    background: rgba(255, 106, 106, 0.08);
                }
                .error {
                    color: #FF6A6A;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 500;
                    line-height: 21px;
                    letter-spacing: -0.2px;
                }
                .checkbox {
                   margin-right: 19px;            
                    &.confirm {
                        margin-top: 12px;
                    }
                    &:last-child {
                        margin-right: 0;
                    }
                }
                label {
                    font-size: 15px;
                    font-weight: 400;
                    line-height: 23px; /* 153.333% */
                    letter-spacing: -0.2px;    
                    margin: 0;
                }
            }
            
            .btn-input-file {
                height: 44px;
                width: 100%;
                border-radius: 6px;
                background-color: transparent;
                border: 1px solid var(--web-border-br-01, #E0E0E0);
                background: #FFF;
                color: var(--web-text-gray-09, #616161);
                font-size: 15px;
                font-weight: 500;
                line-height: 23px; /* 153.333% */
                letter-spacing: -0.2px;
            }
            .btn-input-file span{
                vertical-align: middle;
            }
            .btn-input-file .desc{
                color: var(--web-text-gray-07, #BDBDBD);
                line-height: 18px; /* 153.846% */
                letter-spacing: -0.2px;
                vertical-align: middle;
            }
            .file-hidden {
                display: none;
            }
            .file-icon {
                display: inline-block;
                width: 16px;
                height: 16px;
                background: url('~@/assets/img/icon/ic_hitalk_file_blue.png');
                margin-right: 2px;
                vertical-align: middle;
            }
            .file-text {
            vertical-align: middle;
            font-size: 14px !important;
            font-weight: 400 !important;
            line-height: 150% !important; /* 21px */
            letter-spacing: -0.2px;
            }
            .btn-input-file .upload-icon {
                display: inline-block;
                width: 24px;
                height: 24px;
                background: url('~@/assets/img/icon/ic_plus.png');
                margin-right: 2px;
            }
            
        }
    }
    .highlight-box {
        display: flex;
        padding: 12px 17px 12px 33px;
        width: 100%;
        border-radius: 8px;
        border: 1px solid var(--primary);
        background: rgba(71, 120, 222, 0.05);
        margin-bottom: 25px;
        .text {
            position: relative;
            color: var(--primary);
            font-size: 14px;
            font-weight: 400;
            line-height: 21px; /* 150% */
            letter-spacing: -0.2px;
            word-break: break-all;
            
        }
        .warning-icon {
            position: absolute;
            top: 3px;
            left: -20px;
            display: inline-block;
            width: 16px;
            height: 16px;
            background: url('~@/assets/img/icon/warning_circle.svg') no-repeat;
        }
    }

}

.btn-group button{    
    width: 140px;
    height: 44px;
}
.delete-icon {
    position:absolute;
    top:8px;
    right:7px;
    width:24px;
    height:24px;
    background:url('~@/assets/img/icon/ic_seach_keyword_delete.png') no-repeat;       
}
.modal-position {
    top: 30px;
    transform: translateX(-50%);
}
.err-text {
    color: #EC1F2D;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px; /* 150% */
    letter-spacing: -0.2px;
}
.auto-box {
    overflow: auto;
    position: absolute;
    width: 400px;
    height: 222px;
    align-items: center;
    border-radius: 6px;
    border: 1px solid var(--web-border-gray-05, #E0E0E0);
    background: #FFF;
    box-shadow: 0px 2px 25px 0px rgba(0, 0, 0, 0.16);
    z-index: 9;
}
.auto-box .item {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 50px;
    color: var(--web-text-txt-02, #222);
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: var(--font-body);
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: 23px; /* 153.333% */
    letter-spacing: -0.2px;
    border-bottom: 1px solid var(--web-border-br-03, #ECECEC);
    cursor: pointer;
}
.auto-box .item:hover {
    background: rgba(71, 120, 222, 0.08);
}
.auto-box .no-item {
    width: 100%;
    height: 50px;
    color: #616161;
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: var(--font-body);
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 23px; /* 153.333% */
    letter-spacing: -0.2px;
}
.auto-box .no-item span {
    display: flex;
    width: 100%;
    height: 50px;
    align-items: center;
    padding-left: 20px;
}
.item-ban {
    margin-right: 6px;
    width: 28px;
    min-width: 28px;
    height: 18px;
    border-radius: 20px;
    border: 1px solid var(--web-text-txt-04, #9E9E9E);
    background: #FFF;
    color: var(--web-text-txt-03, #616161);
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: var(--font-body);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px; /* 150% */
    letter-spacing: -0.2px;
}
.auto-box .item > span {
    display: flex;
    width: 100%;
    height: 50px;
    align-items: center;
    padding-left: 20px;
    flex-grow: 1;
}
.auto-box .item span.tag{
    max-width: 131px;
    min-width: max-content;
    width: auto;
    font-weight: 400;
    font-size: 12px;
    color: #888;
    justify-content: flex-end;
    padding: 0 12px;
}
.auto-box .item .selected {
    width: inherit;
    height: inherit;
    background: rgba(71, 120, 222, 0.08) !important;
}
.link-text .link-text-url{
    color: #00f !important;
    text-decoration: underline !important;
}
.modal.normal-modal .modal-close-icon {
    top: 20px;
    right: 20px;
}
.reason-length {
  color: #bdbdbd;
  /*display: inline-block;*/
  text-align: right;
  /*width: 100%;*/
  font-size: 12px;
  font-weight: 400;
  flex-grow: 1;
}
.desc-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
@media screen and (max-width: 640px) {
    .modal .modal-cont-wrap {
        position: absolute;
        left: 50%;
    }
}

label span.disabled {
    color: #9E9E9E;
}
</style>
