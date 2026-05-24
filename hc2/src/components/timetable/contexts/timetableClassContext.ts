import { Class } from "../core/types";

import TimetableContextBase from "./timetableContextBase";
import { EmbeddedListResponse } from "../common/types";

export default class TimetableClassContext extends TimetableContextBase<Class> {
  private static _instance: TimetableClassContext;
  
  public static getInstance(): TimetableClassContext {
    if (!TimetableClassContext._instance) {
      TimetableClassContext._instance = new TimetableClassContext();
    }

    return TimetableClassContext._instance;
  }

  public constructor() {
    super();

    this._model = [] as Class[];

    /*
    this._model = Vue.observable({
      classes: [] as Class[],
    });
    */
  }

  get classes(): Class[] {
    return this._model;
  }

  get classMap(): Record<string, Class> {
    return this.classes?.reduce((acc, classItem) => {
      acc[classItem.classId] = classItem;
      return acc;
    }
    , {} as Record<string, Class>) || ({} as Record<string, Class>);
  }

  get classesByGrade(): Record<number, Class[]> {
    return this.classes.reduce((acc, classItem) => {
      if(classItem.isVirtual) {
        return acc;
      }

      const grade = classItem.grade;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(classItem);

      acc[grade].sort((a, b) => {
          return a.classNumber - b.classNumber;
      });

      return acc;
    }, {} as Record<number, Class[]>) || ({} as Record<number, Class[]>);
  }

  get virtualClassesByGrade(): Record<number, Class[]> {
    return this.classes?.reduce((acc, classItem) => {
      if(!classItem.isVirtual) {
        return acc;
      }
      const grade = classItem.grade;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(classItem);
      acc[grade].sort((a, b) => {
          return a.classNumber - b.classNumber;
      });
      return acc;
    }, {} as Record<number, Class[]>) || ({} as Record<number, Class[]>);
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableClassesClasses } = this.api;
      const res = await getTimetableClassesClasses(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { classes } = (res.data as EmbeddedListResponse<Class>)._embedded;

      // 학년/반 순으로 정렬
      this._model = classes.sort((a: Class, b: Class) => {
        return a.grade - b.grade || a.classNumber - b.classNumber;
      });

      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes');
    }
  }
  
}