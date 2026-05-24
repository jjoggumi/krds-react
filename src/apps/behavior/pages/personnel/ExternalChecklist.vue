<!--
@File(Method): ExternalChecklist.vue
@Date Created: 2025-06-27
@Description: 학급기록 > 인원체크 새 창으로 열기
@Modified: #74594 인원체크 상세 새창 분리
-->
<template>
    <div class="behavior-wrapper__body new-win">
      <div class="behavior-wrapper__body__content">
        <div class="record inwon">
          <RecordEdit v-if="isOpen" :search-kind="''" :is-search="false" :bannedWords="bannedWords"/>
        </div>
      </div>

      <give-point-finish-toast
          v-if="toastWithCharacter.isShow"
          :item="toastWithCharacter"
          :content="rewardCompleteContent"
          :isShowCancelBtn="false"
          @close="closeToast"
      />

      <give-point-finish-toast-02
          v-if="toast.isShow"
          :item="toast"
          :content="rewardCompleteContent"
          :isShowCancelBtn="false"
      />
    </div>
</template>

<script>
import "@/assets/css/behavior-record.css"

import { handleTokenExpired } from "@/apps/behavior/pages/personnel/personnel";
import {useChecklistController} from "@/apps/behavior/modules/personnel";
const checklistController = useChecklistController();
import axios from "axios";
import jwt_decode from "jwt-decode";
import {mapActions, mapMutations, mapState} from "vuex";

import RecordEdit from "@/apps/behavior/pages/personnel/components/RecordEdit.vue";
import GivePointFinishToast from "@/apps/behavior/components/toast/GivePointFinishToast.vue";
import GivePointFinishToast02 from "@/apps/behavior/components/toast/GivePointFinishToast02.vue";
import Sound from "@/apps/behavior/mixins/Sound.vue";

export default {
  name: "ExternalChecklist",
  components: {GivePointFinishToast02, GivePointFinishToast, RecordEdit},
  mixins: [Sound],
  data() {
    return {
      isOpen: false,
      tokenId: null,
      checklistId: null,
      toast: {
        isShow: false,
        message: '포인트 지급 완료',
        btnName: '취소',
        top: null, bottom: 124, left: null, right: null,
        width: null, height: null, align: 'center'
      },
      toastWithCharacter: {
        isShow: false,
        mode: 'good'
      },
      toastTimeout: null,
      rewardCompleteContent: {},
      pointRewardSound: {
        good: 'https://download.hiclass.net/static/assets/audio/givepoint_sound_good.mp3',
        effort: 'https://download.hiclass.net/static/assets/audio/givepoint_sound_bad.mp3'
      },
      bannedWords: []
    }
  },
  computed: {
    ...mapState('storeBehavior', ['updateSubscribeList'])
  },
  async created() {
    this.setIsExternalChecklist(true)
    this.tokenId = this.$route.params.tokenId || null

    if (!this.tokenId) {
      handleTokenExpired()
      return
    }

    try {
      const { data: { token } } = await this.getChecklistToken()
      if (token) {
        this.setChecklistToken(token)
        const decoded = jwt_decode(token)
        this.checklistId = decoded.checklistId
        // 웹소켓 연결전 token 만료 체크
        if (this.$moment(decoded.exp * 1000).isBefore(this.$moment().valueOf())) {
          handleTokenExpired()
          return
        }
        this.setCurClassroom({
          classroomId: decoded.classroomId
        })
        await this.connectStompClient()
        checklistController.init(token)
        this.isOpen = true

        await this.loadBannedWords()
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        handleTokenExpired()
      }
    }
  },
  methods: {
    ...mapActions('storeBehavior', ['connectStompClient']),
    ...mapMutations('storeBehavior', ['setCurClassroom', 'setIsExternalChecklist', 'setChecklistToken']),
    async getChecklistToken() {
      return await axios.post(`${process.env.VUE_APP_BASE_API_URI}/classroom/checklist/token/${this.tokenId}`)
    },
    closeToast() {
      clearTimeout(this.toastTimeout)
      this.rewardCompleteContent = {}
      this.toastWithCharacter.isShow = false
      this.toast.isShow = false
    },
    async loadBannedWords() {
      const { data } = await checklistController.axios.get('/bannedWords/cache')
      this.bannedWords = Object.values(data)
    }
  },
  watch: {
    updateSubscribeList(newVal) {
      if (!newVal.content.checklistId || newVal.content.checklistId !== this.checklistId) return

      if (newVal.contentType === 'pointComplete') {
        const pointType = newVal.content.classroomPoints.findIndex(v => v.isNegative) > -1 ? 'effort' : 'good'

        if (newVal.content.useRewardSound) {
          this.resetAllSounds()
          this.playSoundEffect(this.pointRewardSound[pointType])
        }

        this.rewardCompleteContent = newVal

        if (newVal.content.studentViewType === 'CHARACTER') {
          this.toastWithCharacter.mode = pointType
          this.toastWithCharacter.isShow = true
        } else {
          this.toast.isShow = true
        }

        this.toastTimeout = setTimeout(() => {
          this.closeToast()
        }, 3000)

      } else if (newVal.contentType === 'checklist') {
        const eventObj = {
          'deleteChecklistToken': () => {
            handleTokenExpired()
          }
        }

        eventObj[newVal.content.eventType]?.()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.behavior-wrapper__body.new-win {
  width: 100%;
  .behavior-wrapper__body__content .record.inwon .record-recording{    
    position: relative;
    margin: 0 auto;
    &.open {
      width: 100%;
      transition: none;
    }
    ::v-deep{    
      .record-recording__top {
        display: none;
      }
    
      .record-recording__content {
        overflow: hidden;
        height: 100%;
        padding: 0;

        .record-recording__content__inwon{
          .top{
            min-height: 44px;
            display: flex ;
            align-items: center;
            margin-top: 20px;
            .check{display: none;}
            .content{
              display: flex;
              justify-content: space-between;
              width: 100%;
              align-items: center;
              .title{width:100%;min-height: auto;
                margin: 0;
                textarea{
                  width: 100%;
                  height: 44px !important;
                  resize: none;
                }
              }
              .etc{display: none;}
            }
          }
          .list-wrap{
            height:calc(100% - 44px);
            .list{
              // height:100%;
              margin: 0;
              table td p{
                &.check-list:not(.checked){
                  &:hover{
                    background: none;  
                    i{
                      background: url("~@/assets/img/icon/icon_inwon_checkbold_28.svg");
                    }                
                  }
                }
                &.check-list-text:not(.checked){
                  &:hover{
                    background: none;  
                    color: #e0e0e0;               
                  }
                }
              }
            }
          }
        } 
      }
    }
  }    
}
@media (max-width: 760px) {
  .behavior-wrapper__body.new-win {
    .behavior-wrapper__body__content .record.inwon{
      .record-recording{  
        min-height: auto; 
        ::v-deep{    
          .record-recording__content {
            .record-recording__content__inwon .top{
              padding:0 20px;
              .content .title textarea{
                font-size: 16px;
                line-height: 140%;
              }
            }
            .record-recording__content__inwon .list-wrap {
              height: calc(100% - 65px);
              .list{
                padding:0 20px 10px 20px;
                min-height: auto;
              }
            }
          }
        }
      }    
    } 
  }
}
</style>