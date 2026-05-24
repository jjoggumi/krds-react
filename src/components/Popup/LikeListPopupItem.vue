<template>
  <li class="selected">
    <hc-thumbnail
      :isBackgroundImage="true"
      :src="writeUser.userPhoto"
      type="userLike"
    />
    <div class="profile-text-wrap">
      <div class="name">
        <span>{{ getUserNameByWriteUser({ writeUser, isClassPost }) }}</span>
        <!--
        <span>{{ mypageName }}</span>
        <span v-if="isClassPost">&nbsp;{{ suffixName }}</span>
        -->
      </div>
    </div>
  </li>
</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import {mapGetters} from "vuex";

const HcThumbnail = () => ({
  component: import('@/components/Form/HcThumbnail.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'like-list-popup-item',
  components: {
    HcThumbnail
  },
  props: {
    writeUser: {
      type: Object,
      required: true
    },
    isClassPost: {
      type: Boolean
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      getUserNameByWriteUser: 'getUserNameByWriteUser',
    }),
    isTeacher() {
      return (
        this.writeUser.memberRole === 'OWNER' ||
        this.writeUser.memberRole === 'MANAGER'
      )
    },
    isParents() {
      return (
        !this.isTeacher &&
        (this.writeUser.userType === 'TEACHER' ||
          this.writeUser.userType === 'PARENTS')
      )
    },
    isStudent() {
      return !this.isTeacher && this.writeUser.userType === 'STUDENT'
    },
    isDeactivateUser() {
      return this.isUnSubscribeUser && this.writeUser.userName === 'unknown'
    },
    isUnSubscribeUser() {
      return !this.writeUser.userType
    },
    /*
    mypageName() {
      return this.isDeactivateUser ? '탈퇴회원' : this.writeUser.userName
    },
    suffixName() {
      let suffixName = ''
      if (this.isTeacher) {
        suffixName = `선생님`
      } else if (this.isParents) {
        suffixName = `(${this.writeUser.memberChildName} 학부모)`
      } else if (this.isStudent) {
        suffixName = `(${this.writeUser.memberChildName} 학생)`
      } else if (this.isUnSubscribeUser && !this.isDeactivateUser) {
        suffixName = '(탈퇴회원)'
      }
      return suffixName
    }
    */
  },
  methods: {},
  created() {},
  mounted() {},
  destroyed() {}
}
</script>

<style lang="scss" scoped>
li {
  display: flex;
  align-items: center;
  min-height: 72px;
  text-align: left;
  padding: 18px 24px;
  border-bottom: 1px solid #ececec;    
  width: 100%;
  position: relative;
  font-size: 0;  
  
  &.selected .chating-count {
    display: none;
  }

  > * {
    display: inline-block;
    vertical-align: middle;
  } 

  .profile-text-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    min-height: 36px;
    font-size: 13px;
    .name {
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
      color: #2e2e2e;

      span {
        display: inline-block;
        vertical-align: middle;
        font-size: 15px;
        line-height: 1.4;
        color: #2e2e2e;
        word-break: break-all;
      }

      &.no-alarm:after {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        background: url('~@/assets/img/icon_c_no_alarm_16.png');
        vertical-align: middle;
        margin: -5px 0 0 0;
      }
    }
  }
}

// li {
//   .time {
//     margin: 4px 0 0 0;
//     font-size: 0;

//     &:before {
//       content: '';
//       display: inline-block;
//       width: 18px;
//       height: 18px;
//       margin: 0 4px 0 0;
//       background: url('~@/assets/img/icon_c_time_18.png');
//       vertical-align: middle;
//     }

//     span {
//       display: inline-block;
//       font-size: 13px;
//       color: #888;
//       vertical-align: middle;
//       transform: skew(0.2deg);
//     }
//   }
//   .school-info {
//     margin: 4px 0 0 0;
//     font-size: 14px;
//     transform: skew(0.2deg);
//     padding: 0 20px 0 0;

//     span {
//       color: #888;
//       word-break: break-all;
//     }
//   }
//   .chating-preview {
//     height: 14px;
//     margin: 11px 0 0 0;

//     p {
//       transform: skew(0.2deg);
//       font-size: 14px;
//       color: #2e2e2e;
//     }

//     .chating-count {
//       position: absolute;
//       right: 20px;
//       bottom: 15px;
//       width: 36px;
//       height: 22px;
//       border-radius: 12px;
//       background: var(--primary);
//       text-align: center;

//       span {
//         line-height: 22px;
//         color: #fff;
//       }
//     }

//     .chating-time {
//       position: absolute;
//       top: 16px;
//       right: 23px;
//       color: #888;
//       transform: skew(0.2deg);
//     }
//   }
//   .profile-order-wrap {
//     height: 32px;
//     padding: 0 8px;
//     margin: 0 8px 0 0;
//     line-height: 33px;
//     border-radius: 2px;
//     background: #f4f4f4;
//     font-size: 13px;
//     font-weight: bold;
//     text-align: center;
//   }
// }
  
  </style>
