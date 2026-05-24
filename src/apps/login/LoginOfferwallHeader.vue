<template>
  <header class="navbar navbar-expand-lg navbar-dark bg-dark" v-if="isShow">
    <a class="navbar-brand" href="#">
      <img src="@/assets/img/svg/logo-white.svg" alt="하이클래스" loading="lazy">
    </a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item" :class="{
                      active: this.isPath('/offerwall/statistics') || this.isPath('/offerwall')
        }">
          <a class="nav-link" href="/offerwall/statistics">광고통계</a>
        </li>
        <li class="nav-item" :class="{ active: this.isPath('/offerwall/settlement') }">
          <a class="nav-link" href="/offerwall/settlement">정산서</a>
        </li>
      </ul>
    </div>
    <div class="navbar-login">
      <span class="navbar-text text-white">
        {{ this.companyName }}
      </span>
      <button class="btn btn-primary ml-3 pl-4 pr-4" @click="logout">로그아웃</button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'LoginOfferwallHeader',
  props: {
    companyName: String,
    isShow: Boolean
  },
  mounted() {

  },
  methods: {
    isPath(path) {
      return this.$route.path === path;
    },
    logout() {
      const queryParam = Array.from({ length: localStorage.length })
          .reduce((map, _, i) => {
            const key = localStorage.key(i);
            return map.set(key, localStorage.getItem(key));
          }, new Map());

      this.$authentication.save(queryParam);
      this.$router.push('/logout/offerwall', () => {})
    }
  }
}
</script>

<style></style>
