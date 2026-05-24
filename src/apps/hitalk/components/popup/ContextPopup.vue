<template>
  <div
    v-if="shown"
    v-click-outside="hide">
    <div class="float-layer">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

const globalContext = Vue.observable({
  currentShownId: null
});

export default {
  name: "ContextPopup",
  props: {
    popupId: {
      type: String,
      required: true
    }
  },
  computed: {
    shown: function() {
      return globalContext.currentShownId === this.popupId;
    },
    globalKey: function() {
      return globalContext.currentShownId;
    }
  },
  methods: {
    toggle() {
      globalContext.currentShownId = globalContext.currentShownId === this.popupId ? null : this.popupId;
    },
    hide() {
      globalContext.currentShownId = null;
    }
  },
  destroyed() {
    globalContext.currentShownId = null;
  }
}
</script>

<style scoped>
</style>