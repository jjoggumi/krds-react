<template>
  <HiModal @close="$emit('close')">
    <template v-slot:content>
      <h2 class="text-lg font-bold mb-4">환경 선택</h2>
      <ul>
        <li v-for="env in environments" :key="env.name" style="margin-top: 15px; height: 30px;">
          <HiButton style='width:70%; position:relative;' @click="onSelectEnv(env)">{{ env.name }}</HiButton>
        </li>
      </ul>
    </template>
  </HiModal>
</template>

<script>
import { useElectronController } from '@/apps/hitalk/utils'
const entryOf = e => `https://${e}.hiclass.net/hitalk`;
const controller = useElectronController();

export default {
  data: () => ({
    environments: [
      { name: 'Dev', value: entryOf('devui') },
      { name: 'Board', value: entryOf('devboard') },
      { name: 'Stage', value: entryOf('stage') },
      { name: 'Production', value: entryOf('www') },
    ]
  }),
  methods: {
    async onSelectEnv(env) {
      controller.sendIpcMessage('change-entry', env.value);
      this.$emit('close');
    }
  },
}
</script>
