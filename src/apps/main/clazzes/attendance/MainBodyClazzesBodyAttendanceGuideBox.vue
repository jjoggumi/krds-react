<template>
  <div class="attendance-info-area">
    <i class="icon-speech-bubble"></i>
    <div class="info" :class="{'editing': mode === 'edit'}" ref="infoDiv">
      <span
          v-show="mode === 'view'"
          v-html="replaceEnter()"
      />
      <textarea
          v-show="mode === 'edit'"
          class="info-textarea"
          @input="setHeight($event)"
          ref="infoTextarea"
          style="white-space:pre-line;"
          v-model="cloneGuidInfo"
          maxlength="255"
      />

      <i
          v-if="clazzMemberRole !== 'MEMBER' && mode === 'view'"
          class="icon-list-modify"
          role="button"
          @click="setMode('edit')"
      />
      <p class="btn" v-if="mode === 'edit'">
        <button class="hi-btn btn-md btn-line-lgray" @click="setMode('view')">취소</button>
        <button class="hi-btn btn-md btn-line" @click="saveGuideInfo">수정</button>
      </p>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "main-body-clazzes-body-attendance-guide-box",
  data() {
    return {
      mode: 'view',
      cloneGuidInfo: ''
    }
  },
  computed: {
    ...mapGetters({
      curClassId: 'curClassId',
    })
  },
  props: {
    clazzMemberRole: {
      type: String
    },
    guide: {
      type: Object
    }
  },
  methods: {
    ...mapActions('storeClazzes', {
      patchAttendanceGuidesGuides: 'patchAttendanceGuidesGuides'
    }),
    setMode(mode) {
      if (mode === 'edit') {
        this.$refs.infoTextarea.style.height = `${this.$refs.infoDiv.clientHeight}px`
        this.cloneGuidInfo = _.cloneDeep(this.guide.INFO)
      }
      this.mode = mode
    },
    setHeight(e) {
      this.$refs.infoTextarea.style.height = 'auto'
      this.$refs.infoTextarea.style.height = `${this.$refs.infoTextarea.scrollHeight}px`
    },
    replaceEnter() {
      return this.guide.INFO.replaceAll('\n', '<br>')
    },
    saveGuideInfo() {
      this.patchAttendanceGuidesGuides({
        classId: this.curClassId,
        guide: {INFO: this.cloneGuidInfo}
      })
      this.guide.INFO = _.cloneDeep(this.cloneGuidInfo)
      this.setMode('view')
    }
  }
}
</script>

<style scoped>
.btn .btn-line {
  margin-left: 8px;
}
.attendance-info-area {
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    margin-bottom: 40px;
    background: #FAFAFA;
    padding-top: 20px;
    padding-bottom: 20px;
}
.attendance-info-area .icon-speech-bubble {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icons_speech_bubble.svg");
    margin-left: 20px;
    margin-top: 3px;
    position: absolute;
}
.attendance-info-area .info {
    color: #616161;
    margin-left: 44px;
    position: relative;
}
.attendance-info-area .info .icon-speech-bubble-n2 {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icons_speech_bubble.svg");
    margin-left: -24px;
    margin-top: 3px;
    position: absolute;
}
.attendance-info-area .info span {
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
}
.attendance-info-area .info.editing {
    background: #fff;
    padding: 10px 20px 11px 15px;
    border: 1px solid #E0E0E0;
    border-radius: 6px;
    margin-right: 20px;
}
.attendance-info-area .info.editing .info-textarea{
    width: 80%;
    border: 0;
    line-height: 150%;
    font-size: 15px;
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.attendance-info-area .info.editing .info-textarea::-webkit-scrollbar{
    display: none;
}
.attendance-info-area .info.editing .icon-speech-bubble-n2 {
    margin-left: -39px;
    margin-top: 0px;
}
.attendance-info-area .info p.btn {
    display: none;
}
.attendance-info-area .info.editing p.btn {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 140px;
    display: block;
}
.attendance-info-area .info.editing p.btn button {
    width: 66px;
    height: 32px;
    line-height: 30px;
    font-size: 14px;
    font-weight: 500;
    padding: 0;
}
.attendance-info-area .icon-list-modify {
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    background: url("~@/assets/img/icon/icons_list_modify.svg");
}
</style>