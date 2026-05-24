import {TeacherCourseBase} from "../core/types";
import TimetableContextBase from "./timetableContextBase";
import {EmbeddedListResponse} from "../common/types";

export default class TeacherCourseBaseContext extends TimetableContextBase<TeacherCourseBase> {
  private static instance: TeacherCourseBaseContext;

  public static getInstance(): TeacherCourseBaseContext {
    if (!TeacherCourseBaseContext.instance) {
      TeacherCourseBaseContext.instance = new TeacherCourseBaseContext();
    }
    return TeacherCourseBaseContext.instance;
  }

  private constructor() {
    super();

    this._model = [] as TeacherCourseBase[];
  }

  get teacherCourseBases(): TeacherCourseBase[] {
    return this._model;
  }

  get teacherCourseBaseMap(): Record<string, TeacherCourseBase[]> {
    return this._model?.reduce((acc: Record<string, TeacherCourseBase[]>, teacherCourseBase: TeacherCourseBase) => {
      if (!acc[teacherCourseBase.teacherId]) {
        acc[teacherCourseBase.teacherId] = [];
      }
      acc[teacherCourseBase.teacherId].push(teacherCourseBase);
      acc[teacherCourseBase.teacherId].sort((a, b) => a.sortNo - b.sortNo);
      return acc;
    }, {} as Record<string, TeacherCourseBase[]>) || ({} as Record<string, TeacherCourseBase[]>);
  }

  public replace(teacherCourseBases: TeacherCourseBase[]): void {
    teacherCourseBases.forEach(conf => {
      const idx = this._model
        .findIndex((tc: TeacherCourseBase) => tc.teacherId === conf.teacherId && tc.courseBaseId === conf.courseBaseId);

      if (idx !== -1) {
        this._model.splice(idx, 1, conf);
      } else {
        this._model.push(conf);
      }
    })
  }

  public async fetch(): Promise<void> {
    try {
      const { getTeacherCourseBaseConfsAllByTimetableIdTeachercoursebaseconfs } = this.api;
      const res = await getTeacherCourseBaseConfsAllByTimetableIdTeachercoursebaseconfs(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { timetableTeacherCourseBaseConfs } = (res.data as EmbeddedListResponse<TeacherCourseBase>)._embedded;
      this._model = timetableTeacherCourseBaseConfs;

      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching teacherCourseBase:', error);
      throw new Error('Failed to fetch teacherCourseBase');
    }
  }  

  public async delete(teacherCourseBase: TeacherCourseBase): Promise<void> {
    // 이미 등록된 과목인지 확인한다.
    const isExistCourse = this.teacherCourseBases.some((tc: TeacherCourseBase) => {
      return tc.teacherId === teacherCourseBase.teacherId && tc.courseBaseId === teacherCourseBase.courseBaseId;
    });

    if (!isExistCourse) {
      return;
    }

    try {
      const { removeCourseBaseFromTeacherCoursebaseCourseBaseId } = this.api;
      const res = await removeCourseBaseFromTeacherCoursebaseCourseBaseId(
        this.timetableId,
        teacherCourseBase.teacherId,
        teacherCourseBase.courseBaseId
      );

      if (res.status !== 200) {
        throw new Error('Failed to delete teacher course');
      }
      // console.log('Teacher course deleted successfully:', res.data);      
    }
    catch (error) {
      console.error('Error deleting teacher course:', error);
      throw new Error('Failed to delete teacher course');
    }
  }

  public async deleteCourseBaseFromTeacher(teacherId: string, courseBaseId: string): Promise<void> {
    try {
      await this.delete({
        teacherId: teacherId,
        courseBaseId: courseBaseId,
      } as TeacherCourseBase);
     
      // 삭제 후 teacherCourses에서 제거
      this._model = this._model.filter((tc: TeacherCourseBase) => {
        return !(tc.teacherId === teacherId && tc.courseBaseId === courseBaseId);
      });

      // 해당 교사 과목 재정렬: 실제 DB의 데이터는 API를 통해 관리
      this._model
        .filter((tc: TeacherCourseBase) => tc.teacherId === teacherId)
        .sort((a: TeacherCourseBase, b: TeacherCourseBase) => {
          return a.sortNo - b.sortNo;
        })
        .map((tc: TeacherCourseBase, index: number) => {
          tc.sortNo = index + 1; // 1부터 시작하도록
          return tc;
        });
    }
    catch (error) {
      console.error('Error deleting course from teacher:', error);
      throw new Error('Failed to delete course from teacher');
    }    
  }

  public async add(teacherCourseBase: TeacherCourseBase): Promise<TeacherCourseBase> {
    // 이미 등록된 과목인지 확인한다.
    const isExistCourse = this.teacherCourseBases.some((tc: TeacherCourseBase) => {
      return tc.teacherId === teacherCourseBase.teacherId && tc.courseBaseId === teacherCourseBase.courseBaseId;
    });

    if (isExistCourse) {
      return teacherCourseBase;
    }

    try {
      const { addCourseBaseToTeacherCoursebaseCourseBaseId } = this.api;
      const res = await addCourseBaseToTeacherCoursebaseCourseBaseId(
        this.timetableId,
        teacherCourseBase.teacherId,
        teacherCourseBase.courseBaseId
      );

      if (res.status !== 200) {
        throw new Error('Failed to add teacher course');
      }

      return res.data as TeacherCourseBase;
    }
    catch (error) {
      console.error('Error adding teacher course:', error);
      throw new Error('Failed to add teacher course');
    }
  }
  
  public async addCourseBaseToTeacher (teacherId: string, courseBaseId: string) {
    // 이미 등록된 과목인지 확인한다.
    const isExistCourse = this.teacherCourseBases.some((tc: TeacherCourseBase) => {
      return tc.teacherId === teacherId && tc.courseBaseId === courseBaseId;
    });

    if (isExistCourse) {
      return {
        teacherId,
        courseBaseId,
      } as TeacherCourseBase
    }

    try {
      const addedTeacherCourseBase = await this.add({
        teacherId: teacherId,
        courseBaseId: courseBaseId,
      } as TeacherCourseBase);

      this.teacherCourseBases.push(addedTeacherCourseBase);

      this.notifyListeners();

      return addedTeacherCourseBase;
    }
    catch (error) {
      throw new Error('Failed to add course to teacher');
    }
  }
  
}