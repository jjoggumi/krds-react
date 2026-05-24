<template>
  <div class="record-write">
    <div class="title">
      <h2>새로 만들기</h2>
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
import { CARD_LABEL, CARD_META } from '@/apps/behavior/pages/personnel/personnel.js';

export default {
  name: 'RecordWrite',
  props: {
    fnOpenWritePage: { type: Function, required: true },
  },
  data() {
    return {
      writeCards: CARD_META,
      CARD_LABEL
    }
  }
}
</script>