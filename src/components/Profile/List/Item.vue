<template>
  <span v-if="inline" style="word-wrap: break-word;">
    {{ profileName }}
  </span>
  <div v-else :class='{"profile-list-item": withStyle}'>
    <span v-if="showImage" class="img-area">
      <img :src="user.profilePhoto" alt="">
    </span>

    <span class="txt-area" :class="{ 'no-img' : !showImage, 'profile-block': blocked }">
      <span v-if="showStudentNo && user.userType !== 'TEACHER' && user.studentNo"
      :class="sortedKind(user.studentNo, user.userType)">{{ user.studentNo }}</span>
      <span class="txt-inner">
        <span class="name">{{ profileName }}</span>
      </span>
    </span>
  </div>
</template>
  
  <script>
  export default {
    name: 'ProfileListItem',
    props: {
      user: {
        type: Object,
        required: true
      },
      showImage: {
        type: Boolean,
        default: true
      },
      attachSir: {
        type: Boolean,
        default: false
      },
      inline: {
        type: Boolean,
        default: false
      },
      withStyle: {
        type: Boolean,
        default: true
      },
      blocked: {
        type: Boolean,
        default: false
      },
      showStudentNo: {
        type: Boolean,
        default: true
      },
      showStudentProfileName: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      userName() {
        return this.user.userName || this.user.profileName
      },
      studentName() {
        return this.user.memberChildName || this.user.studentName
      },
      profileName() {
        return ({
          'TEACHER': () => `${this.userName} 선생님`,
          'STUDENT': () => this.studentName ?
            `${this.studentName} 학생` + (this.showStudentProfileName ? ` (${this.userName})` : '')
            : `${this.userName} 학생`,
          'PARENTS': () => this.studentName
            ? `${this.studentName} 학부모 (${this.userName})`
            : `${this.userName} 학부모${this.attachSir ? '님' : ''}`,
        }[this.user.userType] || (() => this.userName || '(알수없음)'))(this.user)
      }
    },
    methods: {
      sortedKind(number, type) {
        if(number === 999) {
          return "num-no"
        }
        if(type === "PARENTS") {
          return "num"
        }      
        return "num-std"
      }
    }
  }
  </script>

  <style scoped lang="scss">
  .profile-list-item {
    padding: 0px;
  }
  .txt-area.no-img {
    margin-left: 8px;
  }
  .txt-inner .name {
    width: inherit;
  }
  </style>
  