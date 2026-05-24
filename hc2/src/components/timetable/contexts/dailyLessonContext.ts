import { InitializeOption, Lesson } from "../core/types";

import TimetableContextBase from "./timetableContextBase";
import { EmbeddedListResponse, LessonHistoryItem, PageResponse, UpdatedLessonResponse } from "../common/types";

export default class LessonContext extends TimetableContextBase<Lesson> {
  private static _instance: LessonContext;

  public static getInstance(): LessonContext {
    if (!LessonContext._instance) {
      LessonContext._instance = new LessonContext();
    }

    return LessonContext._instance;
  }

  public constructor() {
    super();
    this._model = [] as Lesson[];
  }

  get lessons(): Lesson[] {
    return this._model;
  }

  set lessons(lessons: Lesson[]) {
    this._model = lessons;
  }

  get lessonsByTeacher(): Record<string, Lesson[]> {
    return this._model.reduce((acc: Record<string, Lesson[]>, lesson: Lesson) => {
      lesson.lessonTeachers?.forEach(({ teacherId }) => {
        if (!acc[teacherId]) {
          acc[teacherId] = [];
        }
        acc[teacherId].push(lesson);
      });
  
      return acc;
    }, {} as Record<string, Lesson[]>);
  }

  get firstPeriodOfConsecutiveLessons(): Record<string, number> {
    return this._model
      .filter((lesson: Lesson) => lesson.consecutiveGroupId)
      .reduce((acc: Record<string, number>, lesson: Lesson) => {
        if (!lesson.consecutiveGroupId) {
          return acc;
        }

        if (!acc[lesson.consecutiveGroupId] || acc[lesson.consecutiveGroupId] > lesson.period) {
          acc[lesson.consecutiveGroupId] = lesson.period;
        }

        return acc;
      }
      , {} as Record<string, number>);
  }

  get swapCourses() {
    const { swapTimetableBasicTemplateLessonsSwap } = this.api;
    return swapTimetableBasicTemplateLessonsSwap;
  }

  get tossCourses() {
    const { tossTimetableBasicTemplateLessonsToss } = this.api;
    return tossTimetableBasicTemplateLessonsToss;
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableBasicTemplateLessonsLessons } = this.api;
      const res = await getTimetableBasicTemplateLessonsLessons(this.timetableId);

      if (res.status !== 200) {
        throw new Error("Failed to fetch lessons");
      }

      const { lessons } = (res.data as EmbeddedListResponse<Lesson>)._embedded;
      this._model = lessons;

      this.notifyListeners();
    }
    catch (error) {
      console.error("Error fetching lessons:", error);
      throw new Error("Failed to fetch lessons");
    }
  }

  /**
   * 배치로 저장,
   */
  public async saveLessons(lessonsToAddOrUpdate: Lesson[], isReplaceAll: boolean = false): Promise<Lesson[]> {
    try {

      const { saveTimetableBasicTemplateLessonsLessons } = this.api;
      const res = await saveTimetableBasicTemplateLessonsLessons(this.timetableId, {
        isReplaceAll,
        lessons: lessonsToAddOrUpdate
      });

      if (res.status !== 200) {
        throw new Error("Failed to add or update lessons");
      }

      const { lessons } = (res.data as EmbeddedListResponse<Lesson>)._embedded;  
      
      if(!isReplaceAll) {
        this.patchLessonsToModel(lessons);
      }

      return lessons;
    }
    catch (error) {
      console.error("Error adding or updating lessons:", error);
      throw new Error("Failed to add or update lessons");
    }
  }

  public async patchLessonsToModel(lessons: Lesson[]): Promise<void> {
    if (!lessons || lessons.length === 0) {
      console.warn("No lessons provided for insertion or update");
      return;
    }

    // lessonkey: {classId}-{dayOfWeek}-{period}
    const lessonMap = this._model.reduce((acc: Record<string, Lesson>, lesson: Lesson) => {
      const lessonKey = `${lesson.classId}-${lesson.dayOfWeek}-${lesson.period}`;
      acc[lessonKey] = lesson;
      return acc;
    }, {});

    try {
      // const existingLessons = this._model;
      lessons.forEach((lesson: Lesson) => {
        const lessonKey = `${lesson.classId}-${lesson.dayOfWeek}-${lesson.period}`;
        
        if (!lessonMap[lessonKey]) {
          // console.log("!!!!!!!!! -> Adding new lesson:", lesson);
          this._model.push(lesson);
          return;
        }

        lessonMap[lessonKey] = { ...lesson };
        // console.log("!!!!!!!!! -> Updating existing lesson:", lessonMap[lessonKey], lesson);
      });
    }
    catch (error) {
      console.error("Error updating model by lessons:", error);
      throw new Error("Failed to update model by lessons");
    }
  }

  public async saveLessonsWithReplace(lessonsToAddOrUpdate: Lesson[]): Promise<Lesson[]> {
    const lessons = await this.saveLessons(lessonsToAddOrUpdate, true);
    this._model = [...lessons];

    // console.log("Lessons replaced successfully:", this._model);

    return lessons;
  }


  public async removeByIds(lessonIds: string[]): Promise<string[]> {
    try {
      const { deleteTimetableBasicTemplateLessonsLessons } = this.api;
      const res = await deleteTimetableBasicTemplateLessonsLessons(this.timetableId, { lessonIds });

      if (res.status !== 200) {
        throw new Error("Failed to remove lessons");
      }

      const { uUIDs } = (res.data as EmbeddedListResponse<string>)._embedded;
      
      if( uUIDs.length != lessonIds.length) {
        throw new Error("Not all lessons were removed successfully");
      }

      return uUIDs;
    }
    catch (error) {
      console.error("Error removing lessons:", error);
      throw new Error("Failed to remove lessons");
    }
  }

  public async initializeLessons(options: InitializeOption[]): Promise<void> {
    try {
      if( !options || options.length === 0) {
        console.warn("No options provided for lesson initialization");
        return;
      }

      const { initializeTimetableBasicTemplateLessonsInitialize } = this.api;
      const res = await initializeTimetableBasicTemplateLessonsInitialize(this.timetableId, { initializeOptions: options });

      if (res.status !== 200) {
        throw new Error("Failed to initialize lessons");
      }

      const { lessons } = (res.data as EmbeddedListResponse<Lesson>)._embedded;
      this._model = lessons;
    }
    catch (error) {
      console.error("Error initializing lessons:", error);
      throw new Error("Failed to initialize lessons");
    }
  }

  /**
   * 수정 이력 조회
   * - lesson-context의 데이터는 아니나 우선 현 위치에서 관리
   */
  public async getLessonHistories(): Promise<LessonHistoryItem[]> {
    try {
      // 500개 최대. 현재는 UI상 페이징이 없어 한번에 가져온다.
      const { getTimetableLessonHistoryLessonhistories } = this.api;
      const res = await getTimetableLessonHistoryLessonhistories(this.timetableId, { page: 0, size: 500 });

      if (res.status !== 200) {
        throw new Error("Failed to fetch lesson histories");
      }

      const { lessonHistories } = (res.data as PageResponse<LessonHistoryItem>)._embedded;
      return lessonHistories;
    }
    catch (error) {
      console.error("Error fetching lesson histories:", error);
      throw new Error("Failed to fetch lesson histories");
    }
  }

  public async restoreLessonHistory(lessonHistoryId: string): Promise<void> {
    try {
      const { restoreTimetableLessonHistoryLessonhistoriesLessonHistoryId } = this.api;
      const res = await restoreTimetableLessonHistoryLessonhistoriesLessonHistoryId(this.timetableId, lessonHistoryId);

      if (res.status !== 200) {
        throw new Error("Failed to restore lesson history");
      }
    }
    catch (error) {
      console.error("Error restoring lesson history:", error);
      throw new Error("Failed to restore lesson history");
    }
  }

  public async saveLessonHistories(memo: string): Promise<void> {
    try {
      if (!memo || memo.trim() === "") {
        throw new Error("Memo cannot be empty");
      }

      const { saveTimetableCurrentLessonHistoryLessonhistories } = this.api;
      const res = await saveTimetableCurrentLessonHistoryLessonhistories(this.timetableId, { memo });

      if (res.status !== 200) {
        throw new Error("Failed to fetch lesson histories");
      }
    }
    catch (error) {
      console.error("Error fetching lesson histories:", error);
      throw new Error("Failed to fetch lesson histories");
    }
  }

  public async updateTimetableBasicTemplateLessons(lessonsToAdd: Lesson[], lessonIdsToDelete: string[], isReplaceAll: boolean = false): Promise<UpdatedLessonResponse> {
    try {
      const { updateTimetableBasicTemplateLessonsBatchupdate } = this.api;
      const res = await updateTimetableBasicTemplateLessonsBatchupdate(this.timetableId, {
        lessonsToAdd,
        lessonIdsToDelete,
        isReplaceAll
      });

      if (res.status !== 200) {
        throw new Error("Failed to update timetable basic template lessons");
      }

      const { lessons, deletedLessonIds } = (res.data as UpdatedLessonResponse) || {};

      if(!isReplaceAll) {
        // console.log(lessons, "Lessons to patch to model");
        await this.patchLessonsToModel(lessons);
      }

      return { lessons, deletedLessonIds };
    } catch (error) {
      console.error("Error updating timetable basic template lessons:", error);
      throw new Error("Failed to update timetable basic template lessons");
    }
  }
}