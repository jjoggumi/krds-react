<template>
<HiModal type="type01" size="sm" @close="close" :modalLayerStyle="{width: '370px'}">
  <template v-slot:heading v-if="success">
    <div id="clap-animation"></div>
    <h2 class="heading">이제 선생님으로 로그인해주세요.</h2>
  </template>
  <template v-slot:content>
    <p class="content" v-if="success">
      선생님 회원 전환이 완료되어<br>
      모든기기에서 로그아웃이 진행됩니다.<br>
      앞으로는 선생님 계정으로 PC 또는 App(앱)에서<br>
      로그인해주세요.
    </p>
    <p class="content" v-if="!success">
      <pre>{{ errMessage }}</pre>
    </p>
  </template>
  <template v-slot:footer>
    <HiButton color="primary" size="md" @click="close"> 확인 </HiButton>
  </template>
</HiModal>
</template>

<script>
import lottie from 'lottie-web';
import clap from '@/assets/img/icon/clap_lottie.json';

export default {
  name: 'ConfirmPopup',
  props: {
    message: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    status: {
      type: Number,
      default: 0
    },
    data: {
      type: Object,
      default: () => ({})
    },
    returnUri: {
      type: String,
      default: '/'
    }
  },
  computed: {
    success () {
      return [200, 204].includes(this.status);
    },
    errorEmail () {
      const email = ((this.data.error || '').split(',')[1] || '').trim();
      const [localPart, domain] = email.split('@');
      const maskedLocalPart = localPart.length > 2 ? '**' + localPart.slice(2) : localPart;
      return `${maskedLocalPart}@${domain}`;
    },
    errMessage () {
      console.log('errMessage, ', this.data)
      const additional428Google = `\n
다른 Google 계정으로 이용하시려면
아래 방법을 따라 시도해보세요.

1. Gmail 또는 Google 앱을 엽니다.
2. 화면 오른쪽 상단의 **프로필 아이콘(동그란 사진 또는 이니셜)**을 누릅니다.
3. 다른 계정 추가를 선택합니다.
4. 계정 전환을 다시 시도해주세요. `

      return (({
        404: '교사·교직원 재직서류 인증이 완료된\n학부모 회원만 참여가 가능합니다.\n\n(관련 문의사항은 고객센터\n문의하기를 통해 남겨주세요.)',
        406: '진행이 일시 중단되어 처음 화면으로 이동합니다.\n다시 진행해 주세요.',
        407: '인증된 사용자 정보가 일치하지 않습니다.',
        410: '종료된 이벤트입니다.\n해당 페이지를 이용할 수 없습니다.',
        428: `해당 SNS계정으로 가입된 정보가 있습니다.\n다른 SNS 계정을 선택해주세요.`,
        500: '서버 오류가 발생했습니다.',
      })[this.status] || `알 수 없는 오류가 발생했습니다. (${this.status})`) + (this.status === 428 && (this.data.clientRegistrationId || '') === 'google' ? additional428Google : '');
    }
  },
  methods: {
    close () {
      if (this.success) {
        localStorage.clear();
      }
      window.location.href= this.returnUri;
    },
    loadAnimation () {
      lottie.loadAnimation({
        container: document.getElementById('clap-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: clap
      });
    },
  },
  mounted () {
    this.loadAnimation();
  }
}
</script>

<style scoped>
.content {
  color: #888888;
  line-height: 1.5em;
}
.content pre {
  line-height: 1.5em;
}
.content .highlight {
  color: var(--primary);
}
</style>
