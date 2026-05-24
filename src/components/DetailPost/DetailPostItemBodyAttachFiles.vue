<template>
  <div v-if="post.version === null || post.version === 'V1'">
    <!-- 첨부 이미지 div -->
    <div
      class="img-vedio-view-wrap"
      v-if="$comn.isImage(post.files, true).length > 0"
    >
      <div class="img-vedio-view-inner">
        <div class="img-view-wrap">
          <div
            class="height-100-per"
            v-for="file in $comn.isImage(post.files, true)"
            :key="file.currentId"
          >
            <a
              v-if="isShowImageNonThumbnail(post.postType, file.fileFlag)"
              href="javascript:void(0)"
              @click="openAttachFile(file)"
            >
              <img :src="file.fileOriginalPath" alt="" />
            </a>
          </div>
        </div>
      </div>
    </div>
    <!-- 첨부 이미지 div -->

    <!-- 첨부 동영상 div -->
    <template v-for="file in $comn.isImage(post.files, 'v')">
      <hc-video
        :key="`${file.fileOriginalPath}-${file.fileTranscodePath}`"
        :item="post"
        :file="file"
        :options="$hiClass.setVideoOptions(file, 'classImgCrop1')"
      />
    </template>
    <!-- 첨부 동영상 div -->



    <!-- 첨부 파일 div -->
    <div
      class="text-wrap"
      v-if="
        $comn.isImage(post.files, false).length > 0 && isExistPostContent(post)
      "
    >
      <template v-for="file in $comn.isImage(post.files, false)">
        <button
          :key="file.currentId"
          class="attached-file btn-bg-cg"
          @click="openAttachFile(file)"
        >
          {{ file.fileName }}
        </button>
      </template>
    </div>
    <!-- 첨부 파일 div -->
  </div>
  <div v-else></div>
</template>

<script>
import HcVideo from "@/components/Form/HcVideo";
export default {
  name: "detail-post-item-body-attach-files",
  components: {HcVideo},
  props: {
    post: {
      type: Object,
      required: true
    },
  },
  data() {
    return {}
  },
  computed: {},
  methods: {
    isExistPostContent(post) {
      return (post.postContent !== undefined &&
        post.postContent !== null &&
        post.postContent.trim().length > 0) ||
        this.$comn.isImage(post.files, false).length > 0;
    },
    isShowImageNonThumbnail(postType, fileFlag) {
      const ignoreTypes = ['EDUCATION', 'EVENT', 'HINOTICE', 'CP_BOARD']
      return !(ignoreTypes.includes(postType) && fileFlag === 'THUMBNAIL');
    },
    openAttachFile(file) {
      if (this.$comn.isImage([file], true).length > 0) {
        this.$store.commit('setImageView', {
          isOpen: true,
          items: [file],
          index: 0
        })
      } else {
        this.$store.commit('setDocView', {
          isOpen: true,
          item: file
        })
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.height-100-per {
  text-align: center;
  margin: 3px auto;
}
.height-100-per img {
  width: 100%;
  height: auto;
}
.video-view-wrap video {
  display: block;
  margin: 10px auto;
  width: 90%;
  height: 90%;
}
#recommend_thumb {
  background-image: url('../../assets/img/recommend_thumb.png');
}
</style>