<!--
@File(Method): MainBodyClazzesBodyPermissionBoardSettingItem.vue
@Author: -
@Date Created: -
@Description: 게시판 설정
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 2년전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->
<template>
  <!-- 게시판 기능 설정 -->
  <div class="category-cont-wrap boundary-box clfix">
    <ul>
      <!-- 게시판 기능 사용 -->
      <li
        class="title-wrap"
        :class="{
          on: clazzes[`${type.code}Used`]
        }"
      >
        <div class="inner">
          <div class="text">
            {{ itemUsedTitle }} 사용
            <span
              v-if="isNote || isHomework"
              class="text-refer"
            >
              {{ itemUsedTitleDescription }}
            </span>
          </div>
          <button
            class="switching-btn"
            :class="{
              on: clazzes[`${type.code}Used`],
              dis: isDisabledUsed
            }"
            :disabled="isDisabledUsed"
            @click="clazzes[`${type.code}Used`] = !clazzes[`${type.code}Used`]"
          ></button>
        </div>
      </li>
      <!-- // 게시판 기능 사용 -->

      <template
        v-if="postTypeArr.includes(type.code)"
      >
        <!-- 읽기 권한 -->
        <li v-if="clazzes[`${type.code}Used`] && isClassActivated">
          <div class="inner">
            <div class="text">읽기 권한</div>
            <div class="free-check-box">
              <div
                v-for="(userType, i) of userTypes"
                :key="userType.code"
                class="free-check"
              >
                <div class="check-wrap">
                  <input
                    type="checkbox"
                    :id="`auth-check-${i}-${type.code}`"
                    :class="{ dis: isDisabledUsed }"
                    v-model="clazzes[`${type.code}${userType.code}Used`]"
                    :disabled="isDisabledUsed"
                  />
                  <label :for="`auth-check-${i}-${type.code}`"
                  ><span>{{ userType.name }}</span></label
                  >
                </div>
              </div>
            </div>
          </div>
        </li>
        <!-- // 읽기 권한 -->

        <!-- 글쓰기 권한 -->
        <li v-if="clazzes[`${type.code}Used`] && isClassActivated && !isDisabledWriteUsed">
          <div class="inner">
            <div class="text">글쓰기 권한</div>
            <div class="free-check-box">
              <div
                v-for="(userType, i) of userTypes"
                :key="userType.code"
                class="free-check"
              >
                <div class="check-wrap">
                  <input
                    type="checkbox"
                    :id="`write-auth-check-${i}-${type.code}`"
                    :class="{ dis: isDisabledWriteUsed }"
                    v-model="clazzes[`${type.code}${userType.code}WriteUsed`]"
                    :disabled="isDisabledWriteUsed"
                  />
                  <label :for="`write-auth-check-${i}-${type.code}`">
                    <span>{{ userType.name }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </li>
        <!-- // 글쓰기 권한 -->

        <!-- 과제 제출 권한 -->
        <li v-if="clazzes[`${type.code}Used`] && isClassActivated && isHomework">
          <div class="inner">
            <div class="text">
              과제 제출 권한
              <span class="text-refer">* 권한을 부여받은 구성원만 과제 제출이 가능합니다.</span>
            </div>
            <div class="free-check-box">
              <div
                v-for="(userType, i) of userTypes"
                :key="userType.code"
                class="free-check"
              >
                <div class="check-wrap">
                  <input
                    type="checkbox"
                    :id="`submit-auth-check-${i}-${type.code}`"
                    :class="{ dis: isDisabledUsed || !clazzes[`${type.code}${userType.code}Used`] }"
                    v-model="clazzes[`${type.code}${userType.code}SubmitUsed`]"
                    :disabled="isDisabledUsed || !clazzes[`${type.code}${userType.code}Used`]"
                  />
                  <label :for="`submit-auth-check-${i}-${type.code}`"
                  ><span>{{ userType.name }}</span></label
                  >
                </div>
              </div>
            </div>
          </div>
        </li>
        <!-- // 과제 제출 권한 -->

        <!-- 댓글 사용 -->
        <li v-if="clazzes[`${type.code}Used`] && isClassActivated">
          <div class="inner">
            <div class="text">댓글 사용</div>
            <button
              class="switching-btn"
              :class="{
                on: clazzes[`${type.code}CommentUsed`],
                dis: !isClassActivated
              }"
              :disabled="!isClassActivated"
              @click="clazzes[`${type.code}CommentUsed`] = !clazzes[`${type.code}CommentUsed`]"
            ></button>
          </div>
        </li>
        <!-- // 댓글 사용 -->

        <!-- 댓글 쓰기 권한 -->
        <li v-if="clazzes[`${type.code}Used`] && isClassActivated">
          <div class="inner">
            <div class="text">댓글 쓰기 권한</div>
            <div class="free-check-box">
              <div
                v-for="(userType, i) of userTypes"
                :key="userType.code"
                class="free-check"
              >
                <div class="check-wrap">
                  <input
                    type="checkbox"
                    :id="`comment-auth-check${i}-${type.code}`"
                    :class="{
                      dis: !isClassActivated
                    }"
                    v-model="clazzes[`${type.code}Comment${userType.code}Used`]"
                    :disabled="!isClassActivated"
                  />
                  <label :for="`comment-auth-check${i}-${type.code}`"
                  ><span>{{ userType.name }}</span></label
                  >
                </div>
              </div>
            </div>
          </div>
        </li>
        <!-- // 댓글 쓰기 권한 -->

        <!-- 좋아요 사용 -->
        <li v-if="clazzes[`${type.code}Used`] && isClassActivated">
          <div class="inner">
            <div class="text">좋아요 사용</div>
            <button
              class="switching-btn"
              :class="{
                on: clazzes[`${type.code}LikeUsed`],
                dis: !isClassActivated
              }"
              :disabled="!isClassActivated"
              @click="clazzes[`${type.code}LikeUsed`] = !clazzes[`${type.code}LikeUsed`]"
            ></button>
          </div>
        </li>
        <!-- // 좋아요 사용 -->

      </template>

    </ul>

    <!-- 로딩 백그라운드 투명 처리 -->
    <loading-overlay
      :active.sync="option.isLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
    ></loading-overlay>
  </div>
</template>

<script>
export default {
  name: 'main-body-clazzes-body-permission-board-setting-item',
  components: {
    LoadingOverlay: () => import('vue-loading-overlay')
  },
  props: {
    clazzes: Object,
    isManager: Boolean,
    isClassActivated: Boolean,
    type: Object
  },
  data() {
    return {
      option: {
        isLoading: false
      },
      userTypes: [
        {
          code: 'Student',
          name: '학생'
        },
        {
          code: 'Parents',
          name: '학부모'
        }
      ]
    }
  },
  computed: {
    isNote() {
      return this.type.code === 'note'
    },
    isAlbum() {
      return this.type.code === 'album'
    },
    isBoard() {
      return this.type.code === 'board'
    },
    isHomework() {
      return this.type.code === 'homework'
    },
    isApply() {
      return this.type.code === 'apply'
    },
    isAttendance() {
      return this.type.code === 'attendance'
    },
    isDisabledUsed() {
      return !this.isClassActivated
    },
    isDisabledWriteUsed() {
      return !this.isClassActivated || this.isNote || this.isHomework
    },
    classSetting() {
      const postType = this.type.code
      const classSetting = {}

      classSetting[`${postType}Used`] = this.clazzes[`${postType}Used`]

      if (this.postTypeArr.includes(postType)) {
        classSetting[`${postType}${this.userTypes[0].code}Used`] = this.clazzes[`${postType}${this.userTypes[0].code}Used`]
        classSetting[`${postType}${this.userTypes[1].code}Used`] = this.clazzes[`${postType}${this.userTypes[1].code}Used`]

        classSetting[`${postType}${this.userTypes[0].code}WriteUsed`] = this.clazzes[`${postType}${this.userTypes[0].code}WriteUsed`]
        classSetting[`${postType}${this.userTypes[1].code}WriteUsed`] = this.clazzes[`${postType}${this.userTypes[1].code}WriteUsed`]

        if (this.isHomework) {
          classSetting[`${postType}${this.userTypes[0].code}SubmitUsed`] = this.clazzes[`${postType}${this.userTypes[0].code}SubmitUsed`]
          classSetting[`${postType}${this.userTypes[1].code}SubmitUsed`] = this.clazzes[`${postType}${this.userTypes[1].code}SubmitUsed`]
        }

        classSetting[`${postType}CommentUsed`] = this.clazzes[`${postType}CommentUsed`]
        classSetting[`${postType}LikeUsed`] = this.clazzes[`${postType}LikeUsed`]

        classSetting[`${postType}Comment${this.userTypes[0].code}Used`] = this.clazzes[`${postType}Comment${this.userTypes[0].code}Used`]
        classSetting[`${postType}Comment${this.userTypes[1].code}Used`] = this.clazzes[`${postType}Comment${this.userTypes[1].code}Used`]
      }

      return classSetting
    },
    postTypeArr() {
      return ['note', 'album', 'board', 'homework']
    },
    itemUsedTitle() {
      let itemUsedTitle = `${this.type.name} 게시판`

      if (this.isApply)
        itemUsedTitle = `${this.type.name} 신청서 관리`

      if (this.isAttendance)
        itemUsedTitle = `${this.type.name}`

      return itemUsedTitle
    },
    itemUsedTitleDescription() {
      let itemUsedTitleDescription = null

      if (this.isNote)
        itemUsedTitleDescription = '* 알림장 작성은 선생님만 가능합니다.'
      else if (this.isHomework)
        itemUsedTitleDescription = '* 과제작성(출제)은 선생님만 가능합니다.'

      return itemUsedTitleDescription
    }
  },
  watch: {
    classSetting(valueObj, oldValueObj) {
      // this.$log.debug(`valueObj => `, valueObj)
      // this.$log.debug(`oldValueObj => `, oldValueObj)

      const changedValueObj = {}

      for (const [key, value] of Object.entries(valueObj)) {
        if (valueObj[key] !== oldValueObj[key])
            changedValueObj[key] = value
      }

      this.$log.warn(`changedValueObj => `, changedValueObj)

      // eslint-disable-next-line no-unused-vars
      for (const key of Object.keys(changedValueObj)) {
        this.updateClazzes(key, this.type.code)
      }
    },

  },
  created() {},
  mounted() {},
  methods: {
    updateClazzes(el, postType) {
      if (!this.option.isLoading && this.type.code === postType) {
        this.option.isLoading = true

        if (!this.isClassActivated) {
          alert('비공개된 클래스입니다.\n설정을 변경할 수 없습니다.')
          this.option.isLoading = false
          return false
        }
        if (!this.isManager) {
          alert('설정 변경 권한이 없습니다.')
          this.option.isLoading = false
          return false
        }

        const params = {}
        const classSettingKeys = Object.keys(this.classSetting)

        if (this.postTypeArr.includes(this.type.code)) {

          const postTypeAndCode = {
            studentUsed: `${postType}StudentUsed`,
            parentsUsed: `${postType}ParentsUsed`,
            studentWriteUsed: `${postType}StudentWriteUsed`,
            parentsWriteUsed: `${postType}ParentsWriteUsed`,
            studentSubmitUsed: `${postType}StudentSubmitUsed`,
            parentsSubmitUsed: `${postType}ParentsSubmitUsed`,
            commentUsed: `${postType}CommentUsed`,
            commentStudentUsed: `${postType}CommentStudentUsed`,
            commentParentsUsed: `${postType}CommentParentsUsed`,
            likeUsed: `${postType}LikeUsed`,
          }

          /**
           * 요청 key 값에 따라 추가 설정 변경
           */
          switch (el) {
            case postTypeAndCode.studentUsed: {
              if (this.clazzes[el] === false && (this.isAlbum || this.isBoard))
                this.clazzes[postTypeAndCode.studentWriteUsed] = this.clazzes[el]

              if (this.clazzes[el] === false && this.isHomework)
                this.clazzes[postTypeAndCode.studentSubmitUsed] = this.clazzes[el]

              if (this.clazzes[el] === false)
                this.clazzes[postTypeAndCode.commentStudentUsed] = this.clazzes[el]

              break
            }
            case postTypeAndCode.parentsUsed: {
              if (this.clazzes[el] === false && (this.isAlbum || this.isBoard))
                this.clazzes[postTypeAndCode.parentsWriteUsed] = this.clazzes[el]

              if (this.clazzes[el] === false && this.isHomework)
                this.clazzes[postTypeAndCode.parentsSubmitUsed] = this.clazzes[el]

              if (this.clazzes[el] === false)
                this.clazzes[postTypeAndCode.commentParentsUsed] = this.clazzes[el]

              break
            }
            case postTypeAndCode.studentWriteUsed:
            case postTypeAndCode.studentSubmitUsed:
            case postTypeAndCode.commentStudentUsed: {
              if (this.clazzes[el] === true)
                this.clazzes[postTypeAndCode.studentUsed] = this.clazzes[el]

              break
            }
            case postTypeAndCode.parentsWriteUsed:
            case postTypeAndCode.parentsSubmitUsed:
            case postTypeAndCode.commentParentsUsed: {
              if (this.clazzes[el] === true)
                this.clazzes[postTypeAndCode.parentsUsed] = this.clazzes[el]

              break
            }
            case postTypeAndCode.commentUsed: {
              if (this.clazzes[el] === true) {
                this.clazzes[postTypeAndCode.studentUsed] = this.clazzes[el]
                this.clazzes[postTypeAndCode.parentsUsed] = this.clazzes[el]
              }
              this.clazzes[postTypeAndCode.commentStudentUsed] = this.clazzes[el]
              this.clazzes[postTypeAndCode.commentParentsUsed] = this.clazzes[el]

              break
            }
          }

          this.clazzes[postTypeAndCode.commentUsed] = this.clazzes[postTypeAndCode.commentStudentUsed] || this.clazzes[postTypeAndCode.commentParentsUsed]
        }

        for (const classSettingKey of classSettingKeys) {
          params[classSettingKey] = this.clazzes[classSettingKey]
        }

        /**
         * 데이터 변경이 종료된 후 PATCH
         */
        this.$nextTick(() => {
          this.$log.debug(
            this.$options.name + ` updateClazzes() params =>`, JSON.stringify(params)
          )
          this.$hiClass.clazzes.update(params, `/clazzes/${this.clazzes.currentId}`)
            .then(() => {
              this.$log.warn(`classSetting ${this.type.code} changed!`)
              localStorage.setItem('isChangedClassSettings', 'true')
            })
            .catch(error => {
              this.$log.debug(error)
            })
            .finally(() => {
              this.option.isLoading = false
            })
        })
      }
    }
  },
}
</script>

<style scoped>
.free-check-box{
    position: absolute;
    top: 12px;
    right:9px
}
.free-check{
    display: inline-block;
    margin-left: 16px;
}
</style>
