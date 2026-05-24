import {TeacherCourse} from "../core/types";
import TimetableContextBase from "./timetableContextBase";
import {EmbeddedListResponse} from "../common/types";

export default class TeacherCourseContext extends TimetableContextBase<TeacherCourse> {
  private static instance: TeacherCourseContext;

  public static getInstance(): TeacherCourseContext {
    if (!TeacherCourseContext.instance) {
      TeacherCourseContext.instance = new TeacherCourseContext();
    }
    return TeacherCourseContext.instance;
  }

  private constructor() {
    super();

    this._model = [] as TeacherCourse[];
  }

  get teacherCourses(): TeacherCourse[] {
    return this._model;
  }

  get teacherCourseMap(): Record<string, TeacherCourse[]> {
    return this._model?.reduce((acc: Record<string, TeacherCourse[]>, teacherCourse: TeacherCourse) => {
      if (!acc[teacherCourse.teacherId]) {
        acc[teacherCourse.teacherId] = [];
      }
      acc[teacherCourse.teacherId].push(teacherCourse);
      acc[teacherCourse.teacherId].sort((a, b) => a.sortNo - b.sortNo);
      return acc;
    }, {} as Record<string, TeacherCourse[]>) || ({} as Record<string, TeacherCourse[]>);
  }

  public replace(teacherCourses: TeacherCourse[]): void {
    teacherCourses.forEach(conf => {
      const idx = this._model
        .findIndex((tc: TeacherCourse) => tc.teacherId === conf.teacherId && tc.courseId === conf.courseId);

      if (idx !== -1) {
        this._model.splice(idx, 1, conf);
      } else {
        this._model.push(conf);
      }
    })
  }

  public async fetch(): Promise<void> {
    try {
      const { getTeacherCourseConfsAllByTimetableIdTeachercourseconfs } = this.api;
      const res = await getTeacherCourseConfsAllByTimetableIdTeachercourseconfs(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { timetableTeacherCourseConfs } = (res.data as EmbeddedListResponse<TeacherCourse>)._embedded;
      this._model = timetableTeacherCourseConfs;

      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching teacherCourse:', error);
      throw new Error('Failed to fetch teacherCourse');
    }
  }  

  public async delete(teacherCourse: TeacherCourse): Promise<void> {
    // 이미 등록된 과목인지 확인한다.
    const isExistCourse = this.teacherCourses.some((tc: TeacherCourse) => {
      return tc.teacherId === teacherCourse.teacherId && tc.courseId === teacherCourse.courseId;
    });

    if (!isExistCourse) {
      return;
    }

    try {
      const { removeCourseFromTeacherCoursesCourseId } = this.api;
      const res = await removeCourseFromTeacherCoursesCourseId(
        this.timetableId,
        teacherCourse.teacherId,
        teacherCourse.courseId
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

  public async deleteCourseFromTeacher(teacherId: string, courseId: string): Promise<void> {
    try {
      await this.delete({
        teacherId: teacherId,
        courseId: courseId,
      } as TeacherCourse);
     
      // 삭제 후 teacherCourses에서 제거
      this._model = this._model.filter((tc: TeacherCourse) => {
        return !(tc.teacherId === teacherId && tc.courseId === courseId);
      });

      // 해당 교사 과목 재정렬: 실제 DB의 데이터는 API를 통해 관리
      this._model
        .filter((tc: TeacherCourse) => tc.teacherId === teacherId)
        .sort((a: TeacherCourse, b: TeacherCourse) => {
          return a.sortNo - b.sortNo;
        })
        .map((tc: TeacherCourse, index: number) => {
          tc.sortNo = index + 1; // 1부터 시작하도록
          return tc;
        });

      this.notifyListeners();
    }
    catch (error) {
      console.error('Error deleting course from teacher:', error);
      throw new Error('Failed to delete course from teacher');
    }    
  }

  public async add(teacherCourse: TeacherCourse): Promise<TeacherCourse> {
    // 이미 등록된 과목인지 확인한다.
    const isExistCourse = this.teacherCourses.some((tc: TeacherCourse) => {
      return tc.teacherId === teacherCourse.teacherId && tc.courseId === teacherCourse.courseId;
    });

    if (isExistCourse) {
      return teacherCourse;
    }

    try {
      const { addCourseToTeacherCoursesCourseId } = this.api;
      const res = await addCourseToTeacherCoursesCourseId(
        this.timetableId,
        teacherCourse.teacherId,
        teacherCourse.courseId
      );

      if (res.status !== 200) {
        throw new Error('Failed to add teacher course');
      }

      return res.data as TeacherCourse;
    }
    catch (error) {
      console.error('Error adding teacher course:', error);
      throw new Error('Failed to add teacher course');
    }
  }
  
  public async addCourseToTeacher (teacherId: string, courseId: string) {
    try {
      const addedTeacherCourse = await this.add({
        teacherId: teacherId,
        courseId: courseId,
      } as TeacherCourse);

      this.teacherCourses.push(addedTeacherCourse);
      
      this.notifyListeners();
      
      return addedTeacherCourse;
    }
    catch (error) {
      throw new Error('Failed to add course to teacher');
    }
  }
  
}