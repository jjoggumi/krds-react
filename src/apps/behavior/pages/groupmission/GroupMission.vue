<template>
  <div class="group-mission">
    <div class="top-menu">
      <div class="menu">
        <span :class="{ on: selectedTab === 'progress' }" @click="setRouterPath('progress')">진행중인 미션</span>
        <span :class="{ on: selectedTab === 'storage' }" @click="setRouterPath('storage')">보관함</span>
      </div>
      <div class="menu-right">
        <label class="sound-switch">
          <span class="switch-title">효과음</span>
          <input type="checkbox" v-model="soundOn" class="switch-input" />
          <span class="switch-slider">
            <span :class="['switch-control', soundOn ? 'on' : 'off']">{{ soundOn ? 'ON' : 'OFF' }}</span>
          </span>
        </label>
      </div>
    </div>

    <div class="tab-content">
      <!-- 진행중인 미션 탭 -->
      <MissionInProgress v-if="selectedTab === 'progress'" :characters="characters" />

      <!-- 보관함 탭 -->
      <MissionStorage v-else-if="selectedTab === 'storage'" :characters="characters" />
    </div>
  </div>
</template>

<script lang="js">
import MissionStorage from '@/apps/behavior/pages/groupmission/MissionStorage.vue';
import MissionInProgress from '@/apps/behavior/pages/groupmission/MissionInProgress.vue';
import { FirebaseRemoteConfigKey, remoteConfig } from '@/plugins/firebase';
import { mapState } from 'vuex';

export default {
  name: 'GroupMission',
  components: { MissionInProgress, MissionStorage },
  data() {
    return {
      selectedTab: 'progress',
      characters: [],
      soundOn: true,
    };
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
  },
  async mounted() {
    window.hiclassSoundEnabled = this.soundOn;
    this.selectedTab = this.$route.params.tab;
    await this.loadCharacters();
  },
  methods: {
    setRouterPath(tab) {
      this.$router.push(`/behavior-records/${this.curClassroom.classroomId}/groupmission/${tab}`);
    },
    async loadCharacters() {
      await remoteConfig.ensureInitialized();
      await remoteConfig.fetchAndActivate();
      const groupMissionCharacter = JSON.parse(remoteConfig.getString(FirebaseRemoteConfigKey.GROUP_MISSION_CHARACTERS) || '{}');
      this.characters = groupMissionCharacter.map((character) => ({
        characterCode: character.characterCode,
        thumb: `https://download.hiclass.net/static/classroom/groupMission/${character.characterCode}_thumb.svg`,
        thumbBlack: `https://download.hiclass.net/static/classroom/groupMission/${character.characterCode}_thumb_black.svg`,
        lottie: `https://download.hiclass.net/static/classroom/groupMission/${character.characterCode}.json`,
        characterName: character.characterName,
        characterMessage: character.characterMessage,
      }));
      for (const character of this.characters) {
        fetch(character.lottie).then((res) => {
          res.json().then((data) => {
            character.lottie = data;
          });
        });
      }
    },
  },
  watch: {
    $route(to, from) {
      this.selectedTab = to.params.tab;
    },
    soundOn(val) {
      window.hiclassSoundEnabled = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.group-mission {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .top-menu {
    position: relative;
    width: 100%;
    height: 78px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 0 30px;

    .menu {
      span {
        display: inline-flex;
        height: 78px;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        font-size: 18px;
        font-weight: 500;
        color: #616161;
        cursor: pointer;
        padding: 0 20px;
        border-bottom: 3px solid transparent;
        &.on {
          border-bottom: 3px solid #fe8813;
          color: #222;
          font-weight: 700;
        }
        + span {
          margin-left: 20px;
        }
      }
    }

    .menu-right {
      position: absolute;
      right: 30px;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      .sound-switch {
        display: flex;
        align-items: center;
        gap: 6px;
        .switch-title {
          color: #1d1d1d;
          font-size: 17px;
          font-weight: 500;
          line-height: 25px;
        }
        .switch-slider {
          position: relative;
          width: 68px;
          height: 28px;
          background: #ff8737;
          border-radius: 14px;
          transition: background 0.2s;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 4px;
          box-sizing: border-box;
          &::before {
            content: '';
            position: absolute;
            right: 4px;
            top: 4px;
            width: 20px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            transition: right 0.2s;
          }
        }
        .switch-control {
          font-size: 15px;
          font-weight: 500;
          line-height: 24px;
          position: absolute;
          top: 50%;
          color: #fff;
          transform: translateY(-50%);
          transition: color 0.2s;
          &.on {
            left: 15px;
          }
          &.off {
            left: 28px;
          }
        }
        .switch-input {
          display: none;
          &:checked {
            + .switch-slider {
              background: #ff8a36;
              &::before {
                right: 4px;
              }
            }
          }
          &:not(:checked) {
            + .switch-slider {
              background: #9e9e9e;
              &::before {
                left: 4px;
              }
              .switch-control {
                color: #fff;
              }
            }
          }
        }
      }
    }
  }

  .tab-content {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
