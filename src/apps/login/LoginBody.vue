<!--
@File(Method): LoginBody.vue
@Description: 로그인 본문
@Modified: 2026-01-07 : #83862 로그인/회원가입 > 만 14세 미만 법정대리인 동의 추가
-->
<template>
  <div v-if="isLoadComplete" id="loginBody" :class="{
  'login-box-agreement-wrap': isAgreement === true
  }" 
  class="login-box-wrap boundary-box">
    <div class="login-box-inner">
      <LoginTitle v-if="isLogin && isComponentReady" :is-guardian-verification="isGuardianVerification"></LoginTitle>
      <component v-bind:is="curForm" v-show="isComponentReady" @component-ready="onComponentReady" @change-guardian-verification="onChangeGuardianVerification"></component>
    </div>
  </div>
</template>

<script>
import LoginTitle from "./LoginTitle.vue";
import Teacher from "./teacher/LoginTeacher.vue";
import Student from "./student/LoginStudent.vue";
import Parents from "./parents/LoginParents.vue";
import EducationOffice from "./educationOffice/LoginEducationOffice.vue";
import Auth from "./auth/LoginAuthBody.vue";
import FindId from "./findId/LoginBodyFindIdBody";
import FindSns from "./findSns/LoginBodyFindSnsBody";
import ResetPw from "./resetPw/LoginBodyResetPwBody";
import iScream from "./iScream/LoginiScreamBody";
import Choice from "./choice/LoginChoice";
import SelectAge from "./choice/LoginSelectAge";
import Recertification from "./recertification/LoginRecertification";
import Agreement from "./agreement/LoginAgreement";

export default {
  name: "loginBody",
  data: () => ({
    curForm: "",
    isLogin: true,
    isLoadComplete: false,
    isGuardianVerification: false,
    isComponentReady: true,
  }),
  components: {
    LoginTitle,
    Teacher,
    Student,
    Parents,
    EducationOffice,
    Auth,
    FindId,
    FindSns,
    iScream,
    ResetPw,
    Choice,
    Recertification,
    SelectAge,
    Agreement,
  },
  watch: {
    $route() {
      this.setComponent();
    },
  },
  computed: {
    isAgreement: function () {
      return this.curForm === "Agreement";
    },
  },
  created() {
    this.setComponent();
  },
  methods: {
    setComponent() {
      try {
        this.isGuardianVerification = false;
        const COMPONENTS = [
          "Teacher",
          "Student",
          "Parents",
          "Advertiser",
          "EducationOffice",
          "Auth",
          "FindId",
          "FindSns",
          "iScream",
          "ResetPw",
          "Choice",
          "Recertification",
          "SelectAge",
          "Agreement",
        ];
        let userType = this.$route.params.userType;
        if (userType === "iScream") {
          this.curForm = "iScream";
        } else {
          this.curForm = userType.replace(/^./, userType[0].toUpperCase());
        }
        if (!COMPONENTS.includes(this.curForm + "")) throw new Error();

        this.$log.debug(this.$options.name, ", 현재 호출된 컴포넌트 : ", this.curForm);
        document.title = "login-" + this.curForm;
        this.isComponentReady = this.curForm !== 'Agreement';
        this.isLoadComplete = true;
      } catch (error) {
        this.isLoadComplete = true;
        this.$router.push("/", () => {});
      }
    },
    onChangeGuardianVerification(val) {
      this.isGuardianVerification = val;
    },
    onComponentReady() {
      this.isComponentReady = true;
    },
  },
};
</script>

<style scoped></style>
