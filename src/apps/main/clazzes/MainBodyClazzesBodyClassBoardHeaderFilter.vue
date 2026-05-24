<template>
  <div
    class="board__filter board__filter-fixed"
    :class="[ { 'is-fixed': getIsFixed() } ]"
  >
    <div class="filter-fixed__area">
      <div class="filter-fixed__inner">

        <main-body-clazzes-body-class-board-header-filter-group
          :is-manager="isManager"
        />

        <main-body-clazzes-body-class-board-header-filter-post-search
          v-if="curClassTabCode === 'LIST' && showPostSearchInClass"
          :is-manager="isManager"
          @getUser="getUser"
        />

        <main-body-clazzes-body-class-board-header-filter-file-search
          v-if="curClassTabCode === 'FILE'"
        />

      </div>
    </div>
  </div>

</template>

<script>
import {mapGetters, mapState} from "vuex";
import MainBodyClazzesBodyClassBoardHeaderFilterGroup
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderFilterGroup";
import MainBodyClazzesBodyClassBoardHeaderFilterPostSearch
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderFilterPostSearch";
import MainBodyClazzesBodyClassBoardHeaderFilterFileSearch
  from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoardHeaderFilterFileSearch";

export default {
  name: "main-body-clazzes-body-class-board-header-filter",
  components: {
    MainBodyClazzesBodyClassBoardHeaderFilterFileSearch,
    MainBodyClazzesBodyClassBoardHeaderFilterPostSearch,
    MainBodyClazzesBodyClassBoardHeaderFilterGroup
  },
  props: {
    isManager: {
      type: Boolean
    }
  },
  computed: {
    ...mapState({
      curClassTabCode: 'curClassTabCode',
      versionData: 'versionData'
    }),
    ...mapGetters({
      getIsFixed: 'getIsFixed',
    }),
    showPostSearchInClass() {
      if (this.versionData.web.showPostSearchInClass === undefined) {
        return true;
      }
      return this.versionData.web.showPostSearchInClass;
    }
  },
  methods: {
    getUser(data) {
      this.$emit("getUser", data)
    }
  }
}
</script>

<style scoped>

</style>