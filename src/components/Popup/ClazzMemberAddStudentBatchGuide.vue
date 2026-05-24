<template>
  <modal-layout
    ref="modalLayout"
    :modal-name="'clazz-member-add-student-batch'"
    :key="componentKey"
    :class-list="{
      modal: ['common-modal', 'guide-register-temp-student-modal'],
      modalContWrap: [],
      modalCont: ['boundary-box'],
    }"
    @modal-close="close"
  >
    <template v-slot:modalContInner>
      <div class="modal-cont-inner">
        <div class="modal-title-wrap">
          <div class="title">임시 학생 계정 일괄 생성 안내</div>
        </div>
        <div class="guide-wrap">
          <p class="text-step">1. EXCEL 파일을 다운로드 받으세요.</p>
          <p class="text-step">2. 엑셀 파일에 등록할 반 번호, 학생 이름, 계정정보를 <strong>아래 규칙에 맞게 입력</strong>해주세요.</p>
          <ul class="box-list">
            <li>- 학반(태그) : 한글, 영문, 숫자, 특수기호 일부 (- _ / & , . )가능, 최대 10자까지</li>
            <li>- 반 번호 : 1~99까지 숫자만 가능</li>
            <li>- 아이디 : 영문 소문자/숫자 4~12자</li>
            <li>- 이름 : 한글, 영문 대/소문자 2자 이상</li>
            <li>- 비밀번호 :  8자 이상 숫자만 가능</li>
          </ul>
          <p class="text-step">3. 등록하신 엑셀 파일을 업로드 하신 후 유효성 결과 리스트에서 수정 하신 후 <br>최종 등록 해주세요. </p>
          <table class="tbl-excel">
            <caption>임시 학생 일괄 등록</caption>
            <colgroup>
              <col style="width:110px;">
              <col style="width:85px;">
              <col style="width:auto;">
              <col style="width:130px;">
              <col style="width:120px;">
            </colgroup>
            <thead>
            <tr>
              <th scope="col"><span class="required">학반(태그)</span></th>
              <th scope="col"><span class="required">반 번호</span></th>
              <th scope="col"><span class="required">학생 이름</span></th>
              <th scope="col"><span class="required">아이디</span></th>
              <th scope="col"><span class="required">비밀번호</span></th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>1-1</td>
              <td>1</td>
              <td>김하이</td>
              <td>alsk12</td>
              <td>********</td>
            </tr>
            <tr>
              <td>햇님반</td>
              <td>2</td>
              <td>최미나</td>
              <td>alsk1234</td>
              <td>********</td>
            </tr>
            </tbody>
          </table>
          <div class="box-notice">
            <p>학생 간 서로 유추하기 쉬운 아이디와 비밀번호 규칙은 자제해주세요.</p>
          </div>
        </div>
      </div>
    </template>
  </modal-layout>
</template>

<script>
import ModalLayout from "@/components/Modal/ModalLayout";

export default {
  name: "clazz-member-add-student-batch-guide",
  components: {ModalLayout},
  data() {
    return {
      componentKey: 0,
    }
  },
  methods: {
    close() {
      this.$emit('closeGuide')
    }
  }
}
</script>

<style lang="scss" scoped>
.guide-register-temp-student-modal {
  z-index: 10000;
  background: 0;
  ::v-deep .modal-cont-wrap {
    overflow: visible;
    .boundary-box {
      width: 600px;
      box-shadow: 0 2px 10px 10px rgba(0, 0, 0, 0.15);
      padding-bottom: 40px;
    }
  }
  .guide-wrap {
    padding: 0 25px;
    margin-top: 25px;
  }
  .text-step {
    color: #222;
    font-size: 15px;
    font-weight: 400;
    text-align: left;
    line-height: 1.4;
    text-indent: -15px;
    padding-left: 15px;
    margin-bottom: 10px;
  }
  .box-list {
    background-color: #fafafa;
    padding: 20px;
    font-size: 0;
    margin-bottom: 25px !important;
    li {
      display: inline-block;
      width: 50%;
      color: #616161;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.6;
      text-align: left;
      &:first-child {
        width:100%;
      }
    }
  }
  .box-notice {
    background-color: #fff4f6;
    border: 1px solid #ffcacf;
    border-radius: 3px;
    padding: 16px;
    margin-top: 25px;
    p {
      color: #ff2a20;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.4;
      text-align: left;
      padding-left: 20px;
      &::before {
        content: "!";
        width: 12px;
        height: 12px;
        font-size: 10px;
        line-height: 12px;
        display: inline-block;
        text-align: center;
        border: 1px solid #ff2a20;
        border-radius: 50%;
        margin-right: 6px;
        margin-left: -20px;
      }
    }
  }
  .tbl-excel {
    border-left: 1px solid #e3e3e3;
    border-right: 1px solid #e3e3e3;
    tbody {
      td {
        height: 32px;
        line-height: 32px;
        color: #616161;
      }
    }
  }
}
</style>