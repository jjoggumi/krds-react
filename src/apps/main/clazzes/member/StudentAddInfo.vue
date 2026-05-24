<!--
@File(Method): StudentAddInfo.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 학생 > 학생 추가
@Modify: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <div class="student-add-info">
    <div class="info-box-card">
      <div class="info-block">
        <div class="info-title">임시 학생 계정 생성 전 동의 관련 안내</div>
        <ul class="info-list">
          <li class="info-item">
            임시 학생 계정은 선생님 회원이 학생을 대신하여 생성하는 계정으로, 서비스 내 별도의 이용 동의 절차를 제공하지 않습니다.
          </li>
          <li class="info-item">
            이에 따라 계정 생성 전 만 14세 미만은 법정대리인에게, 만 14세 이상은 학생 본인에게 임시 계정 생성에 대한 동의서를 확보해주세요.
          </li>
          <li class="info-item">
            온라인으로 동의서를 받는 경우, 학교 양식 신청서 > 신청서 관리에서 ‘임시 학생 계정 동의서’의 사용 여부를 ON으로 설정한 후 이용해주세요.
          </li>
        </ul>
      </div>
      <div class="btns">
        <HiButton v-for="(file, index) in files" :key="index" color="default" size="md" outline @click="downloadFile(file, index)">
          <HiIcon name="ico-file-down" color="default" size="20"/>{{ file.title }}
        </HiButton>
        <HiButton color="primary" size="md" outline @click="moveToWorksheet">          
          온라인으로 받기(학교양식신청서)
          <HiIcon name="ico-next" color="primary" size="18"/>
        </HiButton>
      </div>
    </div>
    <div class="info-box-card">
      <!-- <div class="smr">* SNS 계정이 없거나 휴대폰이 없는 학생은 선생님이 임시 계정을 만들어 <br> &nbsp; &nbsp;줄 수 있습니다.</div> -->
      <div class="info-block">
        <div class="info-title">임시 계정 생성 시 유의사항</div>
        <ul class="info-list">
          <li class="info-item">
            임시 학생 계정의 생성 및 관리 책임은 해당 계정을 생성한 선생님에게 있습니다.
          </li>
          <li class="info-item">
            개인정보 보호를 위해 타인이 유추할 수 없는 아이디와 비밀번호로 계정을 생성해 주세요.
          </li>
        </ul>
      </div>
      <div class="btns">
        <HiButton color="secondary" size="lg" bitrounded @click="openAddStudent('SINGLE')">
          <HiIcon name="ico-plus2" size="20"/>임시 학생 계정 생성
        </HiButton>
        <HiButton color="jungle" size="lg" bitrounded outline @click="openAddStudent('BATCH')">
          <i class="icon-excel"></i>
          임시 학생 계정 일괄 생성
        </HiButton>
      </div>
    </div>

    <member-detail-modal
        v-if="isOpenDetailModal"
        :classId="clazzes.currentId"
        @closeMemberDetail="closeMemberDetail"
        @reloadMembers="$emit('reloadMembers')"
    />

    <!-- <main-body-clazzes-body-member-body-student-add-student-terms
        v-if="addStudentTermsPop.isShow"
        :addStudentTermsPop="addStudentTermsPop"
        :clazzId="clazzes.currentId"
        :addType="addType"
        @openAddStudent="openAddStudent"
    /> -->

    <clazz-member-add-student-batch
        v-if="isOpenBatchAddModal"
        :classId="clazzes.currentId"
        @closeAddStudentBatch="closeAddStudentBatch"
        @reloadMembers="$emit('reloadMembers')"
    />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import MemberDetailModal from "@/apps/main/clazzes/member/modal/MemberDetail";
// import MainBodyClazzesBodyMemberBodyStudentAddStudentTerms from './MainBodyClazzesBodyMemberBodyStudentAddStudentTerms.vue'
import ClazzMemberAddStudentBatch from "@/components/Popup/ClazzMemberAddStudentBatch";

export default {
  name: 'student-add-info',
  props: {
    clazzes: Object,
    isManager: Boolean
  },
  data() {
    return {
      isOpenDetailModal: false,
      isOpenBatchAddModal: false,
      addStudentTermsPop: {
        isShow: false,
        isSkip: null
      },
      addType: 'SINGLE',
      files: [
        {
          title: '만 14세 미만 법정대리인 동의서',
          name: '하이클래스_만 14세 미만 아동의 개인정보 수집·이용에 관한 법정대리인 동의서.hwp',
          src: `https://download.hiclass.net/static/document/hiclass_privacy_consent_form_under_14.hwp`
        },
        {
          title: '만 14세 이상 동의서',
          name: '하이클래스_만 14세 이상 학생의 개인정보 수집·이용에 관한 본인 동의서.hwp',
          src: `https://download.hiclass.net/static/document/hiclass_privacy_consent_form_over_14.hwp`
        }
      ]
    }
  },
  components: {
    ClazzMemberAddStudentBatch,
    MemberDetailModal,
    // MainBodyClazzesBodyMemberBodyStudentAddStudentTerms
  },
  methods: {
    ...mapActions({
      download: 'download',
      // triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    async downloadFile(item, index) {
      // this.triggerAnalyticsLogEvent({ code: `analytics.home.download.item${index + 1}.click` })
      const payload = { src: item.src, name: item.name };
      await this.download(payload);
    },
    moveToWorksheet() {
      const worksheetUrl = `/main/clazzes/${this.clazzes.currentId}/form/sheetList`;
      this.$router.push(worksheetUrl);
    },
    async openAddStudent(addType) {
      this.addType = addType;
      (this.addType === 'BATCH' ? this.openAddStudentBatch : this.openMemberDetail)();
    },
    openMemberDetail() {
      this.isOpenDetailModal = true
    },
    closeMemberDetail() {
      this.isOpenDetailModal = false
    },
    openAddStudentBatch() {
      this.isOpenBatchAddModal = true
    },
    closeAddStudentBatch() {
      this.isOpenBatchAddModal = false
    },
    openAddStudentTerms() {
      this.addStudentTermsPop.isShow = true
    },
    // async getIsConsent() {
    //   const res = await this.$axios.get(`/clazzes/${this.clazzes.currentId}/consents`)
    //   let isConsent = false
    //   if (res.data._embedded.clazzConsents.length > 0) {
    //     const clazzConsents = res.data._embedded.clazzConsents
    //     isConsent = clazzConsents.find(clazzConsent => clazzConsent.consentType === 'tempStudent').isConsent
    //   }
    //   return isConsent
    // }
  }
}
</script>

<style lang="scss" scoped>
  .student-add-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
    .info-box-card{
      background:#F8F9FC;
      border-radius:8px;
      padding:24px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      .info-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
        .info-title {
          font-size: 14px;
          font-weight: 500;
          line-height: 160%;
          color: var(--secondary);
        }
        .info-list {
          padding-left: 18px;
          .info-item {
            font-size: 14px;
            font-weight: 400;
            line-height: 160%;
            color: var(--gray-09);
            list-style: disc;
            &::marker {
              font-size: 10px;
              color: var(--gray-09);
            }
          }
        }
      }
      .btns {
        display: flex;
        justify-content: flex-start;
        gap: 8px;
      }
    }
  }
</style>