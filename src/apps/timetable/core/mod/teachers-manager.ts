import { TimetablePeriod } from '../types';
import { TimetableDataContext } from './timetable-data-context';

export default class TeachersManager {
  private _context: TimetableDataContext;

  constructor(context: TimetableDataContext) {
    this._context = context;
  }

  getFreePeriods(teacherId: string) {
    return this._context.teacherMap[teacherId].freePeriods || [];
  }

  addFreePeriod(teacherId: string, dayOfWeek: number, period: number): void {
    const teacher = this._context.teacherMap[teacherId];

    if (!teacher) {
      return;
    }

    if (!teacher.freePeriods) {
      teacher.freePeriods = [];
    }

    const isExists = teacher.freePeriods.some(
      (p) => p.dayOfWeek === dayOfWeek && p.period === period
    );

    if (isExists) {
      return;
    }

    teacher.freePeriods.push({ dayOfWeek, period });
  }

  removeFreePeriod(teacherId: string, dayOfWeek: number, period: number): void {
    const teacher = this._context.teacherMap[teacherId];

    if (!teacher || !teacher.freePeriods) {
      return;
    }

    const index = teacher.freePeriods.findIndex(
      (p) => p.dayOfWeek === dayOfWeek && p.period === period
    );

    if (index === -1) {
      return;
    }

    teacher.freePeriods.splice(index, 1);
  }

  resetFreePeriods(teacherId: string): TimetablePeriod[] {
    const teacher = this._context.teacherMap[teacherId];

    if (!teacher || !teacher.freePeriods) {
      return [];
    }

    const delFreePeriods = [...teacher.freePeriods];

    delFreePeriods.map((dp) => {
      if (!teacher.freePeriods) {
        return;
      }

      const index = teacher.freePeriods.findIndex(
        (p) => p.dayOfWeek === dp.dayOfWeek && p.period === dp.period
      );

      if (index === -1) {
        return;
      }

      teacher.freePeriods?.splice(index, 1);
    });

    return delFreePeriods;
  }
}
