<template>
  <div class="behavior-toast-message type02" :style="style">
    <p class="msg">
      {{ item.message }}
    </p>
    <p v-if="isShowCancelBtn" class="esc" @click="escSubmit">
      <i class="bh-icon-refresh-on-20"></i>{{ item.btnName }}
    </p>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'

export default {
  name: 'give-point-finish-toast-02',
  props: {
    item: Object,
    content: Object,
    isShowCancelBtn: { type: Boolean, default: true }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
    }),
    style: function() {
      let obj = {
        width: this.item.width !== null ? `${this.item.width}px` : '420px',
        height: this.item.height !== null ? `${this.item.height}px` : '66px',
        'line-height': this.item.height !== null ? `${this.item.height}px` : '66px',
        'text-align': this.item.align,
      }
      let c = false
      let r = false

      if(this.item.top !== null) {
        obj.top = `${this.item.top}px`
      } else if(this.item.bottom !== null) {
        obj.bottom = `${this.item.bottom}px`
      } else {
        c = true
        obj.top = "50%"
      }

      if(this.item.left !== null) {
        obj.left = `${this.item.left}px`
      } else if(this.item.right !== null) {
        obj.right = `${this.item.right}px`
      } else {
        r = true
        obj.left = "50%"
      }

      if(c === true && r === true) {
        obj.transform = "translate(-50%, -50%)"
      } else if (c === true) {
        obj.transform = "translateY(-50%)"
      } else if (r === true) {
        obj.transform = "translateX(-50%)"
      }

      return obj
    }
  },
  data () {
    return {
      data: {}
    }
  },
  methods: {
    ...mapActions('storeBehavior', {
      sendStompClient: 'sendStompClient'
    }),
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
        for(const [key, value] of Object.entries(res.data.studentPoints)) {
          studentPoints.push({
            studentId: key,
            point: value
          })
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
  },
  created() {
    this.data = JSON.parse(JSON.stringify(this.content))
  },
}
</script>
<style scoped>
.behavior-toast-message {
  z-index: 9999;
}
</style>