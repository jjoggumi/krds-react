<script lang="ts">
/**
 * Sound Mixin
 * 사운드 재생, 정지, 볼륨 조절 등의 기능을 제공하는 mixin
 *
 * 사용법:
 * import Sound from '@/apps/behavior/mixins/Sound.vue'
 *
 * export default {
 *   mixins: [Sound],
 *   mounted() {
 *     this.playSoundEffect('/files/sounds/sfx-bell.mp3');
 *   }
 * }
 */

import Vue from 'vue';

interface SoundState {
  audioMap: Record<string, HTMLAudioElement>;
  soundEffect: boolean;
}

export default Vue.extend({
  name: 'Sound',

  data(): SoundState {
    return {
      audioMap: {}, // 효과음을 제어하기 위한 <Url,Audio> 맵
      soundEffect: true, // 사운드 효과 활성화 여부,
    };
  },

  watch: {
    soundEffect(newValue: boolean) {
      const audios = Object.values(this.audioMap);
      
      if (!newValue) {
        audios.forEach(audio => {
          audio.muted = true;
        });
      } else {
        audios.forEach(audio => {
          audio.muted = false;
        });
      }
    },
  },

  methods: {
    /**
     * 사운드 파일 재생
     * @param soundURL - 사운드 파일 URL
     * @param action - 'play' 또는 'pause'
     */
    playSoundEffect(soundURL: string, action: 'play' | 'pause' = 'play') {
      // 오디오 객체가 없으면 생성해서 저장
      if (!this.audioMap[soundURL]) {
        this.audioMap[soundURL] = new Audio(soundURL);
        this.audioMap[soundURL].muted = !this.soundEffect; // 초기 볼륨 설정
      }

      const audio = this.audioMap[soundURL];

      if (action === 'play') {
        audio.currentTime = 0; // 재생 전에 처음으로 되돌리기
        audio.play().catch((error: any) => {
          console.error('Sound play failed:', error);
        });
      } else if (action === 'pause') {
        audio.pause();
        audio.currentTime = 0;
      }
    },

    /**
     * 모든 사운드 정지
     */
    stopAllSounds() {
      (Object.values(this.audioMap) as HTMLAudioElement[]).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    },

    /**
     * 사운드 효과 토글
     */
    toggleSoundEffect() {
      this.soundEffect = !this.soundEffect;
    },

    /**
     * 특정 사운드 제거 (메모리 정리)
     * @param soundURL - 제거할 사운드 파일 URL
     */
    removeSoundEffect(soundURL: string) {
      if (this.audioMap[soundURL]) {
        this.audioMap[soundURL].pause();
        delete this.audioMap[soundURL];
      }
    },

    /**
     * 사운드 볼륨 설정
     * @param soundURL - 대상 사운드 파일 URL
     * @param volume - 볼륨 (0.0 ~ 1.0)
     */
    setSoundVolume(soundURL: string, volume: number) {
      if (this.audioMap[soundURL]) {
        this.audioMap[soundURL].volume = Math.max(0, Math.min(1, volume));
      }
    },

    /**
     * 현재 재생 중인 사운드들의 정보 반환
     */
    getPlayingSounds(): string[] {
      return Object.keys(this.audioMap).filter(url =>
          this.audioMap[url] && !this.audioMap[url].paused
      );
    },
    /**
     * 모든 사운드 정리
     */
    resetAllSounds() {
      this.stopAllSounds();
      this.audioMap = {};
    }
  },

  beforeDestroy() {
    this.stopAllSounds();
    this.resetAllSounds();
  },
});
</script> 