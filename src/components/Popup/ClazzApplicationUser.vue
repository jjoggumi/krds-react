<template>
  <div class="modal common-modal add-user-modal">
    <div
      ref="clazzApplicationUserModal"
      class="modal-cont-wrap"
      :style="modalStyle"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">신청 학생 선택</div>
            <p>{{ formNameStr }} 신청학생을 선택해주세요</p>
          </div>
          <div
            class="input-box-wrap search-box-wrap"
            :class="{
              focus: option.focus.keyword
            }"
          >
            <input
              ref="keyword"
              type="text"
              placeholder="학생 이름 검색"
              maxlength="50"
              :value="tempKeyword"
              @input="tempKeyword = $event.target.value"
              @focus="option.focus.keyword = true"
              @blur="option.focus.keyword = false"
              @keyup.prevent="checkKeyword($event.target.value)"
              @keyup.enter="setKeyword($event.target.value)"
            >
            <button
              type="button"
              class="search-icon-btn"
              @click="setKeyword(tempKeyword)"
            ></button>
            <button
              v-if="keyword"
              type="button"
              class="input-text-delete-btn"
              :style="{ display: 'inline-block' }"
              @click="setKeyword('')"
            ></button>
          </div>

          <div class="search-result-list-wrap">
            <!-- 검색결과 있을시 -->
            <ul
              v-if="filteredList.length > 0"
            >
              <li
                v-for="(acceptParent, index) of filteredList"
                :key="acceptParent.currentId"
              >
                <div class="inner">
                  <div class="checkbox-wrap">
                    <input
                      type="radio"
                      :id="`ra${index}`"
                      :name="`ra${index}`"
                      :value="acceptParent.userId"
                      v-model="userId"
                    >
                    <label :for="`ra${index}`"></label>
                  </div>
                  <div class="profile-img-wrap" :style="userPhotoStyleObj(acceptParent)"></div>
                  <div class="profile-name-wrap">
                    <span class="name">{{ acceptParent.memberChildName }} 학부모</span>
                    <span class="info">
                      {{ acceptParent.userName }}
                      {{
                        acceptParent.userMobile
                          ? $stringUtil.phoneFormatter(acceptParent.userMobile)
                          : acceptParent.userMobile
                      }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
            <!-- //검색결과 있을시 -->

            <!-- 검색결과 없을시 -->
            <div
              v-if="filteredList.length === 0"
              class="result-empty-wrap"
            >
              <p>조회된 결과가 없습니다.<br>다시 확인해주세요.</p>
            </div>
            <!--// 검색결과 없을시 -->
          </div>
          <div class="btn-wrap">
            <button
              class="btn-bg-w2"
              @click="close"
            >취소</button>
            <button
              class="btn-bg-c"
              :class="{
                dis: isDisabledConfirmButton
              }"
              :disabled="isDisabledConfirmButton"
              @click="openFormModal"
            >확인</button>
          </div>
        </div>
        <div
          class="modal-close-btn modal-close-icon"
          @click="close"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import {eventBus} from "@/main";

export default {
  name: "clazz-application-user",
  props: {
    formName: {
      type: String
    },
    acceptParentList: {
      type: Array
    }
  },
  data() {
    return {
      option: {
        focus: {
          keyword: false
        }
      },
      modalPosition: {},
      keyword: '',
      tempKeyword: '',
      userId: null
    }
  },
  computed: {
    modalStyle() {
      if (this.modalPosition.m_height) {
        return {
          'margin-top': -this.modalPosition.m_height + 'px',
          'margin-left': -this.modalPosition.m_width + 'px'
        }
      } else return {}
    },
    filteredList() {
      return this.acceptParentList.filter(d => {
        return d.memberChildName && d.memberChildName.includes(this.keyword)
      })
    },
    isDisabledConfirmButton() {
      return !this.userId
    },
    formNameStr() {
      if (this.formName === 'ABSENT')
        return '결석사유서'
      else if (this.formName === 'FIELD_STUDY')
        return '체험학습계'
      else
        return ''
    }
  },
  mounted() {
    this.modalPosition = this.$comn.getModalPosition(this.$refs.clazzApplicationUserModal)
    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.$nextTick(() => {
      this.$refs.keyword.focus()
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    close() {
      const clazzApplicationUser = {
        isOpen: false,
        formName: '',
        acceptParentList: []
      }
      this.$store.commit('setClazzApplicationUser', clazzApplicationUser)
    },
    setKeyword(value) {
      this.keyword = value
      this.tempKeyword = value
      this.userId = null
    },
    checkKeyword(value) {
      if (value === '') {
        this.keyword = ''
        this.tempKeyword = ''
        this.userId = null
      }
    },
    openFormModal() {
      const payload = {
        formName: this.formName,
        mode: 'create',
        userId: this.userId
      }
      eventBus.$emit('clazzes-form-open-modal', payload)
      this.close()
    },
    userPhotoStyleObj(item) {
      let rtnValue = ''
      let imagePath = ''
      const userPhoto = item.userPhoto
      const defaultImagePath = '/files/img/profile_default.png'

      if (userPhoto !== undefined && userPhoto !== null && userPhoto !== '')
        imagePath = userPhoto
      else imagePath = defaultImagePath

      if (imagePath.includes("//download")) {
        const oldStr = "//download";
        const newStr = "//image";
        imagePath = imagePath.replace(oldStr, newStr);
      }

      if (!imagePath.includes("?")) {
        let resizeQuery = "";
        let width = 66 * 3;
        let height = 66 * 3;
        resizeQuery = `?width=${width}&height=${height}`;
        imagePath = imagePath + resizeQuery;
      }

      rtnValue = `background-image:url('${imagePath}'); background-size: 66px 66px;`

      return rtnValue
    }
  }
}
</script>

<style scoped>
  .modal {
    display: block;
  }
</style>