<script lang="ts">
/**
 * SeatPlansMixIn
 * 일반 Student와 SeatPlan - Student를 Mapping하거나 사용하기위한 mixin
 *
 * 사용법:
 * import SeatPlanMixin from '@/apps/behavior/mixins/SeatPlanMixin.vue'
 *
 * export default {
 *   mixins: [SeatPlanMixin],
 *   sampleTest(seatPlanStudent) {
 *     this.getProfileImage(student);
 *   }
 * }
 */

import Vue from 'vue';
import {SeatStudent} from "@hiclass/core";



export default Vue.extend({
  name: 'SeatPlansMixin',
  data() {
    return {
      isHeightMap: {} as Record<string, boolean>,
    };
  },
  methods: {
    getProfileImage(seatStudent: SeatStudent) {
      // 사진이 있다면 사진으로 쓰기
      if (seatStudent.studentPhoto) {
        return seatStudent.studentPhoto
      }
      // 사진이 없으면 캐릭터로
      return `https://download.hiclass.net/static/classroom/student/${seatStudent.character}_head.png`
    },
    getProfileImageClass(seatStudent: SeatStudent) {
      const baseClass = seatStudent.studentPhoto ? 'profile-photo' : 'profile-img';
      const isHeight = this.isHeightMap[seatStudent.studentId];
      return isHeight ? `${baseClass} is-height` : baseClass;
    },
    onProfileImageLoad(studentId: string, event: Event) {
      const img = event.target as HTMLImageElement;
      if (!img || !img.naturalWidth || !img.naturalHeight) return;

      // 세로가 가로보다 2배 이상 커야 true
      const isHeight = img.naturalHeight >= img.naturalWidth * 1.3;

      this.$set(this.isHeightMap, studentId, isHeight);
    },
    convertSeatStudent(student: {studentId: string, studentCharacter: string, studentName: string, studentNo: number, point: number, studentPhoto: string | null}) {
      // Students API에서 내려주는 Student와 SeatPlan에 탑재되어 있는 Student는 다르기 때문에 맵핑
      return {
        studentId: student.studentId,
        character: student.studentCharacter,
        studentName: student.studentName,
        studentNo: student.studentNo,
        point: student.point,
        studentPhoto: student.studentPhoto,
      } as SeatStudent
    },
  },
});
</script>