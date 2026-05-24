import FanfareLottie from '@/assets/img/lottie/Fanfare.json';

export default {
  data() {
    return {
      confettiTimeout: null,
      showConfetti: false,
      confettiCount: 0,
      FanfareLottie: {
        animationData: FanfareLottie,
        loop: true,
        autoplay: true,
      },
    };
  },
  methods: {
    async triggerConfetti(confettiDuration) {
      this.clearConfetti();

      this.confettiCount++;
      this.showConfetti = true;

      this.confettiTimeout = setTimeout(() => {
        this.clearConfetti();
      }, confettiDuration);
    },
    clearConfetti() {
      if (this.confettiTimeout) {
        clearTimeout(this.confettiTimeout);
        this.confettiTimeout = null;
      }
      this.showConfetti = false;
    },
  },
};
