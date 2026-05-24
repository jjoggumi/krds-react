<template>
  <div class="banner-wrap">
    <Slick :options="slickOptions" ref="schoolsRnbBannerSlide">
      <template v-for="banner in banners">
        <a href="javascript:void(0)" :key="banner.currentId" style="cursor: default">
          <!-- <a :href="banner.href" :key="banner.currentId" target="_blank"> -->
          <img :src="banner.src" alt />
        </a>
      </template>
    </Slick>
  </div>
</template>

<script>
import Slick from "vue-slick";

export default {
  name: "mainBodySchoolsRnbBanner",
  props: {
    user: Object
  },
  components: {
    Slick
  },
  data: () => ({
    banners: [],
    slickOptions: {
      autoplay: true,
      autoplaySpeed: 5000,
      slidesToShow: 1,
      infinite: true,
      speed: 500,
      adaptiveHeight: false,
      cssEase: "linear",
      dots: false,
      prevArrow: false,
      nextArrow: false
    }
  }),
  created() {
    this.banners.push({
      src: "//download.hiclass.net/static/images/banners/bnr1.png",
      href: "//www.home-learn.co.kr/main/Index.do"
    });
    if (this.user.userType === "TEACHER") {
      this.banners.push({
        src: "//download.hiclass.net/static/images/banners/bnr2.png",
        href: "//www.i-screammall.co.kr"
      });
      this.banners.push({
        src: "//download.hiclass.net/static/images/banners/bnr3.png",
        href: "//www.i-scream.co.kr"
      });
    }
    this.$comn.shuffle(this.banners);
  },
  mounted() {}
};
</script>