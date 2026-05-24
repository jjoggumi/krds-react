<template>
  <li>
    <member-title-bar v-if="isTitle" :title="classItem.class.className" v-on:toggle="toggleList"/>
    <div class="list-cont-wrap" ref="member-list">
      <ul>
        <member-class-user-item
          v-for="member in memberList"
          :key="`${member.user.userId}-classUser`"
          :member="member"
          :blockable="blockable"
          @blockRequested="onBlockRequested"
          @blockDeleteRequested="onBlockDeleteRequested"
          @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"
        />
      </ul>
    </div>
    <HiModal type="type01" size="sm" class="block-confirm" v-if="showBlockConfirmModal" @close="showBlockConfirmModal = false">
      <template v-slot:heading>
        <h2 class="heading">
          {{ selectedMemberName }} <br> 차단하시겠습니까?
        </h2>
      </template>
      <template v-slot:content>
        <ul class="txt-gray list-dot">
          <li>차단 대상은 선생님께 메시지를 보내거나 전화를 걸 수 없습니다.</li>
          <li>선생님은 차단 대상에게 일방향으로 하이톡/콜 발신이 가능합니다.</li>
          <li>차단 여부는 상대방이 알 수 없으며, 하이톡/콜을 사용하지 않는 학급으로 표시됩니다.</li>
        </ul>
      </template>
      <template v-slot:footer>
        <HiButton color="light-primary" outline  size="md" @click="showBlockConfirmModal = false"> 취소 </HiButton>
        <HiButton color="noti" size="md" @click="onClickConfirmBlock"> 차단 </HiButton>
      </template>
    </HiModal>
    <HiModal type="type01" size="sm" v-if="showBlockDeleteConfirmModal" @close="showBlockDeleteConfirmModal = false">
        <template v-slot:heading>
          <h2 class="heading">
            차단 해제 하시겠습니까?
          </h2>
        </template>
        <template v-slot:footer>
          <HiButton color="primary" outline  size="md" @click="showBlockDeleteConfirmModal = false"> 취소 </HiButton>
          <HiButton color="primary" size="md" @click="onConfirmBlockDelete"> 차단 해제 </HiButton>
        </template>
      </HiModal>
  </li>
</template>

<script>
import MemberTitleBar from "@/apps/hitalk/components/tabs/member/MemberTitleBar";
import MemberClassUserItem from "@/apps/hitalk/components/tabs/member/MemberClassUserItem";
import HiModal from "@/components/Modal/HiModal";
import HiButton from "@/components/Button/HiButton";
import {UserLevel} from "@/enums";
import {mapState, mapActions} from "vuex";
import {userNameOfMember} from "./stringUtils";

export default {
  name: "MemberClassUserList",
  components: {MemberClassUserItem, MemberTitleBar, HiModal, HiButton},
  props: {
    classItem: Object,
    memberSearchItem: {
      type: Object
    }
  },
  data: () => ({
    toggleFlag: false,
    showBlockConfirmModal: false,
    showBlockDeleteConfirmModal: false,
    selectedMember: null
  }),
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', [
      'searchKeyword', 'blockedUsers'
    ]),
    isTitle: function () {
      if (this.memberSearchItem.searchType === 'TAG') {
        return this.memberList.length > 0
      } else {
        return this.searchKeyword.trim() === '' || this.searchKeyword.trim() !== '' && this.memberList.length > 0
      }
    },
    memberList: function () {
      let list = this.classItem.users.map(userItem => {
        if(!userItem.memberClassNumber === true) userItem.memberClassNumber = 999
        return userItem
      })

      if (this.memberSearchItem.searchType === 'TAG') {
        list = list.filter(user =>
            this.classItem.memberRole !== 'MEMBER' &&
            (user.tags || []).map(tag => tag.tagId).some(tagId => this.memberSearchItem.searchValue.includes(tagId))
        )
      }

      const ltrim = (value) => {
          return value.replace(/^\s+/,"");
      }
      const rtrim = (value) => {
          return value.replace(/\s+$/,"");
      } 
      const searchKeywords = rtrim(ltrim(this.searchKeyword)).split(' ')
      return this.searchKeyword.trim() !== '' ? list.filter(userItem => {
        switch (userItem.userType) {
          case UserLevel.TEACHER: {
            return searchKeywords.filter(o => o.trim() !== '').some(word => `${userItem.user.userName} 선생님`.match(word.trim()));
          }
          case UserLevel.PARENTS: {
            return searchKeywords.filter(o => o.trim() !== '').some(word => `${userItem.memberChildName} 학부모(${userItem.user.userName})`.match(word.trim()));
          }
          case UserLevel.STUDENT: {
            return searchKeywords.filter(o => o.trim() !== '').some(word => `${userItem.memberChildName} 학생(${userItem.user.userName})`.match(word.trim()));
          }
          default: {
            return searchKeywords.filter(o => o.trim() !== '').some(word => userItem.user.userName.match(word.trim()));
          }
        }
      })
        .sort((a, b) => {
          if (a.userType < b.userType)
            return 1
          else if (a.memberClassNumber > b.memberClassNumber)
            return 1
          else if (a.memberClassNumber < b.memberClassNumber)
            return -1

          return 0
        }) : list.sort((a, b) => {
          if (a.userType < b.userType)
            return 1
          else if (a.memberClassNumber > b.memberClassNumber)
            return 1
          else if (a.memberClassNumber < b.memberClassNumber)
            return -1

          return 0
        })
    },
    selectedMemberName: function () {
      return userNameOfMember(this.selectedMember || {})
    },
    blockable: function () {
      return this.user.userType === 'TEACHER' &&
        ['OWNER', 'MANAGER'].includes(this.classItem.memberRole)
    }
  },
  methods: {
    ...mapActions('storeHitalk', ['blockCreate', 'blockDelete']),
    toggleList: function () {
      this.toggleFlag = !this.toggleFlag;
      if (this.toggleFlag) {
        $(this.$refs["member-list"]).slideUp(200);
      } else {
        $(this.$refs["member-list"]).slideDown(200);
      }
    },
    onBlockRequested (member) {
      this.selectedMember = member
      this.showBlockConfirmModal = true
    },
    async onClickConfirmBlock () {
      await this.blockCreate({
        blockerUserId: this.user.currentId,
        classId: this.selectedMember.clazz.classId,
        blockedUserId: this.selectedMember.user.userId})
      this.showBlockConfirmModal = false
      this.$toasted.clear();
      this.$toasted.show("차단되었습니다.", {
        duration: 2000,
        className: "type01",
      });
    },
    onBlockDeleteRequested(member) {
      this.selectedMember = member
      this.showBlockDeleteConfirmModal = true
    },
    async onConfirmBlockDelete () {
      const found = this.blockedUsers.find(b => b.userId === this.selectedMember.user.userId)
      if (!found) return
      await this.blockDelete({
        blockerUserId: this.user.currentId,
        classIds: found.clazzSubscribes.map(c => c.classId),
        blockedUserId: this.selectedMember.user.userId
      })
      this.showBlockDeleteConfirmModal = false
      this.$toasted.clear();
      this.$toasted.show("차단 해제되었습니다.", {
        duration: 2000,
        className: "type01",
      });
    },
    onCloseShareReportHistoryDetail() {
      this.$emit('closeShareReportHistoryDetail');
    },
  }
}
</script>

<style lang="scss" scoped>
.block-confirm {
  ::v-deep .modal__layer {
    width: 510px;
    max-width: none;
    ul li{
      font-size:16px;
      padding: 3px 0;
    }
  }
}
</style>