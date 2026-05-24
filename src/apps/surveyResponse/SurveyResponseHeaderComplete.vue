<template>
  <div class="survey__header">
    <div class="header__inner">
      <button
          class="btn-close"
          @click="goRouteSurveyList"
      />
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "SurveyResponseHeaderComplete",
  methods: {
    ...mapActions('storeSurvey', {
      goRouteSurveyList: 'goRouteSurveyList'
    })
  }
}

</script>

<style scoped>

</style>