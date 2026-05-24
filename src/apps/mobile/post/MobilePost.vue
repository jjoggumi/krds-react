<template>
  <div>
    <!--<p>mobile-post id => {{ id }}</p>
    <br />
    <input
      type="checkbox"
      id="viewer-mode-check"
      v-model="option.viewerMode"
    />
    <label for="viewer-mode-check">
      <span>뷰어 모드</span>
    </label>
    <br /><br />-->

<!--    -->

    <hc-editor
      v-if="option.initComplete"
      :model="model"
    />
  </div>
</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";

const HcEditor = () => ({
  component: import('@/components/Editor/HcEditor'),
  error: ErrorLoadFailAsyncComponent,
})
export default {
  name: "mobile-post",
  components: {
    HcEditor,
  },
  data() {
    return {
      id: null,
      option: {
        initComplete: false,
        viewerMode: false
      },
      model: {
        postContent: null,
      },
    }
  },
  methods: {
    async init() {
      const validate = require('uuid-validate')
      const id = this.$route.params.id
      this.id = id

      this.$log.debug(`uuid version => ${validate.version(id)}`)

      if (validate(id)) {
        const url = `/posts/${id}`

        await this.hiClass.posts.read(url)
          .then(res => {
            if (res.data)
              this.model = res.data
          })
          .catch(err => {
            this.$log.debug(err)
          })
          // .finally(() => {
          // })
      }
      this.option.initComplete = true

      // this.curForm = id.replace(/^./, id[0].toUpperCase());
      // document.title = "MobileInvite-" + this.curForm;
    }
  },
  created() {
    this.init();
  }
};
</script>

<style scoped>
</style>