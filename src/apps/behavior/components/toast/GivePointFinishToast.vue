<template>
  <div class="behavior-give-point-finish-wrap">
    <div class="modal__dim"></div>
    <div class="behavior-give-point-finish"
      :class="{
        bad: mode === 'effort'
      }"
       v-click-outside="close"
    >
      <div class="behavior-give-point-finish__wrap">
        <img class="close" @click="close" />
        <img class="bg-img" />
        <div class="message-wrap">
          <p class="title"><i></i><span>포인트 지급 완료</span></p>
          <p class="message">
            <!-- <span v-if="mode === 'effort'">숙제를 성실하게 해주세요</span>
            <span v-else>숙제를 착실하게 잘했어요</span> -->
            <span class="text">{{ getPointName }}</span>
            <template v-if="isPointOverCount > 0">
              &nbsp;<span class="point">+{{ isPointOverCount }}</span>
            </template>
          </p>
        </div>

        <div class="character-wrap">
          <template v-if="isCharacterOverCount > 5">
            <div class="character-wrap">
              <div class="characters over">
                <p>
                  <img />
                </p>
              </div>
              <div class="user-over">{{ getStudentName }} 외 {{ isCharacterOverCount - 1}}명</div>
            </div>
          </template>

          <template v-else>
            <div class="characters">
              <p v-for="(item) of data.content.studentPoints" :key="`character-list-${item.studentId}`">
                <img :class="{'is-photo': isPhoto(item)}" :src="selectedImageSrc(item)" />
                <span>{{ item.studentName }}</span>
              </p>
            </div>
          </template>
          <!-- <div class="user-over">양하마 외 6명</div> -->
        </div>

        <div v-if="isShowCancelBtn" class="esc-wrap">
          <button @click="escSubmit"><i></i>취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'

export default {
  name: 'give-point-finish-toast',
  components: {
  },
  props: {
    item: Object,
    content: Object,
    isShowCancelBtn: { type: Boolean, default: true }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
    }),
    isPointOverCount() {
      return this.data.content.classroomPoints.length - 1
    },
    isCharacterOverCount() {
      return this.data.content.studentPoints.length
    },
    getPointName() {
      return this.data.content.classroomPoints[0].pointName
    },
    getStudentName() {
      return this.data.content.studentPoints[0].studentName
    }
  },
  data() {
    return {
      mode: "",
      data: {}
    }
  },
  methods: {
    ...mapActions('storeBehavior', {
      sendStompClient: 'sendStompClient'
    }),
    isPhoto: function(student) {
      return !!student.studentPhoto
    },
    selectedImageSrc: function(student) {
      return this.isPhoto(student) 
        ? student.studentPhoto
        : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_fullshot.png`
    },
    escSubmit: async function() {
      try {
        const res = await this.$axios({
          method: 'DELETE',
          url: `/v2/classroom/${this.curClassroom.classroomId}/rewards`,
          data: {
            userId : this.userId(),
            rewardId : this.data.content.rewardId
          }
        })

        const studentPoints = []
        if(!res.data.studentPoints === false) {
          for(const [key, value] of Object.entries(res.data.studentPoints)) {
            studentPoints.push({
              studentId: key,
              point: value
            })
          }
        }

        const sendObj = {
          classroomId: this.curClassroom.classroomId,
          rewardId: this.data.content.rewardId,
          studentPoints: studentPoints
        }
        await this.sendStompClient(sendObj)
      } catch (err) {
        this.$log.debug('classroom rewards DELETE() error => ', err)
      }
    },
    userId() {
      return localStorage.uuid
    },
    close() {
      this.$emit("close")
    }
  },
  created() {
    this.data = JSON.parse(JSON.stringify(this.content))
  },
  mounted() {
    this.mode = this.item.mode
  }
}
</script>