import isEqual from 'lodash/isEqual';
import { TimetableConfig, TimetableGrade, TimetablePeriod, TimetableStructure } from "../core/types";
import TimetableContextBase from "./timetableContextBase";
import { ArrayUtils } from "../common/utils";
import { DailyTimeSchedule } from "../common/types";

export interface TimetableCreateRequest {
  maxGrade: number,
  classDays: string,
  startPeriod: number,
  maxPeriod: number,
  maxClassCountList: Array<number>,
  maxVirtualClassCountList: Array<number>,
  gradeNames: Array<string>,
  classNames: Array<Array<string>>,
  virtualClassNames: Array<Array<string>>,
  templateName?: string,
}

export const TIMETABLE_CONFIG_INITIAL_STATE = {
  maxGrade: 0,
  classDays: [],
  maxPeriod: 0,
  startPeriod: 0,
  operationStartDate: null,
  operationEndDate: null,
  grades: [],
} as TimetableConfig;

export function getDefaultGrades(): TimetableGrade[] {
  return Array.from({ length: 3 }, (_, i) => ({
    grade: i + 1,
    gradeName: `${i + 1}학년`,
    maxClassCount: 1,
    maxVirtualClassCount: 0,
    timetableStructure: {} as TimetableStructure
  })) as TimetableGrade[];
}

export default class TimetableGradeContext extends TimetableContextBase<TimetableConfig> {
  private static _instance: TimetableGradeContext;

  public static getInstance(): TimetableGradeContext {
    if (!TimetableGradeContext._instance) {
      TimetableGradeContext._instance = new TimetableGradeContext();
    }

    return TimetableGradeContext._instance;
  }

  public constructor() {
    super();

    this._model = {
        ...TIMETABLE_CONFIG_INITIAL_STATE,
      } as TimetableConfig;
  }

  public async fetch(): Promise<void> {
    try {
      if(!this.timetableId) {
        return;
      }

      const { getBasicInfoBasicinfo } = this.api;
      const res = await getBasicInfoBasicinfo(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch timetable config');
      }

      this._model = this.convertDataToTimetableConfig(res.data);

      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching timetable config:', error);
      throw new Error('Failed to fetch timetable config');
    }
  }

  get timetableConfig(): TimetableConfig {
    return this._model;
  }

  get gradeMap(): Record<number, TimetableGrade> {
    return this._model.grades.reduce((acc: Record<number, TimetableGrade>, grade: TimetableGrade) => {
      acc[grade.grade] = grade;
      return acc;
    }, {} as Record<number, TimetableGrade>) || ({} as Record<number, TimetableGrade>);
  }

  get gradeTotalPeriodMap(): Record<number, number> {
    // 학년별 총 시수: ((요일 * 최대시수) - 수업없음 시수)
    const { classDays, maxPeriod, grades } = this._model;

    return grades.reduce((acc: Record<number, number>, grd: TimetableGrade) => {
      // classDays 의 숫자를 더한다
      const classDayCount = classDays.reduce((acc: number, day: number) => acc + day, 0);
      const allPeriod = classDayCount * maxPeriod;
      const gradeFreePeriodCount =
        grd.timetableStructure && grd.timetableStructure.freePeriods ?
          grd.timetableStructure.freePeriods.length : 0;
      acc[grd.grade] = allPeriod - gradeFreePeriodCount;
      return acc;
    }, {} as Record<number, number>);
  }

  get gradeNameMap(): Record<number, string> {
    return this._model.grades.reduce((acc: Record<number, string>, grade: TimetableGrade) => {
        acc[grade.grade] = grade.gradeName || `${grade.grade} -`;
        return acc;
      }, {} as Record<number, string>) || ({} as Record<number, string>);
  }

  get isCreateMode(): boolean {
    return !this._model.maxGrade
  }

  public async updateBeforeLunchPeriodOfGrade(grade: number, beforeLunchPeriod: number): Promise<void> {
    // console.log("updateBeforeLunchPeriodOfGrade --->", grade, beforeLunchPeriod);

    try {
      const { updateTimetableGradeBeforeLunchPeriodLunchtime } = this.api;
      const res = await updateTimetableGradeBeforeLunchPeriodLunchtime(this.timetableId, grade, { beforeLunchPeriod });

      if (res.status !== 200) {
        throw new Error('Failed to update free periods');
      }

      // Update the local model after successful API call
      const timetableConfig = this._model as TimetableConfig;
      const targetGrade = timetableConfig.grades.find(g => g.grade === grade) as TimetableGrade;
      if (targetGrade && targetGrade.timetableStructure) {
        targetGrade.timetableStructure.beforeLunchPeriod = beforeLunchPeriod;
      }
    }
    catch (error) {
      console.error('Error updating free periods:', error);
      throw new Error('Failed to update free periods');
    }
  }

  public async updateFreePeriodsOfGrade(grade: number, freePeriods: TimetablePeriod[]): Promise<void> {
    // console.log("updateFreePeriodsOfGrade --->", grade, freePeriods);

    try {
      const { updateTimetableGradeFreePeriodsFreeperiods } = this.api;
      const res = await updateTimetableGradeFreePeriodsFreeperiods(this.timetableId, grade, { freePeriods });

      if (res.status !== 200) {
        throw new Error('Failed to update free periods');
      }

      // Update the local model after successful API call
      const timetableConfig = this._model as TimetableConfig;
      const targetGrade = timetableConfig.grades.find(g => g.grade === grade) as TimetableGrade;
      if (targetGrade && targetGrade.timetableStructure) {
        targetGrade.timetableStructure.freePeriods = freePeriods;
      }
    }
    catch (error) {
      console.error('Error updating free periods:', error);
      throw new Error('Failed to update free periods');
    }
  }

   public async removeFreePeriodOfGrade (grade: number, period: TimetablePeriod): Promise<void> {
    // console.log("removeFreePeriodOfGrade --->", grade, period);
    const timetableConfig = this._model as TimetableConfig;
    const targetGrade = timetableConfig.grades.find(g => g.grade === grade) as TimetableGrade;

    if (!targetGrade || !targetGrade.timetableStructure) {
      return;
    }
    
    const freePeriods = targetGrade.timetableStructure.freePeriods || [];
    const updatedFreePeriods = freePeriods.filter(p => p.period !== period.period || p.dayOfWeek !== period.dayOfWeek);
    
    await this.updateFreePeriodsOfGrade(grade, updatedFreePeriods);    
  }

  public async updateDailyTimeSchedule(dailyTimeSchedule: DailyTimeSchedule): Promise<void> {
    try {
      const { updateDailyTimeScheduleDailytimeschedule } = this.api;
      const res = await updateDailyTimeScheduleDailytimeschedule(this.timetableId, dailyTimeSchedule);

      if (res.status !== 200) {
        throw new Error('Failed to update daily time schedule');
      }

      // Update the local model after successful API call
      const {
        startPeriod,
        startTime,
        classDuration,
        breakDuration,
        lunchDuration,
        isDisplayDailyScheduleTime,
        isDisplayLunchTime
      } = res.data;

      this._model.startPeriod = startPeriod;
      this._model.isDisplayDailyScheduleTime = isDisplayDailyScheduleTime;
      this._model.isDisplayLunchTime = isDisplayLunchTime;

      this._model.grades.map((grade: TimetableGrade) => {
        if (grade.timetableStructure) {
          grade.timetableStructure.startTime = startTime;
          grade.timetableStructure.classDuration = classDuration;
          grade.timetableStructure.breakDuration = breakDuration;
          grade.timetableStructure.lunchDuration = lunchDuration;
        }
      });
    }
    catch (error) {
      console.error('Error updating daily time schedule:', error);
      throw new Error('Failed to update daily time schedule');
    }
  }

  public updateClassDays(): void {
    // console.log("updateClassDays --->", this._model.classDays);
  }

  public updateMaxPeriod(): void {
    // console.log("updateMaxPeriod --->", this._model.maxPeriod);
  }

  public updateStartPeriod(): void {
    // console.log("updateStartPeriod --->", this._model.startPeriod);
  }

  public updateMaxGrade(): void {
    // console.log("updateMaxGrade --->", this._model.maxGrade);
  }

  public hasChanged(editedData: TimetableConfig): boolean {
    return !isEqual(editedData, this._model);
  }

  private convertDataToTimetableConfig(data: any): TimetableConfig | null {
    if (!data) {
      return null;
    }

    const {
      classDuration,
      breakDuration,
      lunchDuration,
      maxGrade,
      maxPeriod,
      startPeriod,
      startTime,
      isDisplayDailyScheduleTime,
      isDisplayLunchTime,
      operationStartDate,
      operationEndDate,
    } = data;

    const strClassDays = !data.classDays || data.classDays.length < 7 ?
      '0111110' : data.classDays;
    const classDays = ArrayUtils.stringToDigitArray(strClassDays);

    let grades = !Array.isArray(data.grades) || data.grades.length === 0 ? [] : data.grades;

    grades = grades.map((item: any) => {
      const {
        grade,
        gradeName,
        maxClassCount,
        maxVirtualClassCount,
        beforeLunchPeriod,
        freePeriods
      } = item;

      return {
        grade,
        gradeName,
        maxClassCount,
        maxVirtualClassCount,
        timetableStructure: {
          classDuration,
          breakDuration,
          lunchDuration,
          beforeLunchPeriod,
          freePeriods,
          startTime,
        } as TimetableStructure
      } as TimetableGrade;
    });

    return {
      maxGrade,
      classDays,
      maxPeriod,
      startPeriod,
      isDisplayDailyScheduleTime,
      isDisplayLunchTime,
      operationStartDate,
      operationEndDate,
      grades,
    } as TimetableConfig;
  }

  public async createTimetableConfig(request: TimetableCreateRequest): Promise<void> {
    try {
      const { createTimetableConfigTimetablesTimetableId } = this.api;
      const res = await createTimetableConfigTimetablesTimetableId(this.timetableId, request);
      if (res.status !== 200) {
        throw new Error('Failed to create timetable config');
      }

      this._model = this.convertDataToTimetableConfig(res.data);
    } catch (error) {
      console.error('Error creating timetable config:', error);
      throw new Error('Failed to create timetable config');
    }
  }

  public async updateTimetableConfig(request: TimetableCreateRequest): Promise<void> {
    // console.log("here")
    try {
      const { updateTimetableConfigTimetablesTimetableId } = this.api;
      const res = await updateTimetableConfigTimetablesTimetableId(this.timetableId, request);
      if (res.status !== 200) {
        throw new Error('Failed to update timetable config');
      }

      this._model = this.convertDataToTimetableConfig(res.data);
    } catch (error) {
      console.error('Error updating timetable config:', error);
      throw new Error('Failed to update timetable config');
    }
  }
}