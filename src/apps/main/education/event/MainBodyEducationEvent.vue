<template>
  <div class="column-content column-full">

    <div class="page-sub-heading">
      <h3 class="heading">이벤트</h3>
    </div>

    <main-body-education-event-header-filter />

    <main-body-education-event-posts />

  </div>
</template>

<script>

import MainBodyEducationEventPosts from "@/apps/main/education/event/MainBodyEducationEventPosts";
import MainBodyEducationEventHeaderFilter from "@/apps/main/education/event/MainBodyEducationEventHeaderFilter";

export default {
  name: 'main-body-education-event',
  components: {MainBodyEducationEventHeaderFilter, MainBodyEducationEventPosts},
}
</script>

<style scoped></style>
