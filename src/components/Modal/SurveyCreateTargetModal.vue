<!--
@File(Method): SurveyCreateTargetModal.vue
@Author: -
@Date Created: -
@Description: 설문 투표 > 설문 작성 모달 > 구성원 선택 클릭 > 설문 대상 선택 모달
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 
-->
<template>
  <div class="hi-modal-common modal-select-target modal-add-guide">
    <div
      class="modal__dim"
      @click="closeModal"
    ></div>

    <div class="modal__layer">
      <div class="modal__col">
        <div class="modal__header">
          <h2 class="heading">설문 대상 선택</h2>
          <button
              class="btn-close"
              @click="closeModal"
          ></button>

        </div>
        <div class="modal__content ">
          <div class="select-target-wrap box-border">
            <MemberSearch :clazzTags="clazzTags" @search="search"/>
            <div v-show="memberSearchItem.searchType === 'NONE'" class="group-checkbox n">
              <input
                  type="checkbox"
                  id="cc1"
                  :checked="isCheckedAllUserIds"
                  @change="onChangeCheckbox"
              >
              <label for="cc1"><span>전체</span></label>
              <input
                  type="checkbox"
                  id="cc2"
                  :checked="isCheckedTeacherUserIds"
                  @change="onChangeCheckbox"
                  :disabled="!computedTeacherUserIds.length > 0"
              >
              <label for="cc2"><span>선생님</span></label>
              <input
                  type="checkbox"
                  id="cc3"
                  :checked="isCheckedParentsUserIds"
                  @change="onChangeCheckbox"
                  :disabled="!computedParentsUserIds.length > 0"
              >
              <label for="cc3"><span>학부모</span></label>
              <input
                  type="checkbox"
                  id="cc4"
                  :checked="isCheckedStudentUserIds"
                  @change="onChangeCheckbox"
                  :disabled="!computedStudentUserIds.length > 0"
              >
              <label for="cc4"><span>학생</span></label>
            </div>
            <div class="select-target__list">
              <div
                  v-for="(surveyEditTarget, index) of surveyList"
                  :key="surveyEditTarget.userId"
                  class="select-target__item n"
              >
                <input
                    type="checkbox"
                    :id="`nn${index}`"
                    :value="surveyEditTarget.userId"
                    :disabled="isDisabledCheckBox(surveyEditTarget)"
                    v-model="selectedTargetUserIds"
                >
                <label :for="`nn${index}`">
                  <span class="image">
                    <img :src="chatUserPhoto(surveyEditTarget.userPhoto)" @error="chatUserPhotoReplace" alt="">
                  </span>
                  <span 
                    v-if="surveyEditTarget.userType !== 'TEACHER' && sortedKind(surveyEditTarget.memberClassNumber, surveyEditTarget.userType) !== 'num-no'"
                    :class="sortedKind(surveyEditTarget.memberClassNumber, surveyEditTarget.userType)"
                  >
                    <template v-if="surveyEditTarget.memberClassNumber !== 999">
                      {{ surveyEditTarget.memberClassNumber }}
                    </template>
                  </span>
                  <span 
                    class="name"
                    :class="surveyEditTarget.userType !== 'TEACHER' && sortedKind(surveyEditTarget.memberClassNumber, surveyEditTarget.userType) !== 'num-no' ? 'n' : 't'"
                  >{{ getTargetName(surveyEditTarget) }}</span>
                </label>
              </div>              
              <div class="hi-nodata" v-if="surveyList.length === 0">
                <p>
                검색결과가 없습니다.
                </p>
              </div>
            </div>
          </div>
          <button
              class="hi-btn btn-lg"
              @click="selectComplete"
          >
            <strong>{{ targetCount }}명 </strong>선택완료
          </button>
        </div>
      </div>

      <div class="modal__col modal__guide">
        <div class="modal__content">
          <strong class="heading-guide"><span>구성원은 설문 응답을 여기서 할 수 있어요!</span></strong>
          <div class="box__guide">
            <strong class="type">APP</strong>
            <p class="text"><span>위치</span>클래스탭 > 편리한 서비스 > 설문/투표</p>
            <img class="guide-img" src="@/assets/img/guide/survey-reply-guide-app.png" alt="">
          </div>
          <div class="box__guide">
            <strong class="type">WEB</strong>
            <p class="text"><span>위치</span>내클래스 > 수업관리 > 설문/투표</p>
            <img class="guide-img" src="@/assets/img/guide/survey-reply-guide-pc.png" alt="" style="margin-top: 33px;">
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {isEmpty, xor} from "lodash";
import {URLProps} from "@/enums";
import MemberSearch from "@/components/Search/MemberSearch";

export default {
  name: "survey-create-target-modal",
  data() {
    return {
      selectedTargetUserIds: [],
      checkboxes: {
        ALL: false,
        TEACHER: false,
        PARENTS: false,
        STUDENT: false,
      },
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      }
    }
  },
  components: {
    MemberSearch
  },
  computed: {
    ...mapState('storeClazzTag', [
      'clazzTags'
    ]),
    ...mapState('storeSurvey', {
      curSurveyEdit: 'curSurveyEdit',
      surveyCreateTargetModal: 'surveyCreateTargetModal',
      surveyEditTargetList: 'surveyEditTargetList',
    }),
    ...mapGetters('storeSurvey', {
      surveyEditTargetReadQuery: 'surveyEditTargetReadQuery'
    }),
    targetCount() {
      return this.selectedTargetUserIds
        ? this.selectedTargetUserIds.length
        : 0
    },
    computedAllUserIds() {
      return this.surveyEditTargetList
        .filter(d => d.isEditable)
        .filter(d => d.memberRole)
        .map(d => d.userId)
    },
    computedTeacherUserIds() {
      return this.surveyEditTargetList
        .filter(d => d.isEditable)
        .filter(d => d.memberRole && (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER'))
        .map(d => d.userId)
    },
    computedParentsUserIds() {
      return this.surveyEditTargetList
        .filter(d => d.isEditable)
        .filter(d => d.memberRole && d.memberRole === 'MEMBER' && d.userType !== 'STUDENT')
        .map(d => d.userId)
    },
    computedStudentUserIds() {
      return this.surveyEditTargetList
        .filter(d => d.isEditable)
        .filter(d => d.memberRole && d.memberRole === 'MEMBER' && d.userType === 'STUDENT')
        .map(d => d.userId)
    },
    isCheckedAllUserIds() {
      const filteredArr = this.selectedTargetUserIds.filter(userId => this.computedAllUserIds.includes(userId))
      return filteredArr.length > 0
        ? isEmpty(xor(filteredArr, this.computedAllUserIds))
        : false
    },
    isCheckedTeacherUserIds() {
      const filteredArr = this.selectedTargetUserIds.filter(userId => this.computedTeacherUserIds.includes(userId))
      return filteredArr.length > 0
        ? isEmpty(xor(filteredArr, this.computedTeacherUserIds))
        : false
    },
    isCheckedParentsUserIds() {
      const filteredArr = this.selectedTargetUserIds.filter(userId => this.computedParentsUserIds.includes(userId))
      return filteredArr.length > 0
        ? isEmpty(xor(filteredArr, this.computedParentsUserIds))
        : false
    },
    isCheckedStudentUserIds() {
      const filteredArr = this.selectedTargetUserIds.filter(userId => this.computedStudentUserIds.includes(userId))
      return filteredArr.length > 0
        ? isEmpty(xor(filteredArr, this.computedStudentUserIds))
        : false
    },
    chatUserPhoto() {
      return (userPhoto) => {
        return userPhoto ? userPhoto : URLProps.DEFAULT_PROFILE_IMAGE_URL
      }
    },
    surveyList() {
      const list = [
        ...[...this.surveyEditTargetList].filter(v => v.userType === "TEACHER"),
        ...[...this.surveyEditTargetList].filter(v => v.userType === "STUDENT"),
        ...[...this.surveyEditTargetList].filter(v => v.userType === "PARENTS")
          .map(userItem => {
            if(!userItem.memberClassNumber === true) userItem.memberClassNumber = 999
            return userItem
          })
          .sort((a, b) => a.memberClassNumber - b.memberClassNumber),
        ...[...this.surveyEditTargetList].filter(v => v.userType === null)
          .map(userItem => {
            if(!userItem.memberClassNumber === true) userItem.memberClassNumber = 999
            return userItem
          })
          .sort((a, b) => a.memberClassNumber - b.memberClassNumber)
      ]

      if (this.memberSearchItem.searchType === 'KEYWORD') {
        return list.filter(u =>
            u.userName.includes(this.memberSearchItem.searchValue) || (u.memberChildName || '').includes(this.memberSearchItem.searchValue)
        )

      } else if (this.memberSearchItem.searchType === 'TAG') {
        return list.filter(u => (u.tags || []).map(t => t.tagId).includes(this.memberSearchItem.searchValue))

      } else if (this.memberSearchItem.searchType === 'TAG_MULTI') {
        return this.memberSearchItem.searchValue.length > 0 ?
            list.filter(u => this.memberSearchItem.searchValue
                .some(tagId => (u.tags || []).map(t => t.tagId).includes(tagId))
            ) :
            list

      } else {
        return list
      }
    }
  },
  watch: {
    'surveyEditTargetList.length'() {
      if (this.curSurveyEdit.targetUserIds.length !== this.curSurveyEdit.targetCount) {
        this.loadSelectedTargetUserIds()
      }
    }
  },
  created() {
    this.selectedTargetUserIds = [...this.curSurveyEdit.targetUserIds] || []
    this.getSurveyEditTargetList()
    this.fetchTags(this.surveyCreateTargetModal.classId)
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading'
    }),
    ...mapMutations('storeSurvey', {
      setCurSurveyEditAttr: 'setCurSurveyEditAttr',
      setSurveyCreateTargetModalAttr: 'setSurveyCreateTargetModalAttr',
    }),
    ...mapActions('storeSurvey', {
      closeSurveyCreateTargetModal: 'closeSurveyCreateTargetModal',
      getSurveyEditTargetList: 'getSurveyEditTargetList',
      updateSurveyEditTarget: 'updateSurveyEditTarget',
    }),
    ...mapActions('storeClazzTag', [
      'fetchTags'
    ]),
    closeModal() {
      this.closeSurveyCreateTargetModal()
    },
    getTargetName(surveyEditTarget) {
      if (surveyEditTarget.isSecession) return '탈퇴회원'

      let targetName = ''
      const userType = surveyEditTarget.userType
      const userName = surveyEditTarget.userName
      const memberChildName = surveyEditTarget.memberChildName

      switch (userType) {
        case 'TEACHER': {
          targetName = `${userName} 선생님`
          break
        }
        case 'PARENTS': {
          targetName = `${memberChildName} 학부모 (${userName})`
          break
        }
        case 'STUDENT': {
          targetName = `${memberChildName} 학생 (${userName})`
          break
        }
      }
      return targetName
    },
    async selectComplete() {
      //this.setIsLoading(true) 박종철 삭제 저장 은 해더의 저장 버튼 누를때 타도록
      this.setCurSurveyEditAttr({
        targetUserIds: this.selectedTargetUserIds || [],
        targetCount: this.selectedTargetUserIds.length
      })
      //await this.updateSurveyEditTarget() 박종철 삭제 저장 은 해더의 저장 버튼 누를때 타도록

      //this.setIsLoading(false) 박종철 삭제 저장 은 해더의 저장 버튼 누를때 타도록
      this.closeModal()
    },
    loadSelectedTargetUserIds() {
      this.selectedTargetUserIds.splice(0)
      // 응답 대상자이며 탈퇴하지 않은 사용자의 userId
      const savedTargetUserIds = this.surveyEditTargetList
        .filter(t => t.isTarget && !t.isSecession)
        .map(t => t.userId)

      this.selectedTargetUserIds.push(...savedTargetUserIds)
    },
    onChangeCheckbox(event) {
      this.$log.debug(this.$options.name, 'onChangeCheckbox event.target', event.target)
      const id = event.target.id
      const checked = event.target.checked
      let computedKey = ''

      switch (id) {
        case 'cc1':
          computedKey = 'computedAllUserIds'
          break
        case 'cc2':
          computedKey = 'computedTeacherUserIds'
          break
        case 'cc3':
          computedKey = 'computedParentsUserIds'
          break
        case 'cc4':
          computedKey = 'computedStudentUserIds'
          break
      }

      if (checked) {
        const addArr = this[computedKey].filter(userId => !this.selectedTargetUserIds.includes(userId))
        this.$log.debug(this.$options.name, 'onChangeCheckbox addArr', addArr)
        this.selectedTargetUserIds.push(...addArr)

      } else {
        const removeArr = this[computedKey].filter(userId => this.selectedTargetUserIds.includes(userId))
        this.$log.debug(this.$options.name, 'onChangeCheckbox removeArr', removeArr)
        this.selectedTargetUserIds = this.selectedTargetUserIds.filter(userId => !removeArr.includes(userId))

      }
    },
    isDisabledCheckBox(surveyEditTarget) {
      return surveyEditTarget.isSecession || !surveyEditTarget.isEditable
    },
    sortedKind(number, type) {
      if(number === 999) {
        return "num-no"
      }

      if(type === "PARENTS") {
        return "num"
      }
      
      return "num-std"
    },
    chatUserPhotoReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
    }
  }
}
</script>

<style scoped>
.modal-select-target {
  display: block;
}
.hi-nodata{padding:152px 0;}
.guide-img {
  margin: 0 auto;
  height: 297px;
  display: flex;
}
</style>