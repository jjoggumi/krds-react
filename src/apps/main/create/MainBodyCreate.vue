<!--
@File(Method): MainBodyCreate.vue
@Description: 새 클래스 만들기
@Modified: 2025-02-27 - #72631 클래스 생성 > 상단 탭 내 설명 추가 및 수정
-->
<template>
  <div class="cont-box-inner clfix">
    <banner-item
      :key="$store.state.bannerTimestamp"
      positionType="WEB_BANNER_QUICK"
      :banners="$store.state.banner.WEB_BANNER_QUICK"
    />

    <div class="create-class-cont-wrap boundary-box">
      <div class="title-wrap">{{ $t('main.create.title') }}</div>

      <!-- 프로필 이미지 생성용 div -->
      <div class="sr-only">
        <canvas id="profile-canvas" width="1123" height="1123"></canvas>
      </div>

      <div class="cont-wrap">
        <div class="cont-inner">
          <!-- 클래스 구분 -->
          <div class="cont-item">
            <div class="cont-title">클래스 구분 <span class="txt-warning">*</span></div>
            <div class="hi-row sm-gutters">
              <div class="col-sm-6" v-for="type of classTypes" :key="`classType-${type.value}`">
                <input type="radio" name="classType" class="btn-type" :id="type.value" :value="type.value" v-model="clazz.classType" @change="changeClassType"/>
                <label :for="type.value" class="w100">
                  <span>{{ type.title }}</span>
                  <small>
                    {{ type.value === 'CLASS' ?
                      '(담임, 교과 학급 운영시 선택)' :
                      '(전교 대상, 여러 학급/반 운영시 선택)'
                    }}
                  </small>
                  </label>
              </div>
            </div>
            <div class="info-message mt-10">
                {{ clazz.classType === 'CLASS' ?
                '* 클래스에서 1개 학급 운영 (하이초 1학년 1반 담임선생님께서 생성하시는 경우 선택 )' :
                '* 클래스에서 여러 학급을 운영하실 때 사용합니다. 학교 단체 선택시 [연도무관]으로 개설됩니다. '
                }}
                <span v-if="clazz.classType !== 'CLASS'" class="txt-warning">({{ $moment().format('YYYY') }}년도 클래스로 개설 불가)</span>
            </div>
          </div>

          <!-- 학교 구분 -->
          <div class="cont-item">
            <div class="cont-title">학교 구분 <span class="txt-warning">*</span></div>
            <HiSelectBox
                class="opt-default w100"
                :items="$constants.SCHOOL_TYPE.class"
                :empty-title="clazz.classSchoolType || '선택'"
                :value="clazz.classSchoolType"
                @update:value="changeSchoolType($event)"
            />  
            <p v-if="validErrors.classSchoolType" class="txt-warning mt-10">{{ validErrors.classSchoolType }}</p>
          </div>

          <!-- 학교/단체 검색 -->
          <div class="cont-item" v-show="isSelectedClassSchoolType" v-click-outside="closeSchoolSearch">
            <div class="cont-title">{{ $t('main.create.label.school') }} 검색 <span class="txt-warning">*</span></div>
            <div class="input-box-wrap" :class="{ focus: isFocus.schoolName }">
              <input
                  type="text"
                  ref="schoolName"
                  maxlength="50"
                  placeholder="검색"
                  @input="onInputSchoolName"
                  @focus="isFocus.schoolName = true"
                  @blur="isFocus.schoolName = false"
              />
              <button
                  v-if="schoolName"
                  type="button"
                  class="input-text-delete-btn"
                  :style="{ display: 'inline-block' }"
                  @click="removeSchoolName"
              ></button>
              <button
                  type="button"
                  class="search-icon-btn"
                  @click="getSchools(true)"
              ></button>
            </div>
            <div class="search-result-wrap boundary-box no-result" :class="{ on: isSchoolSearch.done }">
              <ul
                  ref="schoolScrollArea"
                  class="custom-scr"
                  v-infinite-scroll="getSchools"
                  :infinite-scroll-disabled="paging.isBusy"
                  :infinite-scroll-distance="paging.scrollLimit"
              >
                <template v-show="schools.length > 0">
                  <li
                      v-for="school in schools"
                      :key="school.currentId"
                      @click="selectSchool(school)"
                  >
                    <div v-show="school.schoolName.length > 1">
                      <div class="school-image">
                        <img v-if="school.schoolImagePath" :src="school.schoolImagePath" alt="">
                      </div>
                      <div class="school-name">{{ school.schoolName }}</div>
                      <div class="school-address">{{ school.schoolAddress || '' }}</div>
                    </div>
                  </li>
                </template>
                <li class="no-result-add-school">
                  <div class="no-result-add-school-wrap">
                    <p v-html="schoolSearchNotFoundMsg"></p>
                    <HiButton color="primary" outline @click="goAddSchools">
                      {{ $t('main.create.button.addNewSchool') }}
                    </HiButton>
                  </div>
                </li>
              </ul>              
            </div>
            <p v-if="validErrors.schoolName" class="txt-warning mt-10">{{ validErrors.schoolName }}</p>
          </div>

          <!-- 연도 -->
          <div v-if="clazz.classType === 'CLASS' && isSelectedClassSchoolType" class="cont-item">
            <div class="cont-title">{{ $t('main.create.label.year') }} <span class="txt-warning">*</span></div>
            <HiSelectBox
                class="opt-default w100"
                :items="years"
                :empty-title="clazz.classYear || '선택'"
                :value="clazz.classYear"
                @update:value="selectClassYear($event)"
            />
            <p v-if="validErrors.classYear" class="txt-warning mt-10">{{ validErrors.classYear }}</p>
          </div>

          <!-- 학년 -->
          <div
              v-if="clazz.classType === 'CLASS' && !['KINDERGARTEN', 'GROUP'].includes(clazz.classSchoolType) && isSelectedClassSchoolType"
              class="cont-item"
          >
            <div class="cont-title">{{ $t('main.create.label.grade') }} <span class="txt-warning">*</span></div>
            <HiSelectBox
                class="opt-default w100"
                :items="classGrades"
                :empty-title="clazz.classGrade || '선택'"
                :value="clazz.classGrade"
                @update:value="selectClassGrade($event)"
            />
            <p v-if="validErrors.classGrade" class="txt-warning mt-10">{{ validErrors.classGrade }}</p>
          </div>

          <!-- 클래스 명 -->
          <div class="cont-item" v-if="isSelectedClassSchoolType">
            <div class="cont-title">
              {{  $t('main.create.label.className') }} <span class="txt-warning">*</span>
            </div>
            <div class="input-box-wrap" :class="{ focus: isFocus.classBan }">
              <input
                  type="text"
                  id="classBan"
                  placeholder="입력"
                  :value="clazz.classBan"
                  @input="clazz.classBan = $event.target.value; inputClassBan()"
                  @focus="isFocus.classBan = true"
                  @blur="isFocus.classBan = false"
                  @keydown.enter.prevent.stop
              />
            </div>
            <p v-if="validErrors.classBan" class="txt-warning mt-10">{{ validErrors.classBan }}</p>
          </div>
        </div>
      </div>

      <div class="btm-wrap">
        <HiButton color="light-primary" outline @click="goMain">
          {{ $t('main.text.cancel') }}
        </HiButton>
        <HiButton color="primary" @click="createClazzes" :disabled="isDimLoading">
          {{ $t('main.text.complete') }}
        </HiButton>
      </div>
    </div>

    <MainBodyCreateComplete
      v-if="isMainBodyCreateComplete"
      :isMainBodyCreateComplete="isMainBodyCreateComplete"
      :createdClazzesURI="createdClazzesURI"
      :createdClazzes="createdClazzes"      
      :user="user"
      @completePopupClose="completePopupClose"
    ></MainBodyCreateComplete>

    <MainLoadingNewTabDim v-if="isShowLoading"></MainLoadingNewTabDim>

    <ProfileSettingModal v-if="isProfileSetting" :mode="'init'" :classId="classId" :isBtnClose="false" />
  </div>
</template>

<script>
import MainBodyCreateComplete from './MainBodyCreateComplete.vue'
import MainLoadingNewTabDim from '../MainLoadingNewTabDim.vue'
import BannerItem from '../../../components/Banner/BannerItem'
import ProfileSettingModal from '@/components/Profile/ProfileSettingModal.vue'
import {mapFields} from "vuex-map-fields";
import {mapActions, mapMutations, mapState} from "vuex";
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: 'mainBodyCreate',
  components: {
    MainBodyCreateComplete,
    MainLoadingNewTabDim,
    BannerItem,
    ProfileSettingModal
  },
  props: ['user'],
  data() {
    return {
      fromRoute: '',

      isShowLoading: false,
      isLoadComplete: false,
      isMainBodyCreateComplete: false,
      isSelectSchool: false,
      isFocus: {
        schoolName: false,
        classBan: false
      },
      isSchoolSearch: {
        done: false,
        notFound: false
      },

      years: [],

      clazz: {
        className: '',
        classYear: '',
        classGrade: '',
        classGradeCode: '',
        classBan: '',
        classImagePath: '',
        classStatus: 'ACTIVATE',
        classType: 'CLASS',
        classSchoolType: '',
        imageTitle: '',
        imageBackgroundColor: '',
        school: '',
        classOwner: this.user.userUri
      },
      paging: {},
      validErrors: {},

      // 학교 검색
      schools: [],
      schoolName: '',
      schoolNames: [],
      timer: null,
      selectedSchool: {},

      // 클래스 구분
      classTypes: [
        { value: 'CLASS', title: '클래스', col: 3 },
        { value: 'SCHOOL', title: '학교/단체', col: 9 },
      ],

      // 멀티프로필
      isProfileSetting: false,
      classId: '',

      // 생성 완료
      createdClazzesURI: '',
      createdClazzes: {}
    }
  },
  computed: {
    ...mapFields([
      'isDimLoading'
    ]),
    ...mapState([
      'profileImageBgColor'
    ]),
    isSelectedClassSchoolType() {
      return this.$constants.SCHOOL_TYPE.class.map(cate => cate.value).includes(this.clazz.classSchoolType)
    },
    schoolSearchNotFoundMsg() {
      const notFoundType = this.isSchoolSearch.notFound ? '' : '2'
      return this.$t(`main.create.message.schoolsNotFound${notFoundType}`)
    },
    classGrades() {
      let grades = this.$store.state.classSchoolGradeType[this.clazz.classSchoolType]
      return grades.map(grade => ({ title: grade.gradeName, value: grade.classGrade }))
    }
  },
  watch: {
    schoolName: function(value, oldValue) {
      let isChanged = false

      if (this.isLoadComplete) {
        this.$nextTick(() => {
          if (value !== oldValue) {
            isChanged = true
            this.selectedSchool = {}
          }

          if (this.schoolName.trim() === '') this.removeSchoolName()
          else if (isChanged && this.schoolName.trim().length > 1) {
            this.addSchoolNames(this.schoolName)
          }
        })
      }
    },
    schoolNames() {
      const schoolNamesLength = this.schoolNames.length
      if (schoolNamesLength > 0) {
        this.isSelectSchool = false
        this.schoolName = this.schoolNames[schoolNamesLength - 1]
        if (this.timer !== null) clearTimeout(this.timer)

        this.timer = setTimeout(() => {
          if (
            this.schoolName.trim() !== '' &&
            this.schoolName.trim().length > 1 &&
            !this.isSelectSchool
          )
            this.getSchools(true)
        }, 200)
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.fromRoute = from.name
    })
  },
  created() {
    if (this.user.userType !== 'TEACHER') this.$router.push('/main')
    this.getClazzYear()
    this.initPaging()
  },
  mounted() {
    this.isLoadComplete = true
    this.triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.createClass' })
  },
  beforeDestroy() {
    this.setSchoolAppliesTempSchoolName({ schoolAppliesTempSchoolName: this.schoolName })
  },
  methods: {
    ...mapMutations('storeSchool', [
      'setSchoolAppliesTempSchoolName'
    ]),
    ...mapActions([
      'triggerAnalyticsLogEvent'
    ]),
    ...mapActions('storeClazzes', ['generateProfileImage']),
    async getSchools(initFlag) {
      if (this.schoolName.trim().length === 0) return
      if (initFlag) {
        this.initSchoolSearch()
        this.initPaging()
      }

      if (!this.paging.isListEnd && !this.paging.isBusy) {
        let params = {
          _schoolName: this.schoolName.trim(),
          _schoolType: this.clazz.classSchoolType,
          page: this.paging.curPage,
          size: this.paging.curSize,
          sort: 'schoolName,asc'
        }

        try {
          this.paging.isBusy = true
          const res = await this.$axios.post('/schools/searchWithTypeExpansion', null, { params })

          this.paging.curPage++
          this.paging.isListEnd = !(res.data.page.totalElements > this.schools.length)

          if (res.data.page.totalElements > 0) {
            let schools = res.data._embedded.schools
            let newSchools = [
              ...schools.filter(school => school.schoolName.startsWith(this.schoolName.trim())),
              ...schools.filter(school => !school.schoolName.startsWith(this.schoolName.trim()))
            ]
            this.schools.push(...newSchools)
          }

          this.isSchoolSearch.notFound = this.schools.length === 0
          this.isSchoolSearch.done = true
          this.schoolNames.splice(0)

        } finally {
          this.paging.isBusy = false
          this.isLoadComplete = true
        }
      }
    },
    addSchoolNames(schoolName) {
      this.schoolNames.push(schoolName)
    },
    removeSchoolName() {
      this.$refs.schoolName.value = ''
      this.schoolName = ''
      this.clazz.school = ''
      this.isSchoolSearch.done = false
      this.isSelectSchool = false
    },
    goMain() {
      if (this.fromRoute === 'mypage-clazzes') {
        this.$router.back()
      } else {
        this.$router.push('/', () => {})
      }
    },
    makeProfileImageInfo() {
      const randomIdx = Math.floor(Math.random() * 14)
      this.clazz.imageBackgroundColor = this.profileImageBgColor[randomIdx] || this.profileImageBgColor[0]
      this.clazz.imageTitle = this.clazz.classBan.replace(/ /g,'').substring(0, 2)
    },
    async upload(file) {
      try {
        const res = await this.$hiClass.multipart.upload(file)
        return res.data._links.original.href
      } catch (err) {
        this.$log.debug(err)
      }
    },
    async createClazzes() {
      if (this.user.userUri === '') {
        this.$hiClass.alert('로그인 사용자 정보를 확인할 수 없습니다.')
        return false
      }

      if (['KINDERGARTEN', 'GROUP'].includes(this.clazz.classSchoolType) || this.clazz.classType === 'SCHOOL') {
        this.clazz.classGrade = 'ANY'
        this.clazz.classGradeCode = 'NONE'

        if (this.clazz.classType === 'SCHOOL') {
          this.clazz.classYear = 'ANY'
        }
      }

      this.validateForm()
      if (Object.keys(this.validErrors).length > 0) return

      this.isDimLoading = true

      await this.makeProfileImageInfo()
      let generatedImage = await this.generateProfileImage(
          { profileText: this.clazz.imageTitle, profileBgColor: this.clazz.imageBackgroundColor, profileBgImage: null }
      )

      this.clazz.classImagePath = generatedImage !== null ? generatedImage : EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
      if (generatedImage === null) {
        this.clazz.imageBackgroundPath = EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
        this.clazz.imageBackgroundColor = null
        this.clazz.imageTitle = ''
      }

      const schoolName = this.selectedSchool.schoolName || this.schoolName
      const gradeObj = this.findGradeInfo()
      const classGrade = !gradeObj || gradeObj.classGrade === 'ANY' ? '' : `${gradeObj.gradeName} `
      this.clazz.className = `${schoolName} ${classGrade}${this.clazz.classBan.trim()}`

      try {
        const res = await this.$hiClass.clazzes.create(this.clazz)
        const clazzesUUID = res.data._links.self.href
        this.createdClazzes = res.data
        this.createdClazzesURI = `/main/clazzes/${this.$comn.split(clazzesUUID, '/')}`
        this.openProfileSettingModal(this.$comn.split(clazzesUUID, '/'))

      } finally {
        this.isDimLoading = false
      }
    },
    async getClazzYear() {
      try {
        const res = await this.$axios.get('/clazzes/years')
        this.years = res.data._embedded.years.map(year => ({
          title: year.year === 'ANY' ? this.$t('main.create.text.anyYear') : year.year,
          value: year.year
        }))
      } catch (err) {
        this.$log.debug(err)
      }
    },
    initPaging() {
      this.paging = {
        isBusy: false,
        isListEnd: false,
        curPage: process.env.VUE_APP_BASE_PAGE_START,
        scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
        curSize: process.env.VUE_APP_BASE_PAGE_SIZE
      }
    },
    initSchoolSearch() {
      this.schools = []
      this.$refs.schoolScrollArea.scrollTo({top: 0})
    },
    completePopupClose() {
      this.isMainBodyCreateComplete = false
      this.$router.push('/main')
    },
    goAddSchools() {
      this.$router.push('/main/create/schoolapplies')
    },
    onInputSchoolName(event) {
      this.schoolName = event.target.value
      if (!this.schoolName.trim()) {
        this.selectedSchool = {}
        this.removeSchoolName()
      }
    },
    closeSchoolSearch() {
      if (this.isSchoolSearch.done) {
        this.schools = []
        this.$refs.schoolScrollArea.scrollTo({top: 0})
        this.removeSchoolName()
      }
    },
    openProfileSettingModal(classId) {
      this.classId = classId
      this.isProfileSetting = true
    },
    closeProfileSettingModal() {
      this.isProfileSetting = false
    },
    validateForm() {
      this.validErrors = {}

      if (!this.clazz.classSchoolType) {
        this.validErrors.classSchoolType = '학교 구분을 선택해 주세요.'
      }
      if (!this.clazz.school) {
        this.validErrors.schoolName = '학교/단체를 선택해 주세요.'
      }
      if (!this.clazz.classBan.trim()) {
        this.validErrors.classBan = '클래스 명을 입력해 주세요.'
      }

      if (this.clazz.classType === 'CLASS') {
        if (!this.clazz.classYear) {
          this.validErrors.classYear = '연도를 선택해 주세요.'
        }
        if (!this.clazz.classGrade) {
          this.validErrors.classGrade = '학년을 선택해 주세요.'
        }
      }
    },
    changeClassType() {
      if (this.clazz.classType === 'SCHOOL') {
        this.clazz.classYear = ''
        this.clazz.classGrade = ''
        this.clazz.classGradeCode = ''
      }
    },
    changeSchoolType(classSchoolType) {
      this.clazz.classSchoolType = classSchoolType
      this.removeSchoolName()
      this.clazz.classYear = ''
      this.clazz.classGrade = ''
      this.clazz.classGradeCode = ''
      this.clazz.classBan = ''
      this.validErrors.classSchoolType = null
    },
    selectSchool(school) {
      const schoolUri = school._links.self.href === undefined ?
          school._links.self[0].href :
          school._links.self.href

      this.clazz.school = schoolUri
      this.$refs.schoolName.value = school.schoolName

      this.selectedSchool = this.schools.filter(d => {
        return d._links.self.href === schoolUri
      })[0] || {}

      this.validErrors.schoolName = null
      this.isSelectSchool = true
      this.isSchoolSearch.done = false
    },
    selectClassYear(classYear) {
      this.clazz.classYear = classYear
      this.validErrors.classYear = null
    },
    selectClassGrade(classGrade) {
      this.clazz.classGrade = classGrade
      this.clazz.classGradeCode = this.findGradeInfo().classGradeCode || ''
      this.validErrors.classGrade = null
    },
    findGradeInfo() {
      const grades = this.$store.state.classSchoolGradeType[this.clazz.classSchoolType]
      return grades.find(g => g.classGrade === this.clazz.classGrade)
    },
    inputClassBan() {
      this.clazz.classBan = this.clazz.classBan
          .replace(this.$regex.excludeNotNumberAndAlphaAndBlankAndKorean, '')
          .substring(0, 20)

      if (this.clazz.classBan.trim().length > 0) {
        this.validErrors.classBan = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.create-class-cont-wrap{
  input[type=radio].btn-type + label{
    font-weight: 500;    
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    small{
      font-size: 14px;
      font-weight: 400;
      color: #666;
    }
  }
  input[type=radio].btn-type:checked + label{    
    small{
      color: #5b97db;
    }
  }
  .info-message{
    color:var(--primary);
    font-size: 14px;
  }
}
.hi-selectbox::v-deep .option__layer {
  max-height: none;
}
</style>
