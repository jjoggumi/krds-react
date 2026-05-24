<!--
@File(Method): TeacherAdd.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 선생님 > 선생님 추가 모달
@Modify: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <div class="modal normal-modal add-class-teacher-modal" :style="{ display: 'block' }">
    <div
        class="modal-cont-wrap"
        ref="modal"
        :style="modalStyleObj"
        v-click-outside="hidePopup"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">클래스 선생님 추가</div>
            <span class="info">
              다른 선생님을 추가하여 공동운영하거나 클래스를 위임할 수 있습니다.
              <br/>
              <span class="red">하이클래스에 가입된 선생님 회원만</span> 추가할 수 있습니다.
            </span>
            <p>휴대폰 번호 혹은 아이스크림 아이디로 검색해 보세요.</p>
          </div>
          <div
              class="input-box-wrap search-box-wrap"
              :class="{ focus: isFocusKeyword }"
          >
            <input
                type="text"
                placeholder="휴대폰 번호 또는 아이스크림 아이디를 입력해주세요."
                maxlength="50"
                ref="keyword"
                v-model="keyword"
                @keydown.enter.prevent.stop="getTeacherList"
                @focus="isFocusKeyword = true"
                @blur="isFocusKeyword = false"
            />
            <button type="button" class="search-icon-btn" @click="getTeacherList"></button>
            <button
                type="button"
                class="input-text-delete-btn"
                v-show="keyword"
                :style="{ display: 'inline-block' }"
                @click="init"
            ></button>
          </div>
          <div class="search-result-list-wrap" v-if="isSearchComplete">
            <MainLoadingScroll v-if="isShowLoading"/>
            <!-- 검색결과 있음 -->
            <template v-if="teacherList.length > 0">
              <ul>
                <teacher-add-item
                    v-for="(teacher, index) in teacherList"
                    :key="teacher.currentId"
                    :teacher="teacher"
                    :index="index"
                    :isSelected="selectedUser.userId === teacher.userId"
                />
              </ul>
            </template>

            <!-- 검색결과 없음 -->
            <template v-else>
              <div class="result-empty-wrap">
                <p>
                  <span>조회된 결과가 없습니다.</span><br />
                  하이클래스에 아직 가입 전이실 수 있습니다.<br />
                  하이클래스에 가입된 휴대폰 번호나 아이디가 맞는지 확인해보세요.
                </p>
              </div>
            </template>
          </div>
          <div
              :class="{ 'confirm-btn-wrap': isSearchComplete }"
              :style="isSearchComplete ? {} : {height: '50px'}"
          >
            <button
                v-if="isSearchComplete"
                class="btn-bg-c"
                @click="checkClassManager"
                :class="{ dis: Object.keys(selectedUser).length === 0 || teacherList.length === 0 }"
                :disabled="Object.keys(selectedUser).length === 0 || teacherList.length === 0"
            >
              추가
            </button>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="hidePopup"></div>
      </div>
    </div>
  </div>
</template>

<script>
import TeacherAddItem from "@/apps/main/clazzes/member/modal/TeacherAddItem";
import MainLoadingScroll from "@/apps/main/MainLoadingScroll";
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
const errorManager = useClassErrorManager();

export default {
  name: 'add-teacher-modal',
  props: {
    classId: {
      type: String
    }
  },
  data() {
    return {
      keyword: '',
      isFocusKeyword: false,
      isShowLoading: false,
      isSearchComplete: false,
      teacherList: [],
      selectedUser: {},
      m_height: 0,
      m_width: 0
    }
  },
  components: {
    TeacherAddItem,
    MainLoadingScroll
  },
  computed: {
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    }
  },
  methods: {
    init() {
      this.teacherList = []
      this.selectedUser = {}
      this.keyword = ''
      this.isSearchComplete = false
    },
    selectUser(idx) {
      if (this.teacherList.length > 0) {
        this.selectedUser = this.teacherList[idx]
      }
    },
    async getTeacherList() {
      const keyword = this.$stringUtil.replaceAll(this.keyword, '-', '')
      if (!keyword || keyword.trim() === '') return false

      this.isShowLoading = true

      // 키워드 타입에 따라 휴대폰번호, 아이스크림ID 파라미터로 분기
      let param = {
        _userType: 'TEACHER',
        _userStatus: 'ACTIVATE'
      }

      if (this.$validation.isRegMobilePhoneNumberWithoutHyphen(keyword)) {
        param._userMobile = keyword
      } else {
        param._loginId = keyword
        param._userSns = 'iScream'
      }

      try {
        const res = await this.$hiClass.users.search(param)
        this.teacherList = []
        if (res.data._embedded.users.length > 0) {
          this.teacherList.push(...res.data._embedded.users)
          this.selectedUser = this.teacherList[0]
        }
        this.isSearchComplete = true
      } finally {
        this.isShowLoading = false
      }
    },
    async addClassManager(clazzSubscribe) {
      const params = {
        memberStatus: 'ACCEPT',
        memberRole: 'MANAGER',
        specifiedTimestamp: this.$moment().valueOf()
      }

      try {
        if (clazzSubscribe) {
          const updateUrl = clazzSubscribe._links.self.href
          await this.$hiClass.clazzSubscribes.update(params, updateUrl)
        } else {
          params.user = this.selectedUser._links.self.href
          params.clazz = `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`
          await this.$hiClass.clazzSubscribes.create(params)
        }
        this.init()
        this.hidePopup(null)
        this.$emit('reloadMembers')
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },
    async checkClassManager() {
      const res = await this.$hiClass.clazzSubscribes.search({
        _user: this.selectedUser._links.self.href,
        _clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`
      })

      let clazzSubscribe = res.data._embedded.clazzSubscribes[0]

      if (clazzSubscribe) {
        if (clazzSubscribe.memberRole === 'OWNER') {
          this.$hiClass.alert('클래스의 개설자이므로 관리자로 추가할 수 없습니다.')
        } else if (clazzSubscribe.memberRole === 'MANAGER' && clazzSubscribe.memberStatus !== 'DENIAL') {
          this.$hiClass.alert('이미 추가된 클래스의 관리자입니다.')
        } else {
          // 거부 상태이면 신규 등록
          await this.addClassManager(
              clazzSubscribe.memberStatus === 'DENIAL' ? null : clazzSubscribe
          )
        }
      } else {
        await this.addClassManager()
      }
    },
    hidePopup(event) {
      if (event && event.target.className && event.target.className.includes('swal2')) return
      this.$emit('closeAddTeacherPopup')
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width

    this.$nextTick(() => {
      setTimeout(() => {
        this.$refs.keyword.focus()
      }, 100)
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style lang="scss" scoped>
.modal.normal-modal {
  .modal-title-wrap {
    padding-top: 40px;
    margin-bottom: 0;
    p {
      margin-bottom: 6px;
      font-size: 15px;
      font-weight: 500;
      color: #222;
    }    
    .title {
      margin-bottom: 0;
    }    
    span {
      line-height: 23px;
    }    
    span span.red {
      display: inline;
      color: #FF0000;
    }
  }  
}

.add-class-teacher-modal {  
  .input-box-wrap {
    width:468px;
    height:36px;
    line-height:34px;
    margin:0 auto 0;
  }

  .search-result-list-wrap {
    position:relative;
    width: 504px;
    height: 106px;
    max-height: 248px;
    overflow: hidden;
    margin: 24px auto 30px;
    background: #F6F6F6;
    border-radius: 8px;
    border: 0;
    color: #9E9E9E;
  } 

  .result-empty-wrap {
    position:absolute;
    top:50%;
    width:100%;
    transform:translateY(-50%);
    p {
      line-height:1.43;
      color:#666;
      span {
        color: #50555C;
        font-weight: 500;
      }
    }
  } 

  .confirm-btn-wrap { 
    padding: 0 0 30px;
    border: 0;
    button {
      width:280px;
      height:44px;
      border-radius:24px;
      color:#fff;
      font-weight: 700;
      font-size:15px;
    }
  }
}
</style>
