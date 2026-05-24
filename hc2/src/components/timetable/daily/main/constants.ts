import { TimetableDailyLessonChangeType } from "../../core/types";

// 학급일정 변경 타입 리스트
export const classScheduleTypeMap = {
  [TimetableDailyLessonChangeType.Event]: '행사처리',
  [TimetableDailyLessonChangeType.Duplication]: '복사',
  // [TimetableDailyLessonChangeType.Reassignment]: '이동',
  [TimetableDailyLessonChangeType.Removal]: '삭제',
  // [TimetableDailyLessonChangeType.InternalSwap]: '교환',
};


// 수업 변경 타입 맵
export const lessonChangeTypeMap = {
  [TimetableDailyLessonChangeType.Exchange]: '수업 교체',
  [TimetableDailyLessonChangeType.Adjustment]: '결, 보강',
  [TimetableDailyLessonChangeType.Replacement]: '수업 변경',
  [TimetableDailyLessonChangeType.Addition]: '수업 추가',
  [TimetableDailyLessonChangeType.Combination]: '합반 배정',
  [TimetableDailyLessonChangeType.Multiple]: '복수교사 배정',
};

export enum ClassScheduleChangeType {
  Event = 'EVENT',
  Reassignment = 'REASSIGNMENT',
  Duplication = 'DUPLICATION',
  Removal = 'REMOVAL',
  Swap = 'SWAP'
};

export enum ClassScheduleErrorType {
  concurrentCourseError = 'concurrentCourseError',
  requestedClassesEmpty = 'requestedClassesEmpty',
  eventNameEmpty = 'eventNameEmpty',
  targetClassIdEmpty = 'targetClassIdEmpty',
  targetDateEmpty = 'targetDateEmpty',
  targetStartPeriodEmpty = 'targetStartPeriodEmpty',
  basicLessonNotFound = 'basicLessonNotFound',
  hasChangedBefore = 'hasChangedBefore',
  specialtyRoomMaxClassError = 'specialtyRoomMaxClassError',
  classScheduleChangeError = 'classScheduleChangeError',
  conflictingLessonExists = 'conflictingLessonExists',
}


// === 에러 메세지 매핑 ===
export const errMsgMapByType = {
  [TimetableDailyLessonChangeType.Event]: {
    [ClassScheduleErrorType.eventNameEmpty]: '행사명을 입력해주세요.',
    [ClassScheduleErrorType.concurrentCourseError]: '동시 수업이 있어 행사 처리가 불가합니다.',
    [ClassScheduleErrorType.requestedClassesEmpty]: '요청한 학급이 존재하지 않습니다.',
  },
  [TimetableDailyLessonChangeType.Duplication]: {
    [ClassScheduleErrorType.hasChangedBefore]: '이미 변경된 수업은 재변경이 불가합니다.',
    [ClassScheduleErrorType.concurrentCourseError]: '동시 수업이 있어 복사가 불가합니다.',
    [ClassScheduleErrorType.specialtyRoomMaxClassError]: '특별실 배정 가능한 학급수를 초과하여 복사가 불가합니다.',
    [ClassScheduleErrorType.requestedClassesEmpty]: '요청한 학급이 존재하지 않습니다.',
    [ClassScheduleErrorType.targetClassIdEmpty]: '변경 대상 학급을 선택해주세요.',
    [ClassScheduleErrorType.targetDateEmpty]: '변경 일자를 선택해주세요.',
    [ClassScheduleErrorType.targetStartPeriodEmpty]: '변경 시작 교시를 선택해주세요.',
    [ClassScheduleErrorType.conflictingLessonExists]: '동일 교시에 학급 또는 교사가 중복으로 배정되어 복사할 수 없습니다. 붙여넣기 할 날짜의 수업을 삭제 후 다시 시도해 주세요.',

  },
  [TimetableDailyLessonChangeType.Removal]: {
    [ClassScheduleErrorType.concurrentCourseError]: '동시 수업이 있어 삭제가 불가합니다.',
    [ClassScheduleErrorType.requestedClassesEmpty]: '요청한 학급이 존재하지 않습니다.',
  }
};

export enum RecoveryErrorType {
  ClassScheduleChangeError = 'classScheduleChangeError',
  RecoveryConflictLessonTeacher = 'recoveryConflictLessonTeacher',
}

export const RecoveryErrMsgMap = {
  [RecoveryErrorType.ClassScheduleChangeError]: '해당 시간표에 학급 일정 변경 이력이 있어 원래 시간표로 복원할 수 없습니다. 복원이 필요한 경우, 현재 수업을 삭제한 후 복사하여 다시 추가해 주세요',
  [RecoveryErrorType.RecoveryConflictLessonTeacher]: '동일 교사의 수업이 이미 존재합니다. 현재 수업을 삭제한 후 복사하여 다시 추가해 주세요',
}