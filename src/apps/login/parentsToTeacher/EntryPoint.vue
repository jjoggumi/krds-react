<template>
  <component :is="calculatedComponent.component" v-bind="calculatedComponent.props"/>
</template>

<script>
import Vue from 'vue';
import { useController } from './parentsToTeacherTransfer';

export default {
  data: () => ({
    calculatedComponent: {},
  }),
  created() {
    const controller = useController();
    this.calculatedComponent = controller.getComponent() || {};

    controller.process(this.$route.params.applyEntryPath);
  }
}
</script>