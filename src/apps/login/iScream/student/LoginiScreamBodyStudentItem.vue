<template>
  <div>
    <!-- 안의 내용이 바뀝니다. -->
    <div class="input-login-cont-wrap input-confirm-wrap type-start">
      <div class="input-box-wrap input-id" :class="{
          focus: isFocusLoginId
        }">
        <input
          type="text"
          placeholder="아이디"
          ref="loginId"
          v-model="loginId"
          @focus="isFocusLoginId = true"
          @blur="isFocusLoginId = false"
          @keydown.enter.prevent.stop
        />
      </div>
      <div
        class="input-box-wrap input-pw"
        :class="{
          focus: isFocusLoginPassword
        }"
      >
        <input
          type="password"
          placeholder="비밀번호"
          ref="loginPassword"
          @keydown.enter.prevent.stop="doSubmit"
          v-model="loginPassword"
          @focus="isFocusLoginPassword = true"
          @blur="isFocusLoginPassword = false"
        />
      </div>
      <!-- <div class="keep-login-wrap">
        <input type="checkbox" id="keep-login" />
        <label for="keep-login">
          <span class="f-ns-b">로그인 상태 유지</span>
        </label>
      </div>-->
      <div class="confirm-btn-wrap">
        <button class="btn-bg-c" @click="doSubmit">로그인</button>
      </div>
    </div>
    <div class="btm-text-wrap">선생님이 아이디/비밀번호를 생성한 학생만 일반 로그인이 가능합니다.</div>
    <!-- 안의 내용이 바뀝니다. -->
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "login-i-scream-body-study-item",
  data: () => ({
    isFocusLoginId: false,
    isFocusLoginPassword: false,
    loginId: "",
    loginPassword: ""
  }),
  methods: {
    ...mapActions({
      createUserLogs: 'createUserLogs',
    }),
    doSubmit() {
      let queryParam = {};
      queryParam.clientRegistrationId = "STUDENT";
      queryParam.principalName = this.loginId;
      queryParam.userType = "STUDENT";

      this.$authentication.save(queryParam);
      this.checkJoined();
    },

    // TODO: 임시 학생회원 확인 프로세스 변경!
    checkJoined() {
      const queryParam = this.$authentication.load();
      const param = {
        _loginId: queryParam.principalName.toString(),
        _loginType: queryParam.clientRegistrationId
      };

      this.$hiClass.users.search(param)
        .then(result => {
          this.$log.debug(
            `${this.$options.name} checkJoined() result : `,
            result
          );
          if (result.data.page.totalElements === 1) {
            const userInfo = result.data._embedded.users[0];

            if (
              userInfo.userStatus === "ACTIVATE" &&
              userInfo.userType === queryParam.userType
            ) {
              // SHA512 compare
              const loginPasswordHash = this.loginPassword
              if (userInfo.loginPassword === loginPasswordHash) {
                this.$store.commit("setUserUri", userInfo._links.self.href);
                this.$store.commit("setUserType", userInfo.userType);
                this.$store.commit("setUser", userInfo);

                queryParam.userType = userInfo.userType;
                this.$authentication.save(queryParam);

                // header init
                // Object.assign(this.$axios.defaults, { headers: "" });

                // 사용자 접속 이력 등록
                this.createUserLogs({
                 userUri: userInfo._links.self.href
                });

                this.$router.push("/main");
              } else {
                let msg = "비밀번호가 맞지 않습니다.";
                alert(msg);
                this.loginPassword = "";
                this.$refs.loginPassword.focus();
                this.$authentication.clear();
              }

              // TODO : 회원 상태 변경 처리. 탈퇴 후 복구 등
            } else if (userInfo.userStatus === "DEACTIVATE") {
              let msg = "탈퇴된 계정입니다.";
              alert(msg);
              this.$authentication.clear();
            }
          } else if (result.data.page.totalElements > 1) {
            let msg = "가입된 계정이 여러개 있습니다. 관리자에게 문의하세요.";
            alert(msg);
            this.$authentication.clear();
          } else {
            let msg = "가입된 계정이 없습니다.";
            alert(msg);
            this.$authentication.clear();
          }
        })
        .catch(error => {
          this.$authentication.clear();
          this.$log.debug(error);
        });
    },
  },
  created() {},
  mounted() {
    setTimeout(() => {
      this.$refs.loginId.focus();
    }, 200);
  }
};
</script>

<style scoped></style>