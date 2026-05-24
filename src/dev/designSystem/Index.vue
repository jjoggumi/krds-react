<template>
  <div class="app designSys">
    <Aside :routes="filteredRoutes" :mainCate="mainCate" />
    <main>   
      <HeadTitle/>
      <router-view ></router-view> 
    </main>
  </div>
</template>

<script>
import Aside from '@/dev/designSystem/layout/Aside'
import HeadTitle from '@/dev/designSystem/layout/HeadTitle'
import router from '@/plugins/router'
import '@/plugins/hiComponents.js'
import '@/dev/designSystem/assets/styles/layout.scss';

export default {  
  name: 'DesignSystem',
  components:{
    Aside, HeadTitle
  },  
  data() {
    return {
    }
  },
  computed: {
    mainCate() {
      const currentPath = this.$route.path;
      for (const i of this.$route.matched) {
        if (currentPath.startsWith(i.path)) {
          return i.name;
        }
      }
      return "Unknown";
    },
    filteredRoutes() {
      const mainRoute = router.options.routes.find(route => route.name === 'DesignSystemMain');
      return mainRoute && mainRoute.children ? mainRoute.children : [];
    }
  }
};
</script>
<style lang="scss" scoped>
</style>