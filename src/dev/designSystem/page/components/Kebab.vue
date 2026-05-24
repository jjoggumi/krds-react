<template>
  <article class="kebabSys type01">
    <div class="sections">
      <section>
        <h2> 
          <div class="tit-wrap">
            Kebab UI        
            <HiKebab>
              <button class="btn-copy">btn-copy</button>
              <button class="btn-export">btn-export</button>
              <button class="btn-move">btn-move</button>
              <button class="btn-delete">btn-delete</button>
            </HiKebab>
          </div>
          <HiButton @click="setCode('basic')">코드보기</HiButton>        
        </h2>
      </section>      
      <section>
        <h2> 
          <div class="tit-wrap">
            하이톡 예약 메시지 목록 리스트 내 캐밥 메뉴    
            <HiKebab>
            <button class="btn-hitalk-send">지금 보내기</button>
            <button class="btn-hitalk-delete" >예약 삭제</button>
            <button class="btn-hitalk-reserve">실패메시지 재전송</button>
            <button class="btn-hitalk-delete" >전송내역 삭제</button>
            <button class="btn-hitalk-delete">전송내역 삭제</button>
          </HiKebab>
          </div>
          <HiButton @click="setCode('type01')">코드보기</HiButton>        
        </h2>
      </section>   
      <section>
        <h2>
          <div class="tit-wrap">
            코멘트 내 캐밥 메뉴         
            <HiKebab>            
              <button class="btn-edit">수정하기</button>
              <button class="btn-report">신고하기</button>
              <button class="btn-delete">삭제하기</button>
            </HiKebab>
          </div>
          <HiButton @click="setCode('type02')">코드보기</HiButton>           
        </h2>
      </section> 
      <section>
        <h2>
          <div class="tit-wrap">
          게시판 포스트 내 캐밥 메뉴          
          <HiKebab>            
            <button class="btn-notice-off">공지 취소</button>
            <button class="btn-notice">공지</button>
            <button class="btn-blackbd-modify">페이지명 수정</button>
            <button class="btn-modify">게시글로 수수정</button>
            <button class="btn-copy">복사</button>
            <button class="btn-move">이동</button>
            <button class="btn-delete">삭제</button>
          </HiKebab>
          </div>
          <HiButton @click="setCode('type03')">코드보기</HiButton>           
        </h2>
      </section> 
      <section>
        <h2>
          <div class="tit-wrap">
          설문·투표 > 추천 템플릿 > 템플릿 리스트 내 캐밥 메뉴           
          <HiKebab>            
            <button class="btn-delete">공지 취소</button>
          </HiKebab>
          </div>
          <HiButton @click="setCode('type04')">코드보기</HiButton>           
        </h2>
      </section> 
      <section>
        <h2>
          <div class="tit-wrap">
          설문·투표 쓰기/수정 > 좌측 페이지 내 캐밥 메뉴         
          <HiKebab>            
            <button>페이지명 수정</button>
            <button>페이지명 해제</button>
          </HiKebab>
          </div>
          <HiButton @click="setCode('type05')">코드보기</HiButton>           
        </h2>
      </section> 
      <section>
        <h2>
          <div class="tit-wrap">
          업로드 파일 정렬 캐밥 메뉴         
          <HiKebab>            
            <button class="btn-align-left">왼쪽 맟춤</button>
            <button class="btn-align-center">가운데 맞춤</button>
            <button class="btn-align-right">오른쪽 맞춤</button>
            <button class="btn-align-change">변경</button>
            <button class="btn-image">사진편집</button>
            <button class="btn-delete">삭제</button>
          </HiKebab>
          </div>
          <HiButton @click="setCode('type06')">코드보기</HiButton>           
        </h2>
      </section>     
    </div>
    <div class="ctrArea">      
      <div class="codeArea">
        <pre>
          <code v-html="currentCode"></code>
        </pre>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: "ComponentsKebab",
  data() {
    return {      
      currentCode: '',
    };
  },
  methods: {
    setCode(type) {
      const codeMap = {
        basic: `
      <HiKebab>
        <button class="btn-copy">btn-copy</button>
        <button class="btn-export">btn-export</button>
        <button class="btn-move">btn-move</button>
        <button class="btn-delete">btn-delete</button>
      </HiKebab>
          `,
        type01: `
      <HiKebab>
        <button class="btn-hitalk-send">지금 보내기</button>
        <button class="btn-hitalk-delete" >예약 삭제</button>
        <button class="btn-hitalk-reserve">실패메시지 재전송</button>
        <button class="btn-hitalk-delete" >전송내역 삭제</button>
        <button class="btn-hitalk-delete">전송내역 삭제</button>
      </HiKebab>
      `,
        type02: `
      <HiKebab>            
        <button class="btn-edit">수정하기</button>
        <button class="btn-report">신고하기</button>
        <button class="btn-delete">삭제하기</button>
      </HiKebab>
      `,
        type03: `
      <HiKebab>            
        <button class="btn-notice-off">공지 취소</button>
        <button class="btn-notice">공지</button>
        <button class="btn-blackbd-modify">페이지명 수정</button>
        <button class="btn-modify">게시글로 수수정</button>
        <button class="btn-copy">복사</button>
        <button class="btn-move">이동</button>
        <button class="btn-delete">삭제</button>
      </HiKebab>
      `,
        type04: `
      <HiKebab>            
        <button class="btn-delete">공지 취소</button>
      </HiKebab>
      `,
        type05: `
      <HiKebab>            
        <button>페이지명 수정</button>
        <button>페이지명 해제</button>
      </HiKebab>
      `,
        type06: `
      <HiKebab>            
        <button class="btn-align-left">왼쪽 맟춤</button>
        <button class="btn-align-center">가운데 맞춤</button>
        <button class="btn-align-right">오른쪽 맞춤</button>
        <button class="btn-align-change">변경</button>
        <button class="btn-image">사진편집</button>
        <button class="btn-delete">삭제</button>
      </HiKebab>
      `,
      };

      // type에 따라 currentCode 설정
      this.currentCode = this.encodeHTML(codeMap[type] || `<div>default</div>`);
    },
    encodeHTML(html) {
      const div = document.createElement("div");
      div.innerText = html;
      return div.innerHTML;
    },    
  },
};
</script>
<style lang="scss" scoped>
.designSys article.kebabSys .sections{
  section{
    padding:35px;
    h2{
      position: relative;
      margin: 0;
      display: flex;
      justify-content: space-between;
      > .tit-wrap{
        position: relative;
        width: 80%;
      }
      ::v-deep .hi-kebabmenu {
        position: absolute;
        right: 0;
        top: 0;
      }
    }
  }
}
</style>