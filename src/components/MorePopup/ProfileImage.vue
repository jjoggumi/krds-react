<template>
  <div class="change-thumbnail-btn-wrap">
    <button
      class="btn-camera"
      v-click-outside="close"
      @click="isProfileImageMore = !isProfileImageMore"
    ></button>
    <div
      class="more-popup-wrap"
      :class="{
        on: isProfileImageMore
      }"
    >
      <button @click="$emit('change-profile-image')">
        <span class="text">사진 변경</span>
      </button>
      <button @click="$emit('remove-profile-image')">
        <span class="text">프로필 이미지 삭제</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "profile-image",
  data() {
    return {
      isProfileImageMore: false
    }
  },
  methods: {
    close() {
      this.isProfileImageMore = false
    }
  },
}
</script>

<style scoped>

</style>