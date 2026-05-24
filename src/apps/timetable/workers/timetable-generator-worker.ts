import Timetable from '@/apps/timetable/core';

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  if (type === 'GENERATE_TIMETABLE') {
    generateTimetable(payload);
  }
}

const generateTimetable = async (payload: any) => {
  const {
    timetableConfig,
    presetLessons,
    classes,
    courses,
    teachers,
    teacherCourses,
    specialtyRooms,
    lessonConfs,
    fixedConfs,
    concurrentCourseConfs,
    specialtyRoomConfs
  } = payload;

  // console.log('Worker received message:', payload);

  // Timetable core 초기화
  Timetable.timetableConfig = timetableConfig;
  Timetable.classes = classes;
  Timetable.courses = courses;
  Timetable.teachers = teachers;
  Timetable.teacherCourses = teacherCourses;
  Timetable.specialtyRooms = specialtyRooms;
  Timetable.lessonConfs = lessonConfs;
  Timetable.fixedConfs = fixedConfs;
  Timetable.concurrentCourseConfs = concurrentCourseConfs;
  Timetable.specialtyRoomConfs = specialtyRoomConfs;

  try {    
    const isSilent = false; // 디버깅용, 콘솔 출력 안함
    const generatedLessons = await Timetable.generate(presetLessons, isSilent);
    const payload = { 
      generatedLessons,
     };

    postMessage({ success: true, payload });

    self.close();
  }
  catch (error) {
    const generatedLessons = Timetable.currentAssignedLessons;
    const payload = { generatedLessons, };
    postMessage({ success: false, payload });
    console.error('!! Timetable generation failed in WORKER !!:', error);
    self.close();
  }
}
