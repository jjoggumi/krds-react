<!--
@File(Method): MainBodyClazzesBodySettingClassInfo.vue
@Description: 클래스 > 관리자 메뉴 > 클래스 설정 > 클래스 정보 탭
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <!-- 클래스 정보 -->
  <div class="setting-category-wrap category-class-info">
    <div class="category-title">클래스 정보</div>
    <div class="info-message">
      * 클래스 이미지와 정보를 수정할 수 있습니다.
    </div>
    <div class="category-cont-wrap boundary-box clfix">
      <div class="cont-item">
        <div class="txt-center">
          <HiAvatar            
            type="class"
            size="xl" 
            :img="clazzes.classImagePath ? getThumbnail(clazzes.classImagePath) : null"
          >              
            <template v-slot:badge>
              <HiIcon
                name="ico-pen2" color="white" bgColor="default" rounded="rounded"
                class="bottom-right"
                @click.native="openProfileImageEdit"
                role="button"
            ></HiIcon>
            </template>
          </HiAvatar>
          <!-- #72684 프로필 이미지 아바타(HiAvatar)적용 전
          <div class="avatar-img xl class">
            <div class="img-area" :style="{'background-image': clazzes.classImagePath ? 'none' : '~@/assets/img/icon/school_default.png'}">
              <img v-if="clazzes.classImagePath" :src="getThumbnail(clazzes.classImagePath)">
            </div>
            <HiIcon
                name="ico-pen2" color="white" bgColor="default" size="20" rounded="rounded"
                class="bottom-right"
                @click.native="openProfileImageEdit"
                role="button"
            ></HiIcon>
          </div> 
          -->
        </div>
      </div>

      <!-- 클래스 구분 -->
      <div class="cont-item">
        <div class="cont-title">
          클래스 구분
        </div>
        <div class="input-box-wrap dis">
          <input type="text" disabled :value="classTypes.find(type => type.value === clazzes.classType).title"/>
        </div>
      </div>

      <!-- 학교 구분 -->
      <div class="cont-item">
        <div class="cont-title">
          학교 구분
        </div>
        <div class="input-box-wrap dis">
          <input type="text" :value="classSchoolTypeStr" disabled/>
        </div>
      </div>

      <!-- 학교/단체 -->
      <div class="cont-item">
        <div class="cont-title">
          {{ $t('main.create.label.school') }}
        </div>
        <div class="hi-row sm-gutters">
          <div class="col-sm-10">
            <div
              class="input-box-wrap dis"
              v-if="schoolName !== undefined"
            >
              <input type="text" v-model="schoolName" disabled />
            </div>
          </div>
          <div class="col-sm-2">
            <HiButton class="w100" color="primary" bitrounded size="lg" @click="isSchoolGroupSearch = true"> 변경</HiButton>
          </div>
        </div>
      </div>

      <!-- 연도 -->
      <div v-if="clazzes.classType === 'CLASS'" class="cont-item">
        <div class="cont-title">{{ $t('main.create.label.year') }}</div>
        <HiSelectBox class="opt-default w100"
          :value="classYearStr"
          @update:value="clazzes.classYear = $event; selectItem('year')"
          :items="years"
          :empty-title="classYearStr || '선택'"                
        />
      </div>

      <!-- 학년 -->
      <div v-if="clazzes.classType === 'CLASS' && !['KINDERGARTEN', 'GROUP'].includes(clazzes.classSchoolType)" class="cont-item">
        <div class="cont-title">{{ $t('main.create.label.grade') }}</div>
        <HiSelectBox
            class="opt-default w100"
            :value="classGradeStr"
            @update:value="clazzes.classGrade = $event; selectItem('grade')"
            :items="classGrades"
            :empty-title="classGradeStr || '선택'"
        />
      </div>

      <!-- 클래스명 -->
      <div class="cont-item">
        <div class="cont-title">
          {{ $t('main.create.label.className') }}
        </div>
        <div
          class="input-box-wrap"
          :class="{ focus: isFocusClassBan, dis: !isClassActivated }"
        >
          <input
            type="text"
            id="classBan"
            ref="classBan"
            maxlength="20"
            :placeholder="$t('main.create.description.className')"
            :value="clazzes.classBan"
            @input="clazzes.classBan = $event.target.value"
            @focus="isFocusClassBan = true; backupResource('clazzes', clazzes)"
            @blur="isFocusClassBan = false"
            @change="onChangeClassBan"
            @keydown.enter.prevent.stop
            :disabled="!isClassActivated"
          />
        </div>
      </div>
    </div>

    <!-- #69538 프로필 이미지 수정 모달 -->
    <profile-image-edit
        v-if="isProfileImageEdit === true"
        :profileImage="profileImage"
        :profileType="'CLASS'"
        @close="closeProfileImageEdit"
        @updateProfileImage="updateProfileImage"
    />
    <SchoolGroupSearch v-if="isSchoolGroupSearch === true" :classSchoolType="clazzes.classSchoolType" @close="closeSchoolGroupSearch"/>
  </div>
  <!-- //클래스 정보 -->
</template>

<script>
import ProfileImageEdit from '@/components/Modal/ProfileImageEdit.vue'
import SchoolGroupSearch from '@/components/Modal/SchoolGroupSearch.vue'
import {mapFields} from "vuex-map-fields"
import {mapState} from "vuex";

export default {
  name: 'MainBodyClazzesBodySettingClassInfo',
  components: {
    ProfileImageEdit,
    SchoolGroupSearch
  },
  props: ['clazzes', 'isManager', 'isClassActivated'],
  data() {
    return {
      isFocusClassBan: false,
      years: [],

      oldResource: {},
      isSchoolGroupSearch: false,

      classTypes: [
        { value: 'CLASS', title: '클래스' },
        { value: 'SCHOOL', title: '학교/단체' },
      ],

      isProfileImageEdit: false,
      profileImage: {
        classImagePath: '',
        imageBackgroundColor: '',
        imageBackgroundPath: '',
        imageTitle: ''
      }
    }
  },
  computed: {
    ...mapFields([
      'isDimLoading'
    ]),
    classYearStr() {
      return this.clazzes.classYear === 'ANY' ? this.$t('main.create.text.anyYear') : this.clazzes.classYear
    },
    classGradeStr() {
      const grades = this.$store.state.classSchoolGradeType[this.clazzes.classSchoolType]
      return (grades.find(g => g.classGrade === this.clazzes.classGrade) || {}).gradeName || ''
    },
    classSchoolTypeStr() {
      return (this.$constants.SCHOOL_TYPE.class.find(type => type.value === this.clazzes.classSchoolType) || {}).title
    },
    schoolName() {
      return this.clazzes.school ? this.clazzes.school.schoolName : ''
    },
    classGrades() {
      let gradeData = this.$store.state.classSchoolGradeType[this.clazzes.classSchoolType]

      return gradeData.map(grade => ({
        title: grade.gradeName,
        value: grade.classGrade
      }))
    }
  },
  watch: {
    'clazzes.classBan'() {
      this.clazzes.classBan = this.clazzes.classBan.replace(
        this.$regex.excludeNotNumberAndAlphaAndBlankAndKorean,
        ''
      )
    }
  },
  methods: {
    async getClazzProfileImage() {
      try {
        const res = await this.$axios.get(`/clazzes/${this.clazzes.currentId}/profileimage`)
        this.profileImage = res.data

        if (!res.data.imageBackgroundPath && !res.data.imageBackgroundColor) {
          this.profileImage.imageBackgroundPath = res.data.classImagePath
        }

      } catch (err) {
        this.$log.debug(err)
      }
    },
    async updateProfileImage(fileOriginalPath) {
      try {
        if (fileOriginalPath.trim().length === 0) return

        this.profileImage.classImagePath = fileOriginalPath

        const res = await this.$axios.patch(`/clazzes/${this.clazzes.currentId}/profileimage`, this.profileImage)
        for (const [key, value] of Object.entries(res.data)) {
          this.clazzes[key] = value
        }
      } catch (err) {
        this.$log.debug(err)
      }
    },
    getThumbnail(imagePath) {
      return imagePath.split('.').pop().toLowerCase() === 'gif' ?
          imagePath :
          `${imagePath.replace('download.hiclass.net', 'image.hiclass.net')}?width=120&height=120`
    },
    async openProfileImageEdit() {
      await this.getClazzProfileImage()
      this.isProfileImageEdit = true
    },
    closeProfileImageEdit() {
      this.isProfileImageEdit = false
    },
    selectItem(el) {
      if (!this.isClassActivated) return false

      this.setClassName()
      let requestBody = { className: this.clazzes.className }

      if (el === 'year') {
        requestBody.classYear = this.clazzes.classYear
      } else if (el === 'grade') {
        const gradeObj = this.findGradeInfo()
        requestBody.classGrade = this.clazzes.classGrade
        requestBody.classGradeCode = gradeObj.classGradeCode
        this.clazzes.classGradeCode = gradeObj.classGradeCode
      } else if (el === 'ban') {
        requestBody.classBan = this.clazzes.classBan
      }

      this.updateClazzes(requestBody)
    },
    onChangeClassBan() {
      this.clazzes.classBan = this.clazzes.classBan.trim()
      if (this.clazzes.classBan) {
        this.selectItem('ban')
      } else {
        this.$hiClass.alert('클래스명을 입력해 주세요.').then(() => this.restoreResource('clazzes'))
      }
    },
    setClassName() {
      const gradeObj = this.findGradeInfo()
      const classGrade = !gradeObj || gradeObj.classGrade === 'ANY' ? '' : `${gradeObj.gradeName} `
      this.clazzes.className = `${this.schoolName} ${classGrade}${this.clazzes.classBan}`
    },
    findGradeInfo() {
      const grades = this.$store.state.classSchoolGradeType[this.clazzes.classSchoolType]
      return grades.find(g => g.classGrade === this.clazzes.classGrade)
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
    async updateClazzes(requestBody) {
      if (!this.isDimLoading) {
        if (!this.isClassActivated) return false
        if (!this.isManager) {
          alert('설정 변경 권한이 없습니다.')
          return false
        }

        this.isDimLoading = true
        try {
          await this.$hiClass.clazzes.update(requestBody, `/clazzes/${this.clazzes.currentId}`)
        } finally {
          this.isDimLoading = false
        }
      }
    },
    backupResource(key, resource) {
      this.oldResource[key] = Object.assign({}, resource)
    },
    restoreResource(...keys) {
      keys.forEach(key => {
        for (const [k, v] of Object.entries(this.oldResource[key])) {
          this[key][k] = v
        }
      })
    },
    async closeSchoolGroupSearch(schoolGroup) {
      this.isSchoolGroupSearch = false
      if (schoolGroup.currentId) {
        const res = await this.$axios.patch(`/clazzes/${this.clazzes.currentId}/school`, {
          prevSchoolId: this.clazzes.school.currentId,
          schoolId: schoolGroup.currentId
        })
        for (const [key, value] of Object.entries(res.data)) {
          this.clazzes[key] = value
        }

        this.setClassName()
        await this.updateClazzes({ className: this.clazzes.className })

        this.$toasted.show('학교/단체가 변경되었습니다.')
      }
    }
  },
  created() {
    this.getClazzYear()
  }
}
</script>

<style lang="scss" scoped>
.class-setting-wrap .setting-category-wrap { padding: 28px 25px 0 25px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 25px; }
.select-photo-wrap .selected-photo .photo {
  background-position: center;
  background-size: 100%;
}
.class-setting-wrap .setting-category-wrap .category-title { font-family: var(--font-body); margin:0 0 0 0; color: #000000; font-size: 18px; }

.class-setting-wrap .boundary-box { border: 0; }
.boundary-box {
  -webkit-box-shadow: none;
  box-shadow: none;
}

.class-setting-wrap .category-class-info .category-cont-wrap { padding-top: 0; padding-left: 0; padding-right: 0; }

.class-setting-wrap .setting-category-wrap .info-message { margin-bottom: 8px; }

.class-setting-wrap .category-class-info .des-text {
  margin: 0;
  padding-top: 18px;
  padding-bottom: 24px;
  border-top: 1px solid #EEEEEE;
  font-size: 14px;
  font-weight: 400;
  color: #9E9E9E;
}
.class-setting-wrap .category-class-info .des-text a {
  color: #4267B2;
}

.class-setting-wrap .category-class-info .cont-item .cont-title {
  margin: 0 0 10px 0;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  color: #222222;
}
.avatar-img{
  .hi-ico{
    border:3px solid #ffffff;
    padding: 5px;
  }
}

</style>
