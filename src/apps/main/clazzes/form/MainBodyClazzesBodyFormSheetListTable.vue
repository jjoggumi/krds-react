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
      <!-- <td><p class="skew">{{ getSheetApplyTypeNameByCode({code: resource.applyType}) }}</p></td> -->
      <td><p class="skew">{{ getDisplayApplyTypeName(resource) }}</p></td>

      <td
        :role="isResourceSheetTypeW(resource.sheetType) ? 'button' : ''"
        @click="onClickPreview(resource)"
      >
        <p class="title">
          <strong>{{ resource.title }}</strong>
          <span
              v-if="['FIELD_STUDY', 'MEDICATION_ORDER'].includes(resource.applyType) && isResourceSheetTypeH(resource.sheetType)"
              class="fieldStudyNew"
          >
            {{ resource.applyType === 'FIELD_STUDY' ? '반일 신청 양식 추가' : '간편 제출 양식 추가' }}
          </span>
        </p>
        <p class="desc">{{ resource.description }}</p>
      </td>

      <td
        v-if="isResourceDefaultType(resource)"
        :key="`${resource.sheetId}-${resource.sheetType}-title`"
      >
        <p class="skew">{{ '-' }}</p>
        <p class="skew">{{ '하이클래스' }}</p>
      </td>
      <td
        v-else-if="isResourceSheetTypeW(resource.sheetType)"
        :key="`${resource.sheetId}-${resource.sheetType}-title`"
      >
        <p class="skew">{{ resource.insertedTimestamp ? convertTimestampFormat(resource.insertedTimestamp, 'YYYY.MM.DD') : '-' }}</p>
        <p class="skew">{{ resource.insertedUser ? resource.insertedUser.userName + ' ' + getUserTypeNameByCode({code: resource.insertedUser.userType}) : '-' }}</p>
      </td>

      <td v-if="resource.sheetStatus === 'TEMP'">
        <p class="skew">{{ '-' }}</p>
      </td>
      <td v-else>
        <div class="checkbox-wrap">
          <input
            type="checkbox"
            :id="`${resource.sheetId}-${resource.sheetType}-checkbox-1`"
            :name="`${resource.sheetId}-${resource.sheetType}-checkbox`"
            :class="{
              dis: resource.sheetStatus !== 'USED'
            }"
            :disabled="resource.sheetStatus !== 'USED'"
            v-model="resource.studentUsed"
            @change="toggleSheetUsedByType({
              resource: resource,
              type: 'studentUsed',
              value: resource.studentUsed
            })"
          >
          <label :for="`${resource.sheetId}-${resource.sheetType}-checkbox-1`">
            <span>학생</span>
          </label>
          <input
            type="checkbox"
            :id="`${resource.sheetId}-${resource.sheetType}-checkbox-2`"
            :name="`${resource.sheetId}-${resource.sheetType}-checkbox`"
            :class="{
              dis: resource.sheetStatus !== 'USED'
            }"
            :disabled="resource.sheetStatus !== 'USED'"
            v-model="resource.parentUsed"
            @change="toggleSheetUsedByType({
              resource: resource,
              type: 'parentUsed',
              value: resource.parentUsed
            })"
          >
          <label :for="`${resource.sheetId}-${resource.sheetType}-checkbox-2`">
            <span>학부모</span>
          </label>

        </div>
      </td>

      <td v-if="resource.sheetStatus === 'TEMP'">
        <p
          class="skew"
          :class="[getSheetStatusClassByCode({code: resource.sheetStatus})]"
        >{{ getSheetStatusNameByCode({code: resource.sheetStatus}) }}</p>
      </td>
      <td v-else>
        <button
          class="btn-switch"
          :class="{
            on: resource.sheetStatus === 'USED',
            dis: !isUseSheetStatus(resource)
          }"
          :disabled="!isUseSheetStatus(resource)"
          @click="toggleSheetStatus(resource)"
        ></button>
      </td>

      <td
        v-if="isResourceSheetTypeH(resource.sheetType)"
        :key="`${resource.sheetId}-${resource.sheetType}-sheet-more`"
      >
        <p class="skew">{{ '-' }}</p>
<!--        <main-body-clazzes-body-form-sheet-more
          :isManager="isManager"
          :resource="resource"
          @create-resource="$emit('create-resource', resource)"
        />-->
      </td>
      <td
        v-else-if="isResourceSheetTypeW(resource.sheetType)"
        :key="`${resource.sheetId}-${resource.sheetType}-sheet-more`"
      >
        <main-body-clazzes-body-form-sheet-more
          :isManager="isManager"
          :resource="resource"
          @edit-sheet="$emit('edit-sheet', resource)"
          @copy-sheet="$emit('copy-sheet', resource)"
          @delete-sheet="$emit('delete-sheet', resource)"
          @download-sheet="$emit('download-sheet', resource)"
          @create-resource="$emit('create-resource', resource)"
          @share-sheet="$emit('share-sheet', resource)"
          @share-sheet-other-school="$emit('share-sheet-other-school', resource)"
        />
      </td>

    </tr>

  </fragment>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import MainBodyClazzesBodyFormSheetMore from '@/apps/main/clazzes/form/MainBodyClazzesBodyFormSheetMore'

export default {
  name: "main-body-clazzes-body-form-sheet-list-table",
  components: {MainBodyClazzesBodyFormSheetMore},
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
  },

  methods: {
    ...mapActions({
      toggleSheetStatus: 'toggleSheetStatus',
      toggleSheetUsedByType: 'toggleSheetUsedByType',
    }),
    // 임시 처리: 제목에 "동의서" 포함된 기타 항목을 "동의서"로 표시 (백엔드 개발 전까지)
    getDisplayApplyTypeName(resource) {
      if (resource.applyType === 'ETC' && (resource.title || '').includes('동의서')) {
        return '동의서'
      }
      return this.getSheetApplyTypeNameByCode({code: resource.applyType})
    },
    isResourceDefaultType(resource) {
      return resource.sheetType === 'H' || (resource.sheetType === 'W' && (resource.isDefault || false))
    },
    isResourceSheetTypeH(sheetType) {
      return sheetType === 'H'
    },
    isResourceSheetTypeW(sheetType) {
      return sheetType === 'W'
    },

    isUseSheetStatus(resource) {
      return resource.sheetStatus === 'USED' ||
        resource.sheetStatus === 'NOT_USED'
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

  },


  mounted() {
  }
}
</script>

<style scoped>

</style>