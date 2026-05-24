<template>
<component :is="calculatedComponent.component" v-bind="calculatedComponent.props"/>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useController } from './gneTransfer';

export default defineComponent({
  setup() {
    const controller = useController();
    const calculatedComponent = controller.getComponent();

    controller.process();

    return {
      calculatedComponent,
    };
  }
});
</script>