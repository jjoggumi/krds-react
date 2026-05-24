<template>
  <aside>
    <div class="navBrand">
      <a href="@/">HiClass <span>Creative Lab</span></a>
    </div>
    <div class="collapseSet type02">
      <CollapseAside v-for="(route, index) in routes" :key="index" :active="true" :isActive="mainCate === route.name" :nonChild="!route.children">
        <template #tit>
          <router-link :to="route.path" v-if="!route.children">
            <template v-if="route.name !== 'Pub'"> {{ route.name }}</template>
          </router-link>
          <span v-else>{{ route.name }}</span>
        </template>
        <template #con>
          <div v-for="(childRoute, subIndex) in route.children" :key="subIndex" class="item">
            <router-link :to="route.path + '/' + childRoute.path">{{ childRoute.name }}</router-link>            
          </div>
        </template>
      </CollapseAside>
    </div>
  </aside>
</template>

<script>
import CollapseAside from "./CollapseAside.vue";

export default {
  name: "AsideLayout",
  components: { CollapseAside },
  props: {
    routes: Array,
    mainCate: String,
  },
  data() {
    return {};
  },
};
</script>
