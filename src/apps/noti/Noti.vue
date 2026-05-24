<template>
  <div id="wrap" :class="className" ref="noti" v-if="isLoadComplete">
    <div id="cont-wrap">
      <!-- header -->
      <NotiHeader ref="header"></NotiHeader>
      <!-- header -->

      <div id="cont-box-wrap">
        <div class="cont-box-inner clfix">
          <router-view ref="body"></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotiHeader from "./NotiHeader.vue";

export default {
  name: "Noti",
  components: {
    NotiHeader
  },
  data: () => ({
    className: "",
    isLoadComplete: false
  }),
  watch: {
    $route(to) {
      this.$comn.log(this, "call", to.path);
      this.init(to.path);
    }
  },
  methods: {
    init(to) {
      let name = this.$route.meta.class;
      if (typeof name === "undefined") name = "school-class";
      this.className = `page-${name}`;

      this.initAfterLoad(to);
    },
    initAfterLoad(to) {
      if (to === "/noti") to = "/noti/closeAccount";
      this.$router.replace(to, () => {});
      this.isLoadComplete = true;
    }
  },
  created: function() {
    const to = this.$route.path;
    this.init(to);
  }
};
</script>

<style scoped></style>
