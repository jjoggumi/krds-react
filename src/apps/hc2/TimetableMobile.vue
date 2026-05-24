<template>
  <!--
  <mobile-change-lesson></mobile-change-lesson>
  -->
  <timetable-mobile-main basepath="/mobile/timetable"></timetable-mobile-main>
</template>

<script>
import ReactStyle from '@/apps/hc2/mixins/reactStyle';
export default {
  name: 'timetable-mobile',
  mixins: [ReactStyle],
  watch: {
    // index(iframe) 화면 여부가 바뀌는 경우 body 클래스도 동기화
    isShowIndex(val) {
      this.$hiClass?.toggleBodyClass(val ? 'add' : 'remove', 'iframeShow');
    },
  },
  data() {
    return {};
  },
  async created() {
    this.setComponent();
    if (this.applyStyle) this.applyStyle();
  },
  mounted() {
    setTimeout(() => {
      document.documentElement.classList.add('hc2', 'timetable-root');
      window.addEventListener('react-route-change', this.handleReactNavigate);
    }, 0);
  },
  beforeDestroy() {
    if (this.removeStyle) this.removeStyle();
    document.documentElement.classList.remove('hc2', 'timetable-root');
    window.removeEventListener('react-route-change', this.handleReactNavigate);
  },
  methods: {
    setComponent() {
      //empty
    },
    async handleReactNavigate(event) {
      const { routePath, query } = event.detail;

      const { timetableId, lessonDate, teacherId } = query || {};

      console.log('>> ', lessonDate, timetableId, teacherId);

      if (routePath) {
        await this.$router.push({ path: routePath, query: query || {} });
      }
    },
  },
}
</script>
<style scoped>
</style>