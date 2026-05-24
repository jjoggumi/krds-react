<!--
@File(Method): MainBodyCreateSchoolapplies.vue
@Description: 신규 학교 / 단체 추가 신청
@Modified: 2024-12-10 - #69538 클래스 생성 시 유치, 중고등 분류
-->
<template>
  <div class="cont-box-inner clfix">
    <div class="create-class-cont-wrap boundary-box">
      <div class="title-wrap">
        {{ $t('main.create.schools.title') }}
        <!--#69538 삭제  <span class="title-vali txt-warning">* {{ $t('main.text.input.mandatory') }}</span> -->
      </div>
      <div class="cont-wrap">
        <div class="cont-inner">
          <!-- 학교 / 단체명 -->
          <div class="cont-item">
            <div class="cont-title">
              {{ $t('main.create.schools.label.schoolName') }}
              <span class="txt-warning">*</span>
            </div>
            <div
              class="input-box-wrap"
              :class="{
                focus: isFocusSchoolName
              }"
            >
              <input
                type="text"
                ref="schoolName"
                placeholder="학교명만 입력 (예:00초등학교)"
                v-model="school.schoolName"
                @click="isFocusSchoolName = true"
                @blur="isFocusSchoolName = false"
                @keydown.enter.prevent.stop
                maxlength="15"
              />
            </div>
          </div>
          <!-- 도로명 -->
          <div class="cont-item">
            <div class="cont-title">
              {{ $t('main.create.schools.label.schoolAddress1') }}              
              <span class="txt-warning">*</span>
            </div>
            <div
              class="input-box-wrap search-box-wrap"
              :class="{
                focus: isFocusSchoolAddress1
              }"
            >
              <input
                type="text"
                ref="address1"
                :placeholder="
                  $t('main.create.schools.description.schoolAddress1')
                "
                :readonly="isAddressesReadOnly"
                @input="school.address1 = $event.target.value"
                @keydown.enter.prevent.stop="searchAddress"
                @click="isFocusSchoolAddress1 = true"
                @blur="isFocusSchoolAddress1 = false"
                maxlength="100"
              />
              <button
                type="button"
                class="search-icon-btn"
                @click="searchAddress"
              ></button>
              <button
                type="button"
                class="input-text-delete-btn"
                :style="{ display: 'inline-block' }"
                v-if="school.address1"
                @click="clearAddress"
              ></button>
            </div>
            <div
              class="search-result-wrap boundary-box"
              v-bind:class="{
                on: isAddressesSearch,
                'no-result': isAddressesSearchNotFound
              }"
            >
              <div
                class="no-result-add-school-wrap"
                v-if="isAddressesSearchNotFound"
              >
                <p>{{ searchErrorMessage }}</p>
              </div>

              <ul class="address-list" v-else>
                <li
                  v-for="juso in addresses.juso"
                  v-bind:key="juso.currentId"
                  @click="
                    selectItem('address', {
                      address1: `${juso.siNm} ${juso.sggNm} ${juso.rn}`,
                      address2:
                        `${juso.buldMnnm}` +
                        (juso.buldSlno != 0 ? `-${juso.buldSlno}` : '') +
                        (juso.roadAddrPart2 != 0
                          ? ` ${juso.roadAddrPart2}`
                          : '')
                    })
                  "
                >
                  <div class="school-name">{{ `${juso.roadAddr}` }}</div>
                  <div class="school-address">
                    {{
                      `${$t('main.create.schools.text.oldAddress')} : ${
                        juso.jibunAddr
                      }`
                    }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <!-- 상세주소 -->
          <div class="cont-item">
            <div class="cont-title">
              {{ $t('main.create.schools.label.schoolAddress2') }}              
              <span class="txt-warning">*</span>
            </div>
            <div
              class="input-box-wrap"
              :class="{
                focus: isFocusSchoolAddress2
              }"
            >
              <input
                type="text"
                ref="address2"
                :placeholder="
                  $t('main.create.schools.description.schoolAddress2')
                "
                v-model="school.address2"
                @click="isFocusSchoolAddress2 = true"
                @blur="isFocusSchoolAddress2 = false"
                @keydown.enter.prevent.stop
                maxlength="100"
              />
            </div>
          </div>
          <!-- 홈페이지 -->
          <div class="cont-item">
            <div class="cont-title">
              {{ $t('main.create.schools.label.schoolHomepage') }}
              
            </div>
            <div
              class="input-box-wrap"
              :class="{
                focus: isFocusSchoolHomepage
              }"
            >
              <input
                type="text"
                v-model="school.homepage"
                @click="isFocusSchoolHomepage = true"
                @blur="isFocusSchoolHomepage = false"
                @keydown.enter.prevent.stop
                maxlength="100"
                placeholder="홈페이지"
              />
            </div>
          </div>
          <!-- 대표 전화번호 -->
          <div class="cont-item">
            <div class="cont-title">
              {{ $t('main.create.schools.label.schoolTel') }}
            </div>
            <div class="hi-row sm-gutters">
              <div class="col-sm-4">
                <div
                  class="input-box-wrap"
                  :class="{
                    focus: isFocusSchoolTel1
                  }"
                >
                  <input
                    type="tel"
                    id="tel1"
                    ref="tel1"
                    @input="school.tel1 = $event.target.value"
                    @keydown.enter.prevent.stop
                    @keyup="onKeyInput($event)"
                    @click="isFocusSchoolTel1 = true"
                    @blur="isFocusSchoolTel1 = false"
                    maxlength="3"
                    placeholder="지역번호 (숫자만)"
                  />
                </div>
              </div>
              <div class="col-sm-4">
                <div
                  class="input-box-wrap"
                  :class="{
                    focus: isFocusSchoolTel2
                  }"
                >
                  <input
                    type="tel"
                    id="tel2"
                    ref="tel2"
                    @input="school.tel2 = $event.target.value"
                    @keydown.enter.prevent.stop
                    @keyup="onKeyInput($event)"
                    @click="isFocusSchoolTel2 = true"
                    @blur="isFocusSchoolTel2 = false"
                    maxlength="4"
                    placeholder="중간번호 (숫자만)"
                  />
                </div>
              </div>
              <div class="col-sm-4">
                <div
                  class="input-box-wrap"
                  :class="{
                    focus: isFocusSchoolTel3
                  }"
                >
                  <input
                    type="tel"
                    id="tel3"
                    ref="tel3"
                    @input="school.tel3 = $event.target.value"
                    @keydown.enter.prevent.stop
                    @keyup="onKeyInput($event)"
                    @click="isFocusSchoolTel3 = true"
                    @blur="isFocusSchoolTel3 = false"
                    maxlength="4"
                    placeholder="끝번호 (숫자만)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="btm-wrap">
        <HiButton color="light-primary" outline @click="goBack" :disabled="isLoading">
          {{ $t('main.text.cancel') }}
        </HiButton>
        <HiButton color="primary" @click="addSchoolApplies"
          :class="{
            dis: !isFormChecked || isLoading
          }"
          :disabled="!isFormChecked || isLoading">
          {{ $t('main.text.complete') }}
        </HiButton>
      </div>
    </div>

    <MainBodyCreateSchoolappliesComplete
      v-if="isMainBodyCreateSchoolappliesComplete"
    ></MainBodyCreateSchoolappliesComplete>
  </div>
</template>

<script>
import MainBodyCreateSchoolappliesComplete from './MainBodyCreateSchoolappliesComplete.vue'
import {mapMutations, mapState} from "vuex";

export default {
  name: 'MainBodyCreateSchoolApplies',
  components: {
    MainBodyCreateSchoolappliesComplete
  },
  props: ['user'],
  data: () => ({
    isMainBodyCreateSchoolappliesComplete: false,
    isFocusSchoolName: false,
    isFocusSchoolAddress1: false,
    isFocusSchoolAddress2: false,
    isFocusSchoolHomepage: false,
    isFocusSchoolTel1: false,
    isFocusSchoolTel2: false,
    isFocusSchoolTel3: false,
    isAddressesSearch: false,
    isAddressesSearchNotFound: false,
    isAddressesReadOnly: false,
    isSelectAddress: false,
    school: {
      schoolName: '',
      address1: '',
      address2: '',
      homepage: '',
      tel1: '',
      tel2: '',
      tel3: ''
    },
    addresses: [],
    tmpAddresses: [],
    searchErrorMessage: '',
    isLoading: false,
    isChanged: false,
    timer: null
  }),
  computed: {
    ...mapState('storeSchool', {
      schoolAppliesTempSchoolName: 'schoolAppliesTempSchoolName'
    }),
    isFormChecked() {
      if (
        this.school.schoolName.trim() !== '' &&
        this.school.address1 !== '' &&
        this.school.address2.trim() !== ''
      )
        return true
      else return false
    }
  },
  watch: {
    'school.address1': function(value, oldValue) {
      this.$log.debug(`oldValue => ${oldValue}`, `value => ${value}`)
      let isChanged = false

      this.$nextTick(() => {
        if (value !== oldValue) isChanged = true

        if (this.school.address1.trim() === '') this.clearAddress()
        else if (isChanged && !this.isSelectAddress) {
          this.addSchoolAddress(this.school.address1)
        }
      })
    },
    tmpAddresses() {
      const tmpAddressesLength = this.tmpAddresses.length
      if (tmpAddressesLength > 0) {
        this.isSelectAddress = false
        this.school.address1 = this.tmpAddresses[tmpAddressesLength - 1]
        if (this.timer !== null) clearTimeout(this.timer)

        this.timer = setTimeout(() => {
          if (this.school.address1.trim() !== '' && !this.isSelectAddress)
            this.searchAddress()
        }, 200)
      }
    }
  },
  created() {
    this.$log.debug(`this.schoolAppliesTempSchoolName created: `, this.schoolAppliesTempSchoolName)
  },
  mounted() {
    this.$log.debug(`this.schoolAppliesTempSchoolName mounted: `, this.schoolAppliesTempSchoolName)

    if (this.schoolAppliesTempSchoolName)
      this.school.schoolName = this.schoolAppliesTempSchoolName
  },
  beforeDestroy() {
    this.setSchoolAppliesTempSchoolName({ schoolAppliesTempSchoolName: null })
  },
  methods: {
    ...mapMutations('storeSchool', {
      setSchoolAppliesTempSchoolName: 'setSchoolAppliesTempSchoolName'
    }),
    goBack() {
      this.$router.go(-1)
    },
    init() {
      this.school.schoolName = ''
      this.school.homepage = ''
      this.school.tel1 = ''
      this.school.tel2 = ''
      this.school.tel3 = ''
      this.clearAddress()
    },
    clearAddress() {
      this.school.address1 = ''
      this.school.address2 = ''
      this.$refs.address1.value = ''
      this.$refs.address2.value = ''
      this.isSelectAddress = false
      this.isAddressesSearch = false
      this.isAddressesReadOnly = false
    },
    validate() {
      if (
        this.school.schoolName === '' ||
        this.school.address1 === '' ||
        this.school.address2 === ''
      ) {
        alert('필수 입력 정보를 확인해 주세요.')
        return false
      }
      if (this.user.userUri === '') {
        alert('로그인 사용자 정보를 확인할 수 없습니다.')
        return false
      }
      return true
    },
    addSchoolApplies() {
      if (!this.isLoading) {
        this.isLoading = true

        const param = {}
        param.schoolName = this.school.schoolName
        param.address1 = this.school.address1
        param.address2 = this.school.address2
        if (this.school.homepage !== '') param.homepage = this.school.homepage
        if (this.school.tel1 !== '') param.tel1 = this.school.tel1
        if (this.school.tel2 !== '') param.tel2 = this.school.tel2
        if (this.school.tel3 !== '') param.tel3 = this.school.tel3

        this.$log.debug(
          `${this.$options.name} method: addSchoolApplies param `,
          param
        )

        this.$axios({
          method: 'post',
          url: '/schoolApplies',
          params: param
        })
          .then(result => {
            this.$log.debug(
              this.$options.name + ' addSchoolApplies() result : ',
              result
            )


            if (result.data.resultCode === '1') {
              this.isMainBodyCreateSchoolappliesComplete = true
            } else {
              alert(
                '이미 등록된 학교 이름입니다.\n이미 등록된 학교는 신규 학교로 추가 신청하실 수 없습니다.'
              )
            }

            this.isLoading = false
          })
          .catch(error => {
            this.$log.debug(error)
            alert(
              'errorCode : ' +
                error.response.status +
                '\n' +
                '요청이 정상적으로 처리되지 않았습니다.\n' +
                '잠시 후 다시 시도해 주세요.'
            )
            this.isLoading = false
          })
      }
    },
    searchAddress() {
      this.isAddressesSearch = true

      let param = {
        countPerPage: 20,
        currentPage: 1,
        keyword: this.school.address1
      }
      this.$axios({
        method: 'get',
        url: '/addresses',
        params: param
      })
        .then(result => {
          this.$log.debug(
            `${this.$options.name} method: searchAddress result `,
            result
          )
          const errorCode = result.data.results.common.errorCode
          const errorMessage = result.data.results.common.errorMessage

          if (errorCode === '0') {
            this.addresses = result.data.results
            this.isAddressesSearch = true

            if (this.addresses.common.totalCount < 1) {
              this.isAddressesSearchNotFound = true
              this.searchErrorMessage = this.$t(
                'main.create.schools.message.addressNotFound'
              )
            } else this.isAddressesSearchNotFound = false
          } else {
            this.$log.debug(
              `${this.$options.name} method: searchAddress errorMessage `,
              errorMessage
            )
            this.searchErrorMessage = errorMessage
            this.isAddressesSearch = true
            this.isAddressesSearchNotFound = true
          }
          this.isLoading = false
        })
        .catch(error => {
          this.$log.debug(error)
          this.clearAddress()
          this.isLoading = false
        })
    },
    selectItem(el, data) {
      this.$log.debug(`selectItem ${el} `, data)
      if (el === 'address') {
        this.isSelectAddress = true
        this.$nextTick(() => {
          this.school.address1 = data.address1
          this.school.address2 = data.address2
          this.$refs.address1.value = data.address1
          this.isAddressesReadOnly = true

          if (this.timer2 !== null) clearTimeout(this.timer2)
          this.timer2 = setTimeout(() => {
            this.isAddressesSearch = false
          }, 200)
        })
      }
    },
    onBlur() {
      this.isAddressesSearch = false
    },
    onKeyInput(e) {
      const id = e.target.id
      const value = this.$refs[id].value
      if (!this.$validation.isRegNumber(value)) {
        this.$refs[id].value = ''
        return false
      }
    },
    addSchoolAddress(schoolAddress) {
      this.tmpAddresses.push(schoolAddress)
    }
  },
}
</script>

<style scoped></style>
