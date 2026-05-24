<template>
  <HiModal @close="$emit('close')">
    <template v-slot:heading>
        투표 만들기
    </template>
    <template v-slot:content>
      <div class="editor-body">
        <hitalk-vote-editor-main :room="connectRoomItem.roomId" :vote="vote" @change="onChange"></hitalk-vote-editor-main>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="gray" size="lg" @click="$emit('close')">취소</HiButton>
      <HiButton color="primary" :disabled='disabled' size="lg" @click="submit">{{ isEditMode ? '수정' : '만들기' }}</HiButton>
    </template>
  </HiModal>
</template>

<script>
import { mapState } from 'vuex'
import { Hitalks } from '@/apis/Hitalks'

const apis = { Hitalks: new Hitalks(), HitalksForChatServer: new Hitalks({baseURL: process.env.VUE_APP_CHAT_API_SERVER_URI})}

export default {
  props: {
    vote: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState('storeHitalk', ['connectRoomItem']),
    disabled() {
      return !this.model || this.model.questions?.some(q => 
        q.questionTitle === ''
      );
    },
    isEditMode() {
      return this.vote !== '';
    }
  },
  data: () => ({ model: {}}),
  methods: {
    onChange({ detail }) {
      if (!detail) return;
      this.model = detail
    },
    checkValidations() {
      const allQuestionsHasOneOrMoreAnswers = this.model.questions?.every(q => 
        q.items.length > 1 && !q.items?.every(i => i.itemContent === ''))

      const noRedundantItems = this.model.questions?.every(q => {
        const itemContents = q.items.map(i => i.itemContent.trim());
        return new Set(itemContents).size === itemContents.length;
      });

      if (!noRedundantItems) {
        this.$hiClass.alert('중복된 항목이 있습니다.');
      }

      if (!allQuestionsHasOneOrMoreAnswers) {
        this.$hiClass.alert('항목을 입력해 주세요.')
      }

      return allQuestionsHasOneOrMoreAnswers && noRedundantItems;
    },
    adjustItemContents() {
      this.model.questions?.filter(q => q.questionType === 'IMAGE').forEach(q => q.items?.forEach((i, idx) => {
        if (i.itemContent !== '') return;
        i.itemContent = `${idx + 1}번`;
      }))
    },
    async submit() {
      if (!this.checkValidations()) return;
      this.adjustItemContents();
      const result = await (this.isEditMode 
        ? apis.Hitalks.updateVoteMessageId(this.vote, this.model)
        : apis.HitalksForChatServer.createVote(this.model)).catch(err => {
        this.$emit('error', err);
      });
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.hi-modal-common::v-deep .modal__layer {
  width: 840px;
  height: 630px;
}

.editor-body {
  width: 780px;
  height: 444px;
}

.hi-modal-common::v-deep .modal__footer button {
  width: 180px;
  height: 44px;
  margin-right: 8px;
}
</style>