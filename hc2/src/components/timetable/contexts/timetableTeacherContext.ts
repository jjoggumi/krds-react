import { Teacher } from "../core/types";
import { EmbeddedListResponse } from "../common/types";
import TimetableContextBase from "./timetableContextBase";

export interface TeacherForAdd {
  teacherName: string;
  teacherId?: string;
}

export interface TeacherForUpdate {
  teacherName: string;
  classId?: string;
  teacherId?: string;
}

export default class TimetableTeacherContext extends TimetableContextBase<Teacher> {
  private static _instance: TimetableTeacherContext;

  // private _repository = TimetableTeacherRepository; 

  private constructor() {
    super();

    this._model = [] as Teacher[];
    
    /*
    this._model = Vue.observable({
      teachers: [] as Teacher[],
    });
    */
  }

  public static getInstance(): TimetableTeacherContext {
    if (!TimetableTeacherContext._instance) {
      TimetableTeacherContext._instance = new TimetableTeacherContext();
    }
    return TimetableTeacherContext._instance;
  }

  get teachers(): Teacher[] {
    return this._model;
  }

  get teacherMap(): Record<string, Teacher> {
    return this.teachers.reduce((acc, teacher) => {
      acc[teacher.teacherId] = teacher;
      return acc;
    }, {} as Record<string, Teacher>) || ({} as Record<string, Teacher>)
  }

  get teachersOrderByName(): Teacher[] {
    return this._model.sort((a: Teacher, b: Teacher) => a.teacherName.localeCompare(b.teacherName));
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableTeachersTeachers } = this.api;
      const res = await getTimetableTeachersTeachers(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { teachers } = (res.data as EmbeddedListResponse<Teacher>)._embedded;
      this._model = teachers;

      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching teachers:', error);
      throw new Error('Failed to fetch teachers');
    }
  }

  public replace(teachers: Teacher[]): void {
    teachers.forEach(teacher => {
      const idx = this._model
        .findIndex((t: Teacher) => t.teacherId === teacher.teacherId);
      if (idx !== -1) {
        this._model.splice(idx, 1, teacher);
      } else {
        this._model.push(teacher);
      }
    })
  }

  public async add(teacher: TeacherForAdd): Promise<Teacher | null> {
    const addedTeachers = await this.addTeachers([teacher]);
    if (addedTeachers && addedTeachers.length > 0) {
      // api에서 추가된 교사 목록을 반환하므로, 첫 번째 교사를 반환.
      return addedTeachers[0];
    }
     
    return null;
  }

  public async addTeachers(teachers: TeacherForAdd[]): Promise<Teacher[]> {
    if (!teachers || teachers.length === 0) {
      throw new Error('No teachers to add');
    }

    try {
      const { addTeachersTeachers } = this.api;
      const res = await addTeachersTeachers(this.timetableId, { teachers });

      if (res.status !== 200) {
        throw new Error('Failed to add teachers');
      }
      
      const { teachers: addedTeachers } = (res.data as EmbeddedListResponse<Teacher>)._embedded;
      return addedTeachers;
      
    } catch (error) {
      console.error('Error adding teachers:', error);
      throw error;
    }
  }

  public async updateTeacherName(teacher: TeacherForUpdate): Promise<void> {
    if (!teacher || !teacher.teacherId || !teacher.teacherName) {
      throw new Error('Invalid teacher data for update');
    }

    try {
      const { updateTeacherNameName } = this.api;
      const res = await updateTeacherNameName(this.timetableId, teacher.teacherId, teacher);

      if (res.status !== 200) {
        throw new Error('Failed to update teacher name');
      }

      // console.log('Teacher name updated successfully:', res.data);
      
    } catch (error) {
      console.error('Error updating teacher name:', error);
      throw error;
    }
  }

  public async updateTeacherClass(teacher: TeacherForUpdate): Promise<void> {
    if (!teacher || !teacher.teacherId || !teacher.teacherName) {
      throw new Error('Invalid teacher data for update');
    }

    try {
      const { updateManagingClassManager } = this.api;
      const res = await updateManagingClassManager(this.timetableId, teacher.teacherId, teacher);

      if (res.status !== 200) {
        throw new Error('Failed to update teacher class');
      }

      this._model.forEach((t: Teacher) => {
        if (t.teacherId === teacher.teacherId) {
          t.classId = teacher.classId;
        }
      });
      
    } catch (error) {
      throw error;
    }
  }

  public async removeTeacherClass(teacherId: string): Promise<void> {
    if (!teacherId) {
      throw new Error('Teacher ID is required to remove class');
    }

    try {
      const { deleteManagingClassManager } = this.api;
      const res = await deleteManagingClassManager(this.timetableId, teacherId);

      if (res.status !== 200) {
        throw new Error('Failed to remove teacher class');
      }

      // Update the local model
      this._model.forEach((t: Teacher) => {
        if (t.teacherId === teacherId) {
          t.classId = undefined;
          t.className = undefined;
        }
      });      
    } catch (error) {
      console.error('Error removing teacher class:', error);
      throw error;
    }
  }

  public async deleteWithIds(teacherIds: string[]): Promise<void> {
    if (!teacherIds || teacherIds.length === 0) {
      throw new Error('No teacher IDs provided for deletion');
    }

    try {
      const { deleteTeacherTeachers } = this.api;
      const res = await deleteTeacherTeachers(this.timetableId, { teacherIds });

      if (res.status !== 200) {
        throw new Error('Failed to delete teachers');
      }
      
    } catch (error) {
      console.error('Error deleting teachers:', error);
      throw error;
    }
  }

  public async updateFreePeriods(teacher: Teacher): Promise<void> {
    if (!teacher || !teacher.teacherId) {
      throw new Error('Invalid teacher data for updating free period');
    }

    try {
      const { freePeriods, teacherId } = teacher;
      const { updateFreePeriodsFreeperiods } = this.api;
      const res = await updateFreePeriodsFreeperiods(this.timetableId, teacherId, { freePeriods });

      if (res.status !== 200) {
        throw new Error('Failed to update free period');
      }

      const { teacherId: updatedTeacherId } = res.data;

      if( !updatedTeacherId || teacherId !== updatedTeacherId) {
        throw new Error('Invalid response data for updated free periods');
      }
    } catch (error) {
      console.error('Error updating free period:', error);
      throw error;
    }
  }
}