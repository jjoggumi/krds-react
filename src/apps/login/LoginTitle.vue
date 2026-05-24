<template>
  <div>
    <div
      id="loginTitle"
      class="login-start-text"
      :class="{
        smr: ['login.teacher.v2', 'login.parents', 'login.student'].includes(titleCode),
      }"
      v-html="mainTitle"
    ></div>
    <div class="m-login-txt" v-if="subMessage">
      <p>{{ subMessage }}</p>
    </div>
    <div
      class="m-login-txt"
      v-if="isIscreamTeacher && $route.path === '/login/auth/phone'"
    >
      <p v-html="subTitle"></p>
    </div>
  </div>
</template>

<script>
export default {
  name: "login-title",
  props: {
    isGuardianVerification: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      titleCode: "",
    };
  },
  computed: {
    isIscreamTeacher() {
      return (
        localStorage.clientRegistrationId === "iScream" &&
        localStorage.userType === "TEACHER"
      );
    },
    isTeacher() {
      return localStorage.userType === "TEACHER";
    },
    mainTitle() {
      return this.$t(this.titleCode);
    },
    subTitle() {
      return (
        this.$t("login.iScream.teacher.subTitle1") +
        "<br />" +
        this.$t("login.iScream.teacher.subTitle2")
      );
    },
    subMessage() {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const temporaryEntryParams = params.get("tep");
      if (!temporaryEntryParams) return;

      return JSON.parse(decodeURIComponent(atob(temporaryEntryParams))).subMessage;
    },
  },
  watch: {
    $route() {
      this.setTitleCode();
    },
    isGuardianVerification() {
      this.setTitleCode();
    }
  },
  mounted() {
    this.setTitleCode();
  },
  methods: {
    setTitleCode() {
      let path = this.$route.params.userType;
      const id = this.$route.params.id;

      if (path === "agreement") {
        if (this.isGuardianVerification) {
          path = "agreement.guardian.verification";
        } else {
          path = "agreement";
        }
      } else {
        if (this.isIscreamTeacher) {
          path = localStorage.clientRegistrationId + "." + "teacher";
        } else if (path === "iScream") {
          path = this.$route.params.userType + "." + id;
        } else if (this.isTeacher && this.$route.path.includes("/login/auth/phone")) {
          path = "iScream" + "." + "teacher";
        }
      }

      this.titleCode = "login." + path;
      if (id === "v2") this.titleCode += `.${id}`;
    },
  },
};
</script>

<style scoped></style>
