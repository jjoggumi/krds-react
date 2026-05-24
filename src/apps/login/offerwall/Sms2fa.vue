<template>
  <div
    id="wrap"
    class="page-login"
  >
    <div id="cont-wrap">
      <login-header></login-header>
      <login-body>sdsdf</login-body>
    </div>

    <!-- message modal -->
    <message
      v-if="$store.state.popupMessage.isOpen"
      :message="$store.state.popupMessage.message"
      :type="$store.state.popupMessage.type"
    />
  </div>
</template>

<script>
import LoginHeader from '../LoginHeader.vue'
import LoginBody from './Sms2faBody.vue'
import Message from "@/components/Popup/Message";
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";

export default {
  name: 'sms2fa',
  data() {
    return {
    }
  },
  components: {
    Message,
    LoginHeader,
    LoginBody,
  },
  computed: {
    userType() {
      alert(JSON.stringify(this.$route.params))
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
