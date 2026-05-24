<template>
  <div class="border-selectbox-wrap custom-select-box-wrap">
    <div
      class="selected-option"
      :class="{ selected: option.isOpen }"
      @click="toggleOption"
      v-click-outside="setClose"
    >
      <div
        class="option-val"
        :class="{
          placeholder: false
        }"
      >
        {{ playName }}
      </div>
    </div>
    <div class="option-list-wrap" :style="{ display: optionStyle }">
      <div class="scrollbar-outer">
        <ul>
          <li
            v-for="item in sounds"
            :key="item.name"
            :class="{ selected: item.name === playName }"
            @click="changeItem(item)"
          >
            <div class="option-item">{{ item.name }}</div>
          </li>
        </ul>
      </div>
    </div>
    <audio ref="playerSound"></audio>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'hiClass_Select_NotiSound',
  data() {
    return {
      option: {
        isOpen: false
      },
      playName: ''
    }
  },
  computed: {
    sounds: {
      get() {
        //return this.$store.state.notiSounds
        return [
          {
            name: '호루라기',
            mp3: require('../../../public/files/sounds/sfx-whistle.mp3')
          },
          {
            name: '종',
            mp3: require('../../../public/files/sounds/sfx-school-bell.mp3')
          },
          {
            name: '게임',
            mp3: require('../../../public/files/sounds/sfx-pacman.mp3')
          },
          {
            name: '드럼 1',
            mp3: require('../../../public/files/sounds/sfx-drum1.mp3')
          },
          {
            name: '드럼 2',
            mp3: require('../../../public/files/sounds/sfx-drum2.mp3')
          },
          {
            name: '딩동',
            mp3: require('../../../public/files/sounds/sfx-dingdong.mp3')
          },
          {
            name: '실로폰',
            mp3: require('../../../public/files/sounds/sfx-bell.mp3')
          },
          {
            name: '마림바',
            mp3: require('../../../public/files/sounds/sfx-5678bell.mp3')
          },
          {
            name: '코믹 (Long)',
            mp3: require('../../../public/files/sounds/music-spongebob.mp3')
          },
          {
            name: '음악상자 연주(Long)',
            mp3: require('../../../public/files/sounds/music-orgel.mp3')
          },
          {
            name: '오르간 연주(Long)',
            mp3: require('../../../public/files/sounds/music-nba.mp3')
          },
          {
            name: '드럼 연주(Long)',
            mp3: require('../../../public/files/sounds/music-drum.mp3')
          },
          {
            name: '서커스(Long)',
            mp3: require('../../../public/files/sounds/music-circus.mp3')
          }
        ]
      }
    },
    optionStyle() {
      if (this.option.isOpen) {
        return 'block'
      } else {
        return 'none'
      }
    }
  },
  mounted() {
    this.playName = this.sounds[0].name
    this.$refs.playerSound.addEventListener('loadedmetadata', () => {
      this.$refs.playerSound.play()
    })

    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar()
    })
  },
  watch: {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    setClose() {
      this.option.isOpen = false
    },
    changeItem(item) {
      this.playName = item.name
      if (item.mp3) {
        this.$refs.playerSound.src = item.mp3
      }
    },
    toggleOption() {
      this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.note.blackboard.notiSound` })
      this.option.isOpen = !this.option.isOpen
    }
  }
}
</script>
