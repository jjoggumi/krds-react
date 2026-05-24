<!--
@File(Method): MainBodyCreateComplete.vue
@Author: -
@Date Created: -
@Description: 신규 학교 추가 신청 완료 모달
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 미사용  MainBodyClassCreatedNew.vue로 변경
-->
<template>
  <div
    class="modal normal-modal add-class-complete-modal"
    style="display:block"
  >
    <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">{{ $t('main.create.complete.title') }}</div>
          </div>

          <div class="after-add-complete-wrap">
            <div class="class-info-wrap">
              <!-- 클래스 대표 사진 -->
              <div class="class-img-wrap" :style="classImagePathStyleObj"></div>
              <div class="class-name-wrap">
                <div class="class-name">
                  {{
                    $stringUtil.shorteningByLength(createdClazzes.className, 63)
                  }}
                </div>
                <div class="class-teacher">
                  {{ user.userName }} {{ $t('main.text.teacher') }}
                </div>
              </div>
            </div>
            <div class="link-wrap">
              <div class="link-item">
                <div class="title setting">
                  <router-link :to="`${createdClazzesURI}/setting`">{{
                    $t('main.create.complete.button.clazz.setting')
                  }}</router-link>
                </div>
                <p>
                  {{ $t('main.create.complete.description.clazz.setting') }}
                </p>
              </div>
              <div class="link-item">
                <div class="title mail">
                  <router-link :to="`${createdClazzesURI}/invite`">{{
                    $t('main.create.complete.button.clazz.invite')
                  }}</router-link>
                </div>
                <p>{{ $t('main.create.complete.description.clazz.invite') }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="modal-close-btn modal-close-icon" @click="closeBtnClick"></div> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainBodyCreateComplete',
  props: {
    isMainBodyCreateComplete: Boolean,
    createdClazzesURI: String,
    createdClazzes: Object,
    classImagePath: String,
    user: Object
  },
  data: () => ({
    clazzesId: '',
    m_height: 0,
    m_width: 0
  }),
  computed: {
    modalStyleObj() {
      const styleObj = {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
      return styleObj
    },
    classImagePathStyleObj() {
      let rtnValue = ''
      const classImagePath = this.classImagePath
      if (
        classImagePath !== undefined &&
        classImagePath !== null &&
        classImagePath !== ''
      ) {
        rtnValue = `background-image:url('${classImagePath}');`
      } else rtnValue = `background-image:url('/files/img/profile_default.png')`
      return rtnValue
    }
  },
  methods: {
    closeBtnClick() {
      // this.$emit("completePopupClose");
      this.$router.push('/main')
    }
  },
  created() {},
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>
<style scoped>
.add-class-complete-modal .after-add-complete-wrap {width:468px;margin:0 auto;}
.add-class-complete-modal .after-add-complete-wrap .class-info-wrap {margin:0 0 30px 0;}
.add-class-complete-modal .link-wrap {padding:0 0 40px 0;text-align:left;}
.add-class-complete-modal .link-wrap .link-item + .link-item {margin:26px 0 0 0;}
.add-class-complete-modal .link-wrap .link-item .title {font-size:13px;}
.add-class-complete-modal .link-wrap .link-item .title:before {content:'';display:inline-block;width:18px;height:18px;margin:0 4px 0 0;vertical-align:middle;}
.add-class-complete-modal .link-wrap .link-item .title.setting:before {background:url('~@/assets/img/icon_add_comp_setting_18.png')}
.add-class-complete-modal .link-wrap .link-item .title.mail:before {background:url('~@/assets/img/icon_add_comp_mail_18.png')}
.add-class-complete-modal .link-wrap .link-item .title:after {content:'';display:inline-block;width:24px;height:24px;background:url('~@/assets/img/icon_comp_arr_24.png');vertical-align:middle;}
.add-class-complete-modal .link-wrap .link-item .title a {display:inline-block;vertical-align:middle;line-height:1.43;transform: skew(0.2deg);font-size: 15px;color: #2e2e2e;}
.add-class-complete-modal .link-wrap .link-item .title:hover a,
.add-class-complete-modal .link-wrap .link-item .title:hover:after {opacity:0.8;}
.add-class-complete-modal .link-wrap .link-item p {padding:0 0 0 22px;color:#888;line-height:1.43;font-size: 14px;transform: skew(0.2deg);}
</style>