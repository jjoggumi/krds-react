<template>
  <div
    v-if="isPostHomeworkUser && postContent"
    class="v1-editor-view"
    @click="handleClick($event, postItem)"
  >
    <pre v-html="autoLinkedContent"></pre>
  </div>

  <div
    v-else-if="postContent"
    class="v1-editor-view"
    v-html="autoLinkedContent"
    @click="handleClick($event, postItem)"
  ></div>

  <div v-else></div>
</template>

<script>
export default {
  name: "post-content-v1",
  props: {
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost | postHomeworkUsers )
     */
    postItem: {
      type: Object
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST | POST_HOMEWORK_USERS )
     */
    postItemType: {
      type: String
    },
    content: {
      type: [String, null]
    }
  },
  computed: {
    isPostHomeworkUser() {
      return this.postItemType === 'POST_HOMEWORK_USERS'
    },
    postContent() {
      if (this.content) return this.content

      return this.postItem.postContent
    },
    autoLinkedContent() {
      const urlRegex = /((https?:\/\/|www\.)[^\s<>()]+[^\s<>,.!?;:'")\]])/gi;
      const content = this.postContent || '';
      return content.replace(urlRegex, function(url) {
        const hasSrcAttribute = /src="/.test(content.slice(content.indexOf(url) - 5, content.indexOf(url)));
        const hasHrefAttribute = /href="/.test(content.slice(content.indexOf(url) - 6, content.indexOf(url)));
        if (hasSrcAttribute || hasHrefAttribute) return url
        let cleanUrl = url.replace(/[),.!?;:'")\]]+$/, '');
        let trailing = url.slice(cleanUrl.length);
        let href = cleanUrl.startsWith('http') ? cleanUrl : 'http://' + cleanUrl;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${trailing}`;
      });
    }
  },
  methods: {
    handleClick($event, postItem) {
      this.$hiClass.handleImageClick($event, postItem, [], true);
      this.$hiClass.handleVideoClick($event, postItem);
    }
  }
}
</script>

<style scoped>

</style>