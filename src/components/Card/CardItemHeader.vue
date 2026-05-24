<!--
@File(Method): CardItemHeader.vue
@Description: 게시판 리스트 header
@Modified: 2024-11-28 #69568 비밀게시판 - 비밀게시판 앞 아이콘 추가
-->
<template>
  <div class="board__header">
    <span class="category" >
      <HiIcon name="ico-group-fill" color="gray" size="18" class="board-type-group" v-if="isSecretBoard" />
      {{ boardAndFolderName }}
    </span>
    <!-- 
    <span class="category" :class="{'secret': isSecretBoard}">{{ boardAndFolderName }}</span>
    -->
    <span
      v-if="isAlarmPlus"
      class="label"
      :class="alarmPlusStatusObj.class"
    >
      {{ alarmPlusLabelTitles }}
    </span>

    <span v-if="postMustRead" class="label required">필독</span>

    <post-title
      :post-title="postTitle"
      :post-type="postType"
      :post-type-name="postTypeName"
      :posted="posted"
    ></post-title>

    <div class="board__info">
      <span
        class="image"
        :class="{ 'school': isSchoolPost }"
      >
        <img v-if="writeUserPhoto" :src="writeUserPhoto" alt="">
      </span>
      <span class="name">{{ writeUserStr }}</span>
      <span
        class="date"
        :class="{
            temp: isTemporary,
            booking: isReserve,
          }"
      >
          {{ postedStr }} {{ postedSuffix }}
        </span>
    </div>

    <button class="btn-hitalkshare" v-if="isShowHitalkShareBtn" @click="controlHitalkShareModal(true)">하이톡 공유</button>

    <card-more
      v-if="isShowCardMore"
      :isManager="isManager"
      :post-id="postId"
      :post-type="postType"
      :post-type-name="postTypeName"
      :post-pin="postPin"
      :post-status="postStatus"
      :is-parent-deactivated="isParentDeactivated"
      :school-type="schoolType"
      :write-user="writeUser"
      :board="board"
      :folder="folder"
      :version="version"
      :isDetail="isDetail"
      :postItem="postItem"
      @movePost="movePost"
      @movePostClose="movePostClose"
      @copyPost="copyPost"
      @is-delete="emitIsDelete"
      @is-post="emitIsPost"
    ></card-more>

    <!-- 하이톡 공유하기 모달 -->
    <hitalk-share-modal
        v-if="hitalkShareIsOpen"
        :post="postItem"
        :postType="postType"
        :shareBtnType="shareBtnType"
        :schoolType="schoolType"
        @controlHitalkShareModal="controlHitalkShareModal"
    >
    </hitalk-share-modal>

  </div>

</template>

<script>
import {mapGetters, mapActions, mapState} from "vuex";
import CardMore from "@/components/Card/header/CardMore";
import PostTitle from "@/components/Card/header/PostTitle";
import {eventBus} from "@/main";
import HitalkShareModal from "@/components/HitalkShare/HitalkShareModal";

export default {
  name: "card-item-header",
  components: {PostTitle, CardMore, HitalkShareModal},
  data() {
    return {
      hitalkShareIsOpen: false
    }
  },
  props: {
    isParentActivated: {
      type: Boolean,
    },
    isParentDeactivated: {
      type: Boolean
    },
    isManager: {
      type: Boolean,
    },
    isTemporary: {
      type: Boolean,
    },
    isReserve: {
      type: Boolean,
    },
    isClassList: {
      type: Boolean
    },
    postId: {
      type: String,
    },
    postItem: {
      type: Object,
    },
    postMustRead: {
      type: Boolean,
    },
    postTitle: {
      type: [String, null]
    },
    postType: {
      type: String,
    },
    postTypeName: {
      type: String,
    },
    posted: {
      type: Number,
    },
    postStatus: {
      type: String,
    },
    postPin: {
      type: Boolean,
      default() {
        return false
      }
    },
    schoolType: {
      type: String
    },
    schoolImagePath: {
      type: String
    },
    schoolName: {
      type: String
    },
    version: {
      type: [String, null]
    },
    writeUser: {
      type: Object,
    },
    board: {
      type: Object
    },
    folder: {
      type: Object
    },
    isShowFolderName: {
      type: Boolean
    },
    isDetail: {
      type: Boolean
    },

    alarmPlus: {
      type: [Object, null],
    },
    alarmPlusId: {
      type: [String, null],
    },
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    ...mapGetters({
      getUserTypeNameByCode: 'getUserTypeNameByCode',
    }),
    isShowCardMore() {
      if (this.isManager) {
        return this.isParentActivated || this.isParentDeactivated
      } else {
        return this.isParentActivated &&
            this.writeUser.userId && this.writeUser.userId === this.$store.state.user.currentId
      }
    },
    isSchoolPost() {
      return ['ALARM', 'ALARM_PLUS', 'MEAL', 'NOTICE', 'ALARM_EDU_OFFICE'].includes(this.postType)
    },
    isOtherPost() {
      return ['EDUCATION', 'EVENT', 'HINOTICE', 'CP_BOARD'].includes(this.postType)
    },
    isClassPost() {
      return ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'].includes(this.postType)
    },
    isCpBoardPost() {
      return ['CP_BOARD'].includes(this.postType)
    },
    isAdminPost() {
      return ['EDUCATION', 'EVENT', 'HINOTICE'].includes(this.postType)
    },
    isAlarmPlus() {
      return !!(this.alarmPlusId)
    },
    postedStr() {
      let dateFormat = 'M[월] D[일] ddd[요일]'
      const nowYear = this.$moment().year()
      const paramYear = this.$moment(this.posted).year()

      if (this.isTemporary || this.isReserve)
        dateFormat = 'M[월] D[일] ddd[요일] HH:mm'

      if (nowYear - paramYear > 0)
        dateFormat = `YYYY[년] ${dateFormat}`

      return this.$moment(this.posted).format(dateFormat)
    },
    postedSuffix() {
      let suffix = ''

      if (this.postStatus === 'RESERVE') suffix = '예약'
      else if (this.postStatus === 'TEMPORARY') suffix = '임시저장'

      return suffix
    },
    writeUserPhoto() {
      if (this.isSchoolPost) {
        return this.schoolImagePath
      } else if (this.isClassPost) {
        return this.writeUser.userPhoto
      } else if (this.isCpBoardPost) {
        return this.postItem && this.postItem.parent ? this.postItem.parent.cpImagePath : ''
      } else if (this.isAdminPost) {
        return this.postItem && this.postItem.parent ? this.postItem.parent.infoImagePath : ''
      } else {
        return ''
      }
    },
    writeUserStr() {
      if (this.isSchoolPost) return this.schoolName
      else if (this.isOtherPost) return '하이클래스'

      try {
        let user = this.writeUser.userName + ' '

        // 클래스 구독자명
        const memberRole = this.writeUser.memberRole
        const userTypeName = this.getUserTypeNameByCode({code: this.writeUser.userType})
        const memberChildName = this.writeUser.memberChildName || this.$t('main.unknown.user.name')

        switch (memberRole) {
          case 'MANAGER':
          case 'OWNER':
            user += userTypeName
            break

          // 클래스 탈퇴 등으로 구독 정보가 삭제된 경우
          case null:
            user = this.$t('main.unknown.user.name')
            break

          default:
            user += `(${memberChildName} ${userTypeName})`
        }

        // 마이페이지 > 스크랩 목록
        /*if (this.option.cardOption.isMypageScrapItem)
          user = `${this.item.parent.className} ${user}`*/

        if (!this.writeUser.userType)
          user = this.writeUser.userName || ''

        if (!this.writeUser.memberRole) {
          user = this.$t('main.unknown.user.name')
        }

        if (this.writeUser.userName === 'unknown' && !memberRole)
          user = this.$t('main.unknown.user.name')

        return user

      } catch (e) {
        return this.writeUser.userName || ''
      }
    },

    alarmPlusTypeObj() {
      if (!this.alarmPlusId) return {}

      const type = {}
      const letterType = this.alarmPlus.letterType
      const secretNameYn = this.alarmPlus.secretNameYn || false
      const isFirstCome = this.alarmPlus.isFirstCome

      switch (letterType) {
        case 'CONSULTATION': {
          type.title = '학부모/학생 상담'
          break
        }
        case 'QUESTIONNAIRE': {
          type.title = `${isFirstCome ? '선착순 ' : ''}${secretNameYn === 'Y' ? '익명설문' :'설문'}`
          break
        }
        case 'AFTER_SCHOOL': {
          type.title = '방과후 신청'
          break
        }
        // case 'GENERAL': {
        //   type.title = '일반'
        //   break
        // }
        default: {
          type.class = ''
          type.title = ''
        }
      }

      return type
    },
    alarmPlusStatusObj() {
      if (!this.alarmPlusId) return {}

      let status = {}
      status.title = this.alarmPlus.letterStatusIcon

      switch (this.alarmPlus.letterStatus) {
        case 'WAIT': {
          status.class = 'waiting'
          break
        }
        case 'END': {
          status.class = 'end'
          break
        }
        case 'APPROACH': {
          status.class = 'deadline'
          break
        }
        case 'ING': {
          status.class = 'ing'
          break
        }
        default: {
          status.class = ''
          status.title = ''
        }
      }
      return status
    },
    alarmPlusLabelTitles() {
      return this.alarmPlusTypeObj.title + ' ' + this.alarmPlusStatusObj.title
    },

    isShowHitalkShareBtn() {
      if (this.postType === 'ALARM_PLUS' || this.postType === 'HINOTICE' || this.postType === 'EVENT') {
        return false
      }

      if (this.postStatus !== 'COMPLETE') {
        return false
      }

      if (!this.isParentActivated) {
        return false
      }

      if (this.user.userType === 'STUDENT' || this.user.userType === 'PARENTS') {
        if(this.postType === 'CP_BOARD') return false

        return !(this.postType === 'NOTICE' || this.postType === 'ALARM' || this.postType === 'MEAL'  || this.postType === 'ALARM_EDU_OFFICE')
      } else {
        return true
      }
    },
    shareBtnType() {
      switch (this.postType) {
        case 'BOARD':
        case 'NOTE':
        case 'ALBUM':
        case 'HOMEWORK':
          return 'classPost'
        case 'NOTICE':
        case 'ALARM':
        case 'MEAL':
          return 'schoolPost'
        case 'CLASS_APPLY':
          return 'classApply'
        case 'CP_BOARD':
          return 'cpPost'
        default:
          return ''
      }
    },
    boardAndFolderName() {
      if (!this.isShowFolderName) {
        return this.board ? this.board.boardName : this.postTypeName
      }

      return this.board ?
        (this.board.isUsedFolder ? `${this.board.boardName}_${this.folder.folderName}` : this.board.boardName)
        : this.postTypeName
    },
    isSecretBoard() {
      return (this.board || {}).boardType === 'SECRET'
    }
  },
  mounted() {
    if (this.postId) {
      eventBus.$on(`update-post-pin-by-post-id|${this.postId}_${this.isDetail ? 'detail' : 'list'}`,postPin => {
        this.$emit('update:post-pin', postPin)
      })
    }
  },
  beforeDestroy() {
    if (this.postId) {
      eventBus.$off(`update-post-pin-by-post-id|${this.postId}_${this.isDetail ? 'detail' : 'list'}`)}
  },
  methods: {
    ...mapActions('storeHitalk', {
      connectStompClient:'connectStompClient',
      disconnectStompClient: 'disconnectStompClient',
      callChatUserList: 'callChatUserList',
      callChatRooms: 'callChatRooms'
    }),
    itemWriteUsed() {
      const postType = this.postType
      const board = this.board
      const isManager = this.isManager

      return this.$hiClass.itemWriteUsed(postType, board, isManager) || false
    },
    emitIsDelete(postId = false) {
      this.$emit('is-delete', postId)
    },
    emitIsPost(value) {
      this.$emit('is-post', value)
    },
    async controlHitalkShareModal(flag) {
      if (flag) {
        await this.connectStompClient()
        await this.callChatUserList()
        await this.callChatRooms({ force: true })

        this.hitalkShareIsOpen = flag

      } else {
        await this.disconnectStompClient()
        this.hitalkShareIsOpen = flag
      }
    },
    movePost(post) {
      this.$emit("movePost", post)
    },
    movePostClose() {
      this.$emit("movePostClose")
    },
    copyPost(post) {
      this.$emit('copyPost', post)
    }
  },
}
</script>

<style scoped>

</style>