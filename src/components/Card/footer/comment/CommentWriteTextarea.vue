<template>
  <textarea
    ref="textarea"
    :placeholder="!posWriteComment ? '댓글을 작성할 수 없습니다.' : option.commentPlaceholder"
    :disabled="!posWriteComment"
    @input="inputComment($event)"
    v-html="commentData"
  ></textarea>
</template>

<script>
export default {
  name: "comment-write-textarea",
  data() {
    return {
      prevComment: ''
    }
  },
  props: {
    comment: {
      type: String,
    },
    option: {
      type: Object,
    },
    posWriteComment: {
      type: Boolean,
    },
    emoticonPath: {
      type: String
    }
  },
  computed: {
    commentData: {
      get() {
        return this.comment
      },
      set(val) {
        this.$emit('update:comment', val)
      }
    },
  },
  watch: {
    commentData(newVal) {
      if (newVal.trim().length === 0) {
        this.prevComment = ''
        this.$refs.textarea.value = ''
        return true
      }

      this.initStyleTextarea()
    },
  },
  mounted() {
    this.prevComment = this.comment
    this.$nextTick(() => this.initStyleTextarea())
  },
  updated() {
    this.initStyleTextarea()
  }, 
  methods: {
    resize() {
      // this.$log.debug(this.$options.name, 'trigger resize()')
      // const obj = this.$refs.textarea
      // if (obj) {
      //   obj.style.height = '1px'
      //   obj.style.height = obj.scrollHeight + 'px'
      // }
    },
    initStyleTextarea() {
      if (this.$refs.textarea) {
        this.$refs.textarea.style.height = '24px'
        this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`
      }
    },
    doFocusTextarea() {
      const obj = this.$refs.textarea
      if (obj) {
        obj.focus()
      }
    },
    inputComment(e) {
      let value = e.target.value
      if ([...e.target.value].length > 300) {
        this.$hiClass.alert('댓글은 300자를 넘을 수 없습니다.', 'warning')
        this.$refs.textarea.blur()
        value = this.prevComment
      }

      e.target.value = value
      this.commentData = value
      this.prevComment = value
    }
  }
}
</script>

<style scoped>
textarea {
  overflow: hidden;
}
</style>