<template>
  <div
    class="item"
    :class="{
      on: resource.sheetId === model.sheetId
    }"
    role="button"
    @click="$emit('is-click', resource)"
  >
    <!-- :class="[getSheetApplyTypeObjByCode({code: resource.applyType}).class]" 수정 -->
    <span
      class="label"
      :class="[getDisplayApplyTypeClass(resource)]"
    >
      <!-- {{ getSheetApplyTypeNameByCode({code: resource.applyType}) }} -->
      {{ getDisplayApplyTypeName(resource) }}
    </span>
    <strong class="title">{{ resource.title }}</strong>
    <p class="desc">{{ resource.description }}</p>
    <div class="info">
      <span>{{ resource.insertedTimestamp ? convertTimestampFormat(resource.insertedTimestamp, 'YYYY-MM-DD') : '-' }}</span>
      <span>사용하기 : <span>{{ resource.usedCount || 0 }}회</span></span>
    </div>

    <worksheet-share-list-item-more
      :resource="resource"
      @delete-resource="deleteResource"
    />

  </div>
</template>

<script>
import {mapGetters} from "vuex";
import WorksheetShareListItemMore from '@/components/Popup/WorksheetShareListItemMore'

export default {
  name: "worksheet-share-list-item",
  components: {WorksheetShareListItemMore},
  props: {
    resource: {
      type: Object,
      required: true
    },
    model: {
      type: Object
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      getSheetApplyTypeNameByCode: "getSheetApplyTypeNameByCode",
      getSheetApplyTypeObjByCode: "getSheetApplyTypeObjByCode"
    }),
  },
  methods: {
    // 임시 처리: 제목에 "동의서" 포함된 기타 항목을 "동의서"로 표시 (백엔드 개발 전까지)
    getDisplayApplyTypeName(resource) {
      if (resource.applyType === 'ETC' && (resource.title || '').includes('동의서')) {
        return '동의서'
      }
      return this.getSheetApplyTypeNameByCode({code: resource.applyType})
    },
    // 동의서일 때 consent 클래스 추가
    getDisplayApplyTypeClass(resource) {
      if (resource.applyType === 'ETC' && (resource.title || '').includes('동의서')) {
        return 'consent'
      }
      return this.getSheetApplyTypeObjByCode({code: resource.applyType}).class
    },
    convertTimestampFormat(source, format) {
      return this.$moment(source).format(format) || ''
    },
    async deleteResource(resource) {
      try {
        if (await this.$hiClass.confirm('공유된 양식을 삭제하시겠습니까?', 'warning'))
          await this.deleteResourceProc(resource)

      } catch (err) {
        this.$log.warn(err)
      }
    },
    async deleteResourceProc(resource) {
      const url = `/sheetInfos/${resource.parentId}/${resource.sheetId}`
      try {
        if (await this.$hiClass.sheetInfos.delete(url)) {
          this.$emit('reset-item')
          resource.del = true
          this.$hiClass.alertDelete()

          this.$log.debug(`deleteResourceProc complete !`)
        }
      } catch (err) {
        this.$log.warn(err)
        this.$hiClass.alertError()
      }
    },

  }
}
</script>

<style scoped>

</style>
