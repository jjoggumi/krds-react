<!--
@File(Method): AlarmPlusSubscribePopup.vue
@Author: -
@Date Created: -
@Description: 가정통신문 가입 요청
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 4년전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->
<template>
  <div
    class="modal normal-modal note-notice-modal note-notice-edit-modal"
    style="display: block;"
  >
    <div
      class="modal-cont-wrap"
      style="margin-top: -265.5px; margin-left: -282px;"
      v-click-outside="closePop"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">가정통신문 가입 요청</div>
          </div>
          <div class="family-letter-popup-wrap">
            <div class="family-letter-popup-inner02">
              <ul>
                <li>
                  <div class="category-name">학교</div>
                  <div class="input-box-wrap readonly">
                    <input
                      type="text"
                      :value="model.classGroup.schoolName"
                      readonly
                    />
                  </div>
                </li>
                <li>
                  <div class="category-name">학년/반</div>
                  <div
                    class="border-selectbox-wrap custom-select-box-wrap"
                    :class="{
                      selected: option.isSelected
                    }"
                  >
                    <div
                      class="selected-option"
                      @click="option.isSelected = !option.isSelected"
                      v-click-outside="closeSelect"
                    >
                      <div class="option-val placeholder">
                        {{ model.classGroup.grade }}학년
                        {{ model.classGroup.className }}반
                      </div>
                    </div>
                    <div class="option-list-wrap">
                      <ul>
                        <li
                          v-for="item of classGroupList"
                          :key="item.elGroupStudentClassId"
                          @click="selectClassGroup(item)"
                        >
                          <div class="option-item">
                            {{ item.grade }}학년 {{ item.className }}반
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
                <li>
                  <div class="category-name">본인 이름</div>
                  <div class="username-wrap">
                    <div class="input-box-wrap input-id readonly">
                      <input
                        type="text"
                        placeholder=""
                        v-model="$store.state.user.userName"
                        readonly
                      />
                    </div>
                    <div class="request-btn-wrap">
                      <button
                        class="btn-bg-c"
                        @click="goRoute('/main/mypage/info')"
                      >
                        변경
                      </button>
                    </div>
                  </div>
                </li>
                <li>
                  <div class="category-name">자녀 이름</div>
                  <div
                    class="input-box-wrap"
                    :class="{
                      focus: isFoucs.studentName
                    }"
                  >
                    <input
                      type="text"
                      placeholder="본명을 입력해주세요."
                      maxlength="20"
                      ref="studentName"
                      :value="model.studentName"
                      @input="model.studentName = $event.target.value"
                      @focus="isFoucs.studentName = true"
                      @blur="isFoucs.studentName = false"
                      @keydown.enter.prevent.stop="subscription"
                    />
                  </div>
                  <!--p class="input-validation-text error-text">이미 사용중인 아이디입니다.</p-->
                </li>
                <li>
                  <div class="category-name">반 번호</div>
                  <div
                    class="input-box-wrap"
                    :class="{
                      focus: isFoucs.studentNo
                    }"
                  >
                    <input
                      type="tel"
                      placeholder="반 번호(숫자)를 입력해주세요."
                      maxlength="2"
                      ref="studentNo"
                      :value="model.studentNo"
                      @input="model.studentNo = $event.target.value"
                      @focus="isFoucs.studentNo = true"
                      @blur="isFoucs.studentNo = false"
                      @keydown.enter.prevent.stop="subscription"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="btn-wrap">
            <div class="confirm-btn-wrap mt-20">
              <button
                class="btn-bg-c"
                :class="{
                  dis:
                    model.studentName.length === 0 ||
                    model.studentNo.length === 0
                }"
                :disabled="
                  model.studentName.length === 0 || model.studentNo.length === 0
                "
                @click="subscription"
              >
                요청하기
              </button>
            </div>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="closePop"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlarmPlusSubscribePopup',
  props: {
    schoolId: String
  },
  data() {
    return {
      classGroupList: [],
      option: {
        isSelected: false
      },
      model: {
        classGroup: {}, // classGroup.elGroupStudentClassId 반정보 그룹 아이디 (필수)
        studentNo: '', // 자녀 반번호 (필수)
        studentName: '', //자녀이름 (필수)
        mobile: this.$store.state.user.userMobile, // 학부모 전화번호 (필수)
        userId: this.$store.state.user.currentId, // user.userId 학부모 ID (필수)
        insertedUser: null // insertedUserId 등록자 ID (선택)
      },
      isFoucs: {
        studentName: false,
        studentNo: false
      }
    }
  },
  watch: {
    'model.studentName'(val, oldVal) {
      if (!this.$validation.isRegNamePattern4(val)) {
        if (oldVal === undefined) oldVal = ''
        this.model.studentName = oldVal
        this.$refs.studentName.value = oldVal
      }
    },
    'model.studentNo'(val, oldVal) {
      let revokeFlg = false
      if (
        !this.$validation.isRegNumber(val) ||
        (val.length === 1 && val == '0') ||
        (val.length === 2 && val.startsWith('0', 0))
      ) {
        revokeFlg = true
      }

      if (oldVal === undefined) oldVal = ''

      if (revokeFlg) {
        this.model.studentNo = oldVal
        this.$refs.studentNo.value = oldVal
      }
    }
  },
  computed: {},
  methods: {
    closePop() {
      this.$emit('handleSubscribePop', false)
    },
    closeSelect() {
      this.option.isSelected = false
    },
    getClassGroupList() {
      if (
        this.schoolId !== undefined &&
        this.schoolId !== null &&
        this.schoolId !== ''
      ) {
        this.$axios({
          method: 'get',
          url: '/educationLetters/classGroupList',
          params: {
            schoolId: this.schoolId
          }
        })
          .then(res => {
            this.$log.debug(
              this.$options.name + ' getClassGroupList() res => ',
              res
            )
            const data = res.data
            if (data.status.resultCode === '0' && data.cnt > 0) {
              this.model.classGroup = data.list[0]
              this.classGroupList = data.list
            }
          })
          .catch(err => {
            this.$log.debug(
              this.$options.name + ' getClassGroupList() err => ',
              err
            )
          })
          .finally(() => {})
      }
    },
    selectClassGroup(classGroup) {
      this.model.classGroup = classGroup
      this.option.isSelected = false
    },
    goRoute(path) {
      this.$router.push(path, () => {})
    },
    subscription() {
      const elGroupStudentClassId = this.model.classGroup.elGroupStudentClassId
      const errMsg = '가입 요청을 실패하였습니다.\n관리자에게 문의바랍니다.'

      if (
        elGroupStudentClassId !== undefined &&
        elGroupStudentClassId !== null &&
        elGroupStudentClassId !== ''
      ) {
        this.$axios({
          method: 'post',
          url: '/educationLetters/subscription',
          params: {
            elGroupStudentClassId: elGroupStudentClassId,
            studentNo: this.model.studentNo,
            studentName: this.model.studentName,
            mobile: this.model.mobile,
            userId: this.model.userId,
            insertedUser: this.model.userId
          }
        })
          .then(res => {
            this.$log.debug(this.$options.name + ' subscription() res => ', res)
            const data = res.data
            if (data.status.resultCode === '0') this.closePop()

            alert(data.status.resultMassage || errMsg)
          })
          .catch(err => {
            this.$log.debug(this.$options.name + ' subscription() err => ', err)
            alert(errMsg)
          })
          .finally(() => {})
      }
    }
  },
  created() {
    this.getClassGroupList()
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>
<style scoped>
.family-letter-popup-wrap{padding:0 30px;}
.family-letter-popup-inner02 > ul > li{padding: 12px 0 12px 140px; position:relative; height:58px;}
.family-letter-popup-wrap  ul li .category-name {width:120px;font-size: 14px;text-align:left;transform: skew(0.2deg);position: absolute; left: 0; top:24px;}
.family-letter-popup-wrap  ul li .category-name + div{width:100%;}
.family-letter-popup-wrap  ul li .input-box-wrap {width:220px;}
.family-letter-popup-wrap  ul li .input-box-wrap input {height:34px;line-height:32px;}
.family-letter-popup-wrap .border-selectbox-wrap .option-list-wrap li .option-item{
    padding:0;
}
.family-letter-popup-inner02 {padding: 0 30px}
.username-wrap .input-box-wrap {float:left;width:296px;}
.username-wrap .request-btn-wrap {float:left;width:76px;margin:0 0 0 8px;}
.username-wrap button {width:100%;height:36px;line-height:36px;border-radius:18px;}
</style>