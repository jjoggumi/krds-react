<template>
  <div>
    <!-- <div class="page-sub-heading">
      <h3 class="heading">클래스 정보</h3>
    </div> -->
    <div v-if="myClazzSubscribe.currentId" class="class-setting-wrap">
      <!-- <div class="setting-category-wrap category-class-secession">
        <div class="category-title">클래스 가입일</div>
        <div class="category-cont-wrap boundary-box clfix">
          <div class="text-wrap">
            <p>{{ joinClassDate }}</p>
          </div>
        </div>
      </div> -->

      <div class="setting-category-wrap profile">
        <div class="category-title">클래스 가입일</div>
        <div class="join-date">{{ joinClassDate }}</div>
      </div>

      <!-- <div
        v-if="!isTempStudent"
        class="setting-category-wrap category-class-secession"
      >
        <div class="category-title">클래스 탈퇴</div>
        <div class="category-cont-wrap boundary-box clfix">
          <div class="text-wrap">
            <p>
              * 나의 클래스 목록에서 삭제되며 해당 클래스의 게시글을 확인할 수 없습니다.
            </p>
          </div>
          <div class="btn-wrap">
            <div class="btn-group">
              <button class="btn-bg-c" @click="unsubscribe()">
                클래스 탈퇴하기
              </button>
            </div>
          </div>
        </div>
      </div> -->

      <div class="setting-category-wrap profile" v-if="!isTempStudent">
        <div class="category-title">클래스 탈퇴</div>
        <div class="out-msg">
          * 나의 클래스 목록에서 삭제되며 해당 클래스의 게시글을 확인할 수 없습니다.
        </div>
        <div class="btn-wrap">
          <template v-if="isManager">
            <button v-if="isManagerKind === 'owner'" @click="unsubscribeOwner()">클래스 탈퇴·위임하기</button>
            <button v-else @click="unsubscribe()">클래스 탈퇴하기</button>
          </template>

          <template v-else>
            <button @click="unsubscribe()">클래스 탈퇴하기</button>
          </template>
        </div>
      </div>

      <!-- <div class="setting-category-wrap category-class-info">
        <div class="category-title">클래스 가입정보</div>
        <div class="category-cont-wrap boundary-box clfix">
          <div class="cont-item item-half">
            <div class="cont-title">본인이름</div>
            <div class="input-box-wrap">
              <input type="text" :value="userNameOrMemberChildName" disabled />
            </div>
          </div>

          <div v-if="isStudent" class="cont-item item-half mr-00">
            <div class="cont-title">반 번호</div>
            <div class="input-box-wrap">
              <input
                type="text"
                :value="myClazzSubscribe.memberClassNumber || ''"
                disabled
              />
            </div>
          </div>

          <div v-else class="cont-item item-half mr-00">
            <div class="cont-title">자녀이름</div>
            <div class="input-box-wrap">
              <input
                type="text"
                :value="myClazzSubscribe.memberChildName || ''"
                disabled
              />
            </div>
          </div>
        </div>
      </div> -->

    </div>

    <MainBodyClazzesBodySettingChangeMemberRole
      v-if="option.isShowChangeMemberRole && managerList.length > 0"
      :clazzes="clazzes"
      :manager-list="managerList"
      @closeChangeMemberRole="option.isShowChangeMemberRole = false"
    />
  </div>
</template>

<script>
import {mapActions} from "vuex";
import MainBodyClazzesBodySettingChangeMemberRole from './MainBodyClazzesBodySettingChangeMemberRole.vue'

export default {
  name: 'MainBodyClazzesBodySettingClassUnsubscribe',
  components: {
    MainBodyClazzesBodySettingChangeMemberRole,
  },
  props: {
    clazzMemberRole: String,
    clazzSubscribesUri: String,
    clazzes: Object,
    user: Object,
    isManager: Boolean
  },
  data() {
    return {
      option: {
        isShowChangeMemberRole: false,
        isLoading: false
      },
      managerList: [],
      myClazzSubscribe: {
        insertedTimestamp: 0,
        memberChildName: '',
        memberClassNumber: ''
      }
    }
  },
  computed: {
    joinClassDate() {
      if (
        this.myClazzSubscribe.insertedTimestamp !== undefined &&
        this.myClazzSubscribe.insertedTimestamp !== null
      )
        return this.$comn.convertTimestamp2DateByFormat(
          this.myClazzSubscribe.insertedTimestamp,
          null,
          'ko2'
        )
      else return ''
    },
    isTempStudent() {
      const userSns = this.user.userSns
      if (
        userSns !== undefined &&
        userSns !== null &&
        userSns.toUpperCase() === 'HICLASS' &&
        this.user.userType === 'STUDENT'
      ) {
        return true
      } else {
        return false
      }
    },
    isStudent() {
      return this.user.userType === 'STUDENT' ? true : false
    },
    isManagerKind() {
      return this.clazzes.classOwner.currentId === this.user.currentId ? 'owner' : 'no-owner'
    },
    userNameOrMemberChildName() {
      return this.isStudent
        ? this.myClazzSubscribe.memberChildName
        : this.user.userName
    }
  },
  methods: {
    ...mapActions('storeHome', {
      spliceJoinWithInviteCodeSubscribe: 'spliceJoinWithInviteCodeSubscribe'
    }),
    setMyClazzSubscribeByClassId(clazzSubscribeViews) {
      const curClassId = this.clazzes.currentId
      clazzSubscribeViews = clazzSubscribeViews.filter(d => {
        return d.memberStatus === 'ACCEPT' && d.classId === curClassId
      })
      if (clazzSubscribeViews.length > 0) {
        this.myClazzSubscribe = clazzSubscribeViews[0]
      }
    },
    unsubscribe() {
      if (this.isManager && this.isManagerKind === 'owner') return false
      if (
        this.clazzSubscribesUri === undefined ||
        this.clazzSubscribesUri === ''
      )
        return false
      const msg = `해당 클래스가 나의 클래스 목록에서 삭제되며 클래스를 탈퇴하더라도 작성했던 글들은 삭제되지 않습니다.\n클래스를 탈퇴하시겠습니까?`
      if (!confirm(msg)) return false

      const clazzSubscribesId = this.$comn.split(this.clazzSubscribesUri, '/')

      this.$hiClass.clazzSubscribes
        .delete(`/clazzSubscribes/${clazzSubscribesId}`)
        .then(() => {
          this.spliceJoinWithInviteCodeSubscribe({clazzSubscribesId: clazzSubscribesId})
          this.$router.push('/main', () => {})
        })
        .catch(error => {
          this.$log.debug(error)
        })
    },
    unsubscribeOwner() {
      if(this.$parent.classManager.length > 0) {
        this.doUnsubscribe()
      } else {
        let msg = '클래스 탈퇴∙위임은<br>클래스 설정 > 구성원 관리에서 가능합니다.<br>해당 화면으로 이동합니다.'
        const opts = {
          confirmButtonText: '확인',
          reverseButtons: false
        }
        this.$hiClass.alert(msg, 'warning', false).then(() => {
          this.$router.push(`/main/clazzes/${this.clazzes.currentId}/member`)
        })
      }
    },
    doUnsubscribe() {
      const curClassOwnerUserId = this.clazzes.classOwner.currentId
      const curLoginUserId = this.$store.state.user.currentId
      const isClassManager = curClassOwnerUserId !== curLoginUserId

      let unsubscribeType = 'owner'
      let msg = '<strong>[위임 후 탈퇴 안내]</strong><br>'
          + '[탈퇴] 버튼을 누른 뒤,<br>위임 받을 관리자를 선택해야 탈퇴가 진행됩니다.'
          + '<br>탈퇴 후에는 내 클래스 목록에서 삭제되며, <br><strong>탈퇴한 클래스의 게시글과 하이톡 내역은 확인할 수 없습니다.</strong>'
          + '<br>위임 후에 탈퇴하시겠습니까?'

      if (isClassManager) {
        unsubscribeType = 'manager'
        msg = '관리자가 클래스를 탈퇴하는 경우 나의 클래스 목록에서 삭제되며 해당 클래스의 게시글을 확인할 수 없습니다.'
          + '<br><br>탈퇴하시겠습니까? '
      }

      const opts = {
        confirmButtonText: '탈퇴',
        reverseButtons: false
      }
      this.$hiClass.confirm(msg, 'warning', opts)
        .then(async () => {
          if (unsubscribeType === 'owner') {
            try {
              // 오너 위임
              this.managerList = await this.getClassManagerList()

              if (this.managerList.length > 0) {
                this.option.isShowChangeMemberRole = true
              } else {
                this.callErrorMessage('위임 가능한 클래스 관리자가 없습니다.<br>다시 확인해주세요.', true)
              }

            } catch (e) {
              this.callErrorMessage('위임 가능한 클래스 관리자가 없습니다.<br>다시 확인해주세요.', true)
            }

          } else {
            // 매니저 탈퇴
            const managerInfo = this.$parent.classManager.find(item => {
              return item.userId === curLoginUserId
            })
            if (managerInfo) {
              const managerUri = `${this.$apiUrl}/clazzSubscribes/${managerInfo.currentId}`

              this.$hiClass.clazzSubscribeViews
                .delete(managerUri)
                .then(() => this.$router.push('/main', () => {}))
                .catch(err => {
                  this.$log.debug(this.$options.name,' doUnsubscribe() error => ',err)
                  this.callErrorMessage('위임 가능한 클래스 관리자가 없습니다.<br>다시 확인해주세요.', true)
                })
            } else {
              this.callErrorMessage('탈퇴 가능한 관리자가 없습니다.<br>다시 확인해주세요.', true)
            }
          }
        })
    },
    getClassManagerList() {
      const requestParams = {
        classId: this.clazzes.currentId,
        memberRole: 'MANAGER',
        memberStatus: 'ACCEPT'
      }
      return new Promise((resolve, reject) => {
        this.$hiClass.clazzSubscribeViews
          .search(requestParams)
          .then(res => {
            const resources = res.data._embedded.clazzSubscribeViews
            resources.length > 0
              ? resolve(resources)
              : reject()
          })
          .catch(err => {
            this.$log.debug(this.$options.name,' existsClassManager() error => ',err)
            reject()
          })
      })
    },
    callErrorMessage(message, pageRefresh) {
      this.$hiClass.alert(message, 'warning')
        .then(() => {
          if (pageRefresh) this.$router.go(0)
        })
    },
  },
  created() {
    this.$hiClass.getClazzSubscribeViews(this).then(clazzSubscribeViews => {
      this.setMyClazzSubscribeByClassId(clazzSubscribeViews)
    })
  },
}
</script>

<style scoped>
/* .l-page-sub .page-sub-heading {
  min-height: auto;
}
.class-setting-wrap .setting-category-wrap {
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  margin-top: 28px;
  padding: 28px 26px 32px 26px;
}
.class-setting-wrap .boundary-box {
  border: 0;
}
.boundary-box {
  -webkit-box-shadow: none;
  box-shadow: none;
}
.class-setting-wrap .category-class-secession .text-wrap, .class-setting-wrap .category-class-info .category-cont-wrap { padding: 0; }
.class-setting-wrap .setting-category-wrap .category-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 700;
  color: #000;
}
.class-setting-wrap .category-class-info .cont-item { margin-top: 16px; margin-bottom: 0; }
.class-setting-wrap .category-class-info .cont-item .cont-title {
  font-family: var(--font-body);
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 16px;
  color: #222222;
}
.class-setting-wrap .category-class-secession .btn-wrap {
  border-bottom: 0;
  padding: 28px 0 0 0;
}
.class-setting-wrap .category-class-secession .text-wrap p {
  color: #9E9E9E;
  font-size: 14px;
  font-weight: 400;
} */
</style>
