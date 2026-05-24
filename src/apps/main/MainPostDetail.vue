<template>
  <div v-html="convertHtml"></div>
</template>

<script>
export default {
  name: "MainPostDetail",
  props: ["html"],
  data: () => ({
    convertHtml: ""
  }),
  components: {},
  methods: {
    modifyUrl(url) {
      let endpoint = url;
      endpoint = endpoint.replace("oembed", "iframe");
      endpoint = endpoint.replace("url", "src");
      endpoint = endpoint.replace("watch?v=", "embed/");
      endpoint = endpoint.replace("oembed", "iframe");
      return endpoint;
    }
  },
  created() {
    this.convertHtml = this.modifyUrl(this.html);
  }
};
</script>

<style scoped>
</style>
