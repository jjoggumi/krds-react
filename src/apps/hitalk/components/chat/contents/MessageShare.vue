<!--
@File(Method): MessageShare.vue
@Description: 하이톡 메시지 공유 컴포넌트
@Modified: 2025-12-08 - #82815 학급기록 포인트 리포트 하이톡 공유 UI 추가
-->
<template>
  <div class="chatting-bubble" @mouseover="showReactionOpenButton" @mouseleave="hideReactionOpenButton">
    <div class="thumb">
      <!-- #82815 학급기록 포인트 리포트 하이톡 공유 UI 추가  -->
      <template v-if="isReport">
        <span class="thumb-report"></span>
      </template>
      <template v-if="isSurvey">
        <span :class="surveyTypeCss"></span>
      </template>
      <template v-if="!isSurvey && !isReport">
        <img v-if="shareContent.thumbnail" :src="shareContent.thumbnail" alt="" />
      </template>
    </div>
    <div class="info">
      <p class="heading" :inner-html.prop="shareContent.title" :class="{ 'share-report-title': isReport === true }" ></p>
      <div v-if="!isOtherPost" class="text">
        <p>{{ shareContent.content }}</p>
      </div>
      <div class="group-link">
        <template v-if="isClassPost || isSchoolPost || isClassApply || isSurvey">
          <a href="javascript:" class="link" @click="goRoute">{{ routeButtonTitle }}</a>
        </template>
        <a href="javascript:" class="link" @click="openDetail">{{ detailButtonTitle }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'message-share',
  props: {
    shareContent: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      classPostTypes: ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'],
      schoolPostTypes: ['ALARM', 'NOTICE', 'MEAL', 'ALARM_EDU_OFFICE'],
      otherPostTypes: ['EDUCATION', 'EVENT', 'CP_BOARD', 'HINOTICE'],
      classApplyTypes: ['SHEET', 'CLASS_APPLY'],
      clickVal: '',
      postDetail: {},
    };
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    shareType() {
      return this.shareContent.shareType;
    },
    isClassPost() {
      return this.classPostTypes.includes(this.shareType);
    },
    isSchoolPost() {
      return this.schoolPostTypes.includes(this.shareType);
    },
    isOtherPost() {
      return this.otherPostTypes.includes(this.shareType);
    },
    isClassApply() {
      return this.classApplyTypes.includes(this.shareType);
    },
    isSurvey() {
      return this.shareType === 'SURVEY';
    },
    // #82815 학급기록 포인트 리포트 하이톡 공유 UI 추가
    isReport() {
      return this.shareType === 'CLASSROOM' ;
    },
    isShareTypeSheet() {
      return this.shareType === 'SHEET';
    },
    isShareTypeClassApply() {
      return this.shareType === 'CLASS_APPLY';
    },
    routeButtonTitle() {
      let title = '';

      if (this.isClassPost || this.isSurvey) title = '클래스 가기';
      else if (this.isSchoolPost) title = '학교가기';
      else if (this.isClassApply) title = '제출내역';

      return title;
    },
    detailButtonTitle() {
      return this.isClassApply && this.shareType === 'SHEET' ? '작성하기' : '상세보기';
    },
    surveyTypeCss() {
      return (
        {
          SURVEY: 'thumb-survey',
          AFTER_SCHOOL: 'thumb-afterschool',
          FCFS: 'thumb-fcfs',
          DRAW: 'thumb-draw',
        }[this.shareContent.surveyType] || 'thumb-counsel'
      );
    },
  },
  methods: {
    showReactionOpenButton: function () {
      this.$emit('showReactionOpenButton');
    },
    hideReactionOpenButton: function () {
      this.$emit('hideReactionOpenButton');
    },
    onClickLink(type) {
      this.$hiClass.alert(type);
    },
    async goRoute() {
      this.clickVal = 'goRoute';
      let routePath = `/main/clazzes/${this.shareContent.classId}`;
      try {
        routePath = await this.getRoutePath();
      } catch (e) {}
      window.open(routePath, this.$moment().valueOf().toString());
    },
    async getRoutePathByHiclassSheet() {
      return await this.getRoutePath();
    },
    async getRoutePathByWorksheet() {
      let routePath = window.location.origin;
      if (!this.shareContent.sheetId) {
        this.shareContent.sheetId = await this.getSheetIdByClassApplyId();
      }

      routePath += `/worksheetApply/${this.shareContent.classId}/${this.shareContent.sheetId}`;
      if (this.shareContent.classApplyId) routePath += `/${this.shareContent.classApplyId}`;

      return routePath;
    },
    getDetailUrl() {
      let path = '';
      if (this.shareContent.postId && (this.isClassPost || this.isSchoolPost || this.isOtherPost)) path += `?postId=${this.shareContent.postId}`;

      switch (this.shareContent.sheetType) {
        case 'H': {
          if (this.isShareTypeClassApply) path += `?applyId=${this.shareContent.classApplyId}`;
          if (this.isShareTypeSheet) path += `?sheetId=${this.shareContent.sheetId}`;
          break;
        }
      }

      return path;
    },
    getSheetIdByClassApplyId() {
      return this.$hiClass.clazzApplies
        .read(`/v2/clazzApplies/${this.shareContent.classApplyId}`)
        .then((res) => res.data.sheetId)
        .catch(() => null);
    },
    async openDetail() {
      if(this.isReport) {
        this.$emit('openClassRoomReport', this.shareContent);
        return;
      } 

      this.clickVal = 'openDetail';
      let routePath;
      try {
        routePath = await this.getRoutePath();
      } catch (e) {
        this.$hiClass.alert('삭제된 게시글입니다.');
        return false;
      }

      if (this.postDetail.del || (this.isClassPost && this.postDetail.board.boardStatus === this.CONSTANTS.BOARD_STATUS.DEACTIVATE)) {
        this.$hiClass.alert('삭제된 게시글입니다.');
        return false;
      }

      if (this.isClassApply) {
        switch (this.shareContent.sheetType) {
          case 'H':
            routePath = await this.getRoutePathByHiclassSheet();
            break;
          case 'W':
            routePath = await this.getRoutePathByWorksheet();
            break;
        }
      }

      const detailUrl = this.getDetailUrl();
      window.open(routePath + detailUrl, this.$moment().valueOf().toString());
    },
    async getRoutePath() {
      let routePath = `${window.location.origin}/main`;

      // 게시글 상세 정보 조회
      if (!this.postDetail.postId && !this.isClassApply && !this.isSurvey) {
        const response = await this.$hiClass.posts.read(`/posts/${this.shareContent.postId}`);
        if (response.data) {
          this.postDetail = response.data;
        }
      }

      if (this.isClassPost) {
        routePath += `/clazzes/${this.shareContent.classId}/${this.postDetail.postType.toLowerCase()}`;
        const boardId = this.postDetail.boardId || null;
        const categoryId = this.postDetail.categoryId || null;
        const isUsedFolder = this.postDetail.board.isUsedFolder;
        if (boardId) {
          routePath += `/${boardId}`;

          if (isUsedFolder && categoryId) {
            routePath += `/${categoryId}`;
          }
        }
      } else if (this.isSchoolPost) {
        routePath += `/schools/${this.shareContent.schoolId}/${this.shareType.toLowerCase()}`;
      } else if (this.isClassApply) {
        routePath += `/clazzes/${this.shareContent.classId}/form`;

        if (this.isClassApply && this.clickVal === 'goRoute') {
          routePath += `/applyList`;
        } else if (this.isClassApply && this.clickVal === 'openDetail') {
          if (this.detailButtonTitle === '작성하기') routePath += `/sheetListMember`;
          else if (this.detailButtonTitle === '상세보기') routePath += `/applyList`;
        }
      } else if (this.isSurvey) {
        if (this.clickVal === 'goRoute') {
          routePath += `/clazzes/${this.shareContent.classId}/${this.shareType.toLowerCase()}`;
        } else {
          routePath = `${window.location.origin}/survey-response/${this.shareContent.surveyId}`;
        }
      }

      return routePath;
    },
  },
};
</script>
<style scoped lang="scss">
.chatting-bubble .info .share-report-title {
  -webkit-line-clamp: 2;
  display: -webkit-box;
  word-wrap: break-word !important;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  white-space: normal !important;
}
</style>