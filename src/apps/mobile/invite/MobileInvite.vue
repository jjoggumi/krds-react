<template>
  <component :is="curForm"></component>
</template>

<script>
import ClazzInviteCard from "./clazzInviteCard/MobileInviteClazzInviteCard.vue";

export default {
  name: "MobileInvite",
  components: {
    ClazzInviteCard
  },
  data: () => ({}),
  watch: {
    $route() {
      this.setComponent();
    }
  },
  methods: {
    setComponent() {
      let id = this.$route.params.id;
      this.curForm = id.replace(/^./, id[0].toUpperCase());
      document.title = "MobileInvite-" + this.curForm;
    }
  },
  created() {
    this.setComponent();
  }
};
</script>

<style scoped>
</style>