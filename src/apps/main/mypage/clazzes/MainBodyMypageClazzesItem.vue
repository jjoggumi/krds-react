<!--
@File(Method):MainBodyMypageClazzesItem.vue
@Description: 마이페이지 > 나의 클래스 > 아이템
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div
    v-if="item.classStatus !== 'CLOSED'"
    class="thumbnail-box boundary-box"
    :class="setClass()"
  >
  <!-- // 클래스 관리자일 경우 추가 -->  
  <HiAvatar 
    @click="onClickClazzes"           
    type="class"
    size="lg" 
    outline
    :img="item.classImagePath ? item.classImagePath : null"
    :style="setDeactivateStyle()"
  >
    <template v-slot:badge>
      <HiIcon v-if="$hiClass.isManager(item)"
        name="ico-crown-fill" color="white" bgColor="noti" rounded="rounded" class="top-left" outline
    ></HiIcon>
    </template>
  </HiAvatar>
  <!-- 
    <span v-if="$hiClass.isManager(item)" class="class-administrator"
      >administrator</span
    >
    <div
      class="thumbnail-wrap"
      :style="setImagePathStyle()"
      @click="onClickClazzes"
    ></div>
    -->
    <div class="title-wrap" @click="onClickClazzes">
      <div class="title">
        {{
          $stringUtil.shorteningByLength(
            getClazzNamePrefix(item.classStatus) + item.className,
            40
          )
        }}
      </div>
      <p>
        <!-- prettier-ignore -->
        <template v-if="item.classYear !== 'ANY'">{{ item.classYear }} / </template>
        {{ item.classOwnerName || '' + ' ' + $t('main.text.teacher') }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainBodyMypageClazzesItem',
  props: {
    item: Object
  },
  methods: {
    setImagePathStyle() {
      let imagePath = this.item.classImagePath
      let rtnValue = ''
      const size = '90'
      if (imagePath !== undefined && imagePath !== null && imagePath !== '') {
        imagePath = imagePath + `?width=${size}&height=${size}`
        rtnValue =
          `background-image: url('${imagePath}');` +
          `background-size: ${size}px ${size}px;`
        rtnValue += this.setDeactivateStyle()
      }

      return rtnValue
    },
    setClass() {
      let rtnValue = ''
      let classStatus = this.item.classStatus
      if (classStatus === 'DEACTIVATE' || classStatus === 'CLOSING')
        rtnValue = `tumbnail-box-disalbe`
      return rtnValue
    },
    onClickClazzes() {
      this.$router.push('/main/clazzes/' + this.item.classId)
    },
    isActivateClass() {
      let classStatus = this.item.classStatus

      if (classStatus === 'ACTIVATE') return true
      else return false
    },
    getClazzNamePrefix() {
      if (!this.isActivateClass()) return '미 운영 · '
      else return ''
    },
    setDeactivateStyle() {
      if (!this.isActivateClass()) return 'opacity: 0.5'
      else return ''
    }
  }
}
</script>

<style scoped lang="scss">
.thumbnail-wrap:hover,
.title-wrap:hover {
  cursor: pointer;
}
.title-wrap:hover , .tumbnail-box-disalbe .class-administrator{
    opacity: 0.5;
}
.avatar-img.lg{
  margin-top: -20px;
  i.hi-ico{
    padding: 1px;
    width: 22px;
    height: 22px;
  }  
}
</style>
