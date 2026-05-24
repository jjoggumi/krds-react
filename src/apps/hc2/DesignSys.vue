<template>
  <div>
    <uiux-page
      class="text-send"
      :route="JSON.stringify(curRoute)"
      :authorities="JSON.stringify([])"
    />
  </div>
</template>

<script>
import AlarmplusMixin from '@/apps/alarmplus/mixins/AlarmplusMixin.vue';
import ReactStyle from '@/apps/hc2/mixins/reactStyle';
export default {
  name: 'DesignSys',
  data() {
    return {
      curRoute: {
        menu: 'designsys',
        schoolId: '',
        query: {}
      },
    };
  },
  mixins: [ AlarmplusMixin, ReactStyle ],
  watch: {
    
  },
  computed: {   
  },
  async created() {
    // hc2 공용 스타일 적용 (hc-common + hc-tailwind)
    this.applyStyle();
  },
  mounted() {
    this.setVheight(); // 초기 높이 설정
    this.boundSetVh = this.setVheight.bind(this); // this 바인딩
    setTimeout(() => {
      document.documentElement.classList.add('hc2');
    }, 0);
  },
  beforeDestroy() {
    this.removeStyle();
    document.documentElement.classList.remove('hc2');
  },
  methods: {
    setVheight() {
      if (this.isShowIndex) {
        this.recalcIframeStyle();
      } else {
        this.setVh()
      }
    },    
  },
};
</script>
<style scoped>
.text-send {
  width: 100%;
  height: calc(100vh - 65px);
  display: block;
}
</style>
