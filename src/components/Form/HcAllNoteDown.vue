<template>
  <button :class="buttonClass" v-on:click="down">
    <span>
      <slot>알림장 전체 다운로드</slot>
    </span>
  </button>
</template>

<script>
export default {
  name: "hiClass_AllNoteDown",
  props: {
    classId: {
      required: true
    },
    buttonClass: {
      type: String
    }
  },
  methods: {
    down() {
      this.$hiClass.clazzes
        .reports({
          _clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`
        })
        .then(res => {
          let filename = this.$moment().format("YYYY-MM-DD_HHmmss") + ".txt";
          this.$downloadjs(
            new Blob([res.data.replace(/\n/g, "\r\n")]),
            filename,
            "text/plain"
          );
        });
    }
  }
};
</script>
