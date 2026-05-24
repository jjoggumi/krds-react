<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="tagListModal"
      style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <!-- <div class="modal-cont-inner"
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco"> -->
        <div class="modal-cont-inner">
          <div class="behavior-modal-tag-list">
            <div class="title-wrap">
              <h2>태그 관리</h2>
            </div>
            <div class="list">
              <template v-if="tags.length > 0">
                <ul>
                  <li v-for="tag of tags" :key="`tag-list-${tag.tagId}`"
                    :class="{
                      new: addNewTagId === tag.tagId
                    }"
                  >
                    <template v-if="tag.selected === true">
                      <input type="text" maxlength="6" v-model="tag.tagName" @blur="updateTag(tag)" @input="inputValidateCheck" @keydown="inputValidateCheck" @keyup="inputValidateCheck" />
                    </template>

                    <template v-else>
                      <span class="name cursor-pointer" @click="openTagEdit(tag)">{{ tag.tagName }}</span>
                    </template>
                    <div>
                      <p @click="deleteTag(tag)">
                        <span class="delete bh-icon-delete-20 cursor-pointer"></span>
                      </p>
                    </div>
                  </li>
                </ul>
              </template>

              <template v-else>
                <div class="nodata">
                  <i class="bh-icon-warning-circle-fill-52"></i>
                  <span>등록된 태그가 없습니다.</span>
                </div>
              </template>
            </div>

            <div class="btn-wrap">
              <input type="text" maxlength="6" v-model="tagName" placeholder="태그를 입력해주세요"  @input="inputValidateCheck" @keydown="inputValidateCheck" @keyup="inputValidateCheck" />
              <button 
                @click="submit"
                :disabled="isSubmit === false"
                :class="{
                  dis: isSubmit === false
                }">추가</button>
            </div>
            <div class="modal-close-btn" @click="close"></div>
          </div>
        </div>
      </div>
    </div>

    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      :isAlert="confirmModal.isAlert"
      @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>

<script>
import {mapState} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'

export default {
  name: 'tag-list-modal',
  components: {
    ConfirmModal
  },
  props: {
  },
  data() {
    return {
      tags: [],
      tagName: "",
      addNewTagId: "",
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        action: '',
        target: null,
        isAlert: false
      },
    }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
    }),
    isSubmit() {
      return this.tagName.trim() !== ""
    }
  },
  methods:{
    close: function() {
      this.$emit('close')
    },
    getTags: async function() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/classroom/${this.curClassroom.classroomId}/tags`,
          params: {
            userId : this.userId()
          }
        })

        if(res.data._embedded) {

          this.tags = res.data._embedded.classroomTags
          this.tags = this.tags.map(item => {
            return {
              ...item,
              selected: false
            }
          })

          // console.log("this.searchStudents", this.searchStudents)
        }
      } catch (err) {
        this.$log.debug('classroom tags GET() error => ', err)
      }
    },
    openTagEdit: function(item) {
      item.selected = true
    },
    updateTag: async function(item) {
      item.selected = false

      try {
        const res = await this.$axios({
          method: 'PATCH',
          url: `/classroom/${this.curClassroom.classroomId}/tag/${item.tagId}`,
          data: {
            userId : this.userId(),
            tagName : item.tagName
          }
        })

        // if(res) {
        //   this.getTags()
        // }
      } catch (err) {
        this.$log.debug('classroom tag PATCH() error => ', err)
      }
    },
    deleteTag: async function(item, confirm = null) {
      if(confirm === null) {
        this.confirmModal.isOpen = true
        this.confirmModal.title = `태그를 삭제하시겠습니까?`
        this.confirmModal.description = "해당 태그가 포함된 모든 기록에서 삭제되며<br/>복원이 불가합니다."
        this.confirmModal.confirmButtonText = '확인'
        this.confirmModal.confirmButtonColor = '#F04F59'
        this.confirmModal.action = "delete"
        this.confirmModal.target = item
        this.confirmModal.isAlert = false
      } else if (confirm === "ok") {
        try {
          const res = await this.$axios({
            method: 'DELETE',
            url: `/classroom/${this.curClassroom.classroomId}/tag/${item.tagId}`,
            params: {
              userId : this.userId()
            }
          })

          if(res) {
            this.getTags()
          }
        } catch (err) {
          this.$log.debug('classroom tags DELETE() error => ', err)
        }
      }
    },
    submit: async function() {
      const pattern = /([^A-Za-z0-9가-힣\s])/i

      if(pattern.test(this.tagName) === true) {
        this.confirmModal.isOpen = true
        this.confirmModal.title = `등록 불가한 태그입니다.`
        this.confirmModal.description = ""
        this.confirmModal.confirmButtonText = '확인'
        this.confirmModal.confirmButtonColor = ''
        this.confirmModal.action = ""
        this.confirmModal.isAlert = true
        this.confirmModal.target = null
        return
      }

      try {
        const res = await this.$axios({
          method: 'POST',
          url: `/classroom/${this.curClassroom.classroomId}/tags`,
          data: {
            userId : this.userId(),
            tagName : this.tagName
          }
        })

        if(res) {
          this.tagName = ""
          this.addNewTagId = res.data.tagId
          this.getTags()
        }
      } catch (err) {
        this.$log.debug('classroom tags POST() error => ', err)
      }
    },
    inputValidateCheck: function(e) {
      e.target.value = e.target.value.substr(0, 6)
      e.target.value = e.target.value.replace(/\s| /gi,'');
      e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '')
    },
    userId() {
      return localStorage.uuid
    },
    closeConfirmModal(isConfirm) {
      if(isConfirm === true) {
        switch(this.confirmModal.action) {
          case 'delete' :
            this.deleteTag(this.confirmModal.target, 'ok')
            break;
        }
      }
      this.confirmModal.isOpen = false
    },
  },
  async created() {},
  mounted() {
    this.getTags()
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 16px;
}
</style>