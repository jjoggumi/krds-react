<template>
  <div class="modal normal-modal hitalk-alert-modal" style="display: block;">
    <div class="modal-cont-wrap">
      <div class="modal-cont boundary-box-550">
        <div class="modal-cont-inner">
          <div class="icon-title-wrap">
            <p style="margin-top:0px;margin-bottom:5px;">
              <span>
                <div class="highlight">하이톡 반응하기 기능 추가</div>
              </span>
            </p>
            <div class="text-wrap">
              굳이 답장하지 않아도 되는 메시지는?
              <!-- <span class="highlight-red">PC 하이톡</span>에서 
              <span class="highlight-red">동영상</span>과 
              <span class="highlight-red">여러 개의 이미지</span>를
              <br/>한번에 발송할 수 있어요 -->
            </div>
            <p style="margin-top:10px;margin-bottom:5px;">
              <span>
                # 말 없이 간단한 리액션으로 # 더욱 간편한 소통 기능!
              </span>
            </p>
           
            <div><img class="image-post" src="files/img/img_info_reaction.png"/></div>
            <!--div class="desc">ㆍ하이톡 저장 방법 &nbsp;:&nbsp; 하이톡 &nbsp;&gt;&nbsp; 대화방 선택 &nbsp;&gt;&nbsp; 대화 저장하기</div-->
          </div>
          <div class="btn-wrap">
            <button class="modal-close-btn btn-bg-w2" @click.prevent="closeModal('completed')">다시보지않기</button>
            <button class="btn-bg-c" @click="closeModal('count')">확인</button>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="closeModal('count')"></div>
      </div>
    </div>
  </div>
</template>
  
<script>
  import {mapMutations} from 'vuex'

  export default {
    methods: {
      ...mapMutations('storeHitalk',['setHitalkNoticePopup']),
      closeModal: function(type){
        const count =  +(localStorage.hitalkFileNoticeCount || 0);
        localStorage.setItem('hitalkReactionNoticeCount', count + (type === 'count' ? 1 : 5));
        this.setHitalkNoticePopup(false)
      }
    }
  }
</script>
  
<style scoped>
.image-post {
  margin-top: 15px;
}
.hitalk-alert-modal.modal .modal-cont .icon-title-wrap p span {
  font-size: 14px;
  font-weight: 400;
}
</style>
  