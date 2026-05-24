<template>
  <div
    v-if="userType"
    id="wrap"
    class="page-login"
  >
    <div id="cont-wrap">
      <login-header></login-header>
      <login-body></login-body>
    </div>

    <!-- message modal -->
    <message
      v-if="$store.state.popupMessage.isOpen"
      :message="$store.state.popupMessage.message"
      :type="$store.state.popupMessage.type"
    />

    <hc-footer />
  </div>
</template>

<script>
import LoginHeader from './LoginHeader.vue'
import LoginBody from './LoginBody.vue'
import Message from "@/components/Popup/Message";
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";

const HcFooter = () => ({
  component: import('@/components/Form/HcFooter'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'login',
  data() {
    return {
    }
  },
  components: {
    Message,
    LoginHeader,
    LoginBody,
    HcFooter,
  },
  computed: {
    userType() {
      return this.$route.params.userType
    },
  },
  methods: {
  },
  mounted() {
    this.$nextTick(() => {
      if ('scrollRestoration' in history) {
        // Back off, browser, I got this...
        history.scrollRestoration = 'manual'
        // alert(history.scrollRestoration);
      }
    })
  }
}
</script>
