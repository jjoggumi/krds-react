<template>
  <div class="modal normal-modal hitalk-alert-modal" style="display: block">
    <div class="modal-cont-wrap">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">공지하기 사용안내</div>
          </div>
          <div class="hitalk-notice-guide-wrap">
            <ul class="guide-list">
              <li class="item">
                <strong class="title">일괄메시지</strong>
                <p class="desc">동일한 내용을 각 개인 1:1 대화방으로 <br>전송 시 활용 할 수 있습니다.</p>
              </li>
              <li class="item">
                <strong class="title">단체방공지</strong>
                <p class="desc">동일한 내용을 여러명이 포함된 단체방에 공지<br>할 수 있습니다. 단 단체방은 선생님만 대화를 전송<br>할 수 있습니다.</p>
                <span class="text-refer">(학생 또는 학부모, 선택된 00명 가능)</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="closeGuide"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations} from "vuex";

export default {
  methods: {
    ...mapMutations("storeHitalk",[
      'hideGuidePopup',
    ]),
    closeGuide() {
      this.hideGuidePopup();
    },
  }
}
</script>

<style lang="scss" scoped>
  .hitalk-notice-guide-wrap {
    .guide-list {
      text-align: left;
      padding: 0 30px 40px;
      .item {
        position: relative;
        min-height: 100px;
        padding-left: 127px;
        padding-top: 10px;
        margin-top: 40px;
        &:first-child {
          margin-top: 27px;
        }
        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          display: block;
          width: 100px;
          height: 100px;
          background: url("~@/assets/img/icon/icons_hitalk.png") 0 -225px/200px auto no-repeat;
        }
        &:last-child {
          &::before {
            background-position: -100px -225px;
          }
        }
      }
      .title {
        color: #2e2e2e;
        font-size: 18px;
        font-weight: 700;
        line-height: 1.5;
      }
      .desc {
        color: #888;
        font-size: 15px;
        line-height: 1.5;
        margin-top: 8px;
      }
      .text-refer {
        display: block;
        color: rgba(136, 136, 136, 0.7);
        font-size: 12px;
        line-height: 1.5;
        margin-top: 8px;
      }
    }
  }
</style>
