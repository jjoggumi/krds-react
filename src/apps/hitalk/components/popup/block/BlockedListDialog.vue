<!--
@File(Method): BlockedListDialog.vue
@Author: - 
@Date Created: 2024-11-01
@Description: 하이톡/콜 차단 목록 관리 모달
-->
<template>
  <HiModal type="type01" size="sm" class="block-list" v-if="value" @close="close">
    <template v-slot:heading>차단 목록 관리</template>
    <template v-slot:content>
      <div class="block-list-wrap">
        <div class="list-title-wrap">
          <div class="title">차단 대상은 차단 해제 시 까지 영구 차단되며, 클래스를 <br>탈퇴/재가입 해도 차단이 유지됩니다.</div>
        </div>
        <ul v-if="blockedUsers.length > 0" class="list-cont-wrap ">
          <li v-for="u in blockedUsers" :key="u.userId">
            <div class="profile-text-wrap">
              <div class="name">
                <span>{{ userNameOf(u) }}</span>
              </div>
              <div class="info"><span>{{ formatDate(u.insertedTimestamp) }} 차단됨</span></div>
            </div>
            <div class="profile-btn-wrap">
              <HiButton color="default" outline size="sm" @click="onClickDelete(u)"> 해제 </HiButton>
            </div> 
            <ul class="class-list-wrap">
              <li class="tit">
                가입 클래스
              </li>
              <li v-for="c in u.clazzSubscribes" :key="c.classId">
                <div class="profile-thumbnail">
                  <img :src="profileImageOf(c)" alt="" />
                </div>                
                <div class="profile-text-wrap">
                    <div class="name">
                      <div 
                        v-show="c.userType !== 'TEACHER' && c.memberClassNumber && c.memberClassNumber !== 999" 
                        class="profile-order-wrap-n"
                        :class="sortedKind(c.memberClassNumber, c.userType)">
                        <template v-if="c.memberClassNumber !== 999">
                          {{c.memberClassNumber}}
                        </template>
                      </div>
                      <span>{{ userNameOf(c) }}</span>
                    </div>
                  <div class="info"><span>{{ c.className }}</span></div>
                </div>
              </li>
              <li class="noclass" v-if="u.clazzSubscribes.length === 0">
                가입된 클래스가 없습니다.
              </li>
            </ul>
          </li>
        </ul>   
        <div v-else class="nodata">
          <HiIcon name="ico-warning-circle-fill" color="disabled" size="50"></HiIcon>
          차단한 구성원이 없습니다. 
        </div>
      </div>
      <HiModal type="type01" size="sm" v-if="showConfirmDelete" @close="showConfirmDelete = false">
        <template v-slot:heading>
          <h2 class="heading">
            차단 해제 하시겠습니까?
          </h2>
        </template>
        <template v-slot:footer>
          <HiButton color="light-primary" outline  size="md" @click="showConfirmDelete = false"> 취소 </HiButton>
          <HiButton color="primary" size="md" @click="onConfirmDelete"> 차단 해제 </HiButton>
        </template>
      </HiModal>
    </template>
  </HiModal>  
</template>

<script>
import {URLProps} from "@/enums";
import { mapState, mapActions } from "vuex";
import HiModal from "@/components/Modal/HiModal";
import HiButton from "@/components/Button/HiButton";
import HiIcon from "@/components/Icon/HiIcon";

export default {
  name: 'BlockedListDialog',
  components: { HiModal, HiButton, HiIcon },
  props: {
    value: Boolean
  },
  watch: {
    value (v) {
      if (v) {
        this.fetchBlockedUsers({userId: this.user.currentId});
      }
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', ['blockedUsers']),
  },
  data() {
    return {
      showConfirmDelete: false,
      selectedUser: null
    }
  },
  methods: {
    ...mapActions('storeHitalk', ['blockDelete', 'fetchBlockedUsers']),
    close() {
      this.$emit('input', false);
    },
    profileImageOf (user) {
      return user.profilePhoto || URLProps.DEFAULT_PROFILE_IMAGE_URL;
    },
    async onConfirmDelete() {
      await this.blockDelete({
        blockerUserId: this.user.currentId,
        classIds: this.selectedUser.clazzSubscribes.map(c => c.classId),
        blockedUserId: this.selectedUser.userId})
      this.showConfirmDelete = false;
      
      this.$toasted.clear();
      this.$toasted.show("차단 해제되었습니다.", {
        duration: 2000,
        className: "type01",
      });
    },
    onClickDelete (m) {
      this.selectedUser = m;
      this.showConfirmDelete = true;
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const z00 = (v) => v < 10 ? '0' + v : v;
      return `${date.getFullYear() % 100}.${z00(date.getMonth() + 1)}.${z00(date.getDate())} ${z00(date.getHours())}:${z00(date.getMinutes())}:${z00(date.getSeconds())}`;
    },
    userNameOf (user) {
      return ({
        PARENTS: u => `${u.memberChildName} 학부모(${u.userName || u.profileName})`,
        STUDENT: u => `${u.memberChildName} 학생(${u.userName || u.profileName})`,
        TEACHER: u => `${u.userName || u.profileName} 선생님`,
      }[user.userType])(user)
    },
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

<style lang="scss" scoped>
  .block-list-wrap {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: auto;
    text-align: left;
    height:484px;
    .list-title-wrap {
      position: relative;
      background-color: #f7f8f9;
      border-bottom: 1px solid #eee;
      padding: 16px;
      .title {
        color: #666666;
        white-space: normal;
        line-height: 1.3;
        font-weight: 400;
        font-size: 13px;
      }
    }
    .list-cont-wrap {
      padding-top: 6px;
      > li {
        padding: 16px 12px 16px 16px;
        border-bottom: 0;
        display: flex;
        flex-wrap: wrap;
        row-gap: 13px;
        &:hover {
          background: transparent;
        }
        .profile-text-wrap {
          flex-grow: 1;
          width: calc(100% - 70px);
        }
      }
      .profile-text-wrap {
        .name {
          span {
            &:not(.num) {
              display: inline-block;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              max-height: 48px;
              max-width: 100%;
              color: #2e2e2e;
              line-height: 1.3;
              font-weight: 500;
              word-break: break-all;
              word-wrap: break-word;
              margin-right: 5px;
              font-size:14px;
            }
          }
        }
        .info{
          margin-top: 1px;
          span{
            display: inline-block;
            color: #888;
            font-size: 12px;
            line-height: 1.5;
            vertical-align: middle;
          }
        }
      }
      .profile-btn-wrap{
        padding-top: 2px;
      }
    }
    .class-list-wrap {
      background-color: #FAFAFA;
      border:1px solid #E6E6E6;
      border-radius: 6px;
      width: 100%;
      overflow: hidden;
      padding:16px 16px 6px;
      > li {
        padding: 14px 0;
        display: flex;
        gap: 8px;
        border-bottom: 1px solid #EEE;
        &:last-child{
          border:0;
        }
        &.tit{
          font-size: 13px;
          color: #888;
          padding: 3px 0 6px;
          min-height: auto;
          border: 0;
          margin-bottom:0;
          font-weight: 400;
        }
        &.noclass{
          font-size: 14px;
        }
        > .profile-text-wrap {
          > .name {
            display: flex;
            gap: 5px;
            align-items: center;
            > span {
              &:not(.num) {
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                color: #2e2e2e;
                line-height: 1.5;
                white-space: nowrap;
              }
            }
          }
        }
      }
      .profile-thumbnail{
        min-width: 36px;
        min-height: 36px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: url("~@/assets/img/icon/profile_default.png") 50% no-repeat;
        background-size: cover;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          -o-object-fit: cover;
          object-fit: cover;
          image-rendering: auto;
        }
      }
      .profile-order-wrap-n {
        &.num,
        &.num-no,
        &.num-std {
          display: inline-block;
          min-width: 28px;
          height: 18px;
          color: #616161;
          background: #fff;
          font-size: 12px;
          font-weight: 500;
          line-height: 16px;
          text-align: center;
          padding: 0 4px;
          border: 1px solid #9e9e9e;
          border-radius: 18px;
        }
      }
    }
    .nodata{
      color:#616161;
      flex-flow: column;
      justify-content: center;
      max-height: calc(100% - 70px);
    }
  }
</style>