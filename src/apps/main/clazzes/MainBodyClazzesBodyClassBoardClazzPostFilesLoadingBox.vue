<template>
  <div>
    <ul
      v-if="isVisiblePhotoLoading"
      class="group-photo-video loading"
    >
      <li
        v-for="i of 12"
        :key="`photo-${i}`"
      ></li>
    </ul>

    <div
      v-else-if="isVisibleFileLoading"
      class="board-file__list"
    >
      <div
        v-for="i of 8"
        :key="`file-${i}`"
        class="loading"
        :class="{
          'board-file__date': i === 1 || i === 5,
          'board-file__item': i !== 1 && i !== 5
        }"
      ></div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "main-body-clazzes-body-class-board-clazz-post-files-loading-box",
  computed: {
    ...mapState({
      curClassPostFileTabCode: 'curClassPostFileTabCode',
    }),
    isVisiblePhotoLoading() {
      return this.curClassPostFileTabCode === 'image'
        || this.curClassPostFileTabCode === 'video'
    },
    isVisibleFileLoading() {
      return this.curClassPostFileTabCode === 'file'
    },
  }
}
</script>

<style scoped>

</style>