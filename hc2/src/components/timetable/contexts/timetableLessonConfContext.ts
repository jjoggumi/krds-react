import { LessonConf } from "../core/types";
import { EmbeddedListResponse } from "../common/types";
import TimetableContextBase from "./timetableContextBase";

export default class LessonConfContext extends TimetableContextBase<LessonConf> {
  private static _instance: LessonConfContext;

  public static getInstance(): LessonConfContext {
    if (!LessonConfContext._instance) {
      LessonConfContext._instance = new LessonConfContext();
    }
    return LessonConfContext._instance;
  }

  private constructor() {
    super();

    this._model = [] as LessonConf[];
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableLessonConfsLessonconfs } = this.api;
      const res = await getTimetableLessonConfsLessonconfs(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch lesson-confs');
      }

      const { timetableLessonConfs } = (res.data as EmbeddedListResponse<LessonConf>)._embedded;
      this._model = timetableLessonConfs;

      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching lesson-confs:', error);
      throw new Error('Failed to fetch lesson-confs');
    }
  }

  get lessonConfs(): LessonConf[] {
    return this._model;
  }

  get lessonConfMap(): Record<string, LessonConf> {
    return this._model.reduce((acc: Record<string, LessonConf>, conf: LessonConf) => {
      acc[conf.lessonConfId] = conf;
      return acc;
    }, {} as Record<string, LessonConf>) || ({} as Record<string, LessonConf>);
  }

  get lessonConfsMapByTeacher(): Record<string, LessonConf[]> {
    return this._model.reduce((acc: Record<string, LessonConf[]>, conf: LessonConf) => {
      const key = conf.teacherId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(conf);
      return acc;
    }, {} as Record<string, LessonConf[]>) || ({} as Record<string, LessonConf[]>);
  }

  get lessonConfMapByMultipleTeacher(): Record<string, LessonConf[]> {
    return this._model.reduce((acc: Record<string, LessonConf[]>, conf: LessonConf) => {
      const key = `${conf.classId}_${conf.courseId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(conf);
      return acc;
    }, {} as Record<string, LessonConf[]>) || ({} as Record<string, LessonConf[]>)
  }
}