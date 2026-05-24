<template>
  <div class="archive-content">
    <div class="section">
      <div class="section-title">우리반에 찾아온 친구들</div>
      <div class="friend-section-content">
        <!-- 친구가 없을 때 빈 상태 카드 -->
        <div v-if="rewardCharacters.length === 0" class="gm-empty-state">
          <div class="gm-empty-card">
            <div class="gm-empty-icon">
              <img src="@/assets/img/icon/ic-smile.svg" alt="smile icon" width="32" height="32" />
            </div>
            <div class="gm-empty-text">우리반에 찾아온<br />친구가 없어요.</div>
          </div>
        </div>
        <div v-else class="friend-list">
          <CharacterCard
            v-for="character in rewardCharactersWithLottie"
            :key="character.characterCode"
            :character="character"
            @openCharacterModal="openCharacterModal"
          />
        </div>
        <CharacterModal
          v-if="characterModal.open"
          :reward-characters="rewardCharactersWithLottie"
          :selected-character-code="characterModal.selectedCharacterCode"
          @closeCharacterModal="closeCharacterModal"
          @updateCharacterLogs="updateCharacterLogs"
        />
      </div>
    </div>
    <div class="section">
      <div class="section-title">아직 숨어있는 친구들</div>
      <div class="hidden-friend-section-content">
        <!-- 숨어있는 친구가 없을 때 빈 상태 카드 -->
        <div v-if="hiddenCharacters.length === 0" class="gm-empty-state">
          <div class="gm-empty-card">
            <div class="gm-empty-icon">
              <img src="@/assets/img/icon/ic-smile.svg" alt="smile icon" width="32" height="32" />
            </div>
            <div class="gm-empty-text">모든 친구를 다 만났어요!<br />새로운 친구를 기다려주세요.</div>
          </div>
        </div>
        <div v-else class="hidden-friend-list">
          <div v-for="(character, idx) in hiddenCharacters" :key="idx" class="hidden-friend-card">
            <img
              v-if="findCharacter(character.characterCode)"
              :src="findCharacter(character.characterCode).thumbBlack"
              :alt="findCharacter(character.characterCode).characterName"
            />
            <div class="friend-name" :class="{ 'hidden-friend-phrase': true }">
              {{ hiddenPhrases[idx] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import CharacterCard from '@/apps/behavior/pages/groupmission/components/CharacterCard.vue';
import CharacterModal from '@/apps/behavior/pages/groupmission/modal/CharacterModal.vue';
import { getGroupMissionStorage } from '@hiclass/core';
import { mapState } from 'vuex';

export default {
  name: 'MissionStorage',
  components: { CharacterModal, CharacterCard },
  data() {
    return {
      hiddenCharacters: [],
      rewardCharacters: [],
      characterModal: {
        open: false,
        selectedCharacterCode: '',
      },
      hiddenPhrases: [], // 셔플된 문구 배열
    };
  },
  props: {
    characters: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    classroomId() {
      return this.curClassroom.classroomId;
    },
    rewardCharactersWithLottie() {
      return (
        this.rewardCharacters.map((c) => ({
          ...c,
          ...this.findCharacter(c.characterCode),
        })) || []
      );
    },
  },
  async mounted() {
    await this.getStorage();
  },
  methods: {
    async getStorage() {
      try {
        const { hiddenCharacters, rewardCharacters } = await getGroupMissionStorage(this.classroomId);
        this.hiddenCharacters = hiddenCharacters || [];
        this.rewardCharacters =
          rewardCharacters.map((c) => ({
            characterCode: c.characterCode,
            characterId: c.characterId,
            goalPoint: c.goalPoint,
            logs: [],
          })) || [];
        // hiddenCharacters 개수만큼 phrases 셔플
        const phrases = ['나 누구게?', '날 찾아봐!', '곧 만나자!', '내 이름은 비밀~', '나 여기 있어!', '기다릴게!'];
        this.hiddenPhrases = this.shufflePhrases(phrases, this.hiddenCharacters.length);
      } catch (e) {
        console.error('미션 보관함 데이터 불러오기 실패', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
    shufflePhrases(phrases, count) {
      let arr = [...phrases];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      while (arr.length < count) {
        arr = arr.concat(this.shufflePhrases(phrases, count - arr.length));
      }
      return arr.slice(0, count);
    },
    findCharacter(characterCode) {
      return this.characters.find((c) => c.characterCode === characterCode);
    },
    async openCharacterModal(character) {
      this.characterModal.selectedCharacterCode = character.characterCode;
      this.characterModal.open = true;
    },
    closeCharacterModal() {
      this.characterModal.selectedCharacterCode = '';
      this.characterModal.open = false;
    },
    updateCharacterLogs({ characterCode, logs }) {
      const character = this.rewardCharacters.find((c) => c.characterCode === characterCode);
      if (character) {
        character.logs = logs;
      }
    },
  },
  watch: {
    classroomId() {
      this.getStorage();
    },
  },
};
</script>

<style lang="scss" scoped>
.archive-content {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
}
.archive-content {
  background: #eef0f4;
  min-height: 100%;
  padding: 40px;
  overflow-y: auto;
  max-height: 100%;
  /* 세로 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 6px;
  }
  /* 상하 화살표 버튼 숨기기 */
  &::-webkit-scrollbar-button {
    display: none;
    height: 0;
    width: 0;
  }
}
.section {
  &:first-child {
    margin-bottom: 60px;
  }
  .section-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 16px;
  }
}
.friend-section-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.hidden-friend-section-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.gm-empty-state {
  .gm-empty-card {
    display: flex;
    width: 244px;
    height: 300px;
    padding: 0 16px 30px 16px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 8px;
    border: 2px solid rgba(213, 213, 213, 0.8);
    background: linear-gradient(151deg, #fff 12%, #f0f1f4 100%);
    .gm-empty-icon {
      margin-bottom: 4px;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      aspect-ratio: 1/1;
      opacity: 0.4;
    }
    .gm-empty-text {
      color: #616161;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      line-height: 22px;
    }
  }
}
.friend-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.hidden-friend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  .hidden-friend-card {
    display: flex;
    width: 244px;
    height: 300px;
    padding: 0 16px 12px 16px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 8px;
    border: 2px solid rgba(213, 213, 213, 0.8);
    background: linear-gradient(151deg, #fff 12%, #f0f1f4 100%);
    box-shadow: 2px 6px 16px -4px rgba(57, 71, 85, 0.12);
    img {
      width: 190px;
      height: 190px;
    }
    .friend-name {
      font-size: 20px;
      color: #000;
      font-weight: 700;
      text-align: center;
      &.hidden-friend-phrase {
        color: #9e9e9e;
      }
    }
  }
}
@media (min-width: 2560px) {
  .archive-content {
    .friend-section-content {
      gap: 32px;
    }
    .hidden-friend-section-content {
      gap: 32px;
    }
    .hidden-friend-list {
      gap: 32px;
      .hidden-friend-card {
        padding: 0 16px 12px 16px;
        width: 320px;
        height: 380px;
        img {
          width: 240px;
          height: 240px;
        }
      }
    }
    .gm-empty-state {
      .gm-empty-card {
        padding: 0 16px 12px 16px;
        width: 320px;
        height: 380px;
      }
    }
    .friend-example-card {
      width: 320px;
      height: 380px;
      padding: 0 16px 12px 16px;
      border-radius: 12px;
      .friend-badge {
        font-size: 16px;
      }
      .friend-name {
        font-size: 24px;
      }
      .friend-image {
        width: 240px;
        height: 240px;
        img {
          width: 240px;
          height: 240px;
        }
      }
    }
  }
}
</style>
