<!--
@File(Method): ClassTagEditor.vue
@Date Created: 2025-01-09
@Description: 클래스 태그 관리 모달
@Modify: #69538 클래스 생성 시 유치, 중고등 분류
-->
<template>
  <div>
    <HiModal type="type01" size="sm" @close="$emit('closeClassTagEditor', originalTagNames)">
      <template v-slot:heading>학반(태그) 관리</template>
      <template v-slot:content>
        <div class="item-list">
          <draggable 
              v-if="clazzTags.length > 0"
              tag="ul"
              :value="clazzTags"
              v-bind="dragOptions"
              handle=".draggable-area"
              @start="isDrag = true"
              @end="isDrag = false"
              @change="sortTag"
          >
            <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
              <li v-for="(tag, idx) in clazzTags" :key="tag.tagId" class="draggable-area" @dragstart.prevent>
                <div v-if="editTagId !== tag.tagId" class="view">
                  <HiIcon name="ico-list-move" color="gray" size="20"/>
                  <span>{{ tag.tagName }}</span>
                  <HiButton color="link" size="sm" class="ml-10" @click="changeEditMode(tag)">
                    <HiIcon name="ico-pen" size="18" color="gray" />
                  </HiButton>
                </div>
                <div v-else class="edit">
                  <div class="input-box-wrap">
                    <input
                        :ref="`editTagNameInput-${idx}`"
                        type="text"
                        v-model="tag.tagName"
                        @input="inputTagName(idx, null)"
                        @blur="editTagName(idx)"
                        @keyup.enter="keyupEnterTagName(idx)"
                    />
                  </div>
                </div>
                <HiButton color="link" size="sm" class="p-10" @click="openDeleteConfirm(tag)">
                  <HiIcon name="ico-delete" size="18" color="gray"/>
                </HiButton>
              </li>
            </transition-group>
          </draggable>     
          <ul v-else class="hi-nodata">
            <li>
                <p>등록된 태그가 없습니다.</p>
            </li>
          </ul>
          <div class="add-item">
            <div class="input-box-wrap">
              <input
                  type="text"
                  :value="newTagName"
                  class="add"
                  placeholder="학반(태그)를 입력해주세요."
                  @input="inputTagName(null, $event)"
                  @keyup.enter="addTag"
              />
            </div>
            <HiButton bitrounded size="md" :disabled="!newTagName || isLoading" @click="addTag">추가</HiButton>
          </div>
        </div>
      </template>
    </HiModal>

    <HiModal type="type01" size="xs" v-if="isOpenDeleteConfirm" closeSkip>
      <template v-slot:heading>학반(태그)를 삭제하시겠습니까?</template>
      <template v-slot:content>
        <div class="desc">구성원 목록에서 모두 삭제되며 <br>복원이 불가합니다.</div></template>
      <template v-slot:footer>
        <HiButton color="line-default" size="lg"  @click="closeDeleteConfirm">취소</HiButton>
        <HiButton color="warning" size="lg" @click="deleteTag">확인</HiButton>
      </template>
    </HiModal>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
import {mapMutations, mapState} from "vuex";
const errorManager = useClassErrorManager();

export default {
  name: "class-tag-editor",
  components: {
    draggable
  },
  data() {
    return {
      originalTagNames: '',
      newTagName: '',
      editTagId: '',
      editTagOriginalName: '',
      isOpenDeleteConfirm: false,
      deleteTagId: '',
      dragOptions: {
        animation: 200,
        disabled: false,
        forceFallback: true
      },
      isDrag: false,
      isLoading: false
    }
  },
  props: {
    classId: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('storeClazzTag', [
      'clazzTags'
    ])
  },
  mounted() {
    this.originalTagNames = this.clazzTags.map(t => t.tagName).join('')
  },
  methods: {
    ...mapMutations('storeClazzTag', [
      'setClazzTags',
      'setTagNameByIdx',
      'addClazzTags',
      'removeTagByIdx'
    ]),
    ...mapMutations(['setIsDimLoading']),
    inputTagName(idx, e) {
      if (idx !== null) {
        this.setTagNameByIdx(
            { idx, tagName: this.replaceTagName(this.clazzTags[idx].tagName) }
        )
      } else {
        this.newTagName = this.replaceTagName(e.target.value)
        e.target.value = this.newTagName
      }
    },
    replaceTagName(tagName) {
      return tagName.replaceAll(/[^0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\-_/&,.()]/g, '').substring(0, 10)
    },
    validTagName(tagName, idx) {
      const regEx = /[ㄱ-ㅎㅏ-ㅣ]/g
      if (regEx.test(tagName)) {
        this.$toasted.show('등록 불가한 태그입니다.')
        return false
      } else {
        const duplicateList = idx !== null ?
            this.clazzTags.filter((tag, i) => tag.tagName === tagName && i !== idx) :
            this.clazzTags.filter(tag => tag.tagName === tagName)
        if (duplicateList.length > 0) {
          this.$toasted.show('중복된 태그입니다.')
          return false
        }
      }
      return true
    },
    async addTag() {
      if (!this.newTagName || !this.validTagName(this.newTagName, null)) return false

      try {
        this.isLoading = true
        const res = await this.$axios.post(`/clazzes/${this.classId}/tags`, { tagName: this.newTagName })
        this.addClazzTags(res.data)
        this.newTagName = ''
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      } finally {
        this.editTagId = ''
        this.editTagOriginalName = ''
        this.isLoading = false
      }
    },
    changeEditMode({ tagId, tagName }) {
      this.editTagId = tagId
      this.editTagOriginalName = tagName
    },
    keyupEnterTagName(idx) {
      this.$refs[`editTagNameInput-${idx}`][0].blur()
    },
    async editTagName(idx) {
      if (this.editTagOriginalName === this.clazzTags[idx].tagName) {
        this.resetEditTag()
        return
      }
      
      if (!this.validTagName(this.clazzTags[idx].tagName, idx)) {
        this.setTagNameByIdx({ idx, tagName: this.editTagOriginalName })
        this.resetEditTag()
        return
      }

      try {
        await this.$axios.patch(`/clazzes/${this.classId}/tags/${this.editTagId}/name`,  {
          tagName: this.clazzTags[idx].tagName
        })
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      } finally {
        this.resetEditTag()
      }
    },
    resetEditTag() {
      this.editTagId = ''
      this.editTagOriginalName = ''
    },
    openDeleteConfirm({ tagId }) {
      this.isOpenDeleteConfirm = true
      this.deleteTagId = tagId
    },
    closeDeleteConfirm() {
      this.isOpenDeleteConfirm = false
      this.deleteTagId = ''
    },
    async deleteTag() {
      try {
        this.setIsDimLoading(true)
        await this.$axios.delete(`/clazzes/${this.classId}/tags/${this.deleteTagId}`)
        const targetIdx = this.clazzTags.findIndex(tag => tag.tagId === this.deleteTagId)
        if (targetIdx > -1) this.removeTagByIdx(targetIdx)
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      } finally {
        this.setIsDimLoading(false)
        this.closeDeleteConfirm()
      }
    },
    async sortTag(e) {
      if (!e.moved && !e.moved.element && !e.moved.newIndex) return
      const tagId = e.moved.element.tagId
      const sortNo = e.moved.newIndex + 1

      try {
        const res = await this.$axios.patch(`/clazzes/${this.classId}/tags/sorting`,  { sortNo, tagId })
        if (res.data._embedded && res.data._embedded.clazzTags.length > 0) {
          this.setClazzTags(res.data._embedded.clazzTags)
        }
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.item-list > ul {
  max-height: 438px;
  height: 438px;
  li{
    padding:0;
    display:flex;
    align-items:center;
    justify-content:space-between;
    min-height: 55px;
    background: #fff;
    &.sortable-drag{
      border-radius: 4px;
      opacity: 1!important; ;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    }
    div.view{
      padding:11px 0 11px 5px;
      display: flex;
      align-items: center;
      flex-grow: 1;
      span{margin-left:5px;}
      button{display:none;}
      &:hover button{display:block;}
    }
    div.edit{
      padding:8px 0 8px 10px;
      width: 100%;
    }
    button:hover i::after{
      background-color: #666 !important
    }
    .delete{
      margin-left:5px;
    }
  }
}
.hi-nodata{
  height: 100%;
  justify-content: center;
  > li{border:0;
    &:hover{
      background-color:transparent;
    }
  }
}
.add-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:10px 0;
  gap:10px;
  .input-box-wrap{
    width: 100%;
    height: 40px;
  }
  .add{
    width:100%;
  }
}
</style>