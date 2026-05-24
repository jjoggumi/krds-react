<template>
  <div></div>
</template>

<script>
import {mapMutations, mapActions, mapState} from "vuex";

export default {
  data: () => ({
    showListFlag: false,
    memberType: "",
    isSelectedItem: false
  }),
  props: {},
  computed: {
    ...mapState('storeHitalk',[
      'currentClassItem',
      'noticeCategory',
    ]),
    allUserIdArrayList:function(){
      let idArrayList =[];
      for(let userItem of this.currentClassItem.users){
        idArrayList.push(userItem.user.currentId)
      }
      return idArrayList;
    },
    parentUserIdArrayList:function(){
      let userArrayList = this.currentClassItem.users.filter(userItem => {
        return userItem.userType === "PARENTS"
      })
      let idArrayList =[];
      for(let userItem of userArrayList){
        idArrayList.push(userItem.user.currentId)
      }
      return idArrayList;
    },
    studentUserIdArrayList:function(){
      let userArrayList = this.currentClassItem.users.filter(userItem => {
        return userItem.userType === "STUDENT"
      })
      let idArrayList =[];
      for(let userItem of userArrayList){
        idArrayList.push(userItem.user.currentId)
      }
      return idArrayList;
    },
    className: function () {
      return this.currentClassItem.class.className;
    },
    selectedIdArrayList:function(){
      switch (this.memberType) {
        case "ALL": {
          return this.allUserIdArrayList;
        }
        case "PARENTS": {
          return this.parentUserIdArrayList;
        }
        case "STUDENT": {
          return this.studentUserIdArrayList;
        }
      }
      return null;
    },
    selectedItem: function () {
      switch (this.memberType) {
        case "ALL": {
          return this.$t('chat.notice.target.all');
        }
        case "PARENTS": {
          return this.$t('chat.notice.target.parents');
        }
        case "STUDENT": {
          return this.$t('chat.notice.target.student');
        }
        case "CUSTOM": {
          return this.$t('chat.notice.target.custom');
        }
        default: {
          return this.$t('chat.notice.target.default');
        }
      }
    },
    titleText:function(){
      switch (this.noticeCategory) {
        case "personal": {
          return "일괄메시지 대상 선택";
        }
        case "group": {
          return "단체공지 대상 선택";
        }
        default: {
          return "단체공지 대상 선택";
        }
      }
    }
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'showNoticeCustomLayout',
      'showNoticeTargetLayout',
      'hideNoticeCustomLayout',
      'hideNoticeTargetLayout',
    ]),
    ...mapActions("storeHitalk", {
      callCreateRoom: "callCreateRoom",
      callRoomInformation: "callRoomInformation",
    }),
    toggleListBox: function () {
      this.showListFlag = !this.showListFlag;
    },
    setSelectItem: function (itemCategory) {
      this.memberType = itemCategory;
      this.isSelectedItem = true;
    },
    closeNoticeTargetSelectBox: function () {
      this.hideNoticeTargetLayout();
      this.memberType = "";
      this.showListFlag = false;
    },
    submitNoticeTarget: function () {
      if (!this.isSelectedItem) return;

      switch (this.memberType){
        case "ALL":
        case "PARENTS":
        case "STUDENT":
          if(this.selectedIdArrayList.length ===0){
            this.$hiClass.alert("공지할 대상이 없습니다.");
            return;
          }
          break;
        case "CUSTOM":
          if(this.allUserIdArrayList.length ===0){
            this.$hiClass.alert("공지할 대상이 없습니다.");
            return;
          }
          this.hideNoticeTargetLayout();
          this.showNoticeCustomLayout();

          return;
      }

      switch (this.noticeCategory){
        case "personal":
          this.callRoomInformation({
            sender : localStorage.uuid,
            classId : this.currentClassItem.classId,
            receiver : this.selectedIdArrayList
          })
          break;
        case "group":
          this.callCreateRoom({
            roomType: "GROUP",
            memberType: this.memberType,
            classId: this.currentClassItem.classId,
            content: ""
          });
          break;
      }

      this.closeNoticeTargetSelectBox();

    }
  },
  created() {
    // 직접 선택 only
    this.setSelectItem('CUSTOM');
    this.submitNoticeTarget();
  },
  mounted() {
  },
  beforeDestroy() {
    this.closeNoticeTargetSelectBox();
  }
}
</script>

<style scoped></style>
