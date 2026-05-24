<!--
@File(Method): MainBodyClassCreatedNew.vue
@Author: -
@Date Created: -
@Description: 클래스 생성 완료 모달 카드
@Modified: 2025-01-03 - #70726 클래스 개설시 팝업에 다국어 설치 안내문 추가
-->
<template>
  <div class="class-new-created-container">
    <div class="title-wrap">
      <h2>새 클래스가 만들어졌습니다.</h2>
    </div>
    <div class="content-wrap">
      <div class="content-wrap__item" @click="onClickBoardManagement">
        <div class="title setting">게시판 설정하기</div>
        <div class="content">게시판 및 폴더 생성, 권한 설정, 댓글 사용 여부를<br/>설정 할 수 있습니다.</div>
        <span class="arrow"></span>
      </div>
      <div class="content-wrap__item" @click="onClickBoardInvite">
        <div class="title invite">무료문자로 초대장 보내기</div>
        <div class="content">학부모, 학생에게 초대코드와 클래스 가입 안내가<br/>담긴 초대장을 무료 문자로 발송할 수 있습니다.</div>
        <span class="arrow"></span>
      </div>
      <div class="content-wrap__item" @click="$comn.download(
            $store.state.classTermsPrivacyDocIntl,
            '(학교+학급 이용) 하이클래스 이용 정보 동의서+14세 이용 동의+설명서_2025.01.zip'
          )
        ">
        <div class="title multi-lang">다국어 설치 안내문 ⋅ 개인정보 동의서</div>
        <div class="content">
          하이클래스 가입 설치 안내와 개인정보 동의서를 <br/>다운로드 할 수 있습니다.      
        </div>
        <span class="arrow"></span>
      </div>
    </div>
    <div class="footer-wrap">
      <button @click="close"></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'main-body-class-created-new',
  components: {},
  props: {
  },
  data() {
    return {
    }
  },
  methods: {
    onClickBoardManagement() {
      this.$emit("close")
      const nextPath = `/main/clazzes/${this.$route.params.id}/permission`
      this.$router.push(nextPath, () => {
      })
    },
    onClickBoardInvite() {
      this.$emit("close")
      const nextPath = `/main/clazzes/${this.$route.params.id}/invite`
      this.$router.push(nextPath, () => {
      })
    },
    close() {
      this.$emit("close")
    }
  }
}
</script>

<style lang="scss" scoped>
.class-new-created-container {
  width: 360px;
  height: 446px;
  border: 1px solid #EEEEEE;
  box-shadow: 0px 4px 12px 0px #0000001A;
  background: #FFF;
  border-radius: 20px;
  overflow: hidden;
  position: fixed;
  left: 50%;
  margin-left: 260px;
  bottom: 50px;
  z-index: 9999;
  animation: showClassNewCreatedPopup .6s ease-out 0.2s forwards;
  transform: translateY(calc(100% + 50px));
  .title-wrap {
    width: 100%;
    padding: 30px 20px 20px 20px;
    text-align: center;
    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #000000;
      line-height: 16px;
    }
  }
  .content-wrap {
    padding: 0 20px 16px 20px;
    .content-wrap__item {
      width: 100%;
      height: 101px;
      border-radius: 8px;
      background: #F8F9FC;
      padding: 15px 0 20px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      position: relative;
      border: 1px solid #F8F9FC;
      &:hover {
        border: 1px solid var(--primary);
        background: #4778DE14;
      }
      &:nth-child(2) {
        margin-top: 12px;
      }
      .title {
        width: 271px;
        height: 26px;
        font-size: 15px;
        font-weight: 500;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: #222;
        &::before {
          content: "";
          display: inline-block;
          width: 24px;
          height: 24px;
          vertical-align: middle;
          margin-right: 4px;
        }
        &.setting {
          &::before {
            background: url("~@/assets/img/icon/icon_setting_blue.svg") no-repeat;
          }
        }
        &.invite {
          &::before {
            background: url("~@/assets/img/icon/icon_invite_blue.svg") no-repeat;
          }
        }
        &.multi-lang {
          &::before {
            background: url("~@/assets/img/icon/icon_download_blue.svg") no-repeat;
            background-size: 93%;
          }
          + .content::after {
            vertical-align: bottom;
            display: inline-block;content:'';width: 96px;height: 17px; background: url("~@/assets/img/icon/multi-lang.png");
          }
        }
      }
      .content {
        width: 271px;
        font-size: 13px;
        font-weight: 400;
        line-height: 16.5px;
        color: #616161;
      }
      &.on {
        .title {
          color: var(--primary);
        }
      }
      span {
        &.arrow {
          display: inline-block;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 9px;
          width: 24px;
          height: 24px;
          background: url("~@/assets/img/icon/icon_arrow_right_gray24.svg") no-repeat;
        }
      }
    }
  }
  .footer-wrap {
    width: 100%;
    height: 50px;
    button {
      width: 100%;
      height: 50px;
      background: url("~@/assets/img/new_class_created_modal_close.svg") no-repeat;
    }
  }
}
@keyframes showClassNewCreatedPopup {
  0% {
    transform: translateY(calc(100% + 100px));
  }
  100% {
    transform: translateY(0);
  }
}
</style>