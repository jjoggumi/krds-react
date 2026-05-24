<!--
@File(Method): 
@Author: -
@Date Created: -
@Description: 서비스 제안
@ETC : 서비스 제공 안되는 페이지 (삭제 요망) 
-->

<template>
  <div class="m-wrap">
    <header class="m-header">
      <!-- <button class="m-btn-back">뒤로</button>
      <h1>서비스 제안하기</h1>-->
      <button class="m-btn-send">보내기</button>
    </header>
    <!-- ::end.header-->
    <div class="m-container">
      <div class="m-box-propose">
        <div class="m-input-propose">
          <div class="m-input-box-wrap">
            <input type="text" value="제안드립니다." />
          </div>
          <div class="m-input-box-wrap">
            <textarea placeholder class="noresize">
              안녕하세요. 제안드립니다.
            </textarea>
          </div>
          <div class="m-gray-box">
            <p>
              첨부파일은 최대 5개, 10MB까지 등록 가능합니다.
              <br />파일 형식은 ...
            </p>
            <div class="filebox">
              <label for="ex_file">첨부파일 추가</label>
              <input type="file" id="ex_file" />
            </div>
          </div>
        </div>
        <ul class="m-attachfile-list">
          <li>
            <span
              >45481111641547845Hgjldafj13445481111641547845Hgjldafj1343434.JPG</span
            >
            <button class="m-btn-delete">삭제</button>
          </li>
          <li>
            <span>제안서.hwp</span>
            <button class="m-btn-delete">삭제</button>
          </li>
        </ul>
        <div class="m-propose-agreetxt">
          <p>
            문의하신 내용에 대한 원인파악 및 원활한 상담을 위하여 이메일,
            휴대폰번호를 수집합니다. 수집된...
          </p>
        </div>
      </div>
      <div class="m-agree-box">
        <div class="m-check-wrap">
          <input type="checkbox" id="agree-check1" class="m-checkbox" />
          <label for="agree-check1"></label>
          <span>위 내용에 동의합니다.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Help',
  components: {},
  data: () => ({})
}
</script>

<!--<style scoped src="../../../../assets/css/m-customer.css" />-->
