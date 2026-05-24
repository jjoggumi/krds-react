<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="rewardsModal"
      style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <!-- <div class="modal-cont-inner"
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco"> -->
        <div class="modal-cont-inner">
          <div class="behavior-modal-setting-view">
            <div class="title-wrap">
              <h2>화면 설정</h2>
            </div>

            <div class="content-wrap">
              <div class="input">
                <p class="title">캐릭터 표시</p>
                <div class="check-list">
                  <p>
                    <input type="radio" name="student" value="CHARACTER" id="student-chk01" v-model="checkStudent">
                    <label for="student-chk01">
                      <span>표시</span>
                    </label>
                  </p>
                  <p>
                    <input type="radio" name="student" value="NONE" id="student-chk02" v-model="checkStudent">
                    <label for="student-chk02">
                      <span>표시 안 함</span>
                    </label>
                  </p>
                </div>
              </div>
              <div class="input">
                <p class="title">포인트 점수 표시</p>
                <div class="check-list">
                  <p>
                    <input type="radio" name="point" value="TOTAL" id="point-chk01" v-model="checkPoint">
                    <label for="point-chk01">
                      <span>표시</span>
                    </label>
                  </p>
                  <p>
                    <input type="radio" name="point" value="NONE" id="point-chk02" v-model="checkPoint">
                    <label for="point-chk02">
                      <span>표시 안 함</span>
                    </label>
                  </p>
                </div>
              </div>
              <div class="input">
                <p class="title">포인트 지급 효과음</p>
                <div class="check-list">
                  <p>
                    <input type="radio" name="sound" value="ON" id="sound-chk01" v-model="checkSound">
                    <label for="sound-chk01">
                      <span>소리 켜기</span>
                    </label>
                  </p>
                  <p>
                    <input type="radio" name="sound" value="OFF" id="sound-chk02" v-model="checkSound">
                    <label for="sound-chk02">
                      <span>소리 끄기</span>
                    </label>
                  </p>
                </div>
              </div>
            </div>

            <div class="btn-wrap">
              <button @click="close">취소</button>
              <button class="reg" @click="submit">완료</button>
            </div>
            <div class="modal-close-btn" @click="close"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState,mapActions,mapMutations} from 'vuex'

export default {
  name: 'student-view-setting',
  props: {},
  data() {
    return {
      checkStudent: "CHARACTER",
      checkPoint: "TOTAL",
      checkSound: "ON"
    }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
        detailClass: 'detailClass'
    }),
  },
  methods: {
    ...mapActions('storeBehavior', {
      getDetailClass: 'getDetailClass'
    }),
    ...mapMutations('storeBehavior', {
      setDetailClass: 'setDetailClass'
    }),
    submit: async function() {
      const data = {
        userId: this.userId(),
        studentViewType: this.checkStudent,
        pointViewType: this.checkPoint
      }

      localStorage.setItem("behavior-givepoint-sound", this.checkSound)

      try {
        const res = await this.$axios({
          method: 'PATCH',
          url: `/classroom/${this.curClassroom.classroomId}/view-types`,
          data: data
        })

        if(res) {
          // this.getDetailClass({classroomId: this.curClassroom.classroomId})
          this.setDetailClass({
            studentViewType: this.checkStudent,
            pointViewType: this.checkPoint
          })
        }
      } catch (err) {
        this.$log.debug('studentViewSetting submit PATCH() error => ', err)
      } 

      this.close()
    },
    close: function() {
      this.$emit('showStudentViewSettingPopup', false)
    },
    userId() {
      return localStorage.uuid
    },
  },
  mounted() {
    this.checkStudent = this.detailClass.studentViewType
    this.checkPoint = this.detailClass.pointViewType

    const checkSound = localStorage.getItem("behavior-givepoint-sound")
    if(!checkSound) {
      this.checkSound = "ON"
    } else {
      this.checkSound = checkSound
    }
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 16px;
}
</style>