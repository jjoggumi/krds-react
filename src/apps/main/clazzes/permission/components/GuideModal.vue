<!--
@File(Method): GuideModal.vue
@Author: -
@Date Created: -
@Description: 게시판 설정 > 게시판 상세 설정 > 이용안내 클릭 >  게시판 이용안내 모달 
@Modified: 2025-02-03 - #71554 게시판 이용안내 팝업 노출 시 딤드 뒷화면 스크롤 되지 않도록 수정 : HiModal 컴포넌트로 변경
-->
<template>
  <HiModal type="type01" class="modal-guide" size="md" @close="onClose">
    <template v-slot:heading>게시판 이용안내</template>
    <template v-slot:content> 
      <ul class="guide__list">
          <li>
            <strong class="heading">게시판 사용</strong>
            <p class="desc">게시판 사용을 OFF하면 클래스 게시판 탭 보이지 않고, 기존 게시물 접근이 불가합니다. </p>
          </li>
          <li>
            <strong class="heading">읽기 권한</strong>
            <p class="desc">권한을 부여받은 구성원에게만 게시글이 보입니다. 이후 권한을 부여하여도, <br>이전 게시물의 읽기 권한이 없었다면 해당 게시물을 열람할 수 없습니다.</p>
          </li>
          <li>
            <strong class="heading">글쓰기 권한</strong>
            <p class="desc">권한을 부여 받은 구성원만 게시글 작성이 가능합니다.</p>
          </li>
          <li v-if="boardType !== 'SECRET'">
            <strong class="heading">댓글 사용</strong>
            <p class="desc">게시판에 댓글 사용 시 게시글 하단에 댓글창이 표시됩니다.</p>
          </li>
          <li>
            <strong class="heading">댓글쓰기 권한</strong>
            <p class="desc">권한을 부여 받은 구성원만 해당 게시판 댓글 확인 및 작성할 수 있습니다.</p>
          </li>
          <li>
            <strong class="heading">좋아요 사용</strong>
            <p class="desc">게시판에 좋아요 사용 시 게시글 하단에 좋아요 버튼이 표시됩니다.</p>
          </li>
        </ul>
    </template>
    <template v-slot:footer>
        <HiButton color="primary" size="lg"  @click="onClose" >확인</HiButton>           
    </template>
  </HiModal>
</template>

<script>
export default {
  name: "GuideModal",
  props: {
    boardType: String
  },
  methods: {
    onClose() {
      this.$emit('openModal', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-guide {
  ::v-deep .modal__layer {
    width: 610px;
    .guide__list {
      padding-top: 20px;
      li {
        text-align: left;
        + li {
          margin-top: 30px;
        }
      }
      .heading {
        color: #222;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.5;
      }
      .desc {
        margin-top: 5px;
      }
    }
  }  
  .btn-md {
    width: 200px;
    margin-top: 34px;
  }
}
</style>