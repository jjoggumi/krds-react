<template>
  <div class="m-wrap m-search version-1">
    <header class="m-header m-head-search">
      <!-- <button class="m-btn-back">뒤로</button>
      <h1>자주 묻는 질문</h1>-->
      <div class="m-top-search">
        <input type="text" value="인증" />
        <button class="m-btn-delete-c">삭제</button>
      </div>
    </header>
    <!-- ::end.header-->
    <div class="m-container">
      <div class="m-total-result">
        <p>
          <span class="m-ft-blue">4개</span>의 검색 결과
        </p>
      </div>
      <div class="m-area-list">
        <ul class="m-box-faq-result">
          <li>
            <p>인증 문자가 오지 않아요. 어떻게 하나요?</p>
            <span class="m-txt-date">가입/변경/탈퇴</span>
          </li>
          <li>
            <p>인증 문자가 오지 않아요. 어떻게 하나요?</p>
            <span class="m-txt-date">가입/변경/탈퇴</span>
          </li>
          <li>
            <p>인증 문자가 오지 않아요. 어떻게 하나요?</p>
            <span class="m-txt-date">가입/변경/탈퇴</span>
          </li>
          <li>
            <p>인증 문자가 오지 않아요. 어떻게 하나요?</p>
            <span class="m-txt-date">가입/변경/탈퇴</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MobileHelpFaqSearch",
  components: {},
  data: () => ({})
};
</script>

<!--<style scoped src="../../../../assets/css/m-customer.css" />-->
