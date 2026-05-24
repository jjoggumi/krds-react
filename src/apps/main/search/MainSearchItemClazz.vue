<template>
  <li>
    <div class="inner">
      <div class="school-class-name-wrap">
        <a
          href="javascript:void(0)"
          @click="goRouteClazzes(itemObj._links.self.href)"
          :style="setDefaultCursorStyle"
        >
          <!-- backgound-img -->
          <div
            class="school-class-img-wrap"
            :style="classImagePathStyleObj"
          ></div>
          <div
            class="school-class-name"
            v-html="
              insertToSpan(itemObj.className, itemObj.classSubscribeCount)
            "
          >
            <!-- 지역구 (api없음) -->
          </div>
          <span
            v-if="itemObj.classSubscribeCount > 0"
            class="student-count"
          >
            구성원 {{ itemObj.classSubscribeCount }}명
          </span>
          <div
            class="teacher-info"
            v-html="insertToSpan(maskedClassOwnerName)"
          ></div>
        </a>
      </div>
      <div class="school-class-etc-wrap">
        <p class="txt-myclass" v-if="classSubscribeStatus === 'ACCEPT'">
          내 클래스
        </p>
        <button
          :class="{
            'btn-bg-w': classSubscribeStatus === 'APPLY',
            'btn-bg-c': classSubscribeStatus !== 'APPLY'
          }"
          @click="goReqJoin(itemObj._links.self.href)"
          v-else-if="!isTempStudent"
        >
          {{ joinBtnTxt }}
        </button>
      </div>
    </div>
  </li>
</template>

<script>
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: 'MainSearchItemClazz',
  data: () => ({
    classSubscribeStatus: ''
  }),
  props: ['itemObj', 'showBytab', 'index', 'isTempStudent'],
  computed: {
    setDefaultCursorStyle() {
      if (this.classSubscribeStatus !== 'ACCEPT') return 'cursor:default'
      else return ''
    },
    classImagePathStyleObj() {
      let rtnValue = ''
      let defaultImagePath = EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
      let classImagePath = this.itemObj.classImagePath
      const size = '66'
      if (
        classImagePath !== undefined &&
        classImagePath !== null &&
        classImagePath !== ''
      ) {
        classImagePath = classImagePath + `?width=${size}&height=${size}`
        rtnValue =
          `background: no-repeat center/100% url('${classImagePath}');` +
          `background-size: ${size}px ${size}px;`
      } else
        rtnValue = `background: no-repeat center/100% url('${defaultImagePath}')`
      return rtnValue
    },
    classOwnerName() {
      if (
        this.itemObj.classOwner !== undefined &&
        this.itemObj.classOwner !== null &&
        this.itemObj.classOwner.userName !== undefined &&
        this.itemObj.classOwner.userName !== null
      ) {
        return this.itemObj.classOwner.userName
      } else {
        return ''
      }
    },
    maskedClassOwnerName() {
      let strName = this.classOwnerName

      // 문자열 검색해서 중간 글자 *로 만들기
      // 2글자면 마지막 글자만
      if (strName.length > 2) {
        let originName = strName.split('')
        originName.forEach(function(name, i) {
          if (i === 0 || i === originName.length - 1) return
          originName[i] = '*'
        })
        const joinName = originName.join()
        return joinName.replace(/,/g, '')
      } else {
        const pattern = /.$/ // 정규식
        return strName.replace(pattern, '*')
      }
    },
    joinBtnTxt() {
      if (this.classSubscribeStatus === 'APPLY') {
        return '가입 요청 중'
      } else if (this.classSubscribeStatus === 'ACCEPT') {
        return '구독중'
        // } else if (this.classSubscribeStatus === "DENIAL") {
        //   return "승인거절됨";
      } else {
        return '가입'
      }
    },
    isDisabledBtn() {
      return this.classSubscribeStatus === 'APPLY';
    }
  },
  watch: {
    '$store.state.clazzSubscribeViews': function(value, oldValue) {
      let isChanged = false

      if (value !== oldValue) isChanged = true
      if (isChanged) {
        this.checkUserClassSubscribed()
      }
    }
  },
  methods: {
    goReqJoin(clazzesKey) {
      this.$parent.goReqJoin(clazzesKey, this.index)
    },
    goRouteClazzes(clazzesKey) {
      if (this.classSubscribeStatus !== 'ACCEPT') {
        return false
      }
      const clazzUuid = this.$comn.split(clazzesKey, '/')
      this.$router.push(`/main/clazzes/${clazzUuid}`)
    },
    insertToSpan(resStr, cnt) {
      let keyword = this.$route.query.searchKeyword

      if (cnt === undefined) {
        if (
          this.showBytab === 2 &&
          resStr !== undefined &&
          resStr.includes(keyword)
        ) {
          resStr = this.$stringUtil.replaceAll(
            resStr,
            keyword,
            '<span>' + keyword + '</span>'
          )
        }
        const tmpStr = ' 선생님'
        const classYearStr = this.itemObj.classYear.includes('ANY')
          ? ''
          : ` / ${this.itemObj.classYear}`

        return resStr + tmpStr + classYearStr
      } else {
        if (
          this.showBytab === 0 &&
          resStr !== undefined &&
          resStr.includes(keyword)
        ) {
          resStr = this.$stringUtil.replaceAll(
            resStr,
            keyword,
            '<span>' + keyword + '</span>'
          )
        }
        return resStr
      }
    },
    checkUserClassSubscribed() {
      const clazzUrl = this.itemObj._links.self.href
      this.classSubscribeStatus = ''
      let filteredList = this.$store.state.clazzSubscribeViews.filter(d => {
        return clazzUrl.includes(d.classId)
      })
      if (filteredList.length > 0)
        this.classSubscribeStatus = filteredList[0].memberStatus
    }
  },
  mounted() {
    this.checkUserClassSubscribed()
  }
}
</script>

<style scoped>
.txt-myclass {
  font-size: 15px;
  color: #3867c6;
  margin: 0 0 0 25px;
  font-weight: 500;
}
</style>
