import Vue from "vue";
import { TimetableProgress, TimetableStatus } from "../core/types";
import TimetableContextBase from "./timetable-context-base";
import { TimetableStatusIndexMap } from "../common/constants";

const TIMETABLE_ACCESSIBLE_STATUS_MAP: Record<TimetableStatus, TimetableStatus[]> = {
  [TimetableStatus.Generate] : [ TimetableStatus.WeeklyPeriod, TimetableStatus.CourseBase, TimetableStatus.Teacher, TimetableStatus.LessonConfig, TimetableStatus.AdditionalWork, TimetableStatus.Generate, TimetableStatus.Finish ],
  [TimetableStatus.AdditionalWork] : [ TimetableStatus.WeeklyPeriod, TimetableStatus.CourseBase, TimetableStatus.Teacher, TimetableStatus.LessonConfig, TimetableStatus.AdditionalWork ],
  [TimetableStatus.LessonConfig] : [ TimetableStatus.WeeklyPeriod, TimetableStatus.CourseBase, TimetableStatus.Teacher, TimetableStatus.LessonConfig ],
  [TimetableStatus.Teacher] : [ TimetableStatus.WeeklyPeriod, TimetableStatus.CourseBase, TimetableStatus.Teacher ],
  [TimetableStatus.CourseBase] : [ TimetableStatus.WeeklyPeriod, TimetableStatus.CourseBase ],
  [TimetableStatus.WeeklyPeriod] : [ TimetableStatus.WeeklyPeriod ],
  [TimetableStatus.Init] : [],
  [TimetableStatus.Edit] : [],
  [TimetableStatus.Finish] : [ TimetableStatus.Generate, TimetableStatus.Finish ],
};

export default class TimetableProgressContext extends TimetableContextBase<TimetableProgress> {
  private static _instance: TimetableProgressContext;

  public static getInstance(): TimetableProgressContext {
    if (!this._instance) {
      this._instance = new TimetableProgressContext();
    }
    return this._instance;
  }

  private constructor() {
    super();

    this._model = Vue.observable<TimetableProgress>({
      status: TimetableStatus.Init,
      assignedCount: 0,
      remainingCount: 0,
      isCompletable: false,
      timetableCoreTick: 0,
      schoolId: '',
      timetableName: '',
      operationStartDate: 0,
      operationEndDate: 0,
      assignedClassLessonCount: 0,
      templateId: '',
      templateName: '',
      templateCount: 0,
    });
  }

  get tick(): number {
    return this._model.timetableCoreTick;
  }

  set remainingCount(count: number) {
    this._model.remainingCount = count;
    this.checkCompletable();
  }

  get remainingCount(): number {
    return this._model.remainingCount;
  }

  set assignedCount(count: number) {
    this._model.assignedCount = count;
    this.checkCompletable();
  }

  get assignedCount(): number {
    return this._model.assignedCount;
  }

  get isCompletable(): boolean {
    return this._model.isCompletable;
  }

  get status(): TimetableStatus {
    return this._model.status;
  }

  get isFinished() : boolean {
    return this._model.status === TimetableStatus.Finish;
  }

  get schoolId(): string {
    return this._model.schoolId;
  }

  get timetableName(): string {
    return this._model.timetableName;
  }

  get operationStartDate(): number {
    return this._model.operationStartDate;
  }

  get operationEndDate(): number {
    return this._model.operationEndDate;
  }

  get assignedClassLessonCount(): number {
    return this._model.assignedClassLessonCount || 0;
  }

  get templateCount(): number {
    return this._model.templateCount || 0;
  }

  get templateId(): string {
    const suTemplateId = super.templateId;
    return suTemplateId ? suTemplateId : this._model.templateId;
  }

  get templateName(): string {
    return this._model.templateName || '';
  }

  get isFirstTemplate(): boolean {
    return this.templateCount === 1;
  }

  public increaseTick(): void {
    // Timetable Core의 변경을 알리기 위해 tick 값을 증가시킨다.
    this._model.timetableCoreTick += 1;
  }

  public checkAccessible(status : TimetableStatus) : boolean {
    /* 2026.01.19, 이전 단계 이동 제한 해제
    const accessibleStatuses = TIMETABLE_ACCESSIBLE_STATUS_MAP[this._model.status as TimetableStatus] as TimetableStatus[];
    return accessibleStatuses.includes(status);
    */
    return true;
  }

  private checkCompletable(): void {
    this._model.isCompletable = this._model.assignedCount > 0 && this._model.remainingCount === 0;
  }

  public async fetch(): Promise<void> {
    try {
      console.log('Fetching timetable progress info...', this.timetableId, this.templateId);

      const { getTimetableProgressInfoProgressinfo } = this.api;
      const res = await getTimetableProgressInfoProgressinfo(this.timetableId, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to fetch timetable progress');
      }

      const { status, schoolId, timetableName, operationStartDate, operationEndDate, assignedClassLessonCount, templateId } = res.data;
      this._model.status = status || TimetableStatus.Init;
      this._model.schoolId = schoolId || '';
      this._model.timetableName = timetableName || '';
      this._model.operationStartDate = operationStartDate || 0;
      this._model.operationEndDate = operationEndDate || 0;
      this._model.assignedClassLessonCount = assignedClassLessonCount || 0;
      this._model.templateId = templateId || '';
      this._model.templateName = res.data.templateName || '';
      this._model.templateCount = res.data.templateCount || 0;
    }
    catch (error) {
      console.error('Error fetching timetable progress:', error);
      throw new Error('Failed to fetch timetable progress');
    }
  }

  public async updateStatus(status: TimetableStatus): Promise<boolean> {
    try {
      const { patchTimetableStatusStatusStatus } = this.api;
      const res = await patchTimetableStatusStatusStatus(this.timetableId, status, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to update timetable progress status');
      }

      this._model.status = (res.data.status || TimetableStatus.Init) as TimetableStatus;

      const resultIndex = TimetableStatusIndexMap[this._model.status as TimetableStatus];
      const requestedIndex = TimetableStatusIndexMap[status];

      return resultIndex >= requestedIndex;
    }
    catch (error) {
      console.error('Error updating timetable progress status:', error);
      throw new Error('Failed to update timetable progress status');
    }
  }
}