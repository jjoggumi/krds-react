<template>
  <div class="side-popup">
    <div class="title">
      <h2>타이틀 텍스트</h2>
      <span class="desc">서브 텍스트 필요시 사용, 서브 텍스트 필요시 사용</span>
    </div>

    <div class="write">
      <div
        v-for="item in writeCards"
        :key="item.type"
        class="write-card cursor-pointer"
        :class="item.class"
        @click="fnOpenWritePage(item.type)"
      >
        <div class="top-l">
          <i :class="item.icon"></i>
          <span>{{ CARD_LABEL[item.type] }}</span>
        </div>
        <div class="bottom-r">
          <i class="bh-icon-plus-28"></i>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'MainSidePoup',
  props: {},
  data() {
    return {
    }
  }
}
</script>