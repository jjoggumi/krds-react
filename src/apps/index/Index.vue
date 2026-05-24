<template>
  <div
    v-if="!isNewTabLoading && isLoadedIndex"
    id="wrap"
    class="l-page-index"
  >
    <hc-app-link />

    <index-body />

    <hc-footer :is-logged-out="true" />
  </div>
</template>

<script>
import "@/assets/css/index.css"
import IndexBody from '@/apps/index/IndexBody'
import HcAppLink from '@/components/Form/HcAppLink'
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";

const HcFooter = () => ({
  component: import('@/components/Form/HcFooter'),
  error: ErrorLoadFailAsyncComponent,
})

import {mapActions, mapGetters} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'index',
  data() {
    return {

    }
  },
  components: {
    IndexBody,
    HcFooter,
    HcAppLink,
  },
  computed: {
    ...mapFields({
      isNewTabLoading: 'isNewTabLoading',
      isLoadedIndex: 'isLoadedIndex',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    })
  },
  created() {
  },
  mounted() {
    this.$log.debug(this.$options.name, 'mounted!')

    this.isNewTabLoading = true

    if (localStorage.getItem('isLoginUserForceLogout') === 'true') {
      localStorage.removeItem('isLoginUserForceLogout')
      this.logout()
    }
    if (sessionStorage.getItem('isReadyClosePopup') === 'true') {
      sessionStorage.removeItem('isReadyClosePopup')
      window.close()
    }

    this.indexLoginCheck()

    this.$nextTick(() => {
      window.scrollTo(0, 0)
    })
  },
  beforeDestroy() {
    this.isLoadedIndex = false
  },
  methods: {
    ...mapActions({
      indexLoginCheck: 'indexLoginCheck',
      logout: 'logout'
    }),
  },
}
</script>

<style>

</style>
