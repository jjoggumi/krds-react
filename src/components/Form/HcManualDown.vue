<template>
  <button v-on:click="down">
    <span>
      <slot>
        하이클래스 안내문
      </slot>
      </span>
  </button>
</template>

<script>
export default {
  name: 'hiClass_ManualDown',
  computed: { },
  methods: {
    down() {
      this.$comn.download(`${process.env.VUE_APP_URL_PROTOCOL}${process.env.VUE_APP_BASE_CDN_URI}/static/document/hiclass_download_teacher_doc_01.hwp`
        , '[학급용]하이클래스 설명서+설치안내문+정보동의서.hwp')
    }
  }
}
</script>
