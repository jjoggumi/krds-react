<template>
  <div
    v-if="downloadList.length > 0"
    class="component-main-download"
  >
    <div class="main-download__list">
      <div
        v-for="(item, index) of downloadList"
        :key="`${item.icon}-${index}`"
        class="main-download__item"
      >
        <a
          href="javascript:void(0);"
          @click="downloadFile(item, index)"
        >
          <i :class="item.icon"></i>
          <span :inner-html.prop="item.title"></span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: "main-body-home-download",
  data() {
    return {
      /**
       * 다운로드 자료 파일명 규칙입니다.
       * 괄호는 파일 확장자로 개인정보 수집 동의서 (hwp) 제외하고 모두  pdf  확장자입니다.
       *
       * 선생님
       * Hiclass_선생님_새학기 학부모 안내자료 (pdf)
       * Hiclass_선생님_학교양식 신청서 작성 가이드 (pdf)
       * Hiclass_선생님_개인정보 수집 동의서 (hwp)
       *
       * 학부모
       * Hiclass_학부모_학부모 및 학생 이용 가이드 (pdf)
       * Hiclass_학부모_학교양식 신청서 작성 가이드 (pdf)
       * Hiclass_학부모_과제제출, 학교알리미 회신 가이드 (pdf)
       *
       * 학생
       * Hiclass_학생_학생 이용 가이드 (pdf)
       * Hiclass_학생_체험학습 결과보고서, 학교신청서 작성가이드 (pdf)
       * Hiclass_학생_과제제출, 피드백 가이드 (pdf)
       *
       */
      downloads: [
        {
          userType: 'TEACHER',
          files: [
            {
              icon: 'icon-teacher',
              title: '새학기 <br>학부모 안내자료',
              name: 'Hiclass_선생님_새학기 학부모 안내자료.zip',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_teacher_doc.zip',
            },
            {
              icon: 'icon-form',
              title: '학교양식신청서 <br>서비스 가이드',
              name: 'Hiclass_선생님_학교양식 신청서 작성 가이드.pdf',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_teacher_doc_02.pdf',
            },
            {
              icon: 'icon-agree',
              title: '개인정보 수집 <br>동의서',
              name: 'Hiclass_선생님_개인정보 수집 동의서.zip',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_teacher_doc_03.zip',
            },
          ]
        },
        {
          userType: 'PARENTS',
          files: [
            {
              icon: 'icon-parents',
              title: '학부모 및<br>학생 이용 가이드',
              name: 'Hiclass_학부모_학부모_학생 이용 가이드.docx',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_parents_doc_01.docx',
            },
            {
              icon: 'icon-form',
              title: '학교양식신청서 <br>서비스 가이드',
              name: 'Hiclass_학부모_학교양식 신청서 작성 가이드.pdf',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_parents_doc_02.pdf',
            },
            {
              icon: 'icon-homework',
              title: '과제제출, 학교알리미<br>회신 가이드',
              name: 'Hiclass_학부모_과제제출, 학교알리미 회신 가이드.pdf',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_parents_doc_03.pdf',
            },
          ]

        },
        {
          userType: 'STUDENT',
          files: [
            {
              icon: 'icon-student',
              title: '학생<br>이용 가이드',
              name: 'Hiclass_학생_학생 이용 가이드.docx',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_student_doc_01.docx',
            },
            {
              icon: 'icon-homework',
              title: '과제 제출 및<br>피드백 가이드',
              name: 'Hiclass_학생_과제제출, 피드백 가이드.pdf',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_student_doc_03.pdf',
            },
            {
              icon: 'icon-form',
              title: '체험학습 결과보고서,<br>학교신청서 작성가이드',
              name: 'Hiclass_학생_체험학습 결과보고서, 학교신청서 작성가이드.pdf',
              src: 'https://download.hiclass.net/static/document/' + 'hiclass_download_student_doc_02.pdf',
            },
          ]

        },
      ]
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      curUserType: 'curUserType',
    }),
    ...mapFields({
      isCircleLoading: 'isLoading',
    }),
    downloadList() {
      const list = this.downloads.find(d => d.userType === this.curUserType)
      return list ? list.files : []
    }
  },
  methods: {
    ...mapActions({
      download: 'download',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    async downloadFile(item, index) {
      this.isCircleLoading = true
      this.triggerAnalyticsLogEvent({ code: `analytics.home.download.item${index + 1}.click` })

      const payload = {
        src: item.src,
        name: item.name
      }
      await this.download(payload).then(() => {
        setTimeout(() => this.isCircleLoading = false, 1000)
      })
    },
  }
}
</script>

<style scoped>

</style>