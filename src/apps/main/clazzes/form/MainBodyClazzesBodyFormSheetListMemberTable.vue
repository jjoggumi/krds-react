<!--
@File(Method): MainBodyClazzesBodyFormSheetListMemberTable.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 학교양식 신청서 > 사용중인 양식 탭 > 리스트 (tbody 영역) 
@Modified: 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가
-->

<template>
  <fragment>

    <!-- sheetType H: 하이클래스 기본 양식 -->
    <!-- sheetType W: 선생님이 추가한 양식 -->
    <tr
      v-for="(resource, index) of resourceList"
      :key="`${resource.sheetId}-${index}-${resource.sheetType}`"
      :class="{
        disabled: isResourceSheetTypeH(resource.sheetType)
      }"
    >

      <td
        :role="isResourceSheetTypeW(resource.sheetType) ? 'button' : ''"
        @click="onClickResourceTitle(resource)"
      >
        <p class="title">
          <!-- #71977 학교양식신청서 및 설문 > 학반(태그) 추가 유형 제목 통합 -->
          <!-- <strong><span class="txt-primary">[{{ getSheetApplyTypeNameByCode({code: resource.applyType}) }}]</span>&nbsp;{{ resource.title }}</strong> -->
          <strong><span class="txt-primary">[{{ getDisplayApplyTypeName(resource) }}]</span>&nbsp;{{ resource.title }}</strong>
          <span
              v-if="['FIELD_STUDY', 'MEDICATION_ORDER'].includes(resource.applyType) && isResourceSheetTypeH(resource.sheetType)"
              class="fieldStudyNew"
          >
            {{ resource.applyType === 'FIELD_STUDY' ? '반일 신청 양식 추가' : '간편 제출 양식 추가' }}
          </span>
        </p>
        <p class="desc">{{ resource.description }}</p>
      </td>

      <td><p class="skew">{{ resource.usedUserStr }}</p></td>

      <td>
        <button
            v-if="isResourceSheetTypeW(resource.sheetType)"
            class="btn-gray btn-download"
            @click="$emit('download-sheet', resource)"
        >
          신청서 다운
        </button>
        <p v-else class="skew">{{ '-' }}</p>
      </td>
      <td>
        <button class="btn-gray btn-hitalkshare" @click="controlHitalkShareModal(true, resource)">하이톡 공유</button>
      </td>
      <td>
        <button
          v-if="isAllowAccessResource(resource)"
          class="btn-bg-w2"
          @click="$emit('create-resource', resource)"
        >
          작성하기
        </button>
        <p
          v-else
          class="skew"
        >
          {{ '-' }}
        </p>
      </td>
    </tr>

    <!-- 하이톡 공유하기 모달 -->
    <hitalk-share-modal
        v-if="hitalkShareIsOpen"
        :post="post"
        :postType="postType"
        :shareBtnType="shareBtnType"
        @controlHitalkShareModal="controlHitalkShareModal"
    >
    </hitalk-share-modal>

  </fragment>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex'
import HitalkShareModal from "@/components/HitalkShare/HitalkShareModal";

export default {
  name: "main-body-clazzes-body-form-sheet-list-member-table",
  components: {HitalkShareModal},
  data() {
    return {
      shareBtnType: 'sheet',
      hitalkShareIsOpen: false,
      postType: 'SHEET',
      post: {}
    }
  },
  props: {
    isManager: {
      type: Boolean,
      default() {
        return false
      },
    },
    resourceList: {
      type: Array,
      default() {
        return []
      }
    },
    resources: {
      type: Object
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getSheetApplyTypeNameByCode: "getSheetApplyTypeNameByCode",
      getUserTypeNameByCode: "getUserTypeNameByCode",
      getSheetStatusNameByCode: "getSheetStatusNameByCode",
      getSheetStatusClassByCode: "getSheetStatusClassByCode",
    }),
    isLoginMemberStudent() {
      return this.$store.state.user.userType === 'STUDENT'
    },
    isLoginMemberParents() {
      return this.$store.state.user.userType === 'PARENTS' ||
        this.$store.state.user.userType === 'TEACHER'
    },

  },

  methods: {
    ...mapActions('storeHitalk', {
      connectStompClient:'connectStompClient',
      disconnectStompClient: 'disconnectStompClient',
      callChatUserList: 'callChatUserList',
      callChatRooms: 'callChatRooms'
    }),
    // 임시 처리: 제목에 "동의서" 포함된 기타 항목을 "동의서"로 표시 (백엔드 개발 전까지)
    getDisplayApplyTypeName(resource) {
      if (resource.applyType === 'ETC' && (resource.title || '').includes('동의서')) {
        return '동의서'
      }
      return this.getSheetApplyTypeNameByCode({code: resource.applyType})
    },
    isResourceSheetTypeH(sheetType) {
      return sheetType === 'H'
    },
    isResourceSheetTypeW(sheetType) {
      return sheetType === 'W'
    },
    isAllowAccessResource(resource) {
      return !!(this.isManager
        || this.isLoginMemberStudent && resource.studentUsed
        || this.isLoginMemberParents && resource.parentUsed
      )
    },

    onClickResourceTitle(resource) {
      if(this.isManager) {
        this.onClickPreview(resource);
      } else {
        this.$emit('create-resource', resource)
      }
    },

    onClickPreview(resource) {
      switch (resource.sheetType) {
        case 'W': {
          const sheetId = resource.sheetId
          const parentId = resource.parentId
          window.open(
            `/worksheets/${parentId}/${sheetId}/preview`,
            'worksheetPreview',
            `height=${screen.availHeight -
            this.$store.state
              .TASKBAR_HEIGHT},width=${screen.availWidth -
            this.$store.state
              .NOTEBOARD_MARGIN_WIDTH},top=0,left=0,resizable,scrollbars=1`
          )
          break
        }

      }
    },

    convertTimestampFormat(source, format) {
      return this.$moment(source).format(format) || ''
    },

    getElementNumber(curIndex) {
      return this.resources.page.totalElements - curIndex
    },

    async controlHitalkShareModal(flag, resource) {
      this.post = resource

      if (flag) {
        await this.connectStompClient()
        await this.callChatUserList()
        await this.callChatRooms({ force: true })

        this.hitalkShareIsOpen = flag

      } else {
        await this.disconnectStompClient()
        this.hitalkShareIsOpen = flag
      }
    }

  },

  // mounted() {
  //   // console.log("resourceList", this.resourceList)
  // }
}
</script>

<style scoped>

</style>