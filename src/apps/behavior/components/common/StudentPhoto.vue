<template>
  <img @load='onLoadImage' v-if="isPhotoAndImgKind" :src="selectedImageSrc"
      :class="{'cursor-pointer': cursorPointer, 'is-height': isHeight}" />
  <div v-else-if="isPhotoAndNotImgKind" class="is-photo">
    <img @load='onLoadImage' :src="selectedImageSrc" :class="{'is-height': isHeight}" />
  </div>
  <img v-else @load='onLoadImage' :src="selectedImageSrc"
      :class="{'cursor-pointer': cursorPointer, 'is-height': isHeight}" />
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'student-photo',
  props: {
    student: {
      type: Object,
      required: true
    },
    kind: String,
    cursorPointer: {
      type: Boolean,
      default: true
    },
  },
  watch: {
    detailClass: {
      handler() {
        this.refreshImageRatio()
      },
      immediate: true,
      deep: true
    }
  },
  data: () => ({ isHeight: false }),
  computed: {
    ...mapState('storeBehavior', ['detailClass']),
    isPhoto() { return !!this.student.studentPhoto },
    isPhotoAndImgKind() { return this.isPhoto && this.kind === 'img' },
    isPhotoAndNotImgKind() { return this.isPhoto && this.kind !== 'img' },
    selectedImageSrc() {
      return this.isPhoto
        ? this.student.studentPhoto
        : `https://download.hiclass.net/static/classroom/student/${this.student.studentCharacter}_head.png`
    },
  },
  methods: {
    determineIsHeight(target) {
      if (target) {
        this.isHeight = target.width > target.height
      }
    },
    refreshImageRatio() {
      this.determineIsHeight(this.$el ? this.$el.querySelector('img') : null)
    },
    onLoadImage({ target }) {
      this.determineIsHeight(target)  
    }
  }
}
</script>

<style lang="scss">
</style>