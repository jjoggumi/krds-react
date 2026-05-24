<template>
  <div></div>
</template>
<script>
import {mapGetters} from 'vuex'

export default {
  name: 'login-note',
  data() {
    return {
      routeQuery: {
        clientRegistrationId: null,
        principalName: null,
        userType: null,
        uuid: null,
        name: null,
        idToken: null,
        refreshToken: null
      },
      isNoteOpen: false,
      classId: null,
      userUri: null,
      userId: null,
      classItem: []
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    loginUrl() {
      const login = `${process.env.VUE_APP_BASE_LOGIN_URI}${process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH}`
      const callbackPrefix = process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX
      const callbackUrl = `${window.location.protocol}//${window.location.hostname}${this.$comn.getLocationPort()}/hiclassnote?userType=${this.CONSTANTS.USER_TYPE.TEACHER}&isNoteOpen=1`
      return `${login}${callbackPrefix}${callbackUrl}`
    }
  },
  created() {
    // 알림장 팝업 노출 여부 체크
    if (this.$route.query.isNoteOpen === '1') {
      this.$log.debug(this.$options.name, 'this.$route.query.isNoteOpen:', this.$route.query.isNoteOpen)
      this.isNoteOpen = true
    }

    // 2nd Step 데이터 저장
    this.setRouteQuery()
  },
  async mounted() {
    if (
        this.routeQuery.principalName && this.$authentication.load().principalName &&
        this.routeQuery.principalName !== this.$authentication.load().principalName
    ) {
      this.$hiClass.alert('로그인 된 계정이 다릅니다.<br>확인 버튼을 눌러 재시도해주세요.', 'warning')
          .then(() => {
            this.$authentication.clear()
            window.location.href = process.env.VUE_APP_BASE_ISCREAMMEDIA_OAUTH2_URI +
                process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_LOGOUT_PATH +
                process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
                encodeURIComponent(this.loginUrl)
          })
      return false
    }

    const existsRouteQuery = await this.loginCheck()

    // 2nd Step Process
    if (existsRouteQuery) {
      try {

        // 기존 userType 저장 오류 예외 처리
        const oldAccountQuery = this.$authentication.load()
        const isWrongUserType = ![
          this.CONSTANTS.USER_TYPE.TEACHER,
          this.CONSTANTS.USER_TYPE.PARENTS,
          this.CONSTANTS.USER_TYPE.STUDENT,
        ].includes(oldAccountQuery.userType)
        this.$log.debug(this.$options.name, 'isWrongUserType', isWrongUserType)
        if (isWrongUserType && oldAccountQuery.userType) {
          this.serviceRefresh(false)
          return false
        }

        // 하이클래스에 로그인된 계정이 있는 경우 새 로그인 계정과 같은지 비교함
        const isSameAccount = await this.checkSameAccount()
        isSameAccount ? this.loginProcess() : this.serviceRefresh(true)

      } catch (e) {
        this.$log.error(e)
        this.logout()
      }
    }
  },
  methods: {
    isClassManager(clazzSubscribeView) {
      return clazzSubscribeView
        && clazzSubscribeView.classStatus === 'ACTIVATE'
        && (clazzSubscribeView.memberRole === 'OWNER' || clazzSubscribeView.memberRole === 'MANAGER')
    },
    setStorage() {
      // 알림장 팝업 열기 예약
      sessionStorage.setItem('iscream-noteopen', '1')
    },
    removeStorage() {
      // 알림장 팝업 열기 예약 삭제
      sessionStorage.removeItem('iscream-noteopen')
    },
    setRouteQuery() {
      // 중복 쿼리가 있는 경우 첫번째만 저장
      for (const [key, value] of Object.entries(this.$route.query)) {
        this.routeQuery[key] = Array.isArray(value) ? value[0] : value
      }
    },
    setClassId(classId) {
      this.classId = classId
    },
    setUserUri(userUri) {
      this.userUri = userUri
    },
    setUserId(userId) {
      this.userId = userId
    },
    serviceRefresh(alertUsed) {
      const logoutAndRetry = () => {
        // 하이클래스 서비스만 로그아웃
        this.$authentication.clear()
        // 앱 재기동
        window.location.reload()
      }
      if (alertUsed) {
        this.$hiClass.alert('로그인 된 계정과 알림장을 작성하려는 계정이 다릅니다.<br>확인 버튼을 눌러 재시도해주세요.', 'warning')
          .then(() => logoutAndRetry())

      } else {
        logoutAndRetry()
      }
    },
    logout() {
      this.goRoute('logout')
    },
    async loginCheck() {
      if (
           this.routeQuery.idToken
        && this.routeQuery.clientRegistrationId
        && this.routeQuery.principalName
        && this.routeQuery.userType
        && this.routeQuery.uuid
      ) {
        // 2nd Step => idToken, uuid 인증 서버에서 가져오기 성공
        return true

      } else {
        // 1st Step => SSO 로그인된 계정의 idToken, uuid 인증 서버에서 가져오기 시도
        window.location.replace(this.loginUrl)
        return false
      }
    },
    checkSameAccount() {
      return new Promise((resolve, reject) => {
        let isSameAccount = true

        try {
          const oldAccountQuery = this.$authentication.load()
          this.$log.debug(this.$options.name, 'oldAccountQuery:', oldAccountQuery)
          this.$log.debug(this.$options.name, 'this.routeQuery:', this.routeQuery)

          if (
              (oldAccountQuery.clientRegistrationId && oldAccountQuery.clientRegistrationId !== this.routeQuery.clientRegistrationId)
            || (oldAccountQuery.principalName && oldAccountQuery.principalName !== this.routeQuery.principalName)
            || (oldAccountQuery.userType && oldAccountQuery.userType !== this.routeQuery.userType)
            || (oldAccountQuery.uuid && oldAccountQuery.uuid !== this.routeQuery.uuid)
          ) {
            isSameAccount = false
          }
          resolve(isSameAccount)

        } catch (e) {
          reject(e)
        }
      })
    },
    loginProcess() {
      this.$authentication.save(this.routeQuery)

      this.setUserUri(`${this.$apiUrl}/users/${this.routeQuery.uuid}`)
      this.setUserId(this.routeQuery.uuid)

      // 하이클래스 가입 여부 체크
      this.$hiClass.users
        .read(this.userUri)
        .then(() => {
          this.checkManagedClass()
        })
        .catch(() => {
          this.$log.debug(this.$options.name, '회원가입 필요 => 회원가입 이동')
          this.goRoute('signUp')
        })
    },

    // 관리 클래스 유무 체크
    checkManagedClass() {
      const requestParams = {
        userId: this.routeQuery.uuid,
        memberStatus: 'ACCEPT',
        sort: 'insertedTimestamp,desc',
        size: 200
      }
      this.$hiClass.clazzSubscribeViews.search(requestParams)
        .then(res => {
          // 관리자/매니저/활성화 체크
          res.data._embedded.clazzSubscribeViews.forEach(clazzSubscribeView => {
            if (this.isClassManager(clazzSubscribeView)) {
              const currentId = clazzSubscribeView.classId
              const classUri = `${this.$apiUrl}/clazzes/${currentId}`
              const item = {
                currentId,
                links: classUri
              }
              this.classItem.push(item)
            }
          })
          this.checkManagedClassNext()
        })
        .catch(() => {
          this.$log.debug(this.$options.name, '관리 클래스 검색 에러 => 메인으로 이동')
          this.goRoute('main')
        })
    },
    checkManagedClassNext() {
      // 관리 클래스 개수에 따른 분기
      switch (this.classItem.length) {
        case 0: {
          this.$log.debug(this.$options.name, '클래스 생성 필요 => 클래스 이동')
          this.goRoute('createClass')
          this.removeStorage()
          break
        }
        case 1: {
          this.setClassId(this.classItem[0].currentId)
          this.openNote()
          this.goRoute('class')
          break
        }
        // 관리 클래스 개수가 2개 이상
        default: {
          this.searchRecentlyUsedClass()
        }
      }
    },
    searchRecentlyUsedClass() {
      // 가장 최근 이력 조회
      const requestParams = {
        // _insertedUser: this.userUri,
        _insertedUser: this.userId,
        _parentUri: this.classItem.map(item => item.links),
        _postType: 'NOTE',
        _postStatus: 'COMPLETE',
        sort: 'insertedTimestamp,desc',
        size: 1
      }
      this.$hiClass.posts.search(requestParams)
        .then(res => {
          if (res.data._embedded.posts.length > 0) {
            const recentlyUsedClass = res.data._embedded.posts[0].parent
            const recentlyUsedClassId = recentlyUsedClass.currentId
            this.setClassId(recentlyUsedClassId)
          }

          this.$log.debug(this.$options.name, '복수 클래스')
          this.openNote()
          this.goRoute('class')
        })
        .catch(() => {
          // 에러 발생 시 클래스로 이동
          this.removeStorage()
          this.goRoute('class')
        })
    },
    openNote() {
      this.$log.debug(this.$options.name, '단일 클래스 => 알림장 이동')
      if (this.classId) {
        if (this.isNoteOpen)
          this.setStorage()

        const params = {
          userUUID: this.routeQuery.uuid,
          classUUID: this.classId,
          type: 'c',
          version: this.$store.state.postVersionDefault
        }
        const options = `height=${screen.availHeight - this.$store.state.TASKBAR_HEIGHT},`
          + `width=${screen.availWidth - this.$store.state.NOTEBOARD_MARGIN_WIDTH},`
          + `top=0,left=0,resizable,scrollbars=1`

        const popup = window.open(
          '/main/clazzes/note/newboard'.concat(this.$comn.jsonToQueryString(params)),
          'createNote',
          options
        )

        if (!popup) {
          this.$hiClass.alert('팝업 차단을 해제해 주세요.')
        }
      } else {
        this.removeStorage()
        this.goRoute('class')
      }
    },
    goRoute(command) {
      switch (command) {
        case 'class': {
          if (this.classId) {
            this.$router.push(`/main/clazzes/${this.classId}`, () => {})
          } else {
            this.$toasted.clear()
            // this.$toasted.show('최근 게시글을 작성한 클래스를 찾을 수 없습니다.')
            this.$router.push('/main', () => {})
          }
          break
        }
        case 'createClass':
          this.$router.push('/main/create', () => {})
          break
        case 'main':
          this.$router.push('/main', () => {})
          break
        case 'signUp':
          this.$router.push('/login/auth/phone', () => {})
          break
        case 'logout':
          this.$router.push('/logout', () => {})
          break
        default:
          this.$router.push('/logout', () => {})
      }
    },

  }
}
</script>
<style></style>
