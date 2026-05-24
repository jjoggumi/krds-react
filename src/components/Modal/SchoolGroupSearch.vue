<!--
@File(Method): SchoolGroupSearch.vue
@Date Created: 2026-02-24
@Description: 학교/단체 검색 모달
@Modify: #84443 클래스 설정 > 학교/단체 변경 안되는 현상
-->
<template>
  <HiModal class="school-group-search" type="type01" size="md" @close="$emit('close')">
    <template v-slot:heading>
      학교/단체 변경
    </template>
    <template v-slot:content>
      <div class="page-create-class">
        <div class="create-class-cont-wrap">
          <p class="desc">
            클래스에 등록된 학교/단체를 변경하실 수 있습니다.<br>
            <span class="txt-warning">
                학교/단체 변경 시 클래스 구성원의 학교 구독 정보가 전체 변경됩니다.
            </span>
          </p>
          <div class="cont-item">            
            <div class="cont-title">
              학교/단체 검색 <span class="txt-warning">*</span>
            </div>
            <HiSearchBox
              :value="schoolName"
              :placeholder="$t('main.create.description.school')"
              :maxlength="50"
              :rounded="false"
              :size="'md'"
              :isInputFocused="true"
              @input="onInputSchoolName"
              @search="getSchools(true)"
              autoSearch
              class="w100"
              inputClass="w100"
            />
            <div
              class="search-result-wrap boundary-box no-result"
              :class="{ on: isSchoolSearch }"
            >
              <ul
                v-show="schoolData.length > 0"
                v-infinite-scroll="getSchools"
                :infinite-scroll-disabled="paging.isBusy"
                :infinite-scroll-distance="paging.scrollLimit"
                ref="schoolScrollArea"
                class="custom-scr"
              >
                <li
                  v-for="school in schoolData"
                  :key="school.currentId"
                  @click="selectSchool(school)"
                >
                  <div v-show="school.schoolName.length > 1">
                    <div class="school-image">
                      <img v-if="school.schoolImagePath" :src="school.schoolImagePath" alt="">
                    </div>
                    <div class="school-name">{{ school.schoolName }}</div>
                    <div class="school-address">{{ getSchoolAddress(school) }}</div>
                  </div>
                </li>
              </ul>    
              <div class="hi-nodata sm p-40" v-show="schoolData.length === 0" >
                <p>검색결과가 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>    
    <template v-slot:footer>
      <HiButton color="line-default" size="lg" @click="$emit('close', {})">취소</HiButton>
      <HiButton color="primary" size="lg" :disabled="!resource.currentId" @click="saveSchoolGroup">저장</HiButton>
    </template>
  </HiModal>
</template>

<script>
export default {
  name: "school-group-search",
  props: ['user', 'classSchoolType'],
  data() {
    return {
      isSelectSchool: false,
      isSchoolSearch: false,
      schoolName: '',
      schoolData: [],
      timer: null,
      paging: {
        isBusy: false,
        isListEnd: false,
        curPage: process.env.VUE_APP_BASE_PAGE_START,
        scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
        curSize: process.env.VUE_APP_BASE_PAGE_SIZE
      },
      resource: {}
    }
  },
  methods: {
    getSchoolAddress(school) {
      return school.schoolAddress || ''
    },
    selectSchool(school) {
      this.isSelectSchool = true
      this.schoolName = school.schoolName
      this.resource = school
      if (this.timer !== null) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.isSchoolSearch = false
      }, 100)
    },
    removeSchoolName() {
      this.schoolName = ''
      this.isSchoolSearch = false
      this.isSelectSchool = false
    },
    initSchoolSearch() {
      this.schoolData = []
      this.paging = {
        isBusy: false,
        isListEnd: false,
        curPage: process.env.VUE_APP_BASE_PAGE_START,
        scrollLimit: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
        curSize: process.env.VUE_APP_BASE_PAGE_SIZE
      }
    },
    async getSchools(initFlag) {
      if (initFlag) {
        this.initSchoolSearch()
      }

      if (!this.paging.isListEnd && !this.paging.isBusy) {
        if (this.schoolName.trim().length > 1) {
          let params = {
            _schoolName: this.schoolName.trim(),
            _schoolType: this.classSchoolType,
            page: this.paging.curPage,
            size: this.paging.curSize,
            sort: 'schoolName,asc'
          }
          this.paging.isBusy = true

          try {
            const res = await this.$axios.post('/schools/searchWithTypeExpansion', null, { params })

            this.paging.curPage++
            this.paging.isListEnd = !(res.data.page.totalElements > this.schoolData.length)

            if (res.data.page.totalElements > 0) {
              let schools = res.data._embedded.schools
              let newSchools = [
                ...schools.filter(school => school.schoolName.startsWith(this.schoolName.trim())),
                ...schools.filter(school => !school.schoolName.startsWith(this.schoolName.trim()))
              ]
              this.schoolData.push(...newSchools)
            }

            this.isSchoolSearch = true
          } finally {
            this.paging.isBusy = false
          }
        }
      }
    },
    onInputSchoolName(value) {
      this.schoolName = value;
      if (!this.schoolName.trim()) {
        this.resource = {};
        this.removeSchoolName();
        this.$refs.schoolScrollArea.scrollTo({ top: 0 });
      }
    },
    saveSchoolGroup() {
      this.$hiClass.confirm('변경사항을 저장하시겠습니까?', null, { reverseButtons: true })
          .then(() => this.$emit('close', this.resource))
          .catch(() => {})
    }
  },
}
</script>

<style scoped lang="scss">
.page-create-class{height: 380px;}
.page-create-class .create-class-cont-wrap .cont-item{margin-top:30px;}
.page-create-class .create-class-cont-wrap .cont-item .cont-title{text-align: left;font-size:15px; font-weight: 500;}
.page-create-class .create-class-cont-wrap .cont-item .search-result-wrap{top: 70px;padding: 0;text-align: left;}
</style>