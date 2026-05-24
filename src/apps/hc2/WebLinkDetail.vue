<template>
   <weblink-detail :code="code" :targetcode="targetCode" :envtype="envType" />
</template>

<script>
import ReactStyle from '@/apps/hc2/mixins/reactStyle';
export default {
   name: 'weblink-detail-page',
   mixins: [ ReactStyle ],
   data() {
      return {
         code: '',
         targetCode: '',
         envType: 'web',
      };
   },
   async created() {
      this.setComponent();
      if (this.applyStyle) this.applyStyle();
   },
   methods: {
      setComponent() {
         this.code = this.$route.params.code;
         this.targetCode = this.$route.params.targetCode;

         const isMobile = this.$store.getters.isMobile;
         const isApp = (
            window.AOSHandler ||
            (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iOSHandler)
         );

         if (isApp) {
            this.envType = 'app';
         } else if (isMobile) {
            this.envType = 'mobileWeb';
         } else {
            this.envType = 'web';
         }
      },   
   },

   mounted() {
      setTimeout(() => {
         document.documentElement.classList.add('hc2');
      }, 0);
   },
   beforeDestroy() {
      if (this.removeStyle) this.removeStyle();
      document.documentElement.classList.remove('hc2');
   },
}
</script>
<style scoped>
</style>