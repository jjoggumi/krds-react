<template>
  <li>
    <span class="class-administrator">administrator</span>
    <div class="profile-thumbnail" :style="profileImage"></div>
    <div class="profile-text-wrap">
      <div class="name">
        <span>{{ className }}</span>
      </div>
      <div class="info">
        <span>{{ classItem.class.schoolName }}</span>
      </div>
    </div>
    <div class="profile-btn-wrap">
      <button type="button" class="btn-message" @click="showBatchPopup('BATCH')">일괄</button>
      <button type="button" class="btn-notice" @click="showTargetPopup('GROUP')">단체</button>
    </div>
  </li>
</template>

<script>
import {URLProps} from "@/enums";
import {mapMutations} from "vuex";
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: "MemberNoticeItem",
  props:{
    classItem: Object
  },
  computed:{
    profileImage() {
      if(!this.classItem.class) return `background-image: url(${URLProps.DEFAULT_PROFILE_IMAGE_URL})`;
      return `background-image: url(${this.classItem.class.classImagePath || EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS})`;
    },

    className() {
      const grade = this.classItem.class.classGrade
      const ban = this.classItem.class.classBan

      if (grade === 'ANY') {
        return `${ban}`
      } else {
        return `${grade}학년 ${ban}`
      }
    }

  },
  methods:{
    ...mapMutations('storeHitalk', [
      "setBatchPopupIsOpen",
      "setTargetPopupIsOpen",
      "setSendMessageItem"
    ]),
    showBatchPopup(roomType) {
      if (!this.classItem.member.length && !this.classItem.manager.length && !this.classItem.owner.length) {
        this.$hiClass.alert("구성원이 없습니다.");
        return
      }

      this.setSendMessageItem({
        mode:'CREATE',
        classId: this.classItem.classId,
        roomType: roomType
      })
      this.setBatchPopupIsOpen(true)
    },
    showTargetPopup(roomType) {
      if(!this.classItem.member.length && !this.classItem.manager.length && !this.classItem.owner.length){
        this.$hiClass.alert("공지할 대상이 없습니다.");
        return
      }

      this.setSendMessageItem({
        mode:'CREATE',
        classId: this.classItem.classId,
        roomType,
        className: this.classItem.class.className
      })
      this.setTargetPopupIsOpen(true)
    }
  }
}
</script>

<style scoped>
.ooo-conversation-cont-wrap .opponent-list-wrap .list-cont-wrap .profile-text-wrap .call span, .ooo-conversation-cont-wrap .opponent-list-wrap .list-cont-wrap .profile-text-wrap .info span, .ooo-conversation-cont-wrap .opponent-list-wrap .list-cont-wrap .profile-text-wrap .time span {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  max-width: 100%;
  word-break: break-all;
  word-wrap: break-word;
}
</style>