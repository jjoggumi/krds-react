<template>
  <div class="record-recording__top">
    <div class="close" @click="closeLayer">
      <i class="bh-icon-arrowright-24 cursor-pointer"></i>
      <span>내용 접기</span>
    </div>

    <div v-if="isNew" class="btn-wrap">
      <button @click="closeLayer" class="esc">취소</button>
      <button :disabled="!isSubmit" :class="{ dis: !isSubmit }" @click="submit" class="reg">등록</button>
    </div>
    <div v-else class="more" v-click-outside="closeMoreLayer">
      <i class="bh-plus-morevert-32 cursor-pointer" @click="toggleMoreLayer"></i>
      <ul v-if="isOpenMoreLayer" style="display: block">
        <li v-if="isDownload" @click="download">{{ downloadString }}</li>
        <!--li>음성 기록 다운로드</li-->
        <li @click="deleted" class="del">기록 삭제하기</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
  name: 'recording-detail-header',
  props: {
    isDetail: Boolean,
    isAudio: Boolean,
    isDownload: Boolean,
    isSubmit: Boolean,
  },
  data() {
    return {
      isOpenMoreLayer: false,
    };
  },
  computed: {
    isNew: function () {
      return !this.isDetail;
    },
    downloadString: function () {
      return this.isAudio ? '녹음 파일 다운로드' : '저장하기';
    },
  },
  watch: {
    isSubmit: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.setIsWritingRecord(newVal);
      }
    },
  },
  methods: {
    ...mapMutations('storeBehavior', {
      setIsWritingRecord: 'setIsWritingRecord',
    }),
    closeLayer: function () {
      this.$emit('close');
    },
    submit: function () {
      this.setIsWritingRecord(false);
      this.$emit('submit');
    },
    download: function () {
      this.$emit('download');
      this.closeMoreLayer();
    },
    deleted: function () {
      this.$emit('delete');
      this.closeMoreLayer();
    },
    toggleMoreLayer: function () {
      this.isOpenMoreLayer = !this.isOpenMoreLayer;
    },
    closeMoreLayer: function () {
      if (this.isOpenMoreLayer) {
        this.isOpenMoreLayer = false;
      }
    },
  },
};
</script>

<style>
.dis {
  color: #fff !important;
  background: #d6d6d6 !important;
  border-color: #d6d6d6 !important;
}
</style>