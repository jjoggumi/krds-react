<template>
  <div class="friend-card friend-example-card" @click="openCharacterModal" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="friend-badge">{{ character.goalPoint }}회 만남</div>
    <div class="friend-image">
      <template v-if="isHovered">
        <lottie
          v-if="character && character.lottie && typeof character.lottie === 'object'"
          class="friend-lottie"
          :options="{ animationData: character.lottie, loop: true, autoplay: true }"
        />
      </template>
      <template v-else>
        <img v-if="character.thumb" :src="character.thumb" :alt="character.characterName" />
      </template>
    </div>
    <div class="friend-name">{{ character.characterName }}</div>
  </div>
</template>

<script lang="js">
import Lottie from '@/components/Lottie/Lottie.vue';

export default {
  name: 'CharacterCard',
  components: {
    Lottie,
  },
  data() {
    return {
      isHovered: false,
    };
  },
  props: {
    character: {
      type: Object,
      required: true,
    },
  },
  methods: {
    openCharacterModal() {
      this.$emit('openCharacterModal', this.character);
    },
  },
};
</script>

<style lang="scss" scoped>
.friend-example-card {
  position: relative;
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
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: center center;
  &:hover {
    transform: scale(1.08);
    z-index: 10;
    .friend-lottie {
      transform: scale(1.2);
    }
  }
  .friend-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    color: #fff;
    display: flex;
    padding: 4px 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-family: 'Pretendard Variable', sans-serif;
    font-size: 15px;
    line-height: 24px;
    font-weight: 400;
    border-radius: 36px;
    background: #1d1d1d;
    z-index: 10;
  }

  .friend-image {
    width: 190px;
    height: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    img {
      width: 190px;
      height: 190px;
      object-fit: contain;
    }
  }

  .friend-name {
    font-size: 20px;
    font-family: 'Pretendard Variable', sans-serif;
    color: #000;
    font-weight: 700;
    text-align: center;
  }
}
@media (min-width: 2560px) {
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
</style>
