import TimetableContextBase from "./timetableContextBase";
import { TimetableOverview, TimetableStatus } from "../core/types";

export default class TimetableOverviewContext extends TimetableContextBase<TimetableOverview> {
  private static _instance: TimetableOverviewContext;
  
  public static getInstance(): TimetableOverviewContext {
    if (!TimetableOverviewContext._instance) {
      TimetableOverviewContext._instance = new TimetableOverviewContext();
    }

    return TimetableOverviewContext._instance;
  }

  public constructor() {
    super();

    this._model = {
      timetableId: this.timetableId,
      timetableStatus: TimetableStatus.Init,
      templateCount: 0,
      latestTemplateId: undefined,
      latestTemplateStatus: undefined,
    } as TimetableOverview;
  }

  get overview(): TimetableOverview {
    return this._model;
  }

  get templateCount(): number {
    return this._model.templateCount;
  }

  get latestTemplateId(): string | undefined {
    return this._model.latestTemplateId;
  }
  
  get latestTemplateStatus(): TimetableStatus | undefined {
    return this._model.latestTemplateStatus;
  }

  get timetableStatus(): TimetableStatus {
    return this._model.timetableStatus;
  }

  public async fetch(): Promise<void> {
    try {
      if(!this.timetableId) {
        return;
      }

      const { getDailyTimetableOverviewTimetableoverview } = this.api;
      const res = await getDailyTimetableOverviewTimetableoverview(this.timetableId);

      if (res.status !== 200) {
        throw new Error("Failed to fetch timetable overview");
      }

      this._model = res.data as TimetableOverview;

      this.notifyListeners();

    }
    catch (error) {
      console.error("Error fetching timetable overview:", error);
      throw error;
    }
  }
  
}